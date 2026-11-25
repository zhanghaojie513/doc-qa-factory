import asyncio,base64
from pathlib import Path
from playwright.async_api import async_playwright
async def run():
 root=Path(__file__).resolve().parent
 async with async_playwright() as p:
  b=await p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])
  pg=await b.new_page(viewport={'width':1920,'height':1080});await pg.goto((root/'comp.html').as_uri());await pg.evaluate('window.__ready')
  await pg.evaluate('window.__seek(7.6)')
  for name,expr in [('canvas','frontCanvas'),('board','boards.image')]:
   data=await pg.evaluate(f'{expr}.toDataURL()');(root/f'debug-{name}.png').write_bytes(base64.b64decode(data.split(',')[1]))
  print(await pg.evaluate('({time:filmTime(7.6),keys:Object.keys(boards),same:fm.map.image===frontCanvas,version:frontTex.version,alpha:fg.globalAlpha,rot:paper.rotation.y})'))
  await b.close()
asyncio.run(run())
