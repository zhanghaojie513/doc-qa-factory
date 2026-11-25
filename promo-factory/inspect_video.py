import subprocess,json
from pathlib import Path
root=Path(__file__).resolve().parent
r=subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,sample_rate','-show_entries','format=duration,size','-of','json',str(root/'draft.mp4')],capture_output=True,text=True,check=True)
info=json.loads(r.stdout);(root/'video-info.json').write_text(json.dumps(info,indent=2),encoding='utf-8');print(r.stdout)
frames=[10,84,135,198,216,294,365,462,615]
selected='+'.join(f'eq(n,{n})' for n in frames)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'draft.mp4'),'-vf',f"select='{selected}',scale=640:360,tile=3x3",'-frames:v','1',str(root/'encoded-sheet.png')],check=True)
print('Saved nine keyframes from the encoded MP4.')
