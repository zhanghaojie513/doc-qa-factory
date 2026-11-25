from pathlib import Path
import urllib.request,zipfile,json
root=Path(__file__).resolve().parent/'assets'
with urllib.request.urlopen('https://kenney.nl/download-link/6173736574732f696d706163742d736f756e6473') as response:
 url=json.loads(response.read())['url']
folder=root/'downloads';folder.mkdir(exist_ok=True)
archive=folder/'kenney-impact.zip'
urllib.request.urlretrieve(url,archive)
with zipfile.ZipFile(archive) as z:
 names=z.namelist();(root/'sound-index.json').write_text(json.dumps(names,indent=2),encoding='utf-8')
 wanted=[n for n in names if n.lower().endswith(('.txt','.md')) or any(s in n.lower() for s in ['impactmetal_light_000','impactwood_light_000','impactplank_000','impactsoft_medium_000','impactgeneric_light_000'])]
 out=root/'sounds';out.mkdir(exist_ok=True)
 for name in wanted:
  if not name.endswith('/'): (out/Path(name).name).write_bytes(z.read(name))
print('Downloaded official Kenney CC0 pack; selected files:',wanted)
