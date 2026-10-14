'use strict';
const $=id=>document.getElementById(id), C=CONFIG, W=960,H=720,ctx=$('canvas').getContext('2d');
const images={},rasterCache=new Map();
function img(path){if(!images[path]){const im=new Image();images[path]=im;im.addEventListener?.('load',()=>warmAsset(path));im.src=path;}return images[path];}
function warmAsset(path){
 let size=null;
 if(C.assets.sprites.gardevoir.includes(path))size=64;
 else if(C.assets.sprites.charizard.includes(path))size=130;
 else for(const [type,asset] of Object.entries(C.assets.enemies))if(asset===path)size=type==='boss'?154:type==='king'?64:49;
 if(size)cacheAsset(path,size,size);
}
function cacheAsset(path,w,h){
 const key=`${path}:${w}x${h}`;if(rasterCache.has(key))return rasterCache.get(key);
 const im=images[path];if(!im?.complete||!im.naturalWidth)return null;
 const bitmap=document.createElement('canvas');bitmap.width=w;bitmap.height=h;bitmap.getContext('2d').drawImage(im,0,0,w,h);rasterCache.set(key,bitmap);return bitmap;
}
function loadAll(o){Object.values(o).forEach(v=>typeof v==='object'?loadAll(v):/\.(svg|png|webp|jpg)$/.test(v)&&img(v));}loadAll(C.assets);
let mode='title',paused=false,muted=false,bgm=null,bgKey=null,section='A',lineIndex=0,level=0,hp=C.player.hp,grapes=C.player.grapes,keys={},enemies=[],bullets=[],shots=[],particles=[],fires=[],schedule=[],elapsed=0,killed=0,spawned=0,player={x:480,y:610},attackCD=0,hurtCD=0,healCD=0,allyShots=0,allyCD=0,allyText='',allyRest=0,pendingFlame=0,shake=0,checkpoint=null;
const names={gardevoir:'你',ralts:'拉鲁拉丝',charizard:'喷火龙'};
const controlsCue=STORY.A.findIndex(row=>row.speaker==='拉鲁拉丝'&&row.text==='对了，您还记得您的王牌招式吧？');
function music(key){
 if(key===bgKey)return;
 if(key==='pauseTown08'&&bgKey==='town08'&&bgm){bgm.pause();bgKey=key;return;}
 if(key==='town08'&&bgKey==='pauseTown08'&&bgm){bgKey=key;if(!muted&&!paused)bgm.play().catch(error=>console.error('BGM play failed',key,error));return;}
 if(bgm){bgm.pause();bgm.currentTime=0;}
 bgKey=key;bgm=key&&key!=='pauseTown08'?new Audio(C.assets.bgm[key]):null;
 if(bgm){bgm.loop=true;bgm.volume=.3;if(!muted&&!paused)bgm.play().catch(error=>console.error('BGM play failed',key,error));}
}
const bgmCues={
 aField:STORY.A.findIndex(row=>row.text.includes('把你围的严严实实')),
 aStop:STORY.A.findIndex(row=>row.text==='就在这时，远方传来一阵低吼声。'),
 aEngi:STORY.A.findIndex(row=>row.speaker==='？？？'&&row.text==='嗷呜……！嗷呜！嗷呜呜！'),
 cStop:STORY.C.findIndex(row=>row.speaker==='？？？'&&row.text==='大家早上好呀~'),
 cTown:STORY.C.findIndex(row=>row.text.includes('降落在拉鲁拉丝身旁')),
 cPause:STORY.C.findIndex(row=>row.text==='又是熟悉的、此起彼伏的低吼声。')-1,
 cResume:STORY.C.findIndex(row=>row.speaker==='拉鲁拉丝'&&row.text==='太好了！看来昨天那顿烤肉没白奖励你。'),
 cAnger:STORY.C.findIndex(row=>row.speaker==='拉鲁拉丝'&&row.text==='……（怒）'),
 dStop:STORY.D.findIndex(row=>row.text==='这就是，被魔物们世世代代守护的、终极真理——！')+1,
 dWakare:STORY.D.findIndex(row=>row.speaker==='你'&&row.text==='嗯……')
};
function storyMusic(s,index){
 if(s==='A')return index<bgmCues.aField?'wakare2':index<bgmCues.aStop?'field4':index<bgmCues.aEngi?null:'slgEngi';
 if(s==='B')return 'slgEngi';
 if(s==='C')return index<bgmCues.cStop?'slgEngi':index<bgmCues.cTown?null:index<bgmCues.cPause?'town08':index<bgmCues.cResume?'pauseTown08':index<bgmCues.cAnger?'town08':'pauseTown08';
 return index<bgmCues.dStop?'yasuragi3':index<bgmCues.dWakare?null:'wakare2';
}
const soundPool={},soundBuffers={};let audioContext=null,soundGain=null,audioStarted=false;
function prepareFallbackSound(key){soundPool[key]=Array.from({length:4},()=>{const a=new Audio(C.assets.sfx[key]);a.volume=.28;a.preload='auto';a.load?.();return a;});}
function initAudio(){
 if(audioStarted){audioContext?.resume().catch(()=>{});return;}audioStarted=true;
 const AudioEngine=window.AudioContext||window.webkitAudioContext;
 try{if(AudioEngine){audioContext=new AudioEngine();soundGain=audioContext.createGain();soundGain.gain.value=.28;soundGain.connect(audioContext.destination);audioContext.resume().catch(()=>{});}}catch{audioContext=null;}
 for(const key of Object.keys(C.assets.sfx)){
  const encoded=window.SFX_DATA?.[C.assets.sfx[key]];
  if(!audioContext||!encoded){prepareFallbackSound(key);continue;}
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  audioContext.decodeAudioData(bytes.buffer).then(buffer=>{soundBuffers[key]=buffer;}).catch(()=>prepareFallbackSound(key));
 }
}
function sound(key){
 if(muted||paused)return;
 if(soundBuffers[key]){const source=audioContext.createBufferSource();source.buffer=soundBuffers[key];source.connect(soundGain);source.onended=()=>source.disconnect();source.start();return;}
 const a=soundPool[key]?.find(audio=>audio.paused||audio.ended);if(a){a.currentTime=0;a.play().catch(()=>{});}
}
function background(key,blur=false){const backdrop=$('backdrop');if(key!=='black')backdrop.style.backgroundImage=`url('${C.assets.backgrounds[key]}')`;backdrop.classList.toggle('black',key==='black');backdrop.classList.toggle('blurred',blur);}
const hudValues={};
function hud(){
 if(hudValues.hp!==hp){$('hp').textContent=`${Math.ceil(hp)} / ${C.player.hp}`;$('hpbar').style.width=`${hp/C.player.hp*100}%`;hudValues.hp=hp;}
 if(hudValues.grapes!==grapes){$('grape-count').textContent=`葡萄 ${grapes} / ${C.player.grapes}`;hudValues.grapes=grapes;}
 if(hudValues.level!==level||hudValues.killed!==killed){$('progress').textContent=`击退 ${killed} / ${C.waves[level].reduce((sum,wave)=>sum+wave.count,0)}`;hudValues.level=level;hudValues.killed=killed;}
}
function reset(){initAudio();hp=C.player.hp;grapes=C.player.grapes;keys={};paused=false;$('game').classList.remove('paused');$('game').classList.remove('finished');$('overlay').hidden=true;$('cover').hidden=true;music(null);showStory('A');}
function showStory(s){clearStoryProps();mode='story';section=s;lineIndex=0;keys={};$('hud').hidden=true;$('canvas').hidden=true;$('dialogue').hidden=false;$('portraits').hidden=false;$('portrait-reactions').hidden=false;$('pause').textContent='Ⅱ 暂停';renderLine();}
function renderLine(){const row=STORY[section][lineIndex];if(!row){if(section==='D')return ending(true);return startLevel({A:0,B:1,C:2}[section]);}
 $('controls-guide').hidden=section==='A'&&lineIndex<=controlsCue;
 const prior=STORY[section].slice(0,lineIndex+1).map(r=>r.text).join('\n');
 // 开场与结局各自经历黑屏，再切换背景。
 const village=section==='A'?prior.includes('映入眼帘'):!(section==='D'&&prior.includes('彻底陷入了黑暗'));
 const black=(section==='A'&&prior.includes('进入了梦乡')&&!prior.includes('映入眼帘')&&row.text!=='结束脑力劳动之后，你躺在床上进入了梦乡。')||(section==='D'&&prior.includes('彻底陷入了黑暗')&&!prior.includes('叮铃铃铃铃'));
 const presentation=storyPresentation(prior,village,row);
 background(black?'black':village?'village':'bedroom',village);
 music(storyMusic(section,lineIndex));
 $('backdrop').classList.toggle('black-now',section==='D'&&black);
 $('backdrop').classList.toggle('dream-warp',!!presentation.warp&&!presentation.deepWarp);
 $('backdrop').classList.toggle('dream-warp-deep',!!presentation.deepWarp);
 const afterJirachi=section==='D'&&STORY.D[lineIndex-1]?.text.includes('基拉祈睁开了眼睛');
 $('dream-glow').hidden=!(presentation.fullGlow||afterJirachi);
 if(afterJirachi){const shownAt=lineIndex;setTimeout(()=>{if(mode==='story'&&section==='D'&&lineIndex===shownAt)$('dream-glow').hidden=true;},900);}
 $('speaker').textContent=row.speaker||'';$('speaker').hidden=!row.speaker;$('line').textContent=row.text;
 let chars=[];if(village){chars=['gardevoir'];if(section!=='A'||prior.includes('哦哦，尊敬的沙奈朵大人'))chars.push('ralts');}if(village&&section==='C'&&prior.includes('降落在拉鲁拉丝'))chars.push('charizard');if(village&&section==='D')chars.push('charizard');
 $('portraits').className=presentation.chest?'treasure-scene':presentation.notebook?'notebook-scene':'';
 $('portraits').replaceChildren();$('portrait-reactions').replaceChildren();$('portrait-reactions').className=chars.length===3?'three-cast':'';for(const ch of chars){const el=document.createElement('img');el.alt=names[ch];const active=names[ch]===row.speaker||(ch==='gardevoir'&&row.speaker==='沙奈朵');const reaction=storyReaction(row,ch);const happy=active&&/！|嘿嘿|太好了|开心|胜利/.test(row.text)&&! /怒|危急|魔物！/.test(row.text);el.src=C.assets.portraits[ch][reaction?.expression||(happy?'happy':'calm')];el.className=active?'active':'';$('portraits').append(el);if(reaction?.symbol){const badge=document.createElement('span');badge.className='portrait-reaction '+ch;badge.textContent=reaction.symbol;$('portrait-reactions').append(badge);}}
 renderStoryProps(presentation);
}
function storyReaction(row,ch){
 const t=row.text;
 if(section==='D'){
  if(ch==='ralts'&&t.includes('您是我们村庄的守护神'))return {expression:'happy',symbol:'👍'};
  if(ch==='charizard'&&t==='那我呢？')return {expression:'calm',symbol:'？'};
  if(ch==='gardevoir'&&t.includes('哇……'))return {expression:'happy',symbol:'😊'};
 }
 if(section==='B'){
  if(ch==='ralts'&&t.includes('天哪，强力的沙奈朵大人'))return {expression:'happy',symbol:'！'};
  if(ch==='gardevoir'&&t==='这是什么？')return {expression:'calm',symbol:'？'};
  if(ch==='ralts'&&t.includes('啊，居然还有'))return {expression:'surprised',symbol:'💦'};
  if(ch==='ralts'&&t.includes('这次也拜托您了'))return {expression:'cheer'};
 }
 if(section==='C'){
  if(ch==='ralts'&&t.includes('这下危机终于解除了'))return {expression:'happy',symbol:'😊'};
  if(ch==='charizard'&&t.includes('降落在拉鲁拉丝身旁'))return {expression:'happy',symbol:'🕶️'};
  if(ch==='ralts'&&t.includes('喷火龙，你这是去哪了'))return {expression:'cheer'};
  if(ch==='charizard'&&t.includes('我寻思今天再去摘点'))return {expression:'calm',symbol:'…'};
  if(ch==='charizard'&&t.includes('那我来击败它们'))return {expression:'happy',symbol:'🕶️'};
  if(ch==='ralts'&&t==='天哪！')return {expression:'cheer'};
  if(ch==='charizard'&&t.includes('剩下的，就交给沙奈朵啦'))return {expression:'happy',symbol:'👍'};
  if(ch==='ralts'&&t==='……（怒）'&&row.speaker==='拉鲁拉丝')return {expression:'calm',symbol:'💢'};
  if(ch==='gardevoir'&&t==='……（怒）'&&row.speaker==='你')return {expression:'calm',symbol:'💢'};
 }
 if(section!=='A')return null;
 if(ch==='gardevoir'&&(/你是谁呀/.test(t)||/有关于魔物的信息吗/.test(t)))return {expression:'calm',symbol:'？'};
 if(ch!=='ralts')return null;
 if(t.includes('不要再开玩笑啦'))return {expression:'calm',symbol:'！'};
 if(t.includes('马上就要来袭击我们的村庄'))return {expression:'surprised'};
 if(t.includes('不知道飞到了哪里'))return {expression:'calm',symbol:'💦'};
 if(t.includes('我们相信沙奈朵大人一定可以的'))return {expression:'cheer'};
 if(t.includes('这里就只能交给')||t.includes('它们要攻过来了'))return {expression:'cheer'};
 if(t.includes('这么快就冷静下来了'))return {expression:'happy',symbol:'👍'};
 if(t.includes('博学的沙奈朵大人'))return {expression:'calm',symbol:'？'};
 return null;
}
// 从已读剧情推导演出状态，快速点击和重开均不会留下旧道具。
function storyPresentation(prior,village,row){
 if(section!=='D')return {};
 if(village){
  const indexOf=text=>STORY.D.findIndex(line=>line.text.includes(text));
  const muted=lineIndex===indexOf('心跳加速')||(lineIndex>=indexOf('话音刚落')&&lineIndex<indexOf('这样就好了'))||(lineIndex>=indexOf('与此同时，困意')&&lineIndex<indexOf('彻底陷入了黑暗'));
  const warp=lineIndex>=indexOf('话音刚落')&&lineIndex<indexOf('彻底陷入了黑暗');
  return {chest:prior.includes('出现了一个精致的宝箱'),open:prior.includes('宝箱打开了'),scroll:prior.includes('一卷古老的卷轴'),sparkles:prior.includes('耀眼的金光从箱子里喷涌而出'),dreamSticker:prior.includes('原来是一张基拉祈的贴纸'),fullGlow:row.text.startsWith('只要掌握了这句真理'),muted,warp,deepWarp:lineIndex>=indexOf('与此同时，困意')&&warp};
 }
 const waking=prior.split('彻底陷入了黑暗')[1]||'';
 return {notebook:waking.includes('床头柜上果然放着一个笔记本'),open:waking.includes('迫不及待地翻开'),sticker:waking.includes('翻到了最后一页'),sparkles:waking.includes('微弱而温柔的光芒'),stickerOpen:waking.includes('基拉祈睁开了眼睛')};
}
let propView=null;
function clearStoryProps(){
 $('story-props').replaceChildren();$('story-props').hidden=true;propView=null;
}
function renderStoryProps(state){
 const kind=state.chest?'chest':state.notebook?'notebook':null;
 if(!kind){clearStoryProps();return;}
 const layer=$('story-props');layer.hidden=false;layer.className=(kind==='chest'?'treasure-scene':'notebook-scene')+(state.muted?' muted':'');
 // 道具独立于人物层；对白切换只更新人物，道具 DOM 和位置保持原样。
 if(!propView||propView.kind!==kind){
  layer.replaceChildren();const stage=document.createElement('div');stage.className='story-prop';
  const art=document.createElement('img');art.className='prop-art';stage.append(art);layer.append(stage);
  propView={kind,stage,art,scroll:false,sticker:null,dreamSticker:null,sparkles:false};
 }
 const {stage,art}=propView;
 const src=kind==='chest'?C.assets.props[state.open?'chestOpen':'chestClosed']:C.assets.props[state.open?'notebookOpen':'notebookClosed'];
 if(propView.src!==src){art.src=src;propView.src=src;}
 art.alt=kind==='chest'?(state.open?'打开的宝箱':'宝箱'):(state.open?'翻开的笔记本':'笔记本');
 if(state.scroll&&!propView.scroll){const scroll=document.createElement('img');scroll.className='scroll-art';scroll.alt='发光的卷轴';scroll.src=C.assets.props.scroll;stage.append(scroll);propView.scroll=true;}
 if(state.dreamSticker&&!propView.dreamSticker){const sticker=document.createElement('img');sticker.className='dream-sticker';sticker.alt='闭着眼睛的基拉祈贴纸';sticker.src=C.assets.props.jirachiClosed;stage.append(sticker);propView.dreamSticker=sticker;}
 if(state.sticker&&!propView.sticker){const sticker=document.createElement('img');sticker.className='wish-sticker';sticker.alt='闭着眼睛的基拉祈贴纸';sticker.src=C.assets.props.jirachiClosed;stage.append(sticker);propView.sticker=sticker;}
 if(propView.sticker&&state.stickerOpen){propView.sticker.src=C.assets.props.jirachiOpen;propView.sticker.alt='睁开眼睛的基拉祈贴纸';}
 if(state.sparkles&&!propView.sparkles){
  stage.classList.add('glowing');
  if(kind==='chest'){const light=document.createElement('div');light.className='treasure-light';stage.append(light);}
  const count=kind==='chest'?16:5;
  for(let i=0;i<count;i++){const star=document.createElement('span');star.className=kind==='chest'?'story-sparkle':'sticker-sparkle';star.textContent='✦';if(kind==='chest'){star.style.left=(8+(i*37)%85)+'%';star.style.top=(5+(i*23)%79)+'%';}else{star.style.left=(58+(i*11)%24)+'%';star.style.bottom=(29+(i*13)%25)+'%';}star.style.animationDelay=(-i*.23)+'s';star.style.fontSize=(10+(i%4)*5)+'px';stage.append(star);}propView.sparkles=true;
 }
}
function moveEnemy(e,dt){
 if(e.type==='boss'){const right=level===2?W*5/6-80:850;e.x+=e.dir*e.speed*dt;if(e.x<110){e.x=110;e.dir=1;}if(e.x>right){e.x=right;e.dir=-1;}return;}
 const radius=e.type==='king'?32:25, bottom=Math.min(H-radius,H*2/3);
 const right=level===2?W*5/6-radius:W-radius;
 if(e.wandering){
  e.turnCD-=dt;if(e.turnCD<=0){e.heading+=(Math.random()-.5)*Math.PI;e.turnCD=.8+Math.random()*1.2;}
  e.x+=Math.cos(e.heading)*e.speed*dt;e.y+=Math.sin(e.heading)*e.speed*dt;
 }else if(e.type==='bat'||e.type==='king'){e.x+=Math.sin(elapsed*1.4+e.phase)*e.speed*dt;e.y+=e.speed*.65*dt;}else e.y+=e.speed*dt;
 // 到达画面约 2/3 处后折返，之后只在玩家前方随机游走。
 if(e.y>=bottom){e.y=bottom;e.wandering=true;e.heading=-Math.PI/2+(Math.random()-.5)*Math.PI*.7;e.turnCD=1+Math.random();}
 if(e.wandering&&e.y<120){e.y=120;e.heading=Math.PI/2+(Math.random()-.5)*Math.PI*.7;e.turnCD=1;}
 if(e.x<radius){e.x=radius;if(e.wandering)e.heading=(Math.random()-.5)*Math.PI*.8;}
 if(e.x>right){e.x=right;if(e.wandering)e.heading=Math.PI+(Math.random()-.5)*Math.PI*.8;}
}
function updateAllyRest(dt){
 if(allyRest<=0)return;
 allyRest=Math.max(0,allyRest-dt);
 allyText=allyRest>C.ally.exhaustedSeconds?'5！':allyRest>0?'没劲儿了……':'沙奈朵加油！';
}
function next(){if(mode==='story'&&!paused){lineIndex++;renderLine();}}
function startLevel(n,retry=false){clearStoryProps();level=n;mode='battle';paused=false;$('game').classList.remove('paused');$('game').classList.remove('finished');keys={};if(retry&&checkpoint){hp=checkpoint.hp;grapes=checkpoint.grapes;}else checkpoint={hp,grapes};
 if(n===2)music('boss05');
 $('canvas').hidden=false;$('hud').hidden=false;$('dialogue').hidden=true;$('portraits').hidden=true;$('portrait-reactions').hidden=true;$('overlay').hidden=true;background('village');
 enemies=[];bullets=[];shots=[];particles=[];fires=[];schedule=[];elapsed=0;killed=0;spawned=0;player={x:480,y:610};hurtCD=1;attackCD=0;healCD=0;allyShots=0;allyCD=0;allyRest=0;pendingFlame=0;allyText='';shake=0;
 for(const wave of C.waves[n])for(let i=0;i<wave.count;i++)schedule.push({at:wave.at+Math.floor(i/3)*.7+(i%3)*.12,type:wave.type});schedule.sort((a,b)=>a.at-b.at);hud();}
