import {pipeline, env} from './vendor/transformers.web.js';
import {activities,eligibleActivities,rankActivities,validatePreference} from './catalog.js';
env.allowRemoteModels=false;
env.allowLocalModels=true;
env.localModelPath=new URL('./models/',import.meta.url).href;
env.useBrowserCache=false;
env.backends.onnx.wasm.wasmPaths=new URL('./vendor/onnx/',import.meta.url).href;
env.backends.onnx.wasm.numThreads=1;
env.backends.onnx.wasm.proxy=false;
let loadPromise,extractor,vectors;
export const modelInfo={id:'Xenova/all-MiniLM-L6-v2',revision:'751bff37182d3f1213fa05d7196b954e230abad9',runtime:'Transformers.js 3.8.1',dtype:'q8',dimensions:384};
export async function initialize(onProgress=()=>{}) {
  if(!loadPromise) loadPromise=(async()=>{
    const start=performance.now();
    onProgress('Loading the local open model…');
    extractor=await pipeline('feature-extraction',modelInfo.id,{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress')onProgress(`Loading model assets… ${Math.round(p.progress)}%`);}});
    const tensor=await extractor(activities.map(a=>a.intent),{pooling:'mean',normalize:true});
    const rows=tensor.tolist();
    if(rows.length!==activities.length||rows.some(r=>r.length!==384||r.some(v=>!Number.isFinite(v))))throw new Error('Unexpected embedding shape.');
    vectors=Object.fromEntries(activities.map((a,i)=>[a.id,rows[i]]));
    onProgress('Ready — your words stay in this browser.');
    return {dimensions:384,activityCount:rows.length,initializationMs:Math.round(performance.now()-start),model:modelInfo};
  })().catch(e=>{loadPromise=null;throw e;});
  return loadPromise;
}
export async function recommend(text,filters,onProgress) {
  const error=validatePreference(text);
  if(error)return {status:'invalid',message:error,results:[]};
  const candidates=eligibleActivities(filters);
  if(!candidates.length)return {status:'empty',message:'No card fits all these limits. Add time, allow another movement option, or select equipment you have.',results:[]};
  await initialize(onProgress);
  const start=performance.now();
  const tensor=await extractor(text.trim(),{pooling:'mean',normalize:true});
  const vector=tensor.tolist()[0];
  if(vector.length!==384||vector.some(v=>!Number.isFinite(v)))throw new Error('Invalid query embedding.');
  const ranked=rankActivities(candidates,vector,vectors);
  // Similarity is a retrieval score, never a probability. This fixed guard is a heuristic.
  const weak=ranked[0].score<0.28;
  const count=Math.min(3,ranked.length);
  return {status:weak?'uncertain':'matched',message:weak?'No clear match. These are available ideas, not a confident interpretation. Try describing a specific outdoor break.':`${count} ${count===1?'idea':'ideas'} that fit your limits.`,results:ranked.slice(0,3),eligibleCount:candidates.length,inferenceMs:Math.round(performance.now()-start),embeddingDimensions:vector.length};
}
