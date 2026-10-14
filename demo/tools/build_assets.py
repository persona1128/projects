from pathlib import Path
import math,wave,struct,random
base=Path(__file__).resolve().parents[1]/'assets'
def svg(path,body,w=240,h=320):
 (base/path).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>')
for who in ['gardevoir','ralts','charizard']:
 for mood in ['calm','happy']:
  eye='<path d="M93 99l9 -4m27 4l9 -4" stroke="#353b50" stroke-width="4"/>' if mood=='happy' else '<path d="M95 94v9m38 -9v9" stroke="#353b50" stroke-width="4"/>'
  if who=='gardevoir': body='<path d="M110 120Q65 168 31 300Q116 277 204 300L140 123" fill="#f6f4e9"/><path d="M110 136L78 243L120 220L156 267L140 134" fill="#67aa8c"/><path d="M90 143L39 203L50 209L110 166M143 143L198 201L190 214L124 164" fill="#e9f1e9"/><ellipse cx="119" cy="91" rx="39" ry="41" fill="#f8efda"/><path d="M76 102Q56 27 119 32Q168 35 163 102L135 72L113 113L106 73Z" fill="#65b891"/><path d="M117 144L130 129L138 161L125 181Z" fill="#e68088"/>'+eye
  elif who=='ralts': body='<path d="M97 137L65 280L115 265L151 286L148 142Z" fill="#f4f3df"/><ellipse cx="121" cy="112" rx="44" ry="44" fill="#f4ecd7"/><path d="M69 111Q59 43 121 47Q180 47 174 115L134 105L120 118Z" fill="#75b78b"/><path d="M118 86L131 39L144 91Z" fill="#ed7c82"/><path d="M95 151L49 194L57 205L109 172M144 153L181 195L174 204L130 173" fill="#f4f3df"/>'+eye
  else: body='<path d="M88 152L17 89L28 228L94 192M153 148L220 83L211 226L153 193" fill="#df965a" stroke="#754f47" stroke-width="6"/><path d="M78 158L32 120L44 202M164 157L205 115L200 207" fill="#5c9990"/><path d="M154 239Q211 268 214 219" fill="none" stroke="#e8a261" stroke-width="18"/><path d="M214 222Q185 198 214 178Q218 193 230 197Q238 220 214 222" fill="#ffb647"/><ellipse cx="122" cy="205" rx="51" ry="76" fill="#e4a064"/><ellipse cx="119" cy="220" rx="30" ry="53" fill="#f6d89e"/><path d="M88 88L90 47L110 70L140 67L155 44L157 104Q152 143 119 141Q87 136 88 88" fill="#e4a064"/><path d="M89 264L63 292L105 290M148 265L177 292L136 291" fill="#e4a064"/>'+eye
  svg(Path('portraits')/f'{who}-{mood}.svg',body)
  if mood=='calm': svg(Path('sprites')/f'{who}.svg',body)
# pixel-art environments
random.seed(4)
body='<rect width="960" height="720" fill="#92ae7e"/><path d="M390 0h180v720H350L440 440Z" fill="#c6bd91"/>'
for x,y in [(35,40),(690,40),(35,260),(720,260)]:
 body+=f'<rect x="{x+20}" y="{y+70}" width="150" height="108" fill="#ddcfac"/><path d="M{x} {y+74}l90 -66l102 66Z" fill="#617c70"/><rect x="{x+79}" y="{y+116}" width="35" height="62" fill="#667363"/><rect x="{x+35}" y="{y+97}" width="28" height="29" fill="#9bbab1"/>'
for i in range(190):
 x=random.randrange(960);y=random.randrange(720)
 if 310<x<610:continue
 body+=f'<rect x="{x}" y="{y}" width="{random.randrange(3,10)}" height="5" fill="{random.choice(["#6e936e","#adc18c","#e0cf9d"])}"/>'
