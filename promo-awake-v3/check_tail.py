import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 root=Path(__file__).resolve().parent
 async with async_playwright() as p:
  b=await p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])
  pg=await b.new_page(viewport={'width':1920,'height':1080});await pg.goto((root/'comp.html').as_uri());await pg.evaluate('window.__ready')
  results=[]
  for t in [3.1,5.1,7.6,10.5,13.3,15.4]:
   result=await pg.evaluate('''t=>{window.__seek(t);const a=geo.attributes.position.array;let delta=0;for(let i=1;i<a.length;i+=3)delta=Math.max(delta,Math.abs(a[i]-base[i]));return {t,maxPrintedBodyYDistortion:delta,tailHasTextUV:!!tailGeo.attributes.uv,tailMinY:tailGeo.boundingBox.min.y};}''',t)
   assert result['maxPrintedBodyYDistortion']==0,result
   assert not result['tailHasTextUV'],result
   results.append(result)
  (root/'tail-check.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print('PASS: 6 reading states retain original printed-body coordinates; tail contains no text UV.')
  await b.close()
asyncio.run(main())
