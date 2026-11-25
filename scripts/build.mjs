import {cp, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await mkdir(output, {recursive:true});
await cp(resolve(root, 'site'), output, {recursive:true});
const pages = JSON.parse(await readFile(resolve(root, 'content/pages.json'), 'utf8'));
const header = `<a class="skip" href="#content">Skip to content</a><header class="header wrap"><a class="brand" href="/"><span class="brandmark" aria-hidden="true"></span>Clear Unit Plan</a><nav aria-label="Main"><a href="/">Calculator</a><a href="/guides/">Moving guides</a></nav></header>`;
const footer = `<footer class="footer wrap"><a class="brand" href="/">Clear Unit Plan</a><nav aria-label="Footer"><a href="/about/">About & contact</a><a href="/method/">Method</a><a href="/privacy/">Privacy</a></nav><p>Estimates in US dollars. Confirm your rental terms and final bill with the facility.</p></footer>`;
for (const page of pages) {
  const folder = resolve(output, page.path);
  await mkdir(folder, {recursive:true});
  const html = `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title} | Clear Unit Plan</title><meta name="description" content="${page.description}"><link rel="canonical" href="https://clearunitplan.com/${page.path}/"><link rel="stylesheet" href="/style.css"><meta name="theme-color" content="#153e3b"></head><body>${header}<main id="content" class="article wrap"><p class="eyebrow">${page.label}</p><h1>${page.title}</h1><p class="lead">${page.description}</p>${page.body}</main>${footer}</body></html>`;
  await writeFile(resolve(folder, 'index.html'), html);
}
const urls = ['https://clearunitplan.com/', ...pages.map(page => 'https://clearunitplan.com/' + page.path + '/')];
await writeFile(resolve(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(url => '<url><loc>' + url + '</loc></url>').join('') + '</urlset>\n');
await writeFile(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://clearunitplan.com/sitemap.xml\n');
await writeFile(resolve(output, '.nojekyll'), '');
await writeFile(resolve(output, 'CNAME'), 'clearunitplan.com\n');
await writeFile(resolve(output, '404.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Clear Unit Plan</title><link rel="stylesheet" href="/style.css"></head><body><main class="wrap article"><h1>That page has moved.</h1><p>Start with the <a href="/">storage move-out calculator</a>.</p></main></body></html>');
console.log('Built ' + urls.length + ' pages in dist.');
