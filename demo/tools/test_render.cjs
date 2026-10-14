// Checks hot-path work with instrumented browser APIs; not an FPS benchmark.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const stats={audio:0,decode:0,play:0,blur:0,text:0,dom:0,canvas:0,rects:[]};
const context=new Proxy({}, {
 get:(_,key)=>key==='fillRect'?((...args)=>stats.rects.push(args)):key==='fillText'?(()=>stats.text++):key==='createLinearGradient'?(()=>({addColorStop(){}})):(()=>{}),
 set:(_,key,value)=>{if(key==='shadowBlur'&&value)stats.blur++;return true;}
});
const element=()=>({style:{},classList:{add(){},remove(){},toggle(){}},children:[],replaceChildren(){this.children=[]},append(c){this.children.push(c)},setAttribute(){},addEventListener(){},set textContent(value){stats.dom++;},getContext:()=>context});
const nodes={};
class AudioContextMock{
 createGain(){return {gain:{value:0},connect(){}};}
 resume(){return Promise.resolve();}
 decodeAudioData(bytes){stats.decode++;assert.equal(Buffer.from(bytes).subarray(0,4).toString(),'RIFF');return Promise.resolve({});}
 createBufferSource(){return {connect(){},disconnect(){},start(){stats.play++;this.onended?.();}};}
}
const sandbox={console,Math,Uint8Array,atob,AudioContext:AudioContextMock,
 Image:class{set src(v){this.complete=true;this.naturalWidth=100;}},
 Audio:class{constructor(){stats.audio++;}play(){return Promise.resolve();}pause(){}},
 document:{getElementById:id=>nodes[id]??=element(),querySelectorAll:()=>[],createElement:tag=>{if(tag==='canvas')stats.canvas++;return element();}},
 setTimeout(){},requestAnimationFrame(){},addEventListener(){}};
sandbox.window=sandbox;vm.createContext(sandbox);
for(const file of ['config.js','story.js','sfx-data.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);
const run=code=>vm.runInContext(code,sandbox);
(async()=>{
 run('reset()');await new Promise(resolve=>setImmediate(resolve));
 assert.equal(stats.decode,5);
 run("startLevel(0);for(const asset of Object.keys(images))warmAsset(asset);schedule=[{at:1000,type:'green'}];draw();");
 const baseline={...stats};
 run("for(const key of ['z','x']){keys={[key]:true};for(let i=0;i<600;i++){update(1/60);draw();}}keys={};");
 assert(stats.play-baseline.play>80,'continuous fire must play attack sounds');
 for(const key of ['audio','decode','blur','text','dom','canvas'])assert.equal(stats[key],baseline[key],key+' repeated during continuous fire');
 run("startLevel(2);enemies=[];spawn('boss');shots=[];bullets=[];fires=[];");
 stats.rects=[];run('draw()');
 const bar=stats.rects.find(([, ,width,height])=>width===160&&height===9);
 assert(bar&&bar[1]>160+154/2,'boss HP bar must be below the sprite');
 console.log('PASS: 20 seconds of continuous Z/X fire; no new media players, audio decodes, blur, text drawing, HUD writes or canvas allocations. Boss bar is below sprite.');
})().catch(error=>{console.error(error);process.exitCode=1;});
