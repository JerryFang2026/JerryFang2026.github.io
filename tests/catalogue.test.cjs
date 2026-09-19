const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const C=require('../assets/catalogue-core.js');
C.setReadingAccess(JSON.parse(fs.readFileSync(path.join(__dirname,'../data/reading_access.json'),'utf8')));
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/books.js'),'utf8'),scope);
const books=JSON.parse(JSON.stringify(scope.window.LIBRARY.books));
const by=id=>books.find(b=>b.id===id);
test('combined fields select the correct book and section',()=>{
  const found=C.search(books,{title:'Groundwater',author:'Cherry',section:'Darcy'});
  assert(found.some(r=>r.book.id==='BK-0002'));
  assert(found.every(r=>/Cherry/i.test(r.book.authors+' '+r.book.editors)));
  assert(found.every(r=>r.hits.length>0));
  assert.equal(C.search(books,{title:'Groundwater',author:'not-an-author-xyz'}).length,0);
});
test('spelling normalization and opt-in related words stay distinct',()=>{
  assert.equal(C.norm('Ground-water Modelling'),C.norm('ground water modeling'));
  assert.equal(C.match('Salinity','saline','all',false).ok,false);
  assert.equal(C.match('Salinity','saline','all',true).related,true);
  const result=C.search([{id:'A',title:'Saline',contents:[]},{id:'B',title:'Salinity',contents:[]}],{q:'saline',related:true});
  assert.deepEqual(result.map(x=>x.book.id),['A','B']);
});
test('phrase / all / any modes and title length do not reward long TOCs',()=>{
  assert.equal(C.match('flow through porous media','porous flow','phrase').ok,false);
  assert.equal(C.match('flow through porous media','porous flow','all').ok,true);
  assert.equal(C.match('porous media','saline porous','any').ok,true);
  assert.equal(C.search([{id:'X',title:'Saltwater',authors:'Intrusion',contents:[]}],{q:'saltwater intrusion',mode:'phrase'}).length,0);
  const exact={id:'A',title:'A relevant book',contents:[{img:'a',entries:[{l:1,t:'Saline groundwater',p:9}]}]};
  const long={id:'B',title:'Long book',summary:'saline groundwater',contents:[{img:'b',entries:Array.from({length:100},(_,i)=>({l:1,t:'Groundwater topic '+i,p:i+1}))}]};
  assert.equal(C.search([long,exact],{q:'saline groundwater'})[0].book.id,'A');
});
test('chapter context crosses photo boundaries and never invents a subsection page',()=>{
  const rows=C.sections({contents:[{img:'a',entries:[{l:1,t:'Chapter 2',p:10}]},{img:'b',entries:[{l:2,t:'Subsection',p:null}]}]});
  assert.equal(rows[1].parents[0].t,'Chapter 2');
  assert.equal(rows[1].p,null);assert.equal(C.pageInfo(rows[1]).own,false);
  assert.match(C.pageInfo(rows[1]).text,/section starting p. 10/);
});
test('online additions remain searchable and have stable section anchors',()=>{
  const result=C.search(books,{section:'tastiest',title:'SWITCH'});
  assert.equal(result.length,1);assert.equal(result[0].book.id,'BK-0138');
  assert.equal(result[0].hits[0].row.p,158);
  for(const book of books){
    const rows=C.sections(book);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length,book.id);
    const html=fs.readFileSync(path.join(__dirname,'../books',book.id+'.html'),'utf8');
    for(const row of rows)assert(html.includes('id="'+row.id+'"'),book.id+' / '+row.id);
  }
});
test('read-online filtering excludes companions, restricted copies and bibliographic records',()=>{
  assert.equal(C.sourceRole({title:'Free full text - modern companion',supports:'modern replacement'}),'related');
  assert.equal(C.sourceRole({title:'Internet Archive',supports:'borrowable digitised copy, not open full text'}),'library');
  assert.equal(C.sourceRole({title:'Catalogue',supports:'bibliographic record'}),'reference');
  assert.equal(C.sourceRole({title:'Unofficial PDF',supports:'copyright status not cleared'}),'reference');
  assert(C.search(books,{access:'open'}).some(r=>r.book.id==='BK-0138'));
  assert(!C.search(books,{access:'open'}).some(r=>r.book.id==='BK-0129'));
  assert(!C.search(books,{access:'open'}).some(r=>r.book.id==='BK-0068'));
  assert(C.search(books,{access:'open'}).some(r=>r.book.id==='BK-0002'));
});
test('ISBN formatting, years and unknown dates are handled without inference',()=>{
  assert(C.search(books,{isbn:'0133653129'}).some(r=>r.book.id==='BK-0002'));
  assert(C.search(books,{isbn:'9780133653120'}).some(r=>r.book.id==='BK-0002'));
  assert.equal(C.search(books,{isbn:'abc'}).length,0);
  assert(C.search(books,{from:'1990',to:'2000'}).every(r=>Number(r.book.year)>=1990 && Number(r.book.year)<=2000));
  assert(!C.search(books,{from:'1900'}).some(r=>r.book.year==='n.d.'));
});
test('share URL round trips all filters and page state',()=>{
  const state={...C.defaults,q:'salt water',author:'Cherry',title:'Groundwater',section:'flow',isbn:'0-13',topic:'Flow in Porous Media',from:'1970',to:'2020',mode:'phrase',access:'open',sort:'newest',related:true,page:3};
  assert.deepEqual(C.parseState(C.stateQuery(state)),state);
  assert.equal(C.parseState('page=-99&sort=bad').page,1);
  assert.equal(C.parseState('mode=bad').mode,'all');
});
test('RIS preserves edition metadata and does not invent unknown years',()=>{
  const text=C.ris(by('BK-0002'));
  assert.match(text,/AU  - Freeze, R. Allan\r\nAU  - Cherry, John A./);
  assert.match(text,/PY  - 1979/);assert.match(text,/BK-0002.html/);
  assert(!C.ris(by('BK-0129')).includes('PY  -'));
  assert(!C.reference(by('BK-0129')).includes('undefined'));
  assert.deepEqual(C.contributors(by('BK-0091'),'editors'),['Sheila Banks','David Banks']);
  assert.equal(C.contributors(by('BK-0021'),'authors').length,1);
  assert.equal(C.csl(by('BK-0021'))[0].author[0].literal,by('BK-0021').authors);
  assert.deepEqual(C.contributors(by('BK-0070'),'authors'),['Raymond Chang']);
});
test('highlighting escapes source text before inserting markup',()=>{
  assert.equal(C.highlight('<script>alert(1)</script>','script'),'&lt;<mark>script</mark>&gt;alert(1)&lt;/<mark>script</mark>&gt;');
});
