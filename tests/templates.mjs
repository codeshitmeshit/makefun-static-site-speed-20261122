import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { parseTemplate, renderTemplate } from '../src/lib/template.js';
import { escapeHtml } from '../src/lib/text.js';
export async function testTemplates(kit) {
 const { renderNodes }=await import(pathToFileURL(`${kit}/baselines/makefun-site/vendor/makefun-site/lib/template.js`));
 const templates=new Map(Object.entries({
  root:'{{ page.title }}|{{ p.title }}|{% for p in posts %}{% include "card" %}{% endfor %}|{% include "recursive" %}',
  card:'{{ p.title }}:{% if p.tags %}{% for p in p.tags %}{% include "label" %}{% endfor %}{% else %}none{% endif %}',
  label:'{{ p.name }}:{{ loop.index }}:{{ page.title }}:{{{ site.raw }}}',
  recursive:'{{ page.title }}{% if recent %}{% include "cycle" %}{% endif %}',
  cycle:'{{ site.title }}{% include "recursive" %}',
  shadow:'{% for site in posts %}{{ site.title }}{% for loop in site.tags %}{{ loop.index }}-{{ loop.name }}{% endfor %}{% endfor %}',
  missing:'{{ absent.value }}{% if not absent %}missing{% endif %}{{ values }}',
  empty:'',
 }).map(([n,s])=>[n,parseTemplate(n,s)]));
 const oldCtx={templates,escape:escapeHtml};const ctx={templates,escape:escapeHtml};
 const shared={title:'A & <B>',raw:'<raw>'};
 const posts=Array.from({length:6},(_,i)=>({title:`post ${i}`,tags:i%2?[{name:'x&y'},{name:'<z>'}]:[]}));
 const scopes=Array.from({length:36},(_,i)=>({vars:{page:{title:i%3?'':'page & '+i},site:shared,posts:posts.slice(i%6),recent:i%2?posts:[],p:i%3?posts[i%6]:null,values:[true,2,['a','<b>'],null]},parent:{vars:{absent:i%4?undefined:{value:0},site:{title:'masked'}},parent:null}}));
 let checks=0;
 for(const pass of [scopes,[...scopes].reverse()]) for(const scope of pass) for(let depth=0;depth<=9;depth++) for(const nodes of templates.values()){
  assert.equal(renderTemplate(nodes,scope,ctx,depth),renderNodes(nodes,scope,oldCtx,depth));checks++;
 }
 return checks;
}
