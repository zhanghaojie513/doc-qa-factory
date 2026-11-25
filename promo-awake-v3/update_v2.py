from pathlib import Path
import base64
root=Path(__file__).resolve().parent
p=root/'comp.html';s=p.read_text(encoding='utf-8')
if 'polish.js' not in s:s=s.replace('</script></body></html>','</script><script src="polish.js"></script></body></html>')
s=s.replace("if(q.has('play'))play();else", "if(false)play();else").replace('at>=20?0:at','at>=DURATION?0:at')
if 'assets/filter.js' not in s:s=s.replace('<script src="polish.js">','<script src="assets/filter.js"></script><script src="polish.js">')
(root/'assets/filter.js').write_text('window.FILTER_IMAGE_DATA="data:image/png;base64,'+base64.b64encode((root/'assets/filter-original.png').read_bytes()).decode()+'";',encoding='utf-8')
p.write_text(s,encoding='utf-8')
p=root/'check_frames.py';s=p.read_text().replace('[.7,2.6,4.9,8.8,10.3,19]','[.35,2.9,4.9,7.6,10.5,13.3,15.4,19.5]').replace('window.__seek(19)','window.__seek(19.5)').replace('6 seek','8 seek');p.write_text(s,encoding='utf-8')
p=root/'preview.html';s=p.read_text(encoding='utf-8').replace('20 秒','21 秒').replace('全新 A 概念','v2 精修版');p.write_text(s,encoding='utf-8')
p=root/'inspect_video.py';s=p.read_text().replace('eq(n,21)+eq(n,90)+eq(n,204)+eq(n,309)+eq(n,438)+eq(n,570)','eq(n,12)+eq(n,87)+eq(n,150)+eq(n,225)+eq(n,315)+eq(n,585)');p.write_text(s,encoding='utf-8')
print('v2 entry and review tools updated')
