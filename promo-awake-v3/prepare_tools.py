from pathlib import Path
root=Path(__file__).resolve().parent
src=Path.home()/'.agents/skills/onetake/scripts'
gpu="p.chromium.launch(args=['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist'])"
for name in ['probe','stills']:
    code=(src/f'{name}.py').read_text(encoding='utf-8').replace('p.chromium.launch()',gpu)
    (root/f'{name}_windows.py').write_text(code,encoding='utf-8')
print('Prepared probe and stills: only browser launch changed to Windows D3D11.')