function spawn(type){const cfg=C.enemies[type],side=type==='bat'||(type==='king'&&Math.random()<.7),radius=type==='boss'?77:type==='king'?32:25;const right=level===2?W*5/6-radius:W-radius;const left=level===2||Math.random()<.5;const e={type,x:side?(left?30:right):80+Math.random()*(right-80),y:side?170+Math.random()*180:100,hp:cfg.hp,shot:cfg.interval,phase:Math.random()*Math.PI*2,dir:Math.random()<.5?-1:1,chatTime:0,chatCD:2+Math.random()*12,chatLine:'',...cfg};if(type==='boss'){e.x=480;e.y=160;allyCD=0;}enemies.push(e);spawned++;}
function burst(x,y,color,n=10){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.5)*170,t:.5,color});}
function damage(e,d){if(e.hp<=0)return;e.hp-=d;burst(e.x,e.y,'#eae3ba',3);if(e.hp<=0){killed++;burst(e.x,e.y,'#f5db91',16);}}
function firePlayer(){let type=keys.x?'song':keys.z?'psychic':null;if(!type||attackCD>0)return;const cfg=C[type];attackCD=cfg.interval;sound(type);let count=cfg.count||1;for(let i=0;i<count;i++){const a=-Math.PI/2+(count>1?((i/(count-1))-.5)*cfg.angle*Math.PI/180:0);shots.push({x:player.x,y:player.y-25,vx:Math.cos(a)*cfg.speed,vy:Math.sin(a)*cfg.speed,type,damage:cfg.damage});}}
function heal(){if(healCD>0||grapes<=0||hp>=C.player.hp)return;hp=Math.min(C.player.hp,hp+C.player.heal);grapes--;healCD=.35;sound('heal');burst(player.x,player.y,'#a8e9b0',22);}
function hurt(d){if(hurtCD>0)return;hp=Math.max(0,hp-d);hurtCD=C.player.invincible;shake=.12;sound('hit');burst(player.x,player.y,'#ec9390');if(hp<=0)ending(false);}
const enemyChatLines=['嗷～','冲呀！','好想回家……','这是哪？','天气不错！','怎么又加班？','写论文中勿扰','参考文献的格式……','有金币！','更多的金币！','快，快摸鱼','燃尽啦','到饭点了吗？','想睡觉','要干啥来着'];
function update(dt){elapsed+=dt;attackCD-=dt;hurtCD-=dt;healCD-=dt;shake=Math.max(0,shake-dt);while(schedule.length&&schedule[0].at<=elapsed)spawn(schedule.shift().type);
 let dx=(!!(keys.arrowright||keys.d))-(!!(keys.arrowleft||keys.a)),dy=(!!(keys.arrowdown||keys.s))-(!!(keys.arrowup||keys.w));let length=Math.hypot(dx,dy)||1;player.x=Math.max(24,Math.min(936,player.x+dx/length*C.player.speed*dt));player.y=Math.max(125,Math.min(688,player.y+dy/length*C.player.speed*dt));firePlayer();if(keys.c)heal();
 let activeChats=0;for(const e of enemies){if(e.hp<=0)continue;moveEnemy(e,dt);if(e.type!=='boss'){e.chatTime=Math.max(0,e.chatTime-dt);e.chatCD-=dt;if(e.chatTime>0)activeChats++;else if(e.chatCD<=0&&activeChats<2&&Math.random()<dt*.1){e.chatLine=enemyChatLines[Math.floor(Math.random()*enemyChatLines.length)];e.chatTime=1.25;e.chatCD=12+Math.random()*14;activeChats++;}}e.shot-=dt;if(e.shot<=0){e.shot+=e.interval;for(let j=0;j<e.count;j++){const a=Math.PI/2+(Math.random()-.5)*e.angle*Math.PI/180;bullets.push({x:e.x,y:e.y+15,vx:Math.cos(a)*155,vy:Math.sin(a)*155,damage:e.damage,type:e.type});}}
 if(Math.hypot(e.x-player.x,e.y-player.y)<(e.type==='boss'?52:25))hurt(e.damage);
 }
 const boss=enemies.find(e=>e.type==='boss'&&e.hp>0);if(boss){if(elapsed>=2){allyCD-=dt;if(allyShots<C.ally.shots&&allyCD<=0&&pendingFlame<=0){allyShots++;allyText=`${allyShots}！`;allyCD=C.ally.interval;pendingFlame=.25;}}
 if(pendingFlame>0){pendingFlame-=dt;if(pendingFlame<=0){fires.push({x:840,y:410,tx:boss.x,ty:boss.y,t:.65});damage(boss,C.ally.damage);shake=.4;burst(boss.x,boss.y,'#ffb64d',35);sound('fire');if(allyShots===C.ally.shots)allyRest=.5+C.ally.exhaustedSeconds;}}}

 updateAllyRest(dt);
 for(const s of shots){s.x+=s.vx*dt;s.y+=s.vy*dt;for(const e of enemies){if(e.hp>0&&Math.hypot(s.x-e.x,s.y-e.y)<(e.type==='boss'?50:26)){damage(e,s.damage);s.y=-999;break;}}}
 for(const b of bullets){b.x+=b.vx*dt;b.y+=b.vy*dt;if(Math.hypot(b.x-player.x,b.y-player.y)<12){hurt(b.damage);b.y=999;}}
 shots=shots.filter(s=>s.y>-40&&s.x>-30&&s.x<W+30);bullets=bullets.filter(b=>b.y<H+30&&b.x>-30&&b.x<W+30);enemies=enemies.filter(e=>e.hp>0);
 for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t-=dt;}particles=particles.filter(p=>p.t>0);fires.forEach(f=>f.t-=dt);fires=fires.filter(f=>f.t>0);hud();
 if(mode!=='battle')return;if(!schedule.length&&!enemies.length){showStory(['B','C','D'][level]);}
}
function drawAsset(path,x,y,w,h){const bitmap=cacheAsset(path,w,h);if(bitmap)ctx.drawImage(bitmap,Math.round(x-w/2),Math.round(y-h/2));}
// 模糊发光和音符只栅格化一次，战斗帧仅复制小位图。
const projectileArt={};
function prepareProjectileArt(){
 for(const type of ['psychic','song','green','red','bat','king','boss']){
  const art=document.createElement('canvas');art.width=type==='boss'?26:['green','red','bat','king'].includes(type)?20:64;art.height=type==='psychic'?80:type==='song'?48:art.width;
  const brush=art.getContext('2d');
  if(type==='psychic'){brush.fillStyle='#d7b6ff';brush.shadowColor='#9760ff';brush.shadowBlur=15;brush.fillRect(28,22,8,32);}
  else if(type==='song'){brush.fillStyle='#ffb7d7';brush.font='bold 25px serif';brush.textAlign='center';brush.fillText('♪',32,32);}
  else if(type==='green'){brush.beginPath();brush.arc(10,10,6,0,Math.PI*2);brush.fillStyle='#c5ed9b';brush.strokeStyle='#64a875';brush.lineWidth=2;brush.fill();brush.stroke();}
  else if(type==='red'){brush.beginPath();brush.moveTo(10,2);brush.lineTo(17,10);brush.lineTo(10,18);brush.lineTo(3,10);brush.closePath();brush.fillStyle='#f7a1a4';brush.strokeStyle='#b96168';brush.lineWidth=2;brush.fill();brush.stroke();}
  else if(type==='bat'){brush.beginPath();brush.moveTo(2,7);brush.lineTo(7,9);brush.lineTo(10,4);brush.lineTo(13,9);brush.lineTo(18,7);brush.lineTo(16,15);brush.lineTo(10,12);brush.lineTo(4,15);brush.closePath();brush.fillStyle='#bfa9e7';brush.strokeStyle='#735e9d';brush.lineWidth=1.5;brush.fill();brush.stroke();}
  else if(type==='king'){brush.beginPath();brush.moveTo(2,6);brush.lineTo(6,10);brush.lineTo(9,4);brush.lineTo(12,10);brush.lineTo(18,6);brush.lineTo(16,16);brush.lineTo(4,16);brush.closePath();brush.fillStyle='#eac887';brush.strokeStyle='#93638c';brush.lineWidth=1.5;brush.fill();brush.stroke();}
  else{brush.beginPath();brush.moveTo(13,2);brush.lineTo(24,13);brush.lineTo(13,24);brush.lineTo(2,13);brush.closePath();brush.fillStyle='#98d8e1';brush.strokeStyle='#4a788f';brush.lineWidth=2;brush.fill();brush.stroke();brush.fillStyle='#ecfaff';brush.fillRect(11,6,4,14);brush.fillRect(6,11,14,4);}
  projectileArt[type]=art;
 }
}
prepareProjectileArt();
function dxMoving(){return keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright;}
function draw(){ctx.clearRect(0,0,W,H);if(mode!=='battle')return;ctx.save();if(shake)ctx.translate((Math.random()-.5)*shake*24,(Math.random()-.5)*shake*24);
 if(level===2){drawAsset(C.assets.sprites.charizard[Math.floor(elapsed*7)%C.assets.sprites.charizard.length],864,410+Math.sin(elapsed*3)*3,130,130);if(allyText){ctx.fillStyle='#fff5d7';ctx.beginPath();ctx.roundRect(775,294,175,34,8);ctx.fill();ctx.fillStyle='#5e5746';ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText(allyText,862,317);}}
 for(const e of enemies){const size=e.type==='boss'?154:e.type==='king'?64:49;drawAsset(C.assets.enemies[e.type],e.x,e.y,size,size);if(e.type==='boss'){ctx.fillStyle='#3e5355';ctx.fillRect(e.x-80,e.y+88,160,9);ctx.fillStyle='#e8a496';ctx.fillRect(e.x-80,e.y+88,160*e.hp/C.enemies.boss.hp,9);ctx.fillStyle='#fff8e4';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(`巨金怪  ${Math.ceil(e.hp)} / ${C.enemies.boss.hp}`,e.x,e.y+116);}}
 for(const s of shots){const art=projectileArt[s.type];ctx.drawImage(art,Math.round(s.x-art.width/2),Math.round(s.y-art.height/2));}
 for(const b of bullets){const art=projectileArt[b.type]||projectileArt.green;ctx.drawImage(art,Math.round(b.x-art.width/2),Math.round(b.y-art.height/2));}
 if(hurtCD<=0||Math.floor(elapsed*15)%2===0)drawAsset(C.assets.sprites.gardevoir[(dxMoving()?Math.floor(elapsed*9):1)%C.assets.sprites.gardevoir.length],player.x,player.y+(keys.arrowup||keys.w?Math.sin(elapsed*14)*2:0),64,64);ctx.fillStyle='#f8edbd';ctx.beginPath();ctx.arc(player.x,player.y,3,0,Math.PI*2);ctx.fill();
 for(const f of fires){ctx.globalAlpha=Math.min(1,f.t*3);const grad=ctx.createLinearGradient(f.x,f.y,f.tx,f.ty);grad.addColorStop(0,'#fff2a1');grad.addColorStop(.5,'#ffa941');grad.addColorStop(1,'#ed664055');ctx.fillStyle=grad;const a=Math.atan2(f.ty-f.y,f.tx-f.x),nx=Math.cos(a+Math.PI/2)*70,ny=Math.sin(a+Math.PI/2)*70;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.tx+nx,f.ty+ny);ctx.quadraticCurveTo(f.tx+Math.cos(a)*90,f.ty+Math.sin(a)*90,f.tx-nx,f.ty-ny);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffe5a2';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.tx,f.ty);ctx.stroke();ctx.globalAlpha=1;}
 for(const e of enemies){if(e.type==='boss'||e.chatTime<=0)continue;const bubbleWidth=Math.max(92,e.chatLine.length*12+20),half=bubbleWidth/2,bx=Math.max(half+3,Math.min(level===2?W*5/6-half-3:W-half-3,e.x)),by=Math.max(35,e.y-(e.type==='king'?32:25)-36);ctx.fillStyle='#fffbef';ctx.strokeStyle='#9bad99';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(bx-half,by-13,bubbleWidth,27,9);ctx.fill();ctx.stroke();ctx.fillStyle='#556b5b';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText(e.chatLine,bx,by+5);}
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.t*2);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,5,5);}ctx.globalAlpha=1;ctx.restore();}
function ending(win){mode=win?'end':'dead';keys={};$('game').classList.toggle('finished',win);$('overlay').hidden=false;$('resume').hidden=true;$('retry').hidden=win;$('endlabel').hidden=true;$('endtitle').textContent=win?'THE END':'你的HP用尽了';$('endtext').hidden=win;$('endtext').textContent=win?'':'多吃点葡萄。';}
function togglePause(){if(!['battle','story'].includes(mode))return;paused=!paused;$('game').classList.toggle('paused',paused);keys={};$('overlay').hidden=!paused;$('resume').hidden=false;$('retry').hidden=mode!=='battle';$('endlabel').hidden=true;$('endtext').hidden=true;$('endtitle').textContent='暂停中';if(bgm&&bgKey!=='pauseTown08'){if(paused)bgm.pause();else if(!muted)bgm.play().catch(()=>{});}}
$('start').onclick=reset;$('restart').onclick=reset;$('resume').onclick=togglePause;$('retry').onclick=()=>{startLevel(level,true);if(bgm&&!muted)bgm.play().catch(()=>{});};$('pause').onclick=togglePause;$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'♫ 声音关':'♫ 声音开';if(bgm&&bgKey!=='pauseTown08'){if(muted)bgm.pause();else if(!paused)bgm.play().catch(()=>{});}};
$('game').onclick=e=>{if(!e.target.closest('button'))next();};window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','z','x','c','escape'].includes(k))e.preventDefault();if(k==='escape'&&!e.repeat)return togglePause();if(mode==='story'&&(k===' '||k==='enter')&&!e.repeat){next();return;}if(!paused)keys[k]=true;});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);window.addEventListener('blur',()=>{keys={};if(!paused&&['battle','story'].includes(mode))togglePause();});
for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(!paused)keys[b.dataset.key]=true;});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>keys[b.dataset.key]=false);}
let last=0;function loop(t){const dt=Math.min((t-last)/1000,.035);last=t;if(mode==='battle'&&!paused){update(dt);if(mode==='battle')draw();}requestAnimationFrame(loop);}background('village');requestAnimationFrame(loop);
// 只读调试快照，方便验证战斗流程。
window.demoState=()=>({mode,paused,section,lineIndex,level,hp,grapes,elapsed,killed,spawned,enemies:enemies.map(e=>({type:e.type,hp:e.hp})),allyShots,pending:schedule.length});
