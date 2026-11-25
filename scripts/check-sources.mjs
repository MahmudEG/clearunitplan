import {mkdir, writeFile} from 'node:fs/promises';

const sources = [
  {name:'Public Storage', url:'https://help.publicstorage.com/rent-a-unit/rental-faqs/zzz-Vacating_Your_Storage_Unit_(Moving_Out)', expected:/at least\s+7\s+days/i},
  {name:'Extra Space', url:'https://www.extraspace.com/self-storage/faq/whats-the-process-for-moving-out/', expected:/15\s+days[\s\S]{0,100}written[\s\S]{0,100}10\s+days/i}
];
const lines = ['# Operator source review', '', 'Generated ' + new Date().toISOString(), '', 'These checks look for expected wording. A missing match or blocked request requires human review. A match does not establish that every policy is unchanged.', ''];
let needsReview = false;
for (const source of sources) {
  try {
    const response = await fetch(source.url, {signal:AbortSignal.timeout(20000)});
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const text = (await response.text()).replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ');
    const found = source.expected.test(text);
    if (!found) needsReview = true;
    lines.push('- ' + source.name + ' — ' + (found ? 'Expected notice wording found.' : 'Review needed. Expected wording not found.'), '  ' + source.url, '');
  } catch (error) {
    needsReview = true;
    lines.push('- ' + source.name + ' — Unable to verify. ' + error.message, '  ' + source.url, '');
  }
}
await mkdir('reports', {recursive:true});
await writeFile('reports/source-review.md', lines.join('\n'));
console.log(lines.join('\n'));
if (needsReview) process.exitCode = 1;
