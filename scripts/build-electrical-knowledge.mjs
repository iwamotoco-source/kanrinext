import fs from 'node:fs';
const dataPath=new URL('../data/electrical-knowledge.json',import.meta.url);
const db=JSON.parse(fs.readFileSync(dataPath,'utf8'));const ids=new Set();
if(db.schemaVersion!==1||!Array.isArray(db.entries))throw Error('Unsupported database');
for(const e of db.entries){if(ids.has(e.id))throw Error('Duplicate '+e.id);ids.add(e.id);for(const k of ['title','category','summary','body','updatedAt'])if(typeof e[k]!=='string'||!e[k])throw Error('Missing '+k);if(!db.categories.includes(e.category)||!e.checks.length||!e.sources.length)throw Error('Invalid '+e.id);for(const s of [...e.sources,...(e.rules||[]).map(r=>r.source)])if(new URL(s.url).protocol!=='https:')throw Error('Unsafe source');for(const r of e.rules||[])if(!r.value||!r.condition||!r.source.locator)throw Error('Unscoped rule');}
const out=new URL('../assets/js/electrical-knowledge-data.js',import.meta.url),expected='window.ELECTRICAL_KNOWLEDGE = '+JSON.stringify(db,null,2)+';\n';
if(process.argv.includes('--check')){if(fs.readFileSync(out,'utf8')!==expected)throw Error('Data bundle is stale');}else fs.writeFileSync(out,expected);
console.log(`Validated ${ids.size} entries and ${db.entries.reduce((n,e)=>n+(e.rules?.length||0),0)} specifications`);