svg(Path('backgrounds/village.svg'),body,960,720)
svg(Path('backgrounds/bedroom.svg'),'<rect width="960" height="720" fill="#b0b3a1"/><rect y="440" width="960" height="280" fill="#8f8877"/><path d="M0 441h960M0 530h960M0 635h960" stroke="#a79a83" stroke-width="6"/><rect x="85" y="67" width="300" height="294" fill="#656f6a"/><rect x="97" y="80" width="276" height="265" fill="#d4dec2"/><path d="M232 80v265M97 215h276" stroke="#939f8b" stroke-width="12"/><path d="M66 55h80l-23 325H58M330 55h80l8 325h-77" fill="#7e9183"/><path d="M365 350h450v263H365Z" fill="#6f7167"/><path d="M343 426h507v221H343Z" fill="#dcd8bd"/><path d="M350 479h493v159H350Z" fill="#829d91"/><rect x="397" y="389" width="164" height="77" rx="18" fill="#f0e8ce"/><rect x="600" y="389" width="164" height="77" rx="18" fill="#f0e8ce"/><rect x="176" y="428" width="125" height="164" fill="#716f60"/><rect x="180" y="409" width="120" height="21" fill="#d2bb89"/><path d="M222 406v-69h30v69" fill="#8b927d"/><path d="M199 340l20 -58h38l24 58Z" fill="#efdaa5"/><path d="M255 448l33 4l-5 39l-33 -5Z" fill="#e5d7b4"/>',960,720)
for name,color in [('green','#81b96c'),('red','#ca736e')]:svg(Path('enemies')/f'{name}.svg',f'<path d="M18 69Q16 22 50 24Q84 22 83 69Q52 88 18 69" fill="{color}" stroke="#48554e" stroke-width="4"/><path d="M36 49v8m27 -8v8" stroke="#34483c" stroke-width="5"/>',100,100)
for name,color in [('bat','#9283b4'),('king','#62587e')]:svg(Path('enemies')/f'{name}.svg',f'<path d="M46 37L27 16L5 32L13 67L32 55L50 80L69 55L88 67L96 30L74 16L55 38Z" fill="{color}" stroke="#48425c" stroke-width="4"/><path d="M39 42l7 4m10 0l7 -4" stroke="#fff1b6" stroke-width="4"/>',100,100)
svg(Path('enemies/boss.svg'),'<path d="M17 32L2 77L26 84L38 63L65 64L80 85L98 77L82 31Z" fill="#7b9da5" stroke="#3c586a" stroke-width="4"/><path d="M20 26L50 14L82 28L75 62L26 62Z" fill="#92b3b8"/><path d="M32 28L68 57M68 28L32 57" stroke="#dfddd0" stroke-width="9"/><path d="M26 42h10m29 0h10" stroke="#d16e78" stroke-width="4"/>',100,100)
rate=22050
for name,notes in [('bedroom',[261.63,329.63,392,329.63,293.66,349.23,440,349.23]),('village',[329.63,392,440,523.25,440,392,293.66,392])]:
 data=[]
 for i in range(rate*8):
  t=i/rate;phase=t%0.5;f=notes[int(t/0.5)%8];env=min(1,phase*30)*math.exp(-phase*4)
  v=(math.sin(2*math.pi*f*t)*0.12+math.sin(2*math.pi*f/2*t)*0.06)*env
  data.append(struct.pack('<h',int(v*32767)))
 with wave.open(str(base/'bgm'/f'{name}.wav'),'wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes(b''.join(data))
for name,f,dur in [('psychic',680,.10),('song',880,.16),('heal',1046,.30),('hit',140,.09),('fire',70,.7)]:
 data=[]
 for i in range(int(rate*dur)):
  t=i/rate;v=(math.sin(2*math.pi*(f*t-100*t*t)) if name!='fire' else random.uniform(-1,1))*0.12*(1-t/dur)
  data.append(struct.pack('<h',int(v*32767)))
 with wave.open(str(base/'sfx'/f'{name}.wav'),'wb') as w:w.setparams((1,2,rate,0,'NONE','not compressed'));w.writeframes(b''.join(data))
print('占位美术、音乐、音效已生成')

# 统一角色和敌人的战斗美术，避免重新生成时回退为像素风。
import runpy
runpy.run_path(str(Path(__file__).with_name('build_sprites.py')), run_name='__main__')

runpy.run_path(str(Path(__file__).with_name('build_enemies.py')), run_name='__main__')

runpy.run_path(str(Path(__file__).with_name('build_portraits.py')), run_name='__main__')
