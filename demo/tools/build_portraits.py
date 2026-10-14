"""重绘三位角色的六张矢量立绘；同角色的表情只更新五官，轮廓位置一致。"""
from pathlib import Path
base=Path(__file__).resolve().parents[1]/'assets/portraits'
def gradient(name,a,b):
 return f'<linearGradient id="{name}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>'
def save(who,mood,body):
 defs=''.join(gradient(*v) for v in [('green','#b7ddaa','#4c927f'),('greenDark','#83baa2','#3b6d65'),('silk','#ffffef','#c7d8dc'),('silkShade','#e5edf0','#93afb8'),('red','#f4a0aa','#b95873'),('orange','#f7c183','#b75e42'),('orangeDark','#d58957','#8c493e'),('wing','#78b9b1','#315e72'),('cream','#fff0bd','#d3a772'),('flame','#fff8b5','#ef7649')])
 (base/f'{who}-{mood}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><defs>{defs}</defs><g stroke-linecap="round" stroke-linejoin="round">{body}</g></svg>')
for mood in ['calm','happy']:
 # Gardevoir: long curved silhouette, layered flowing gown, delicate face in three-quarter view.
 body='''<path d="M228 253Q172 309 148 428Q124 521 61 594Q148 625 226 591Q307 637 408 599Q331 530 315 429Q298 301 259 251Z" fill="url(#silk)" stroke="#537e7b" stroke-width="3"/>
 <path d="M230 268Q191 356 197 447Q186 542 110 599Q193 587 244 518L225 589Q303 614 368 600Q291 526 282 443Q283 335 260 270Z" fill="url(#silkShade)" opacity=".67"/>
 <path d="M229 288Q214 359 215 414L184 515L239 474L287 545Q269 456 275 411Q281 341 260 276Z" fill="url(#greenDark)"/>
 <path d="M218 277Q169 325 166 380Q167 425 118 463L101 474Q123 434 130 393Q141 315 201 275Z" fill="url(#green)" stroke="#477f70" stroke-width="3"/>
 <path d="M113 458L96 475Q108 479 125 466M116 466L101 479" fill="none" stroke="#477f70" stroke-width="2"/>
 <path d="M259 278Q304 307 315 350Q319 377 341 397L364 401Q349 413 332 401Q301 383 288 354L246 308Z" fill="url(#green)" stroke="#477f70" stroke-width="3"/>
 <path d="M219 221Q220 249 201 275Q213 306 240 334Q269 307 275 279Q250 253 253 225Z" fill="url(#silk)" stroke="#688c86" stroke-width="2.5"/>
 <path d="M245 268L264 246L275 289L250 326L243 296Z" fill="url(#red)" stroke="#a95870" stroke-width="2.5"/>
 <path d="M208 133Q258 95 284 147Q310 197 278 230Q255 251 224 232L189 199Z" fill="url(#silk)" stroke="#537e7b" stroke-width="3"/>
 <path d="M192 167L172 162L188 181L173 186L196 198" fill="#f8fbec" stroke="#537e7b" stroke-width="2.5"/>
 <path d="M277 190l8 9l-8 3" fill="none" stroke="#98aaa1" stroke-width="2"/>
 <path d="M167 202Q116 171 139 99Q157 46 220 50Q289 39 317 104Q339 152 305 220Q284 240 278 247Q295 209 279 177L248 136Q234 160 200 171Q213 113 184 101Q160 131 167 202Z" fill="url(#green)" stroke="#447b6d" stroke-width="3.5"/>
 <path d="M156 113Q168 68 220 65Q270 61 296 104" fill="none" stroke="#e2f1c8" stroke-width="7" opacity=".7"/>
 <path d="M185 83Q249 102 279 177M146 132Q140 174 163 192M295 116Q314 170 295 212" fill="none" stroke="#5e9b80" stroke-width="2.5"/>
 <path d="M161 431Q142 529 84 584M299 461Q317 547 383 591" fill="none" stroke="#ffffff" stroke-width="6" opacity=".7"/>'''
 if mood=='calm':body+='''<path d="M231 181Q247 169 264 181Q256 207 239 203Z" fill="#fffdf2" stroke="#486e67" stroke-width="2"/><ellipse cx="250" cy="187" rx="8" ry="13" fill="url(#red)"/><ellipse cx="252" cy="188" rx="3" ry="8" fill="#563a58"/><ellipse cx="247" cy="180" rx="3" ry="4" fill="#fff"/><path d="M229 180Q247 169 266 180" fill="none" stroke="#385750" stroke-width="4"/><path d="M259 219q8 4 13 -1" fill="none" stroke="#987379" stroke-width="2"/>'''
 else:body+='''<path d="M231 187Q247 171 264 186" fill="none" stroke="#385750" stroke-width="4"/><path d="M258 215Q267 219 277 212Q274 229 265 228Z" fill="#b87582" stroke="#956874" stroke-width="2"/><path d="M245 204l-7 3m16 -1l-7 4" stroke="#e8a0a4" stroke-width="3"/>'''
 save('gardevoir',mood,body)
 # Ralts: rounded head, red horn, softly shaped white body and expressive small hands.
 body='''<path d="M199 315Q166 368 163 440L144 543Q159 561 184 553L210 528L229 570Q251 581 271 563L272 520L306 544Q331 548 337 528L309 429Q300 351 264 321Z" fill="url(#silk)" stroke="#5c897d" stroke-width="3.5"/>
 <path d="M242 362Q225 441 234 553Q250 563 264 551L260 506L296 528Q311 531 318 523L290 434L271 368Z" fill="url(#silkShade)" opacity=".65"/>
 <path d="M202 339Q176 359 155 389Q145 403 157 414Q177 416 199 388L220 360M273 339Q301 361 320 389Q331 404 319 415Q302 414 280 388L257 361" fill="url(#silk)" stroke="#5c897d" stroke-width="3"/>
 <path d="M200 344Q215 333 222 349L219 365Q207 375 199 363ZM271 344Q256 333 249 349L252 365Q263 375 271 363Z" fill="#f8fae9" stroke="#5c897d" stroke-width="2.5"/>
 <path d="M155 244Q152 305 200 335Q239 361 283 336Q327 308 324 253Z" fill="url(#silk)" stroke="#5c897d" stroke-width="3"/>
 <path d="M145 270Q115 191 157 139Q186 103 239 110Q303 100 335 152Q356 194 337 274L297 263L271 279L235 253L197 278L177 259Z" fill="url(#green)" stroke="#497f6d" stroke-width="4"/>
 <path d="M148 192Q163 125 233 125Q289 118 317 160" fill="none" stroke="#dff1c5" stroke-width="8" opacity=".75"/>
 <path d="M192 144Q175 192 180 251M284 145Q309 194 301 255" fill="none" stroke="#76ad8b" stroke-width="3"/>
 <path d="M230 161L249 85Q263 112 269 153L258 184Z" fill="url(#red)" stroke="#a65d70" stroke-width="3"/>
 <path d="M144 202L130 174L127 228L141 243Z" fill="url(#red)" stroke="#a65d70" stroke-width="2.5"/>
 <path d="M246 110L238 154" stroke="#ffd4cd" stroke-width="4" opacity=".75"/>'''
 if mood=='calm':body+='''<path d="M182 283q14 -12 26 0M271 283q14 -12 27 0" stroke="#40665d" stroke-width="3" fill="none"/><ellipse cx="198" cy="288" rx="6" ry="10" fill="#b9657d"/><ellipse cx="280" cy="288" rx="6" ry="10" fill="#b9657d"/><circle cx="196" cy="284" r="2.5" fill="#fff"/><circle cx="278" cy="284" r="2.5" fill="#fff"/><path d="M231 316q8 5 16 0" stroke="#a38482" stroke-width="2.5" fill="none"/>'''
 else:body+='''<path d="M182 289q13 -18 27 0M270 289q14 -18 28 0" stroke="#40665d" stroke-width="4" fill="none"/><path d="M225 310Q239 318 253 309Q249 330 239 330Q229 328 225 310Z" fill="#c88794" stroke="#9c7481" stroke-width="2"/><path d="M180 308l-8 3m19 -2l-7 3m110 -4l-7 3m19 -2l-7 3" stroke="#e4a4a4" stroke-width="4"/>'''
 save('ralts',mood,body)
 # Charizard: broad layered wings, angular heroic profile, defined limbs, long curving flame tail.
 body='''<path d="M200 300Q140 181 78 115L39 338L91 305L115 374L161 333L189 401Z" fill="url(#wing)" stroke="#764d43" stroke-width="5"/>
 <path d="M276 305Q332 167 409 102L447 337L392 306L366 376L322 337L300 407Z" fill="url(#wing)" stroke="#764d43" stroke-width="5"/>
 <path d="M192 346L78 115L91 305M283 345L409 102L392 306M78 115L115 374M409 102L366 376" fill="none" stroke="url(#orange)" stroke-width="11"/>
 <path d="M75 151L59 299L85 283M405 147L428 299L397 280" fill="none" stroke="#a9d7bd" stroke-width="3" opacity=".65"/>
 <path d="M285 475Q365 560 405 472Q429 421 407 370" fill="none" stroke="#70493f" stroke-width="35"/>
 <path d="M285 475Q365 560 405 472Q429 421 407 370" fill="none" stroke="url(#orange)" stroke-width="25"/>
 <path d="M409 388Q369 367 382 329L398 349Q390 303 419 278Q410 320 435 322Q464 352 439 378Z" fill="url(#flame)" stroke="#c47848" stroke-width="3"/>
 <path d="M409 379Q395 354 411 335Q411 354 426 347Q442 364 421 379Z" fill="#fff6b5"/>
 <path d="M200 263Q168 324 174 415L163 489Q202 531 275 512L311 476Q315 407 291 323L266 267Z" fill="url(#orange)" stroke="#754b40" stroke-width="4"/>
 <path d="M213 294Q189 347 194 410L188 469Q215 500 267 484Q282 455 268 411Q253 379 253 316Z" fill="url(#cream)" stroke="#c39463" stroke-width="2.5"/>
 <path d="M204 357Q224 363 254 354M198 388Q222 397 263 385M196 426Q225 440 274 423" fill="none" stroke="#ca9e6b" stroke-width="2" opacity=".6"/>
 <path d="M178 331Q149 344 132 384L109 396L102 409L123 408Q151 420 174 385L193 366" fill="url(#orange)" stroke="#754b40" stroke-width="4"/>
 <path d="M284 327Q322 343 332 378L348 390L352 405L338 402Q307 405 293 373L271 357" fill="url(#orangeDark)" stroke="#754b40" stroke-width="4"/>
 <path d="M108 395L94 408L109 409M121 401L112 415L125 411M342 389L359 397L350 403" fill="#f6e7c9" stroke="#755448" stroke-width="2"/>
 <path d="M181 458Q149 487 159 536L136 558L183 567L215 550L216 499M276 460Q310 483 309 530L336 554L302 568L266 552L257 499" fill="url(#orange)" stroke="#754b40" stroke-width="4"/>
 <path d="M151 547L130 564L151 566L162 554L159 570L180 566L184 551M307 547L333 560L316 569L304 556L302 572L282 561L283 548" fill="#f6e7c9" stroke="#755448" stroke-width="2.5"/>
 <path d="M209 250L196 276Q208 301 241 309L271 280L257 235Z" fill="url(#orange)" stroke="#754b40" stroke-width="3"/>
 <path d="M193 189L186 126L217 162L248 156L279 121L275 203Q280 237 254 258Q230 274 204 251L169 238L154 211L184 204Z" fill="url(#orange)" stroke="#754b40" stroke-width="4"/>
 <path d="M197 152L199 183M263 145L256 176" fill="none" stroke="#ffd498" stroke-width="4"/>
 <path d="M174 211l8 -2M225 258L245 253" stroke="#996147" stroke-width="3"/>
 <path d="M250 186Q263 209 255 235L267 219" fill="none" stroke="#b27650" stroke-width="3"/>'''
 if mood=='calm':body+='''<path d="M191 199L220 193L211 211L197 213Z" fill="#f4ecca" stroke="#755044" stroke-width="2"/><path d="M203 199L208 198L207 209L202 210Z" fill="#426c80"/><path d="M188 198L222 190" stroke="#67473f" stroke-width="4"/><path d="M163 230Q184 238 204 227" fill="none" stroke="#704b43" stroke-width="3"/>'''
 else:body+='''<path d="M189 204Q204 191 220 199" fill="none" stroke="#67473f" stroke-width="4"/><path d="M163 228Q187 242 210 224Q204 247 187 250Q173 245 163 228Z" fill="#865452" stroke="#704b43" stroke-width="2.5"/><path d="M168 232L178 235L176 241M199 232L204 229L201 238" fill="#fff2ce" stroke="none"/>'''
 save('charizard',mood,body)
print('已重绘三位角色的六张 SVG 立绘')
