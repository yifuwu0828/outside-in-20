import {initialize,recommend,modelInfo} from './engine.js';
import {activities,eligibleActivities} from './catalog.js';
export const cases=[
  ['I want to stop and hear the breeze and nearby sounds.','listen'],
  ['I would like to quietly observe a feathered visitor flying around.','birds'],
  ['I feel like looking up and seeing shapes drift across the sky.','clouds'],
  ['I want to wander and notice surfaces that are rough or smooth.','textures'],
  ['I want a little scavenger hunt looking for things of one hue.','colors'],
  ['I would like to draw the outline of buildings against the horizon.','sky-sketch'],
  ['I want to sit on a bench and enjoy a few pages of a novel.','read'],
  ['I want to use my pencil to capture the shape of a plant.','leaf-sketch'],
  ['I would like to take a picture of an interesting shadow outside.','photo'],
  ['I want to stretch my legs and stroll around a familiar route.','walk'],
  ['I want to go outdoors with a friend and catch up about our day.','talk'],
  ['I want to make a public place cleaner by collecting a little litter.','tidy'],
];
const allEquipment=['paper','book','camera','gloves'];
let report;
document.querySelector('#run').addEventListener('click',async()=>{
  const run=document.querySelector('#run'),progress=document.querySelector('#progress'),output=document.querySelector('#report');run.disabled=true;
  const started=new Date().toISOString(),start=performance.now();
  try{
    const initialization=await initialize(t=>progress.textContent=t),semantic=[];
    for(const [query,expected] of cases){progress.textContent=`Checking meaning ${semantic.length+1}/12…`;const r=await recommend(query,{minutes:20,movement:'any',equipment:allEquipment});semantic.push({query,expected,actual:r.results.map(a=>({id:a.id,score:Number(a.score.toFixed(5))})),top1:r.results[0]?.id===expected,top3:r.results.some(a=>a.id===expected),inferenceMs:r.inferenceMs,status:r.status});}
    let combinations=0,filterViolations=[];
    for(const minutes of [5,10,15,20])for(const movement of ['any','seated','walking'])for(let mask=0;mask<16;mask++){
      const equipment=allEquipment.filter((_,i)=>mask&(1<<i));const filters={minutes,movement,equipment},eligible=eligibleActivities(filters);combinations++;
      for(const a of eligible)if(a.minutes>minutes||(movement!=='any'&&a.movement!==movement)||a.equipment.some(e=>!equipment.includes(e)))filterViolations.push({filters,id:a.id});
    }
    const zero=await recommend('I want to go for a little walk.',{minutes:5,movement:'walking',equipment:[]});
    const empty=await recommend('',{minutes:20,movement:'any',equipment:[]});
    const numerical=await recommend('1234567890123',{minutes:20,movement:'any',equipment:[]});
    const overlong=await recommend('walking '.repeat(50),{minutes:20,movement:'any',equipment:[]});
    const unrelated=await recommend('Please repair a broken SQL database migration and debug a server.',{minutes:20,movement:'any',equipment:allEquipment});
    const nonsense=await recommend('florb zingle wobble quux snarp',{minutes:20,movement:'any',equipment:allEquipment});
    const constrained=await recommend('I want to walk and take photographs.',{minutes:5,movement:'seated',equipment:[]});
    const hardFilterInference=constrained.results.every(a=>a.minutes<=5&&a.movement==='seated'&&a.equipment.length===0);
    const requests=performance.getEntriesByType('resource').map(e=>({url:e.name,durationMs:Math.round(e.duration),transferBytes:e.transferSize}));
    report={startedAtUtc:started,finishedAtUtc:new Date().toISOString(),elapsedMs:Math.round(performance.now()-start),model:modelInfo,initialization,semantic:{cases:semantic,top1Passed:semantic.filter(s=>s.top1).length,top3Passed:semantic.filter(s=>s.top3).length,total:12},filters:{combinations,violations:filterViolations,actualInferenceConstraintPass:hardFilterInference,actualInferenceIds:constrained.results.map(a=>a.id)},edgeCases:{zeroEligible:zero.status,empty:empty.status,numerical:numerical.status,overlong:overlong.status,unrelated:{status:unrelated.status,topId:unrelated.results[0]?.id,topScore:unrelated.results[0]?.score},nonsense:{status:nonsense.status,topId:nonsense.results[0]?.id,topScore:nonsense.results[0]?.score}},resourceRequests:requests,externalAssetRequests:requests.filter(e=>new URL(e.url).origin!==location.origin),browser:navigator.userAgent,limitations:['12 development fixtures are not an unbiased benchmark.','Similarity threshold 0.28 is a fixed heuristic, not calibrated confidence.','Seated flag is a card posture filter, not an accessibility audit.','No actual outdoor field test or user trial performed.']};
    output.textContent=JSON.stringify(report,null,2);progress.textContent=`Finished: top 1 ${report.semantic.top1Passed}/12; top 3 ${report.semantic.top3Passed}/12. Filter violations ${filterViolations.length}.`;document.querySelector('#download').disabled=false;
  }catch(error){output.textContent=JSON.stringify({startedAtUtc:started,error:String(error),stack:error.stack},null,2);progress.textContent='Validation failed — see the actual error below.';console.error(error);}finally{run.disabled=false;}
});
document.querySelector('#download').addEventListener('click',()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}));a.download='outside20-validation.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
