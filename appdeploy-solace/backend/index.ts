import { MODEL_DATA } from './model-data';

const FEATURE_NAMES = MODEL_DATA.feature_names;
const SUSPICIOUS_WORDS = new Set([
    'login', 'verify', 'verification', 'secure', 'account', 'update', 'password',
    'signin', 'banking', 'wallet', 'confirm', 'recover', 'urgent', 'gift', 'free',
    'bonus', 'claim', 'support', 'auth', 'kyc', 'payment', 'invoice', 'unlock',
]);
const SHORTENERS = new Set([
    'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
    'cutt.ly', 'rb.gy', 'shorturl.at',
]);
const RISKY_TLDS = new Set([
    'zip', 'mov', 'top', 'xyz', 'click', 'work', 'country', 'gq', 'tk', 'ml',
    'cf', 'ru', 'cn', 'rest', 'cam',
]);
type FeatureMap = Record<string, number>;
export class InputError extends Error {}

function entropy(value: string): number {
    if (!value) return 0;
    const counts = new Map<string, number>();
    for (const character of value) {
        counts.set(character, (counts.get(character) || 0) + 1);
    }
    let result = 0;
    for (const count of counts.values()) {
        const probability = count / value.length;
        result -= probability * Math.log2(probability);
    }
    return result;
}

function isIpAddress(host: string): boolean {
    if (host.startsWith('[') && host.endsWith(']') && host.includes(':')) return true;
    const parts = host.split('.');
    return parts.length === 4 && parts.every(part => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const value = Number(part);
        return value >= 0 && value <= 255;
    });
}

function extractFeatures(raw: string) {
    let value = raw.trim();
    if (!value) throw new InputError('Enter a URL.');
    if (value.length > 2048) throw new InputError('URL is too long (maximum 2048 characters).');
    if ([...value].some(character => character.charCodeAt(0) < 32)) {
        throw new InputError('URL contains control characters.');
    }
    if (/\s/.test(value)) throw new InputError('URL must not contain unescaped spaces.');
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value)) value = `https://${value}`;

    let parsed: URL;
    try {
        parsed = new URL(value);
    } catch {
        throw new InputError('That does not look like a valid URL. Include a hostname.');
    }
    const protocol = parsed.protocol.slice(0, -1).toLowerCase();
    if (protocol !== 'http' && protocol !== 'https') {
        throw new InputError('Only http:// and https:// URLs are supported.');
    }
    if (!parsed.hostname) throw new InputError('That does not look like a valid URL. Include a hostname.');

    const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
    const ipAddress = isIpAddress(host);
    const labels = host.split('.').filter(Boolean);
    const tokens = value.toLowerCase().match(/[a-zA-Z]+/g) || [];
    const keywordCount = tokens.filter(token => SUSPICIOUS_WORDS.has(token)).length;
    const digits = [...value].filter(character => /\d/.test(character)).length;
    const path = parsed.pathname || '/';
    const query = parsed.search ? parsed.search.slice(1) : '';
    const tld = labels.length > 1 ? labels[labels.length - 1] : '';
    const features: FeatureMap = {
        url_length: value.length,
        hostname_length: host.length,
        dot_count: (host.match(/\./g) || []).length,
        hyphen_count: (value.match(/-/g) || []).length,
        at_symbol: Number(value.includes('@')),
        ip_address: Number(ipAddress),
        https_scheme: Number(protocol === 'https'),
        suspicious_keyword_count: keywordCount,
        digit_ratio: digits / Math.max(1, value.length),
        subdomain_depth: Math.max(0, labels.length - 2),
        path_length: path.length,
        query_length: query.length,
        entropy: entropy(host),
        shortener_host: Number(SHORTENERS.has(host)),
    };
    const hasHighRiskTld = RISKY_TLDS.has(tld);
    const signals: string[] = [];

    if (ipAddress) signals.push('Hostname is a raw IP address rather than a conventional domain.');
    if (value.includes('@')) signals.push('An @ symbol can obscure which host the browser actually visits.');
    if (keywordCount) signals.push(`Contains ${keywordCount} credential, urgency, or reward-related keyword(s).`);
    if (features.subdomain_depth >= 3) signals.push('Unusually deep subdomain nesting can hide the effective domain.');
    if (features.hyphen_count >= 3) signals.push('Multiple hyphens may indicate a deceptive or generated hostname.');
    if (hasHighRiskTld) signals.push(`The .${tld} top-level domain is frequently abused in suspicious URLs; this alone is not proof.`);
    if (SHORTENERS.has(host)) signals.push('A URL shortener hides the final destination until expanded safely.');
    if (value.length > 100) signals.push('The URL is unusually long.');
    if (!signals.length) signals.push('No strong lexical warning signs were detected; this does not guarantee the site is safe.');

    return {
        normalizedUrl: value,
        host,
        protocol,
        subdomain: labels.length > 2 ? labels.slice(0, -2).join('.') : 'None',
        rootDomain: labels.length >= 2 ? labels.slice(-2).join('.') : host,
        tld,
        pathAndQuery: `${path}${query ? `?${query}` : ''}`,
        hasIpAddress: ipAddress,
        hasAtSymbol: value.includes('@'),
        hasHighRiskTld,
        isShortener: SHORTENERS.has(host),
        features,
        signals,
    };
}

