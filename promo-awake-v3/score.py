"""A fresh original C-major motif, paper friction, air and muted object sounds."""
import sys,json,wave,subprocess
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path.home()/'.agents/skills/onetake/scripts'))
from sfx_palette import Score,SR,air,wood,glass,sub,bp,lp
root=Path(__file__).resolve().parent
events=json.loads((root/'events.json').read_text())
s=Score(dur=21,T60=.65);rng=np.random.default_rng(29)
def paper(dur=.55):
    t=np.arange(int(SR*dur))/SR
    noise=bp(rng.standard_normal(len(t)),2300,.65)
    env=np.sin(np.pi*t/dur)**1.3*(.7+.3*np.sin(2*np.pi*31*t))
    return noise*env*.7
def pluck(f,dur=1.4):
    t=np.arange(int(SR*dur))/SR
    a=(1-np.exp(-160*t))*np.exp(-3.8*t)
    return (np.sin(2*np.pi*f*t)+.28*np.sin(2*np.pi*f*2*t)*np.exp(-t*6)+.11*np.sin(2*np.pi*f*3.01*t)*np.exp(-t*11))*a
for e in events:
    t=e['t'];pan=e['pan'];kind=e['kind']
    if kind=='paper':s.place(paper(),t,gain=.18,pan=pan,pan_to=-pan,send=.18)
    if kind=='air':s.place(air(.6,160,1600,.8),t,gain=.14,pan=pan,send=.18)
    if kind=='hit':s.place(wood(155,.14),t,gain=.2,pan=pan,send=.15);s.place(sub(65,.55),t,gain=.14,pan=pan,send=.12)
    if kind=='land':s.place(wood(260,.1),t,gain=.11,pan=pan,send=.18)
    if kind=='glass':s.place(glass(1046.5,.9,.25),t,gain=.07,pan=pan,send=.45)
# Four short musical phrases with different spacing: no one-beep-per-visual-beat score.
for start,melody,steps in [(.08,[261.63,392,329.63],[0,.18,.43]),(1.15,[130.81,261.63,329.63,523.25],[0,.24,.48,.83]),(2.65,[349.23,440,523.25],[0,.18,.5]),(6.65,[196,293.66,392,523.25],[0,.22,.48,.74]),(8.1,[261.63,392,523.25],[0,.24,.48]),(9.55,[196,293.66,392],[0,.18,.42]),(12.4,[130.81,261.63,329.63,392],[0,.24,.48,.72]),(14.95,[174.61,349.23,440],[0,.24,.48]),(17.15,[130.81,261.63,329.63,523.25],[0,.24,.48,.83])]:
    for i,(f,d) in enumerate(zip(melody,steps)):s.place(pluck(f),start+d,gain=.062,pan=(i%3-1)*.22,send=.32)
for t in [.65,1.6,2.1,6.65,7.6,8.1,9.55,12.4,13.35,14.3,15.25,16.2,17.15,18.1]:
    s.place(sub(55,.25),t,gain=.035,send=.08)
m=s.mix(-7)
# Intentional breath at the readable source and the final lockup.
for a,b in [(3.3,4.0),(5.2,6.0),(10.6,11.8),(19.6,21)]:
    i=int(a*SR);j=int(b*SR);n=int(.1*SR);m[i-n:i]*=np.linspace(1,0,n)[:,None];m[i:j]*=0
with wave.open(str(root/'sound-raw.wav'),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((m*32767).astype(np.int16).tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(root/'sound-raw.wav'),'-af','loudnorm=I=-16:TP=-4:LRA=11','-ar','48000','-c:a','pcm_s16le',str(root/'sound-master.wav')],check=True)
print('Original score mastered to -16 LUFS target / -4 dBTP ceiling; paper, air and object sounds share one room.')
