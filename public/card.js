import {activities} from './catalog.js';
const activity=activities.find(a=>a.id===new URLSearchParams(location.search).get('activity')),card=document.querySelector('#card');
function element(tag,text,className){const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;}
if(activity){card.append(element('div',`${activity.minutes} MIN · ${activity.movement.toUpperCase()}`,'kicker'),element('h1',activity.title));const list=document.createElement('ol');activity.steps.forEach(s=>list.append(element('li',s)));card.append(list,element('p',activity.takeaway,'takeaway'));}else{card.append(element('h1','Choose a card first'),element('p','Return to the planner and pick an available idea.'));document.querySelector('#print').hidden=true;}
document.querySelector('#print').addEventListener('click',()=>window.print());
