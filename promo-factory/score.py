"""Recorded CC0 tactile contacts + an original restrained felt-piano score."""
from pathlib import Path
import sys,json,subprocess,wave,hashlib
import numpy as np
from scipy import signal
root=Path(__file__).resolve().parent;sys.path.insert(0,str(root/'lib'))
from sfx_palette import Score,SR,air,sub,hp,lp,bp
events=json.loads((root/'events.json').read_text(encoding='utf-8'))
fx=Score(dur=23.5,T60=.74);music=Score(dur=23.5,T60=.74);rng=np.random.default_rng(311)
def recording(name,limit=.45,pitch=0):
 path=root/'assets/sounds'/name
 r=subprocess.run(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True)
 x=np.frombuffer(r.stdout,dtype=np.float32).astype(float)
 if pitch:x=signal.resample(x,int(len(x)*2**(-pitch/12)))
 x=x[:int(limit*SR)];x=hp(x,100);x=x/(max(np.max(np.abs(x)),1e-8));n=min(len(x),int(.03*SR));x[-n:]*=np.linspace(1,0,n)
 return x
metal=recording('impactMetal_light_000.ogg',.24,-2)
wood=recording('impactWood_light_000.ogg',.19,-1)
soft=recording('impactSoft_medium_000.ogg',.36,-3)
generic=recording('impactGeneric_light_000.ogg',.2)
def paper(dur=.7):
 t=np.arange(int(SR*dur))/SR;n=rng.standard_normal(len(t));a=np.sin(np.pi*t/dur)**1.3
 return (bp(n,1600,.5)*.6+hp(lp(n,8500),3500)*.18)*a*(.8+.2*np.sin(2*np.pi*27*t))
def roll(dur):
 t=np.arange(int(SR*dur))/SR;n=rng.standard_normal(len(t));a=np.sin(np.pi*t/dur)**1.1
 return (bp(n,650,.8)*.19+bp(n,2700,.6)*.06)*a
for e in events:
 t=e['t'];p=e.get('pan',0);kind=e['kind'];dur=e.get('dur',.7)
 if kind=='key':fx.place(soft,t,.31,pan=p,send=.18);fx.place(metal,t+.018,.12,pan=p,send=.24)
 if kind=='lever':fx.place(wood,t,.25,pan=p,send=.2);fx.place(metal,t+.014,.08,pan=p,send=.2)
 if kind=='stamp':fx.place(soft,t,.36,pan=p,send=.24);fx.place(wood,t+.006,.22,pan=p,send=.2);fx.place(sub(66,.34),t,.12,pan=p,send=.13)
 if kind=='check':fx.place(metal if int(round(t*5))%2 else generic,t,.12,pan=p,send=.16)
 if kind=='gate':fx.place(metal,t,.15,pan=p,send=.28)
 if kind=='paper':fx.place(paper(dur),t,.16,pan=p,pan_to=-p,send=.18)
 if kind=='paperland':fx.place(paper(.19),t,.14,pan=p,send=.12);fx.place(soft,t,.12,pan=p,send=.16)
 if kind=='roll':fx.place(roll(dur),t,.23,pan=p,send=.14)
 if kind=='air':fx.place(air(dur,180,1900,.8),t,.085 if dur>1 else .12,pan=p,pan_to=-p,send=.2)
 if kind=='seal':fx.place(soft,t,.16,pan=p,send=.2);fx.place(paper(.22),t,.12,pan=p,send=.12)
def felt(f,dur=1.2):
 t=np.arange(int(SR*dur))/SR;x=np.zeros_like(t)
 for n in range(1,10):
  damping=np.exp(-t*(2.6+n*.7));x+=np.sin(2*np.pi*f*n*np.sqrt(1+.00015*n*n)*t+rng.uniform(-.02,.02))*damping/(n**1.7)
 attack=(1-np.exp(-t*190));return x*attack*.7
phrases=[(1.65,[349.23,523.25,440,659.25],[0,.29,.8,1.24]),(5.32,[261.63,392,523.25],[0,.3,.76]),(7.66,[440,659.25,523.25,783.99],[0,.28,.73,1.13]),(10.85,[523.25,659.25,783.99,987.77],[0,.22,.51,.92]),(14.6,[392,587.33,659.25],[0,.29,.76])]
for start,notes,offsets in phrases:
 for i,(note,offset) in enumerate(zip(notes,offsets)):music.place(felt(note,.95),start+offset,.047,pan=(i%3-1)*.22,send=.3)
# The final cadence is a dry felt chord and a paper landing; no stock shimmer ending.
for i,f in enumerate([174.61,261.63,329.63,392]):music.place(felt(f,1.7),19.2+i*.027,.038,pan=(i-1.5)*.12,send=.3)
mix=Score(dur=23.5,T60=.74);mix.dry=fx.dry+music.dry;mix.wet=fx.wet+music.wet
x=mix.mix(-7)
for lo,hi in [(4.05,5.18),(7.13,7.6),(10.05,10.73),(15.7,16.6),(21.55,23.5)]:
 a=int(lo*SR);b=int(hi*SR);n=int(.07*SR);x[a-n:a]*=np.linspace(1,0,n)[:,None];x[a:b]*=0
with wave.open(str(root/'sound-raw.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype(np.int16).tobytes())
r=subprocess.run(['ffmpeg','-hide_banner','-y','-i',str(root/'sound-raw.wav'),'-af','loudnorm=I=-16:TP=-4:LRA=11:print_format=json','-ar','48000','-c:a','pcm_s16le',str(root/'sound-master.wav')],capture_output=True,text=True,check=True)
(root/'audio-mastering.txt').write_text(r.stderr,encoding='utf-8')
sources={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (root/'assets/sounds').glob('*.ogg')}
(root/'sound-sources.sha256.json').write_text(json.dumps(sources,indent=2),encoding='utf-8')
print('Recorded CC0 contacts and original felt piano mastered; source hashes and loudness log saved.')
