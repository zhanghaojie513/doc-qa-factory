"""Inspect the encoded file itself; do not substitute the HTML for the MP4."""
import subprocess,json
from pathlib import Path
root=Path(__file__).resolve().parent
r=subprocess.run(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate,sample_rate','-show_entries','format=duration,size','-of','json',str(root/'draft.mp4')],capture_output=True,text=True,check=True)
info=json.loads(r.stdout);(root/'video-info.json').write_text(json.dumps(info,indent=2),encoding='utf-8');print(r.stdout)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'draft.mp4'),'-vf',"select='eq(n,10)+eq(n,87)+eq(n,148)+eq(n,228)+eq(n,315)+eq(n,399)+eq(n,462)+eq(n,516)+eq(n,585)',scale=640:360,tile=3x3",'-frames:v','1',str(root/'encoded-sheet.png')],check=True)
print('Wrote encoded-sheet.png from the actual MP4.')
