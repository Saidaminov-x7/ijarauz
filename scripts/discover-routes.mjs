import fs from 'node:fs';
import path from 'node:path';

const appRoot = path.resolve('app/[locale]');
const outputPath = path.resolve('public/page-routes.json');
const routes = new Set(['/']);

function segmentName(segment) {
  if (segment.startsWith('(') && segment.endsWith(')')) return '';
  if (segment.startsWith('[') && segment.endsWith(']')) return `:${segment.slice(1, -1)}`;
  return segment;
}

function walk(directory, segments = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const child = path.join(directory, entry.name);
    const pageFile = path.join(child, 'page.tsx');
    const nextSegments = [...segments, segmentName(entry.name)].filter(Boolean);
    if (fs.existsSync(pageFile)) {
      routes.add(`/${nextSegments.join('/')}`.replace(/\/+/g, '/'));
    }
    walk(child, nextSegments);
  }
}

walk(appRoot);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify([...routes].sort(), null, 2)}\n`, 'utf8');
console.log(`Discovered ${routes.size} site routes`);
