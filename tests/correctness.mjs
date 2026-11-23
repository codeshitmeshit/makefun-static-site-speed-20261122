import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { run } from '../solve.js';
import { testTemplates } from './templates.mjs';
import { inline as fastInline } from '../src/lib/markdown.js';
const kit=resolve(process.argv[2] ?? new URL('../../official/site-generator-speed-01-run-20261122-kit',import.meta.url).pathname);
const { build: baseline }=await import(pathToFileURL(`${kit}/baselines/makefun-site/vendor/makefun-site/index.js`));
const { inline: originalInline }=await import(pathToFileURL(`${kit}/baselines/makefun-site/vendor/makefun-site/lib/markdown.js`));
const { generate }=await import(pathToFileURL(`${kit}/program/generator/subject/sites.mjs`));
const { streamFor }=await import(pathToFileURL(`${kit}/program/generator/rng.ts`));
const cases=JSON.parse(readFileSync(`${kit}/practice/input/cases.json`,'utf8'));
const expected=JSON.parse(readFileSync(`${kit}/practice/reference/expected.json`,'utf8')).cases;
for(let i=0;i<cases.length;i++){
 const input=structuredClone(cases[i].input); const before=JSON.stringify(input);
 const result=run(input); assert.deepEqual(result,expected[i].output,`official ${cases[i].id}`);
 assert.equal(JSON.stringify(input),before,'input was mutated');
 assert.deepEqual(baseline(input),expected[i].output,'baseline must match frozen oracle');
}
// Reorder and repeat unrelated cases in the same module instance. No state is
// reused by run; this checks A-B-A and reverse-order behavior on actual sites.
for(const i of [2,0,1,0,2,1]) assert.deepEqual(run(cases[i].input),expected[i].output);
let state=0x5eed7341;
const rnd=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
const alphabet=['a','Z',' ','\n','\t','&','<','>','"',"'",'\\','`','*','_','[',']','(',')','#','+','-','.','!',':','é','東京','😀','\ud800','\udfff'];
const fixtures=['','ordinary text','**strong *nested* text**','[a **b**](x?a=1&b=2)','\\*literal\\*','``','***a***','\\\\`<&>``', 'x\r\ny'];
const env={link:s=>`/resolved/${s}`};
for(let i=0;i<12000;i++){
 let s=fixtures[i]??'';
 if(i>=fixtures.length) for(let j=rnd()%150;j;j--)s+=alphabet[rnd()%alphabet.length];
 assert.equal(fastInline(s,env),originalInline(s,env),`inline differential ${i}`);
}
// Public generator, explicitly local artificial seeds. No drand query and no
// final/hidden seed, corpus, expected answer or output lookup used by solve.
let generatedSources=0;
for(let i=0;i<18;i++){
 const seed=createHash('sha256').update(`local-only-regression-20261122-${i}`).digest('hex');
 const input=generate(streamFor(seed,'case',i),i);
 generatedSources+=input.files.filter(f=>f.path.endsWith('.md')).length;
 assert.deepEqual(run(input),baseline(input),`local generated ${i}`);
}
// Cross-feature small site: malformed templates, include recursion, shadowed
// static output, slug collisions, malformed front matter and broken links.
const edge={site:{title:'A & <B>',base_url:'https://local.example///',per_page:2,recent:2},templates:{
 page:'{% include "cycle" %}\n{{ page.title }}|{{{ page.content }}}|{% for p in recent %}{{ p.title }}{% endfor %}',
 post:'{{ page.title }}|{{ page.date_long }}|{{{ page.content }}}',
 index:'{% for p in posts %}{{ p.title }}{% include "item" %}{% endfor %}',
 item:'{% for p in p.tags %}{{ p.name }}{% endfor %}',
 tag:'{{ tag.name }}{% for p in tag.posts %}{{ p.title }}{% endfor %}',tags:'{% for t in tags %}{{ t.name }}{% endfor %}',
 cycle:'x{% include "cycle" %}',broken:'{% if page %}unterminated'
},files:[
 {path:'a.md',content:'---\ntitle: "Café & one"\ntags: [C++, C#, nowhere]\n---\n## Head\nText < & \' " [broken](missing.md) [post](posts/a.md#x) 😀\n'},
 {path:'b.md',content:'---\ntitle: Cafe & one\n---\n**bold** `code`\n'},
 {path:'posts/a.md',content:'---\ntitle: Post\ndate: 2026-11-22\ntags: [C++, C#, Café, cafe]\n---\nParagraph\n'},
 {path:'posts/invalid.md',content:'---\ntitle: missing date\n---\nx'},
 {path:'tags/a.md',content:'---\ntitle: reserved\n---\nx'},
 {path:'draft.md',content:'---\ntitle: Draft\ndraft: true\n---\nx'},
 {path:'index.html',content:'shadow me'}, {path:'build-report.txt',content:'old report'},
 {path:'assets/x.txt',content:'bytes\r\n&'}
]};
assert.deepEqual(run(edge),baseline(edge));
const templateDifferential=await testTemplates(kit);
console.log(JSON.stringify({templateDifferential,officialPractice:cases.length,reorderedRepeated:6,inlineDifferential:12000,localGenerated:18,generatedMarkdownSources:generatedSources,edgeSites:1,inputUnchanged:true,status:'PASS'}));
