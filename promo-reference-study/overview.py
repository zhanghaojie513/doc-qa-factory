from pathlib import Path
import subprocess,io,json
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
cases=Path.home()/'.agents/skills/onetake/cases'
videos=sorted(cases.glob('*/*.mp4'));rows=[]
for video in videos:
 duration=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(video)],capture_output=True,text=True,check=True).stdout)
 row=Image.new('RGB',(1278,278),'#eeeeea');d=ImageDraw.Draw(row);d.text((12,8),video.parent.name,fill='#202020')
 for i,p in enumerate([.18,.48,.76]):
  r=subprocess.run(['ffmpeg','-v','error','-ss',str(duration*p),'-i',str(video),'-frames:v','1','-vf','scale=426:240','-f','image2pipe','-vcodec','png','-'],capture_output=True,check=True)
  row.paste(Image.open(io.BytesIO(r.stdout)),(426*i,34))
 rows.append(row)
for start in range(0,len(rows),4):
 group=rows[start:start+4];sheet=Image.new('RGB',(1278,278*len(group)),'white')
 for i,row in enumerate(group):sheet.paste(row,(0,278*i))
 sheet.save(root/f'overview-{start//4+1}.png')
print(f'{len(videos)} case films, 3 sampled frames each, 4 overview sheets.')
