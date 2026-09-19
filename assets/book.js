(function () {
  'use strict';
  const C=window.Catalogue;
  function status(message) { document.getElementById('book-action-status').textContent=message; }
  async function copy(text, message) {
    try {await navigator.clipboard.writeText(text);status(message);}
    catch (_) {
      const host=document.getElementById('book-action-status');
      host.innerHTML='<label>Copy the text below<textarea readonly>'+C.esc(text)+'</textarea></label>';
      host.querySelector('textarea').select();
    }
  }
  function groupLinks(book) {
    const all=C.links(book), labels={open:'Read online',library:'Publisher or library access',preview:'Preview',related:'Other editions & related reading',reference:'Bibliographic sources'};
    return Object.keys(labels).filter(role=>all.some(s=>s.role===role)).map(role=>{
      const list=all.filter(s=>s.role===role).map(s=>'<li><a href="'+C.esc(s.url)+'" target="_blank" rel="noopener">'+C.esc(s.title)+'</a><p>'+C.esc(s.supports)+'</p></li>').join('');
      return role==='reference'||role==='related'?'<details class="source-group"><summary>'+labels[role]+'</summary><ul>'+list+'</ul></details>':'<section class="source-group"><h3>'+labels[role]+'</h3><ul>'+list+'</ul></section>';
    }).join('');
  }
  function init() {
    const book=window.BOOK;if(!book)return;
    const rows=C.sections(book), byKey=new Map(rows.map(r=>[r.id,r]));
    const params=new URLSearchParams(location.search), returning=params.get('return');
    let query='';if(returning)query=C.stateQuery(C.parseState(returning));
    const back=document.getElementById('back-to-results');
    back.href='../library.html'+(query?'?'+query:'')+(query?'#'+book.id:'');
    back.textContent=query?'← Back to search results':'← Browse the library';
    document.getElementById('reading-links').innerHTML=groupLinks(book) || '<p>No online reading link has been established for this copy.</p>';
    document.getElementById('reference-text').textContent=C.reference(book);
    document.getElementById('copy-reference').addEventListener('click',()=>copy(C.reference(book),'Reference copied.'));
    document.getElementById('copy-book-link').addEventListener('click',()=>copy(C.PUBLIC+C.bookURL(book),'Book link copied.'));
    document.getElementById('download-ris').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([C.ris(book)],{type:'application/x-research-info-systems;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=book.id+'.ris';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Reference exported as RIS.');
    });
    document.getElementById('download-csl').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify(C.csl(book),null,2)],{type:'application/json;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=book.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Reference exported as CSL JSON for Zotero.');
    });
    const queryBox=document.getElementById('within-book'), count=document.getElementById('within-count');
    function filter() {
      const q=queryBox.value.trim(), found=new Set(), show=new Set();
      for(const row of rows)if(!q || C.match(row.t,q).ok){found.add(row.id);show.add(row.id);row.parents.forEach(p=>show.add(p.id));}
      for(const el of document.querySelectorAll('.book-toc-row')){
        const row=byKey.get(el.id);el.hidden=!show.has(el.id);el.classList.toggle('toc-context',!!q&&!found.has(el.id));
        el.querySelector('.toc-title').innerHTML=C.highlight(row.t,q);
      }
      for(const group of document.querySelectorAll('.book-toc-group'))group.hidden=!Array.from(group.querySelectorAll('.book-toc-row')).some(el=>!el.hidden);
      count.textContent=q?found.size+' matching sections. Parent headings are kept for context.':rows.length+' indexed entries';
    }
    queryBox.addEventListener('input',filter);filter();
    function jump() {
      let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(_){return;}
      const target=document.getElementById(id);if(!target || !target.classList.contains('book-toc-row'))return;
      queryBox.value='';filter();document.querySelectorAll('.toc-target').forEach(el=>el.classList.remove('toc-target'));target.classList.add('toc-target');
      target.scrollIntoView({block:'center'});target.focus({preventScroll:true});
    }
    window.addEventListener('hashchange',jump);requestAnimationFrame(jump);
    document.getElementById('show-discussion').addEventListener('click',e=>{
      if(!window.mountComments){status('Comments are unavailable. Please try again later.');return;}
      e.currentTarget.disabled=true;mountComments('book:'+book.id,'Questions & corrections');
      document.getElementById('comments').scrollIntoView({block:'start'});
    });
  }
  window.BookUI={init};
})();
