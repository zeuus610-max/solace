import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const output = join(root, 'dist');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const page of ['index.html', 'scanner.html', 'dashboard.html', 'about.html']) {
    await copyFile(join(root, page), join(output, page));
}

await cp(join(root, 'css'), join(output, 'css'), { recursive: true });
await cp(join(root, 'public/resources'), join(output, 'resources'), { recursive: true });
await mkdir(join(output, 'src'), { recursive: true });
await copyFile(join(root, 'src/main.ts'), join(output, 'src/main.js'));
await copyFile(join(root, 'src/solace.js'), join(output, 'src/solace.js'));
