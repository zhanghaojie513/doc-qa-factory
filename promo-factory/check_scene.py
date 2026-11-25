import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 root=Path(__file__).resolve().parent
 async with async_playwright() as p:
  b=await p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])
  page=await b.new_page(viewport={'width':1920,'height':1080});errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
  await page.goto((root/'comp.html').as_uri());print('load errors:',errors)
  await page.evaluate('window.__ready');print('ready errors:',errors)
  for t in [.35,2.8,4.5,6.6,7.2,9.8,12,15.4,20.5]:
   await page.evaluate('t=>window.__seek(t)',t)
   await page.screenshot(path=str(root/f'frame-{t:.2f}.png'))
  (root/'events.json').write_text(json.dumps(await page.evaluate('window.__events()'),indent=2),encoding='utf-8')
  print('final errors:',errors)
  await b.close()
asyncio.run(main())
