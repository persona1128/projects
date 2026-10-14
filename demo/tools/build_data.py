from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[2]
sections={}; current=None
for line in (root/'文本.md').read_text().splitlines():
    line=line.strip()
    if not line: continue
    m=re.match(r'#【([A-D])\.',line)
    if m: current=m[1]; sections[current]=[]; continue
    if not current: continue
    m=re.match(r'^(拉鲁拉丝|喷火龙|沙奈朵|你|？？？)["“](.*?)["”]?$',line)
    sections[current].append({'speaker':m[1] if m else '', 'text':m[2] if m else line})
(root/'demo/story.js').write_text('window.STORY = '+json.dumps(sections,ensure_ascii=False,indent=2)+';\n')
print('剧情已同步：', {k:len(v) for k,v in sections.items()})
