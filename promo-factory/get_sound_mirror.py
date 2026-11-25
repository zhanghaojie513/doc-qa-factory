from pathlib import Path
import urllib.request,json
root=Path(__file__).resolve().parent/'assets';out=root/'sounds';out.mkdir(exist_ok=True)
repo='GeorgeQLe/assets-sfx-combat'
request=urllib.request.Request(f'https://api.github.com/repos/{repo}/git/trees/main?recursive=1',headers={'User-Agent':'doc-qa-factory-production'})
with urllib.request.urlopen(request,timeout=30) as response:tree=json.loads(response.read())['tree']
paths=[n['path'] for n in tree if n['type']=='blob'];(root/'sound-index.json').write_text(json.dumps(paths,indent=2),encoding='utf-8')
print('impact candidates:',[p for p in paths if 'impact' in p.lower()][:25])
selected=[p for p in paths if 'kenney' in p.lower() and any(x in p.lower() for x in ['impactmetal_light_000','impactwood_light_000','impactplank_000','impactsoft_medium_000','impactgeneric_light_000','license'])]
for path in selected:
 url=f'https://raw.githubusercontent.com/{repo}/main/{path}'
 with urllib.request.urlopen(url,timeout=30) as response:(out/Path(path).name).write_bytes(response.read())
print('saved:',selected)
(out/'SOURCE.json').write_text(json.dumps({'pack':'Kenney Impact Sounds','license':'CC0','author_page':'https://kenney.nl/assets/impact-sounds','mirror':repo,'files':selected},indent=2),encoding='utf-8')
