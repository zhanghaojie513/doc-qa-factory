import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    root=Path(__file__).resolve().parent
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])
        page=await b.new_page(viewport={'width':1920,'height':1080})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
        await page.goto((root/'comp.html').as_uri());await page.evaluate('window.__ready')
        events=await page.evaluate('window.__events()')
        (root/'events.json').write_text(json.dumps(events,indent=2),encoding='utf-8')
        for t in [.35,2.9,4.9,7.6,10.5,13.3,15.4,19.5]:
            await page.evaluate('t=>window.__seek(t)',t);a=await page.screenshot()
            await page.evaluate('window.__seek(.1)')
            await page.evaluate('t=>window.__seek(t)',t);bb=await page.screenshot()
            assert a==bb,f'non-deterministic at {t}'
        assert not errors,errors
        await page.evaluate('window.__seek(19.5)');await page.screenshot(path=str(root/'poster.png'))
        print('8 seek round-trip checks passed; no page errors; events.json + poster.png exported')
        await b.close()
asyncio.run(main())
