import {recommend} from './engine.js';
const form=document.querySelector('#planner'),status=document.querySelector('#status'),results=document.querySelector('#results'),find=document.querySelector('#find');
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#preference').value=b.dataset.example;document.querySelector('#preference').focus();}));
function element(tag,text,className){const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;}
form.addEventListener('submit',async event=>{
  event.preventDefault();find.disabled=true;results.hidden=true;status.textContent='Finding a small way out…';
  try{
    const filters={minutes:Number(document.querySelector('#minutes').value),movement:document.querySelector('#movement').value,equipment:[...form.querySelectorAll('input:checked')].map(e=>e.value)};
    const response=await recommend(document.querySelector('#preference').value,filters,text=>status.textContent=text);
    status.textContent=response.message;
    if(!response.results.length)return;
    results.replaceChildren();
    const heading=element('div',null,'result-heading');heading.append(element('h2',response.status==='uncertain'?'Available ideas — no clear match':'Your little way out'));
    const print=element('a','Take one card','print');print.href=`card.html?activity=${encodeURIComponent(response.results[0].id)}`;heading.append(print);results.append(heading);
    if(response.status==='uncertain')results.append(element('p',response.message,'uncertain'));
    const grid=element('div',null,'result-grid');
    response.results.forEach((a,i)=>{const card=element('article',null,'activity');card.append(element('div',`${i===0?'START HERE':'ANOTHER WAY'} · ${a.minutes} MIN · ${a.movement.toUpperCase()}`,'kicker'));card.append(element('h3',a.title));const steps=element('ol');a.steps.forEach(t=>steps.append(element('li',t)));card.append(steps,element('p',a.takeaway,'takeaway'));grid.append(card);});
    results.append(grid);results.hidden=false;results.focus({preventScroll:true});results.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){status.textContent='The local model could not start. No recommendation was generated. Try reloading; if it persists, check the setup instructions.';console.error(error);}finally{find.disabled=false;}
});
if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(async registration=>{if(registration.active)registration.active.postMessage({type:'status'});}).catch(()=>{document.querySelector('#offline-status').textContent='Offline caching is unavailable in this browser. Keep the local server running.';});navigator.serviceWorker.addEventListener('message',event=>{if(event.data.type==='cache-status')document.querySelector('#offline-status').textContent=event.data.ready?'Offline pack ready for this browser. Cached assets can be removed in browser site settings.':'Offline pack is still downloading. Keep this page open.';});}else document.querySelector('#offline-status').textContent='Offline caching is unavailable in this browser.';
