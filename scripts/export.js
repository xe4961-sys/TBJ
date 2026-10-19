import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [html, css, game, app] = await Promise.all(['index.html', 'styles.css', 'game.js', 'app.js'].map(read));
const bundle = game.replace(/^export /gm, '') + '\n' + app.replace(/^import .* from '\.\/game\.js';\n/m, '');
const audio = await readFile(new URL('assets/dice-roll.mp3', root));
const output = html.replace('src="assets/dice-roll.mp3"', `src="data:audio/mpeg;base64,${audio.toString('base64')}"`).replace('<link rel="stylesheet" href="styles.css">', () => `<style>${css}</style>`)
  .replace('  <script type="module" src="app.js"></script>\n', '')
  .replace('</body>', () => `<script>\n${bundle}\n</script>\n</body>`);
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/TBJ-tracker.html', root), output);
console.log('Created dist/TBJ-tracker.html — open directly in a browser.');
