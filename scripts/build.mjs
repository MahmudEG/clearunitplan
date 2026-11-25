import {cp, mkdir, readdir, readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
await mkdir(output, {recursive:true});
await cp(resolve(root, 'site'), output, {recursive:true});
const pages = [
  ...JSON.parse(await readFile(resolve(root, 'content/pages.json'), 'utf8')),
  ...JSON.parse(await readFile(resolve(root, 'content/resources.json'), 'utf8'))
];
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&amp;display=swap"><link rel="stylesheet" href="/style.css"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="theme-color" content="#ffffff"><script type="module" src="/ui.js"></script><script type="module" src="/analytics.js?v=20261125-settings1"></script>`;
const brand = `<a class="brand title-3" href="/"><img src="/favicon.svg" alt="" width="24" height="24">Clear Unit Plan</a>`;
function header(path) {
  const link = (href, name) => {
    const current = href !== '/' && (path + '/').startsWith(href.slice(1)) ? ' aria-current="page"' : '';
    return `<a class="title-4" href="${href}"${current}>${name}</a>`;
  };
  return `<a class="skip button-sm" href="#content">Skip to content</a><header class="site-header"><div class="navbar">${brand}<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span></button><nav id="menu" class="menu" aria-label="Main">${link('/', 'Calculator')}${link('/guides/', 'Moving guides')}${link('/method/', 'Method')}</nav></div></header>`;
}
const footer = `<footer class="footer wrap">${brand}<nav aria-label="Footer"><a class="body-5" href="/about/">About and contact</a><a class="body-5" href="/method/">Method</a><a class="body-5" href="/privacy/">Privacy</a><a class="body-5" href="/terms/">Terms</a></nav><p class="caption-2 muted">Estimates in US dollars. Confirm your rental terms and final bill with the facility.</p></footer>`;
const social = (title, description, url) => `<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="https://clearunitplan.com/og.png"><meta name="twitter:card" content="summary_large_image">`;
for (const page of pages) {
  const folder = resolve(output, page.path);
  await mkdir(folder, {recursive:true});
  const url = `https://clearunitplan.com/${page.path}/`;
  const html = `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title} | Clear Unit Plan</title><meta name="description" content="${page.description}"><link rel="canonical" href="${url}">${social(page.title, page.description, url)}${fonts}</head><body>${header(page.path)}<main id="content" class="article wrap"><p class="body-4 muted">${page.label}</p><h1 class="heading-2">${page.title}</h1><p class="lead">${page.description}</p>${page.body}</main>${footer}</body></html>`;
  await writeFile(resolve(folder, 'index.html'), html);
}
const urls = ['https://clearunitplan.com/', ...pages.map(page => 'https://clearunitplan.com/' + page.path + '/')];
await writeFile(resolve(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls.map(url => '<url><loc>' + url + '</loc></url>').join('') + '</urlset>\n');
await writeFile(resolve(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: https://clearunitplan.com/sitemap.xml\n');
await writeFile(resolve(output, '.nojekyll'), '');
await writeFile(resolve(output, 'CNAME'), 'clearunitplan.com\n');
await writeFile(resolve(output, '404.html'), `<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Clear Unit Plan</title>${fonts}</head><body>${header('404')}<main id="content" class="article wrap"><h1 class="heading-2">We could not find that page</h1><p class="lead">The address may be mistyped or the page may have moved.</p><p><a class="button button-md" href="/">Go to the calculator</a></p></main>${footer}</body></html>`);
console.log('Built ' + urls.length + ' pages in dist.');
