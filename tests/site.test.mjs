import {test} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile, readdir, stat} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';

test('build emits linked pages, sitemap and canonical domain without ad placeholders', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs']);
  const files = await readdir('dist', {recursive:true});
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  assert.equal(htmlFiles.length, 14);
  for (const file of htmlFiles) {
    const html = await readFile(resolve('dist',file),'utf8');
    assert.ok(html.includes('<html lang='));
    assert.ok(html.includes('name="viewport"'));
    assert.ok(html.includes('src="/analytics.js?v=20261125-settings1"') || html.includes('src="./analytics.js?v=20261125-settings1"'));
    assert.ok(!html.includes('ca-pub-'));
    for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
      const target = match[1].split(/[?#]/)[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const location = target.startsWith('/') ? resolve('dist','.'+target) : resolve(dirname(resolve('dist',file)),target);
      assert.ok(location.startsWith(resolve('dist')));
      const info = await stat(location);
      if (info.isDirectory()) await stat(resolve(location,'index.html'));
    }
  }
  assert.equal((await readFile('dist/CNAME','utf8')).trim(), 'clearunitplan.com');
  assert.equal((await readFile('dist/sitemap.xml','utf8')).match(/<loc>/g).length, 13);
});
