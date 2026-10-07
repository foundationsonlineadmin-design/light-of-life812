(() => {
  const STORAGE_KEY='lol-text-size-v1';
  const root=document.documentElement;
  const panel=document.querySelector('#text-size-panel');
  const toggle=document.querySelector('#text-size-toggle');
  const output=document.querySelector('#text-size-value');
  const excluded=new Set(['SCRIPT','STYLE','LINK','META','HEAD']);
  let scale=1;
  try{scale=Number(localStorage.getItem(STORAGE_KEY))||1}catch{}
  scale=Math.max(.8,Math.min(1.4,scale));

  function capture(elements){
    const prior=root.style.getPropertyValue('--text-scale')||'1';
    root.style.setProperty('--text-scale','1');
    for(const el of elements){
      if(!(el instanceof Element)||excluded.has(el.tagName)||el.hasAttribute('data-text-size-captured'))continue;
      const size=getComputedStyle(el).fontSize;
      el.style.setProperty('--text-size-base',size);
      el.style.setProperty('font-size','calc(var(--text-size-base) * var(--text-scale))');
      el.setAttribute('data-text-size-captured','');
    }
    root.style.setProperty('--text-scale',prior);
  }
  function captureTree(node){
    const elements=[];
    if(node instanceof Element){elements.push(node);elements.push(...node.querySelectorAll('*'))}
    capture(elements);
  }
  function update(){
    root.style.setProperty('--text-scale',String(scale));
    output.value=`${Math.round(scale*100)}%`;
    output.textContent=output.value;
    try{localStorage.setItem(STORAGE_KEY,String(scale))}catch{}
  }
  captureTree(document.body);
  update();
  new MutationObserver(records=>{
    const added=[];
    for(const record of records)for(const node of record.addedNodes)if(node instanceof Element)added.push(node);
    if(added.length)capture(added.flatMap(node=>[node,...node.querySelectorAll('*')]));
  }).observe(document.body,{childList:true,subtree:true});

  toggle.addEventListener('click',()=>{
    const open=panel.hidden;
    panel.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
  });
  document.querySelector('#text-size-decrease').addEventListener('click',()=>{scale=Math.max(.8,Math.round((scale-.1)*10)/10);update()});
  document.querySelector('#text-size-increase').addEventListener('click',()=>{scale=Math.min(1.4,Math.round((scale+.1)*10)/10);update()});
  document.querySelector('#text-size-reset').addEventListener('click',()=>{scale=1;update()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.focus()}});
})();
