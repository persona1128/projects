// 无浏览器依赖的战斗 / 剧情逻辑测试；不验证浏览器排版和音频播放。
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');const nodes={};const el=()=>({style:{},classList:{classes:new Set(),toggle(name,on){if(on===undefined)on=!this.classes.has(name);on?this.classes.add(name):this.classes.delete(name)},add(name){this.classes.add(name)},remove(name){this.classes.delete(name)},get black(){return this.classes.has('black')}},children:[],replaceChildren(){this.children=[]},append(child){this.children.push(child)},setAttribute(){},addEventListener(){}});const canvas=new Proxy({}, {get:()=>()=>{}});
const sandbox={console,Math,setTimeout:()=>{},requestAnimationFrame:()=>{},Image:class{set src(v){this.complete=true;this.naturalWidth=1;}},Audio:class{play(){return Promise.resolve()}pause(){}},document:{getElementById(id){return nodes[id]??=(id==='canvas'?{...el(),getContext:()=>canvas}:el());},querySelectorAll:()=>[],createElement:tag=>tag==='canvas'?{...el(),getContext:()=>canvas}:el()}};sandbox.window=sandbox;sandbox.addEventListener=()=>{};vm.createContext(sandbox);for(const f of ['config.js','story.js','game.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),sandbox);
const r=vm.runInContext(`(()=>{const out={};reset();out.story=STORY.A.length+STORY.B.length+STORY.C.length+STORY.D.length;hp=50;heal();out.heal=hp===70&&grapes===4;hp=100;keys={z:true,x:true};attackCD=0;firePlayer();out.exclusive=shots.every(s=>s.type==='song');keys={};
for(let stage=0;stage<2;stage++){startLevel(stage);for(let i=0;i<1200&&mode==='battle';i++){enemies.forEach(e=>damage(e,999));bullets=[];update(.035);}out['level'+stage]={mode,section,spawned,killed};}
startLevel(2);for(let i=0;i<420;i++){bullets=[];hurtCD=100;update(.035);}out.ally={allyShots,boss:enemies.find(e=>e.type==='boss')?.hp,text:allyText};damage(enemies.find(e=>e.type==='boss'),999);update(.035);out.bossAloneNotWin=mode==='battle';out.thirdTotal=spawned;enemies.forEach(e=>damage(e,999));update(.035);out.bossWin=mode==='story'&&section==='D';lineIndex=STORY.D.findIndex(r=>r.text.includes('彻底陷入了黑暗'));renderLine();out.darkOnLine=$('backdrop').classList.black;lineIndex=STORY.D.findIndex(r=>r.text.includes('叮铃铃铃铃'));renderLine();out.bedroom=bgKey==='yasuragi3'&&!$('backdrop').classList.black;lineIndex=STORY.D.length;renderLine();out.end=mode==='end'&&$('endlabel').hidden&&$('endtext').hidden&&$('endtitle').textContent==='THE END'&&$('game').classList.classes.has('finished');startLevel(0);hp=1;hurtCD=0;hurt(5);out.dead=mode==='dead'&&$('endlabel').hidden&&$('endtitle').textContent==='你的HP用尽了'&&$('endtext').textContent==='多吃点葡萄。';startLevel(0,true);out.retry=hp===checkpoint.hp;togglePause();out.pause=paused&&$('endlabel').hidden&&$('endtext').hidden&&$('endtitle').textContent==='暂停中';togglePause();out.resume=!paused;return out;})()`,sandbox);
assert(r.heal&&r.exclusive&&r.bossWin&&r.bossAloneNotWin&&r.thirdTotal===16&&r.darkOnLine&&r.bedroom&&r.end&&r.dead&&r.retry&&r.pause&&r.resume);assert.equal(r.level0.spawned,30);assert.equal(r.level0.section,'B');assert.equal(r.level1.spawned,30);assert.equal(r.level1.section,'C');assert.equal(r.ally.allyShots,5);assert.equal(r.ally.boss,100);assert.equal(r.ally.text,'沙奈朵加油！');
assert.equal(r.story,167);assert.equal(vm.runInContext('C.player.grapes',sandbox),5);
const grapeScene=vm.runInContext(`(()=>{reset();const i=STORY.A.findIndex(row=>row.text==='你获得了5粒葡萄，按C吃掉回血。');const lines=STORY.A.slice(i,i+6);const order=lines.map(row=>row.speaker+':'+row.text).join('|')===':你获得了5粒葡萄，按C吃掉回血。|你:才5粒，这么少？|拉鲁拉丝:本来有20粒的，剩下15粒莫名其妙消失了……可能是被谁吃掉了吧？|拉鲁拉丝:我们相信沙奈朵大人一定可以的！加油！|你:……|:就在这时，远方传来一阵低吼声。';lineIndex=i+1;renderLine();const gardevoir=$('speaker').textContent==='你'&&$('portraits').children.some(el=>el.alt==='你'&&el.className==='active');lineIndex=i+3;renderLine();const ralts=$('portraits').children.some(el=>el.alt==='拉鲁拉丝'&&el.src.endsWith('ralts-cheer.svg')&&el.className==='active');return {order,gardevoir,ralts};})()`,sandbox);
assert(Object.values(grapeScene).every(Boolean),'新葡萄剧情或立绘显示错误');
const controlsCheck=vm.runInContext(`(()=>{reset();const opening=$('controls-guide').hidden;lineIndex=controlsCue-1;renderLine();const before=$('controls-guide').hidden;lineIndex=controlsCue;renderLine();const onCue=$('controls-guide').hidden;next();const after=!$('controls-guide').hidden&&STORY.A[lineIndex].text.startsWith('按Z');showStory('B');const later=!$('controls-guide').hidden;reset();return {opening,before,onCue,after,later,restart:$('controls-guide').hidden};})()`,sandbox);
assert(Object.values(controlsCheck).every(Boolean),'操作指南显示时机错误');
const revised=vm.runInContext(`(()=>{
const out={};
for(const type of ['green','red','bat','king']){
 const radius=type==='king'?32:25,e={type,x:480,y:H*2/3-.1,speed:C.enemies[type].speed,phase:0};
 moveEnemy(e,.035);const touched=e.y;moveEnemy(e,.1);
 if(!e.wandering||e.y>=touched||e.y<120)throw Error(type+' 没有从 2/3 处连续折返');
 for(let i=0;i<5000;i++){moveEnemy(e,.035);if(e.x<radius||e.x>W-radius||e.y<120||e.y>H*2/3)throw Error(type+' 越界');}
}out.boundaryWalk=true;
startLevel(2);hurtCD=100;for(let i=0;i<55;i++){bullets=[];update(.035);}out.allyWaits=allyShots===0&&allyText==='';
for(let i=0;i<4;i++){bullets=[];update(.035);}out.allyStartsAfterTwoSeconds=allyShots===1;
out.thirdRightClear=enemies.every(e=>e.x+(e.type==='boss'?77:e.type==='king'?32:25)<=W*5/6);
for(let i=0;i<300;i++){bullets=[];hurtCD=100;update(.035);if(enemies.some(e=>e.x+(e.type==='boss'?77:e.type==='king'?32:25)>W*5/6))throw Error('第三关怪物进入喷火龙区域');}out.thirdRightStaysClear=true;
enemies.forEach(e=>e.shot=0);bullets=[];update(.035);out.distinctBulletSources=['green','red','bat','king','boss'].every(type=>bullets.some(b=>b.type===type)&&projectileArt[type]);
const chatter=enemies.find(e=>e.type!=='boss');enemies.forEach(e=>{e.chatTime=0;e.chatCD=100;});chatter.chatCD=-1;const randomBefore=Math.random;Math.random=()=>0;update(.035);Math.random=randomBefore;out.enemyChats=chatter.chatTime>0&&enemyChatLines.includes(chatter.chatLine);
allyRest=C.ally.exhaustedSeconds;updateAllyRest(0);if(allyText!=='没劲儿了……')throw Error('未显示疲劳台词');updateAllyRest(1.99);if(allyText!=='没劲儿了……')throw Error('提前切换疲劳台词');updateAllyRest(.011);if(allyText!=='沙奈朵加油！')throw Error('没有切换鼓励台词');out.exhaustedSeconds=2;
showStory('D');
function at(text){lineIndex=STORY.D.findIndex(r=>r.text.includes(text));if(lineIndex<0)throw Error(text);renderLine();}
at('您是我们村庄的守护神');out.guardianThumb=$('portrait-reactions').children[0]?.textContent==='👍';
at('那我呢？');out.charizardQuestion=$('portrait-reactions').children[0]?.textContent==='？';
at('出现了一个精致的宝箱');out.chestCast=$('portraits').children.filter(e=>e.alt).map(e=>e.alt).join(',')==='你,拉鲁拉丝,喷火龙';out.narrationHidden=$('speaker').hidden;
at('这难道就是');out.characterNameVisible=!$('speaker').hidden&&$('speaker').textContent==='你';
at('宝箱打开了');out.chestOpen=$('story-props').children[0].children[0].src===C.assets.props.chestOpen;out.noEarlySparkles=!$('story-props').children[0].children.some(e=>e.className==='story-sparkle');
at('耀眼的金光从箱子里');out.sparkles=$('story-props').children[0].children.some(e=>e.className==='story-sparkle');
at('哇……！');out.gardevoirSmile=$('portrait-reactions').children[0]?.textContent==='😊';
at('一卷古老的卷轴');out.scroll=$('story-props').children[0].children.some(e=>e.className==='scroll-art');
const truth=STORY.D.map((r,i)=>r.text.startsWith('只要掌握了这句真理')?i:-1).filter(i=>i>=0);
out.fourGoldLines=truth.length===4&&truth.every(i=>{lineIndex=i;renderLine();return !$('dream-glow').hidden;});
at('每一个字刻进脑海里');out.goldReturnsToChest=$('dream-glow').hidden;
at('原来是一张基拉祈的贴纸');out.dreamSticker=$('story-props').children[0].children.some(e=>e.className==='dream-sticker'&&e.src===C.assets.props.jirachiClosed);
at('心跳加速');out.firstMuted=$('story-props').className.includes('muted');
at('快，快给我本和笔');out.cheerRestores=!$('story-props').className.includes('muted');
at('话音刚落');out.firstWarp=$('backdrop').classList.classes.has('dream-warp')&&$('story-props').className.includes('muted');
at('你又把笔记本翻到最后一页');out.mutedThroughDreamNotebook=$('story-props').className.includes('muted');
at('这样就好了');out.doneRestores=!$('story-props').className.includes('muted');
at('与此同时，困意');out.deepWarp=$('backdrop').classList.classes.has('dream-warp-deep')&&$('story-props').className.includes('muted');
at('彻底陷入了黑暗');out.cleared=$('portraits').children.length===0&&$('story-props').hidden;
at('床头柜上果然放着');out.notebook=$('story-props').children[0].children[0].src===C.assets.props.notebookClosed;
at('迫不及待地翻开');out.notebookOpen=$('story-props').children[0].children[0].src===C.assets.props.notebookOpen;
at('翻到了最后一页');out.stickerClosed=$('story-props').children[0].children.some(e=>e.className==='wish-sticker'&&e.src===C.assets.props.jirachiClosed);
at('微弱而温柔');out.sticker=$('story-props').children[0].children.some(e=>e.className==='wish-sticker')&&$('story-props').children[0].children.some(e=>e.className==='sticker-sparkle');
at('基拉祈睁开了眼睛');out.stickerOpen=$('story-props').children[0].children.some(e=>e.className==='wish-sticker'&&e.src===C.assets.props.jirachiOpen);
lineIndex++;renderLine();out.goldenTransition=!$('dream-glow').hidden&&!$('transition').classList.classes.has('golden')&&bgKey==='wakare2';
showStory('A');out.restartClears=$('portraits').children.length===0&&$('story-props').hidden;
function atA(text){lineIndex=STORY.A.findIndex(r=>r.text.includes(text));if(lineIndex<0)throw Error(text);renderLine();}
atA('结束脑力劳动之后');out.sleepBedroom=!$('backdrop').classList.black;
atA('呼噜噜');out.sleepBlack=$('backdrop').classList.black;
atA('眼前的景象吓了一跳');out.stillBlack=$('backdrop').classList.black;
atA('映入眼帘');out.villageRevealed=!$('backdrop').classList.black&&bgKey==='field4';
for(const [text,portrait,part,badge] of [
 ['你是谁呀','gardevoir-calm-v3.svg','你','？'],['不要再开玩笑','ralts-calm.svg','拉鲁拉丝','！'],
 ['马上就要来袭击','ralts-surprised.svg','拉鲁拉丝',null],['不知道飞到了哪里','ralts-calm.svg','拉鲁拉丝','💦'],
 ['这里就只能交给','ralts-cheer.svg','拉鲁拉丝',null],['有关于魔物的信息吗','gardevoir-calm-v3.svg','你','？'],
 ['这么快就冷静下来','ralts-happy.svg','拉鲁拉丝','👍'],['博学的沙奈朵大人','ralts-calm.svg','拉鲁拉丝','？'],
 ['它们要攻过来了','ralts-cheer.svg','拉鲁拉丝',null]]){
 atA(text);const actor=$('portraits').children.find(e=>e.alt===part);
 if(!actor?.src.endsWith(portrait)||$('portrait-reactions').children.map(e=>e.textContent).join('')!==(badge||''))throw Error(text+' 立绘或提示符错误');
}out.reactions=true;

lineIndex=STORY.A.findIndex(r=>r.text.includes('映入眼帘'));renderLine();out.openingCast=$('portraits').children.map(e=>e.alt).join(',')==='你';atA('哦哦，尊敬的沙奈朵大人');out.raltsEntrance=$('portraits').children.map(e=>e.alt).join(',')==='你,拉鲁拉丝';
for(const [part,text,portrait,badge] of [
 ['B','天哪，强力的沙奈朵大人','ralts-happy.svg','！'],['B','这是什么？','gardevoir-calm-v3.svg','？'],
 ['B','啊，居然还有','ralts-surprised.svg','💦'],['B','这次也拜托您了','ralts-cheer.svg',''],
 ['C','这下危机终于解除了','ralts-happy.svg','😊'],['C','降落在拉鲁拉丝身旁','charizard-happy.svg','🕶️'],
 ['C','喷火龙，你这是去哪了','ralts-cheer.svg',''],['C','我寻思今天再去摘点','charizard-calm.svg','…'],
 ['C','那我来击败它们','charizard-happy.svg','🕶️'],['C','天哪！','ralts-cheer.svg',''],
 ['C','剩下的，就交给沙奈朵啦','charizard-happy.svg','👍']]){
 showStory(part);lineIndex=STORY[part].findIndex(r=>r.text.includes(text));renderLine();
 const actor=$('portraits').children.find(e=>e.src.endsWith(portrait));
 if(!actor||$('portrait-reactions').children.map(e=>e.textContent).join('')!==badge)throw Error(part+text);
}
showStory('C');for(const speaker of ['拉鲁拉丝','你']){lineIndex=STORY.C.findIndex(r=>r.speaker===speaker&&r.text==='……（怒）');renderLine();const actor=$('portraits').children.find(e=>e.alt===speaker);if(!actor||$('portrait-reactions').children.map(e=>e.textContent).join('')!=='💢')throw Error(speaker+' 生气');}out.newReactions=true;
showStory('D');at('出现了一个精致的宝箱');const chestStage=$('story-props').children[0],chestArt=chestStage.children[0];
at('这难道就是');out.chestStationary=$('story-props').children[0]===chestStage&&chestStage.children[0]===chestArt;
at('宝箱打开了');out.openPreservesStage=$('story-props').children[0]===chestStage&&chestStage.children[0]===chestArt&&chestArt.src===C.assets.props.chestOpen;
at('床头柜上果然放着');const notebookStage=$('story-props').children[0],notebookArt=notebookStage.children[0];
at('迫不及待地翻开');out.notebookStationary=$('story-props').children[0]===notebookStage&&notebookStage.children[0]===notebookArt&&notebookArt.src===C.assets.props.notebookOpen;
at('只要有了这个');out.notebookDialogueStable=$('story-props').children[0]===notebookStage;
startLevel(0);out.battleClears=$('story-props').hidden;

return out;})()`,sandbox);
const bgmChecks=vm.runInContext(`(()=>{
 const out={};reset();out.opening=bgKey==='wakare2'&&bgm.loop;
 const at=(part,text,speaker)=>{if(section!==part)showStory(part);lineIndex=STORY[part].findIndex(row=>row.text===text&&(!speaker||row.speaker===speaker));if(lineIndex<0)throw Error(text);renderLine();};
 at('A','映入眼帘的是一片被阳光照得暖洋洋的草地，几十只拉鲁拉丝把你围的严严实实。');out.field=bgKey==='field4'&&bgm.loop;
 at('A','就在这时，远方传来一阵低吼声。');out.firstStop=bgKey===null&&bgm===null;
 at('A','嗷呜……！嗷呜！嗷呜呜！','？？？');const engi=bgm;out.engi=bgKey==='slgEngi'&&bgm.loop;
 startLevel(0);out.battleContinues=bgm===engi;
 showStory('B');out.bContinues=bgm===engi;showStory('C');out.cContinues=bgm===engi;
 at('C','大家早上好呀~','？？？');out.charizardStop=bgKey===null&&bgm===null;
 at('C','下一秒，一只看上去不太正经但是有点帅的喷火龙降落在拉鲁拉丝身旁。');const town=bgm;out.town=bgKey==='town08'&&bgm.loop;
 town.currentTime=42;let plays=0;town.play=()=>{plays++;return Promise.resolve()};
 lineIndex=bgmCues.cPause;renderLine();out.pauseCue=STORY.C[lineIndex].text==='……'&&STORY.C[lineIndex+1].text==='又是熟悉的、此起彼伏的低吼声。';
 out.townPaused=bgKey==='pauseTown08'&&bgm===town&&town.currentTime===42;
 togglePause();togglePause();$('sound').onclick();$('sound').onclick();out.pauseStaysSilent=plays===0;
 at('C','太好了！看来昨天那顿烤肉没白奖励你。','拉鲁拉丝');out.townResumed=bgKey==='town08'&&bgm===town&&town.currentTime===42&&plays===1;
 at('C','……（怒）','拉鲁拉丝');out.raltsAngerPaused=bgKey==='pauseTown08'&&bgm===town;
 at('C','……（怒）','你');out.gardevoirAngerPaused=bgKey==='pauseTown08'&&bgm===town;
 lineIndex=STORY.C.length;renderLine();out.bossOnLevel=mode==='battle'&&level===2&&bgKey==='boss05'&&bgm.loop;
 showStory('D');out.yasuragi=bgKey==='yasuragi3'&&bgm.loop;
 at('D','这就是，被魔物们世世代代守护的、终极真理——！');out.truthStillPlaying=bgKey==='yasuragi3';
 lineIndex++;renderLine();out.finalStop=STORY.D[lineIndex].text==='……'&&bgm===null;
 at('D','嗯……','你');const wakare=bgm;out.finalWakare=bgKey==='wakare2'&&bgm.loop;
 lineIndex=STORY.D.length;renderLine();out.endContinues=mode==='end'&&bgm===wakare;
 return out;
})()`,sandbox);
for(const [key,value] of Object.entries(bgmChecks))assert(value,'bgm '+key);
for(const [key,value] of Object.entries(revised))assert(value,key);
console.log('修改项检查：',JSON.stringify(revised));
assert(!fs.readFileSync(path.join(root,'index.html'),'utf8').includes('id="chapter"'));
const assets=vm.runInContext('C.assets',sandbox);function check(o){for(const v of Object.values(o)){if(typeof v==='object')check(v);else assert(fs.existsSync(path.join(root,v)),v);}}check(assets);console.log(JSON.stringify({passed:true,checks:r},null,2));
