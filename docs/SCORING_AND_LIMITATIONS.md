# SOLACE scoring and limitations

SOLACE evaluates the submitted URL string. It does not open the page, follow redirects, resolve the host, or fetch reputation data from external services.

## Features inspected

The Python API extracts the following 14 numeric model inputs:

| Feature | What is counted |
|---|---|
| `url_length` | Characters in the normalized URL |
| `hostname_length` | Characters in the parsed hostname |
| `dot_count` | Dots in the hostname |
| `hyphen_count` | Hyphens in the full URL |
| `at_symbol` | Whether the URL contains `@` |
| `ip_address` | Whether the hostname parses as an IP address |
| `https_scheme` | Whether the scheme is HTTPS |
| `suspicious_keyword_count` | Matches from the built-in login, credential, urgency, and reward token list |
| `digit_ratio` | Digits divided by URL length |
| `subdomain_depth` | Hostname labels before the last two labels |
| `path_length` | Path characters, treating an empty path as `/` |
| `query_length` | Query characters, excluding the leading `?` |
| `entropy` | Shannon entropy of the hostname characters |
| `shortener_host` | Whether the hostname matches a small built-in URL shortener list |

The analyzer also emits explanatory signals for conditions such as raw IP hosts, `@`, deep nesting, multiple hyphens, a configured TLD list, known shorteners, and long URLs. These are observations, not proof of malicious activity.

## Model and verdicts

The Python API uses a scikit-learn Random Forest with 220 trees, maximum depth 14, and minimum leaf size 2. If `backend/phishguard_model.joblib` does not exist, startup trains a reproducible 6,000-row synthetic starter dataset. The train/test split is random but seeded in code.

The reported risk score is the model's phishing-class probability rounded to an integer percentage. Product thresholds map that value to a label:

| Risk score | Verdict |
|---|---|
| 0–44 | `SAFE` |
| 45–74 | `SUSPICIOUS` |
| 75–100 | `PHISHING` |

The `confidence` field is the model's maximum class probability; it is not independent validation that the verdict is correct. The Netlify version uses a pre-bundled Random Forest model and the same verdict thresholds.

## Important limitations

- Synthetic training examples are generated from patterns in the code. High held-out metrics on that data measure agreement with those generated patterns, not accuracy on current phishing campaigns or real users' URLs.
- There is no DNS, WHOIS/domain-age, certificate, redirect, page-content, browser reputation, or third-party threat-intelligence lookup.
- The `rootDomain` and `subdomain_depth` fields use simple hostname label splitting, not a Public Suffix List. Results can be misleading for multi-label suffixes such as `co.uk`.
- Safe sites can contain suspicious-looking words or unusual URL structures. Malicious sites can use clean-looking URLs. HTTPS does not establish that a site is trustworthy.
- The configured “high-risk TLD” list is a heuristic and can flag legitimate domains. A TLD by itself is not evidence that a particular site is malicious.
- Confidence, risk scores, and feature-importance values should not be used as an account-blocking or incident-response decision without independent verification.

Use SOLACE as a demonstration and triage aid. When a URL may contain a password, session token, private identifier, or other secret, do not submit it: the Python API stores the submitted URL and its query string in SQLite.