function predictRisk(features: FeatureMap): number {
    const values = FEATURE_NAMES.map(name => features[name]);
    const positiveClass = MODEL_DATA.classes.indexOf(1);
    let probability = 0;

    for (const tree of MODEL_DATA.trees) {
        let node = 0;
        while (tree.left[node] !== -1) {
            const featureIndex = tree.feature[node];
            node = values[featureIndex] <= tree.threshold[node] ? tree.left[node] : tree.right[node];
        }
        const classValues = tree.values[node];
        const total = classValues.reduce((sum, count) => sum + count, 0);
        probability += total ? classValues[positiveClass] / total : 0;
    }

    return probability / MODEL_DATA.trees.length;
}

export function scoreUrl(raw: string) {
    const start = Date.now();
    const extracted = extractFeatures(raw);
    const probability = predictRisk(extracted.features);
    const risk = Math.round(probability * 100);
    const confidence = Math.round(Math.max(probability, 1 - probability) * 1000) / 10;
    const verdict = risk >= 75 ? 'PHISHING' : risk >= 45 ? 'SUSPICIOUS' : 'SAFE';
    const latency = Math.max(1, Date.now() - start);
    const triggers = [...extracted.signals];

    if (risk >= 75) triggers.unshift('The trained Random Forest classifier assigned a high phishing probability.');
    else if (risk >= 45) triggers.unshift('The trained Random Forest classifier assigned an elevated phishing probability; review manually.');
    else triggers.unshift('The trained Random Forest classifier assigned a lower phishing probability; this is not a safety guarantee.');

    const descriptions: Record<string, string> = {
        url_length: 'Total URL character count',
        hostname_length: 'Hostname character count',
        dot_count: 'Dots in hostname',
        hyphen_count: 'Hyphens in full URL',
        at_symbol: 'Presence of @ symbol',
        ip_address: 'Host is an IPv4/IPv6 address',
        https_scheme: 'HTTPS scheme present',
        suspicious_keyword_count: 'Count of suspicious lexical tokens',
        digit_ratio: 'Fraction of URL characters that are digits',
        subdomain_depth: 'Subdomain labels before registrable-looking host',
        path_length: 'Path length',
        query_length: 'Query string length',
        entropy: 'Hostname Shannon entropy',
        shortener_host: 'Known URL-shortener hostname',
    };
    const featuresList = FEATURE_NAMES.map(name => {
        const value = extracted.features[name];
        return {
            name: name.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase()),
            value: Number.isInteger(value) ? String(value) : String(Math.round(value * 10000) / 10000),
            baseline: 'Model input',
            impact: 'Computed by ML model',
            desc: descriptions[name],
            status: ['at_symbol', 'ip_address', 'shortener_host'].includes(name) && value
                ? 'Critical'
                : value ? 'Warning' : 'Normal',
        };
    });

    return {
        id: undefined as string | undefined,
        rawUrl: extracted.normalizedUrl,
        protocol: extracted.protocol,
        subdomain: extracted.subdomain,
        rootDomain: extracted.rootDomain,
        tld: extracted.tld,
        pathAndQuery: extracted.pathAndQuery,
        hasIpAddress: extracted.hasIpAddress,
        hasAtSymbol: extracted.hasAtSymbol,
        hasHighRiskTld: extracted.hasHighRiskTld,
        isShortener: extracted.isShortener,
        finalRiskScore: risk,
        verdict,
        confidence: `${confidence.toFixed(1)}% model confidence`,
        latencyMs: latency,
        triggers,
        featuresList,
        model: { name: 'Random Forest', source: MODEL_DATA.training_source },
        createdAt: new Date().toISOString(),
    };
}

export function modelInfo() {
    const featureImportance = FEATURE_NAMES.map((name, index) => ({
        name: name.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase()),
        importance: Math.round(MODEL_DATA.feature_importances[index] * 10000) / 10000,
    })).sort((left, right) => right.importance - left.importance);

    return {
        name: 'Random Forest (scikit-learn)',
        type: 'Supervised classification',
        training_source: MODEL_DATA.training_source,
        training_rows: MODEL_DATA.training_rows,
        metrics: MODEL_DATA.metrics,
        metrics_note: 'Metrics are measured on a held-out split of the starter training data. Synthetic-data metrics are not evidence of real-world performance.',
        features: FEATURE_NAMES.length,
        feature_importance: featureImportance,
        model_loaded: true,
    };
}

