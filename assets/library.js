(function () {
  'use strict';
  const C=window.Catalogue, size=20;
  let state={...C.defaults}, form, timer, historyBound=false;
  const byId=id=>document.getElementById(id);
  async function copy(text) {
    const status=byId('action-status');
    try { await navigator.clipboard.writeText(text); status.textContent='Link copied.'; }
    catch (_) { status.innerHTML='<label>Copy this link<input readonly value="'+C.esc(text)+'"></label>'; status.querySelector('input').select(); }
  }
  function readForm() {
    const next={...C.defaults};
    for(const key of Object.keys(next)) {
      const el=form.elements.namedItem(key); if(!el)continue;
      next[key]=el.type==='checkbox'?el.checked:el.value.trim();
    }
    return next;
  }
  function writeForm() {
    for(const key of Object.keys(state)) {
      const el=form.elements.namedItem(key);if(!el)continue;
      if(el.type==='checkbox')el.checked=!!state[key];else el.value=state[key];
    }
    if([state.isbn,state.from,state.to,state.topic,state.access!=='all',state.mode!=='all',state.related].some(Boolean))byId('more-search').open=true;
  }
  function url(push=false) {
    const query=C.stateQuery(state), suffix=query?'?'+query:'';
    const next=location.pathname+suffix+location.hash;
    if(next!==location.pathname+location.search+location.hash){try{history[push?'pushState':'replaceState']({},'',next);}catch(_){} }
    try{sessionStorage.setItem('aquifer.search',query);}catch(_){}
  }
  function resultCard(result) {
    const b=result.book, query=C.stateQuery(state), base=window.CATALOGUE_BOOK_BASE || 'books/';
    const href=C.bookURL(b,base,query), term=state.section || state.q;
    const reading=C.links(b), open=reading.find(s=>s.role==='open'), other=reading.some(s=>['library','preview'].includes(s.role));
    const access=open?'Open reading available':other?'Library / preview link':'Find the print copy in G15';
    const hits=result.hits.slice(0,3).map(({row,related})=>{
      const page=C.pageInfo(row), context=row.parents.map(e=>e.t).join(' › ');
      return '<li><div class="hit-heading"><a href="'+C.esc(href+'#'+row.id)+'">'+C.highlight(row.t,term)+'</a><span class="page-label">'+C.esc(page.text)+'</span></div>'+
        (context?'<div class="hit-context" title="'+C.esc(context)+'">'+C.esc(context)+'</div>':'')+
        (related?'<span class="match-kind">Related term</span>':'')+'</li>';
    }).join('');
    return '<article class="book catalogue-result" id="'+C.esc(b.id)+'" data-id="'+C.esc(b.id)+'">'+
      '<div class="result-top"><span class="record-id">'+C.esc(b.id)+'</span><span class="access-tag '+(open?'has-open':'')+'">'+access+'</span></div>'+
      '<h2><a href="'+C.esc(href)+'">'+C.highlight(C.fullTitle(b),state.title || state.q)+'</a></h2>'+
      '<p class="byline">'+C.highlight(b.authors || (b.editors?'Edited by '+b.editors:''),state.author || state.q)+'</p>'+
      '<p class="result-meta">'+C.esc([b.year,b.publisher].filter(Boolean).join(' · '))+'</p>'+
      '<p class="result-summary">'+C.esc(b.best_for || b.summary)+'</p>'+
      (hits?'<ul class="search-hits">'+hits+'</ul>':result.reason?'<p class="match-kind">Matches '+C.esc(result.reason.toLowerCase())+'</p>':'')+
      '<div class="result-bottom"><a href="'+C.esc(href)+'">View book & contents →</a>'+
      (result.hits.length>3?'<span>'+result.hits.length+' matching sections</span>':'')+'</div></article>';
  }
  function render() {
    if(!form || !window.LIBRARY)return;
    const reversed=state.from&&state.to&&Number(state.from)>Number(state.to), invalid=reversed || !form.checkValidity();
    byId('search-error').textContent=reversed?'The start year must not be after the end year.':invalid?'Check the year range or ISBN format.':'';
    const results=invalid?[]:C.search(LIBRARY.books,state), pages=Math.max(1,Math.ceil(results.length/size));
    state.page=Math.min(state.page,pages);url();
    const start=(state.page-1)*size, shown=results.slice(start,start+size);
    const sorting=state.sort==='relevance' && results.some(r=>r.active)?'relevance':state.sort==='newest'?'newest first':state.sort==='oldest'?'oldest first':'title';
    byId('result-note').textContent=results.length+' matching '+(results.length===1?'record':'records')+' · '+(results.length?'Showing '+(start+1)+'–'+(start+shown.length)+' · ':'')+'Sorted by '+sorting;
    byId('book-list').innerHTML=shown.map(resultCard).join('') || '<div class="empty-state"><h2>No matching books</h2><p>Try fewer fields, a shorter title, or a surname. Filled fields are combined with AND.</p></div>';
    byId('pagination').innerHTML=pages>1?'<button type="button" data-step="-1" '+(state.page===1?'disabled':'')+'>← Previous</button><span>Page '+state.page+' of '+pages+'</span><button type="button" data-step="1" '+(state.page===pages?'disabled':'')+'>Next →</button>':'';
  }
  function init() {
    form=byId('catalogue-search');if(!form || form.dataset.ready)return;
    form.dataset.ready='1';state=C.parseState(location.search);
    const oldId=new URLSearchParams(location.search).get('book') || new URLSearchParams(location.search).get('id');
    if(oldId && LIBRARY.books.some(b=>b.id===oldId)){location.replace(C.bookURL({id:oldId},window.CATALOGUE_BOOK_BASE || 'books/'));return;}
    const counts={};LIBRARY.books.forEach(b=>(b.topics||[]).forEach(t=>counts[t]=(counts[t]||0)+1));
    byId('topic').innerHTML='<option value="">All subjects</option>'+Object.keys(counts).sort().map(t=>'<option value="'+C.esc(t)+'">'+C.esc(t)+' ('+counts[t]+')</option>').join('');
    byId('library-count').textContent=LIBRARY.stats.books+' catalogue records · '+LIBRARY.stats.works+' title families · G15, University of Birmingham';
    writeForm();render();
    const update=push=>{state=readForm();url(push);render();};
    form.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>update(false),220);});
    form.addEventListener('change',()=>{clearTimeout(timer);update(false);});
    form.addEventListener('submit',e=>{e.preventDefault();clearTimeout(timer);update(true);byId('result-note').focus();});
    form.addEventListener('reset',()=>{clearTimeout(timer);setTimeout(()=>{state={...C.defaults};writeForm();url(true);render();byId('q').focus();},0);});
    byId('share-search').addEventListener('click',()=>copy(C.PUBLIC+'library.html'+(C.stateQuery(state)?'?'+C.stateQuery(state):'')));
    byId('pagination').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(!b)return;state.page+=Number(b.dataset.step);url(true);render();byId('result-note').scrollIntoView({block:'start'});byId('result-note').focus();});
    if(!historyBound){window.addEventListener('popstate',()=>{if(!document.getElementById('catalogue-search'))return;state=C.parseState(location.search);writeForm();render();});historyBound=true;}
  }
  window.LibraryUI={init,render};
})();
