/* Shared catalogue logic. No network or model calls are needed for searching. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Catalogue = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PUBLIC = 'https://jerryfang2026.github.io/';
  const fields = ['q', 'title', 'author', 'section', 'isbn', 'topic', 'from', 'to', 'access', 'mode', 'sort', 'related', 'page'];
  const defaults = {q:'', title:'', author:'', section:'', isbn:'', topic:'', from:'', to:'', access:'all', mode:'all', sort:'relevance', related:false, page:1};
  const cache = new WeakMap();
  let readingAccess = typeof window !== 'undefined' ? (window.READING_ACCESS || {}) : {};
  const aliases = {saline:['salinity','saltwater','seawater'], salinity:['saline','saltwater','seawater'], saltwater:['seawater','saline','salinity'], seawater:['saltwater','saline','salinity']};
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function norm(s) {
    return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/\bground[ -]+water\b/g,'groundwater').replace(/\bsalt[ -]+water\b/g,'saltwater').replace(/\bsea[ -]+water\b/g,'seawater')
      .replace(/\bmodelling\b/g,'modeling').replace(/\bmodelled\b/g,'modeled')
      .replace(/\banalysing\b/g,'analyzing').replace(/\banalysed\b/g,'analyzed')
      .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g,' ');
  }
  function highlight(s, query) {
    const terms = String(query || '').match(/[\p{L}\p{N}]+/gu) || [];
    if (!terms.length) return esc(s);
    const re = new RegExp('(' + [...new Set(terms)].sort((a,b)=>b.length-a.length).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|') + ')','giu');
    return String(s || '').split(re).map((part,i)=>i%2 ? '<mark>'+esc(part)+'</mark>' : esc(part)).join('');
  }
  function sectionId(kind, group, index) { return kind+'-'+String(group).replace(/[^a-zA-Z0-9_-]/g,'-')+'-'+index; }
  function sections(book) {
    if (cache.has(book)) return cache.get(book);
    const result = [], stack = [];
    const groups = [...(book.contents || []).map(pg=>({...pg,kind:'photo',key:pg.img})), ...(book.online_contents || []).map((pg,i)=>({...pg,kind:'online',key:i}))];
    for (const group of groups) {
      group.entries.forEach((entry,i)=>{
        const level = Number(entry.l) || 1;
        while (stack.length && stack[stack.length-1].level >= level) stack.pop();
        const row = {...entry, level, id:sectionId(group.kind, group.key, i), parents:stack.slice(), source:group.url || entry.p_source || '', origin:group.kind, group};
        result.push(row); stack.push(row);
      });
    }
    cache.set(book,result); return result;
  }
  function pageInfo(row) {
    if (row.p != null && row.p !== '') return {text:(String(row.p).includes('-')?'pp. ':'p. ')+row.p+(row.u?' ?':''), own:true};
    const parent = [...(row.parents || [])].reverse().find(x=>x.p != null && x.p !== '');
    if (parent) return {text:'Within '+(String(parent.p).includes('-')?'pp. ':'section starting p. ')+parent.p+(parent.u?' ?':''), own:false};
    return {text:'Page not listed', own:false};
  }
  function fullTitle(b) { return [b.title, b.volume, b.subtitle].filter(Boolean).join(' — '); }
  function isbnForms(value) {
    const result=String(value||'').split(/[;,/]+/).map(s=>s.replace(/[^\dXx]/g,'').toUpperCase()).filter(Boolean);
    for(const n of result.slice()) {
      if(/^\d{9}[\dX]$/.test(n) && [...n].reduce((s,c,i)=>s+(10-i)*(c==='X'?10:Number(c)),0)%11===0) {
        const base='978'+n.slice(0,9), check=(10-[...base].reduce((s,c,i)=>s+Number(c)*(i%2?3:1),0)%10)%10;
        result.push(base+check);
      }
      if(/^978\d{10}$/.test(n) && [...n].reduce((s,c,i)=>s+Number(c)*(i%2?3:1),0)%10===0) {
        const base=n.slice(3,12), check=(11-[...base].reduce((s,c,i)=>s+(10-i)*Number(c),0)%11)%11;
        result.push(base+(check===10?'X':check));
      }
    }
    return result;
  }
  function match(text, query, mode='all', related=false, initials=false) {
    const hay = norm(text), needle = norm(query);
    if (!needle) return {ok:true, score:0, related:false};
    if ((' '+hay+' ').includes(' '+needle+' ')) return {ok:true,score:hay===needle?120:100,related:false};
    if (mode==='phrase') return {ok:false,score:0,related:false};
    const words = hay.split(' '), terms=needle.split(' ');
    const scores=terms.map(t=>{
      if(words.includes(t)) return 30;
      if((t.length>=3 || initials && t.length===1) && words.some(w=>w.startsWith(t))) return 20;
      if(related && (aliases[t] || []).some(a=>words.includes(a))) return 6;
      return 0;
    });
    const ok=mode==='any'?scores.some(Boolean):scores.every(Boolean);
    return {ok, score:ok?scores.reduce((a,b)=>a+b,0)/terms.length:0, related:ok&&scores.includes(6)};
  }
  function sourceRole(source) {
    const text=(source.title+' '+source.supports).toLowerCase();
    if(source.type==='academic_review' || /contemporary review|book review/.test(text))return 'reference';
    if(/companion|replacement|supplement|later edition|earlier edition|modern update|current guidance/.test(text) || /companion|related|current guidance/.test(source.type || '')) return 'related';
    if(/unofficial|copyright status not cleared|not authorised|not authorized/.test(text)) return 'reference';
    if(/subscription|borrow|lending|institutional access/.test(text)) return 'library';
    if(/preview|search.only|limited access/.test(text)) return 'preview';
    if(/not open|not full|no full|unverified|not verified/.test(text)) return 'reference';
    if(/^full text\s*\//.test(source.type || '') || /open full text|official full text|free full text|full text of held|full text, significance|full report|complete pdf|publisher.provided full|free pdf|free official pdf/.test(text)) return 'open';
    return 'reference';
  }
  function setReadingAccess(value) { readingAccess=value || {}; }
  function links(book) {
    return (book.sources || []).map(s=>{
      const reviewed=(readingAccess[book.id] || {})[s.url], inferred=sourceRole(s);
      return {...s,role:reviewed || (inferred==='open'?'reference':inferred)};
    });
  }
  function search(books, state) {
    const s={...defaults,...state}, active=[s.q,s.title,s.author,s.section,s.isbn].some(Boolean), results=[];
    if(s.isbn && !s.isbn.replace(/[^\dXx]/g,''))return results;
    for(const b of books) {
      if(s.topic && !(b.topics || []).includes(s.topic)) continue;
      const year=/^\d{4}$/.test(String(b.year))?Number(b.year):null;
      if(s.from && (!year || year<Number(s.from)) || s.to && (!year || year>Number(s.to))) continue;
      if(s.isbn && !isbnForms(b.isbn).some(n=>n.includes(s.isbn.replace(/[^\dXx]/g,'').toUpperCase()))) continue;
      if(s.access==='open' && !links(b).some(x=>x.role==='open')) continue;
      if(s.access==='online' && !links(b).some(x=>['open','library','preview'].includes(x.role))) continue;
      const title=match(fullTitle(b),s.title,s.mode,false), author=match([b.authors,b.editors].join(' '),s.author,s.mode,false,true);
      if(!title.ok || !author.ok) continue;
      const ss=sections(b), sectionQuery=s.section || s.q;
      const hits=sectionQuery ? ss.map(row=>({row,...match(row.t,sectionQuery,s.mode,s.related)})).filter(x=>x.ok).sort((a,b)=>b.score-a.score || a.related-b.related) : [];
      if(s.section && !hits.length) continue;
      let qScore=0, related=hits.length?hits[0].related:false, reason=s.section?'Chapter / section':s.title?'Book title':s.author?'Author / editor':s.isbn?'ISBN':'';
      if(s.q) {
        const candidates=[{label:'Book title',...match(fullTitle(b),s.q,s.mode,s.related)},
          {label:'Author / editor',...match([b.authors,b.editors].join(' '),s.q,s.mode,false,true)},
          ...ss.map(row=>({label:'Chapter / section',...match(row.t,s.q,s.mode,s.related)}))];
        const direct=candidates.filter(x=>x.ok).sort((a,b)=>b.score-a.score || a.related-b.related);
        if(direct.length){qScore=direct[0].score;related=related||direct[0].related;reason=direct[0].label;}
        else {
          const texts=[fullTitle(b),b.authors,b.editors,b.publisher,b.summary,b.best_for,...(b.topics||[]),...ss.map(e=>e.t)];
          const broad=s.mode==='phrase' ? (texts.map(text=>match(text,s.q,s.mode,s.related)).filter(x=>x.ok).sort((a,b)=>b.score-a.score)[0] || {ok:false}) : match(texts.join(' '),s.q,s.mode,s.related);
          if(!broad.ok) continue;
          qScore=Math.min(12,broad.score);related=related||broad.related;reason='Catalogue text';
        }
      }
      // Maximum relevance, never number of TOC entries: long books get no bonus.
      let score=qScore+title.score+author.score+(s.section&&hits[0]?hits[0].score:0);
      if(related) score-=200;
      results.push({book:b,hits,score,related,reason:related?'Related term':reason,active});
    }
    results.sort((a,b)=>{
      if(s.sort==='newest' || s.sort==='oldest') {
        const ya=/^\d{4}$/.test(String(a.book.year))?Number(a.book.year):null, yb=/^\d{4}$/.test(String(b.book.year))?Number(b.book.year):null;
        if(ya!==yb){if(ya===null)return 1;if(yb===null)return -1;return s.sort==='newest'?yb-ya:ya-yb;}
      } else if(s.sort==='relevance' && active && a.score!==b.score) return b.score-a.score;
      return fullTitle(a.book).localeCompare(fullTitle(b.book),'en',{sensitivity:'base'}) || a.book.id.localeCompare(b.book.id);
    });
    return results;
  }
  function parseState(query) {
    const p=new URLSearchParams(query), s={...defaults};
    fields.forEach(k=>{if(p.has(k))s[k]=p.get(k);});
    s.related=s.related===true || s.related==='1'; s.page=Math.max(1,Math.floor(Number(s.page)||1));
    if(!['all','any','phrase'].includes(s.mode))s.mode='all';
    if(!['relevance','title','newest','oldest'].includes(s.sort))s.sort='relevance';
    if(!['all','open','online'].includes(s.access))s.access='all';
    for(const k of ['from','to'])if(!/^\d{4}$/.test(s[k]))s[k]='';
    return s;
  }
  function stateQuery(state) {
    const p=new URLSearchParams();
    fields.forEach(k=>{const v=state[k];if(v!==undefined&&v!==''&&v!==defaults[k])p.set(k,k==='related'?(v?'1':'0'):String(v));});
    return p.toString();
  }
  function bookURL(book, prefix='books/', returnQuery='') { return prefix+encodeURIComponent(book.id)+'.html'+(returnQuery?'?return='+encodeURIComponent(returnQuery):''); }
  function institution(name) { return /institute|association|society|agency|survey|university|course team|committee|commission|chambre|council|consortium|office of|department of/i.test(name); }
  function contributors(book, field) {
    const overrides={
      'BK-0070':{authors:['Raymond Chang']}, 'BK-0081':{authors:[]},
      'BK-0071':{authors:['G. J. Kelly','R. G. Kemp']},
      'BK-0091':{editors:['Sheila Banks','David Banks']}, 'BK-0092':{editors:['Sheila Banks','David Banks']},
      'BK-0120':{editors:['H. Olem','G. Flock']},
      'BK-0138':{editors:['John Butterworth','Peter McIntyre','Carmen da Silva Wells']},
      'BK-0153':{editors:[]}
    };
    if(overrides[book.id] && field in overrides[book.id])return overrides[book.id][field];
    const value=String(book[field]||'').replace(/^Prepared by\s+/i,'').trim();
    if(!value)return [];
    if(institution(value) && !value.includes(';'))return [value];
    return value.split(/;\s*|\s+and\s+/).map(n=>n.replace(/\s*\([^)]*\)/g,'').trim()).filter(Boolean);
  }
  function creator(name) {
    if(name==='Carmen da Silva Wells')return {family:'da Silva Wells',given:'Carmen'};
    if(institution(name))return {literal:name};
    if(name.includes(',')){const [family,...given]=name.split(',');return {family:family.trim(),given:given.join(',').trim()};}
    const words=name.split(/\s+/);let i=words.length-1;
    while(i>0 && /^(de|del|da|dos|do|di|du|van|von|der|den|le|la|ten|ter)$/i.test(words[i-1]))i--;
    return i>0?{family:words.slice(i).join(' '),given:words.slice(0,i).join(' ')}:{literal:name};
  }
  function reference(book) {
    const authors=contributors(book,'authors'),editors=contributors(book,'editors');
    const names=authors.length?authors.join('; '):editors.length?editors.join('; ')+(/compiler|reviser/i.test(book.editors)?' (compiler/reviser)':' (eds.)'):'';
    return [names, '('+(book.year || 'n.d.')+').', fullTitle(book)+'.', book.edition?book.edition+'.':'', book.publisher?book.publisher+'.':''].filter(Boolean).join(' ');
  }
  function ris(book) {
    const line=(key,value)=>value?key+'  - '+String(value).replace(/[\r\n]+/g,' ')+'\r\n':'';
    let out=line('TY',/report/i.test(book.knowledge_type || '')?'RPRT':'BOOK')+line('TI',fullTitle(book));
    const name=n=>{const c=creator(n);return c.literal?c.literal.replace(/,\s*/g,' — '):c.family+', '+c.given;};
    contributors(book,'authors').forEach(n=>out+=line('AU',name(n)));
    contributors(book,'editors').forEach(n=>out+=line('A2',name(n)));
    if(/^\d{4}$/.test(String(book.year)))out+=line('PY',book.year);
    out+=line('PB',book.publisher)+line('ET',book.edition);
    String(book.isbn||'').split(/;\s*/).filter(Boolean).forEach(n=>out+=line('SN',n));
    out+=line('UR',PUBLIC+bookURL(book))+line('N1','Aquifer Notes '+book.id+'. Contributors as recorded: '+[book.authors,book.editors].filter(Boolean).join(' / ')+'. Copy/edition statement: '+(book.edition||'not established')+'. Check any missing bibliographic fields against the physical book.')+'ER  - \r\n';
    return out;
  }
  function csl(book) {
    const record={id:book.id,type:/report/i.test(book.knowledge_type||'')?'report':'book',title:fullTitle(book),author:contributors(book,'authors').map(creator),editor:contributors(book,'editors').map(creator),publisher:book.publisher,edition:book.edition,ISBN:book.isbn,URL:PUBLIC+bookURL(book)};
    if(/^\d{4}$/.test(String(book.year)))record.issued={'date-parts':[[Number(book.year)]]};
    return [record];
  }
  return {PUBLIC,defaults,esc,norm,highlight,sections,sectionId,pageInfo,fullTitle,match,links,sourceRole,setReadingAccess,search,parseState,stateQuery,bookURL,contributors,reference,ris,csl};
});
