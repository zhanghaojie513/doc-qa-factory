from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent
items=[]
row=Image.new('RGB',(1278,278),'#eeeee8');ImageDraw.Draw(row).text((12,8),'CURRENT CUT / same subject, similar framing',fill='#202020')
for i,n in enumerate([2,4,6]):row.paste(Image.open(root/'ours'/f'frame_{n:02d}.png').resize((426,240)),(i*426,34))
items.append(row)
for file,idx in [('overview-2.png',1),('overview-1.png',1),('overview-3.png',2)]:
 sheet=Image.open(root/file);items.append(sheet.crop((0,idx*278,1278,(idx+1)*278)))
board=Image.new('RGB',(1278,278*len(items)),'white')
for i,row in enumerate(items):board.paste(row,(0,i*278))
board.save(root/'comparison.png')
print('wrote comparison.png (actual case frames; not a new-film mockup)')
