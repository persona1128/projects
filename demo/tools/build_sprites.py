"""四帧大幅摆臂/裙摆行走与扇翼/尾焰待机动画，保持敌人描边风格。"""
from pathlib import Path
base=Path(__file__).resolve().parents[1]/'assets/sprites'
def save(name,frame,body):
 art=f'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g stroke="#48554e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>'
 (base/f'{name}-{frame}.svg').write_text(art)
 if frame==0:(base/f'{name}.svg').write_text(art)
for frame in range(4):
 swing=[-10,0,10,0][frame];lift=[0,-3,0,3][frame]
 body=f'<path d="M43 74L{36-swing/3} 92L44 92L49 76M53 75L58 92L{66-swing/3} 92L60 73" fill="#79ad8d"/><g transform="translate(0 {lift})"><path d="M40 45Q27 49 {21-swing/2} {63+swing}L{25-swing/2} {68+swing}L44 57M60 45Q74 48 {79-swing/2} {63-swing}L{74-swing/2} {69-swing}L57 58" fill="#f4f0dd"/><path d="M41 44Q34 61 {24+swing/2} 82Q37 {90-lift} 49 82Q62 {91+lift} {77+swing/2} 82Q65 61 59 44Z" fill="#f4f0dd"/><path d="M43 46L{37+swing/3} 72L50 64L{63+swing/3} 75L58 45Z" fill="#79ad8d"/><path d="M34 25Q33 10 49 9Q66 9 67 25L64 39Q51 47 37 39Z" fill="#8abb99"/><path d="M35 29Q46 33 49 44Q55 32 65 29" fill="#70a683"/><path d="M48 46L51 41L55 48L51 56Z" fill="#d47e86" stroke-width="2"/></g>'
 save('gardevoir',frame,body)
 wing=[(77,7,95,46),(85,22,91,58),(73,44,81,69),(85,22,91,58)][frame];tipx,tipy,outerx,outery=wing
 flame=[-6,0,5,1][frame];breath=[0,-2,0,2][frame]
 body=f'<g transform="translate(0 {breath})"><path d="M55 42L{tipx} {tipy}L{outerx} {outery}L76 49L64 64Z" fill="#719b95" stroke="#6e6252"/><path d="M55 42L{tipx} {tipy}L77 44L64 64" fill="none" stroke="#d49562" stroke-width="5"/><path d="M60 70Q{82+flame/2} 88 86 {62+flame}" fill="none" stroke="#48554e" stroke-width="12"/><path d="M60 70Q{82+flame/2} 88 86 {62+flame}" fill="none" stroke="#d99c69" stroke-width="7"/><path d="M86 {66+flame}Q74 {58+flame} {84+flame/2} {40+flame}L88 {51+flame}L94 {48+flame}Q99 {62+flame} 86 {66+flame}Z" fill="#edac58"/><path d="M86 {63+flame}Q81 {58+flame} 87 {53+flame}L90 {57+flame}Z" fill="#f9dc92" stroke="none"/><path d="M36 39Q53 32 63 49L69 74L61 85L40 82Q28 68 36 39Z" fill="#d99c69"/><path d="M37 48Q48 46 53 57L57 77L42 78Q33 67 37 48Z" fill="#eed4a0" stroke-width="2"/><path d="M33 22L35 10L44 20L53 14L53 35Q49 45 37 45L20 39L17 31L30 29Z" fill="#d99c69"/><path d="M29 31l7 -2" stroke="#384e48"/><path d="M18 38h13" fill="none" stroke-width="2"/><path d="M39 53L22 {60+breath}L20 67L42 63M40 79L28 88L46 88M61 79L54 91L71 91" fill="#d99c69"/></g>'
 save('charizard',frame,body)
print('已生成两位角色各四帧动画')
