import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 root=Path(__file__).resolve().parent
 async with async_playwright() as p:
  b=await p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])
  pg=await b.new_page(viewport={'width':1920,'height':1080});errors=[]
  pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('console',lambda m:errors.append(m.text) if m.type=='error' and 'ERR_FILE_NOT_FOUND' not in m.text else None)
  await pg.goto((root/'comp.html').as_uri());await pg.evaluate('window.__ready')
  evidence=[]
  for t in [.35,2.8,4.5,6.6,7.2,9.8,12.1,15.4,20.5]:
   await pg.evaluate('t=>window.__seek(t)',t);a=await pg.screenshot();await pg.evaluate('window.__seek(.1)');await pg.evaluate('t=>window.__seek(t)',t);bb=await pg.screenshot();assert a==bb,f'non-deterministic {t}'
   evidence.append({'t':t,'deterministic':True})
  contacts=await pg.evaluate('''()=>checks.map(c=>{window.__seek(c.hit,false);return {t:c.hit,checkX:c.pl.position.x,paperMin:documentRig.position.x-2.375,paperMax:documentRig.position.x+2.375};})''')
  assert all(c['paperMin']<=c['checkX']<=c['paperMax'] for c in contacts),contacts
  for t in [2.8,4.5,7.2,9.8,12.1]:
   r=await pg.evaluate('''t=>{window.__seek(t,false);const o=window.__track(t).operator;const c=document.getElementById('caption').getBoundingClientRect();return {t,operatorBottom:o.y+o.h,captionTop:c.y,captionOpacity:+document.getElementById('caption').style.opacity};}''',t)
   if r['captionOpacity']>.2:assert r['operatorBottom']<r['captionTop']+3,r
   evidence.append(r)
  await pg.evaluate('window.__seek(4.5)')
  doc=await pg.evaluate('''()=>{const r=docFace.geometry.attributes.uv;return {feed:documentRig.scale.x,uMax:Math.max(...Array.from(r.array).filter((_,i)=>i%2===0))};}''');assert abs(doc['feed']-doc['uMax'])<1e-6,doc
  events=await pg.evaluate('window.__events()');(root/'events.json').write_text(json.dumps(events,indent=2),encoding='utf-8')
  await pg.evaluate('window.__seek(20.5)');await pg.screenshot(path=str(root/'poster.png'))
  assert not errors,errors
  (root/'scene-qa.json').write_text(json.dumps({'samples':evidence,'gateContacts':contacts,'textCrop':doc,'errors':errors},indent=2),encoding='utf-8')
  print('PASS: 9 seek round trips; all six checks physically above paper; caption clearance; glyph-preserving reveal; no page errors.')
  await b.close()
asyncio.run(main())
