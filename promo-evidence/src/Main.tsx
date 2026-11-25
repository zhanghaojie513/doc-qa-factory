import {SpeedBlur} from './SpeedBlur';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';

export const C={mint:'#a7d2be',ink:'#193f31',paper:'#f8f6ed',yellow:'#ffdc72',coral:'#ff7052',muted:'#527663'};
const FONT='"Microsoft YaHei", Arial, sans-serif';
const MONO='Consolas, monospace';
const ease=Easing.bezier(.16,1,.3,1);
export const r=(f:number,a:number,b:number,e= ease)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:e});
export const SHOTS=[
 {id:'open',from:0,duration:120,title:'让手册，直接回答。'},
 {id:'answer',from:120,duration:180,title:'回答，带上原文编号。'},
 {id:'source',from:300,duration:165,title:'每个答案，都有来处。'},
 {id:'image',from:465,duration:135,title:'相关插图，直接交付。'},
 {id:'revision',from:600,duration:135,title:'手册改版，重新标定。'},
 {id:'verify',from:735,duration:150,title:'六项校验，全绿才交付。'},
 {id:'boundary',from:885,duration:90,title:'文档没写，就如实说明。'},
 {id:'outro',from:975,duration:165,title:'让文档，成为有据可查的回答。'},
];
export const TOTAL=1140;
// Output offset measured from six cues, both source families: 2032–2064 samples at 48kHz, Remotion 4.0.484/AAC48k/MP4, 2026-11-03.
export const OUTPUT_AUDIO_OFFSET_F=1.28;
export const SFX=[
 {from:SHOTS[0].from+35-24,src:'audio/sfx/fs-726518.mp3',duration:37,volume:.48},
 {from:SHOTS[1].from+55-2,src:'audio/sfx/swing-normalized.wav',duration:17,volume:.285},
 {from:SHOTS[2].from+35-24,src:'audio/sfx/fs-726518.mp3',duration:37,volume:.4},
 {from:SHOTS[3].from+35-24,src:'audio/sfx/fs-726518.mp3',duration:37,volume:.38},
 {from:SHOTS[4].from+42-2,src:'audio/sfx/swing-normalized.wav',duration:17,volume:.302},
 {from:SHOTS[7].from+42-2.285*30,src:'audio/sfx/fs-859482.mp3',duration:90,volume:.22},
 {from:SHOTS[7].from+42-.425*30,src:'audio/sfx/fs-812744.mp3',duration:49,volume:.32},
 {from:SHOTS[7].from+70-.735*30,src:'audio/sfx/fs-714565.mp3',duration:81,volume:.65},
].map(s=>({...s,from:Math.max(0,Math.round(s.from-OUTPUT_AUDIO_OFFSET_F))}));

const Tag:React.FC<React.PropsWithChildren<{dark?:boolean}>>=({children,dark})=><div style={{fontFamily:MONO,fontSize:36,letterSpacing:1,color:dark?C.mint:C.muted}}>{children}</div>;
const Paper:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>>=({children,style})=><div style={{background:C.paper,borderRadius:28,boxShadow:'0 24px 60px #193f311c, 0 2px 0 #fff8 inset',padding:46,...style}}>{children}</div>;
const Pill:React.FC<React.PropsWithChildren<{bg?:string}>>=({children,bg=C.yellow})=><span style={{display:'inline-block',padding:'12px 24px',borderRadius:15,background:bg,color:C.ink,fontFamily:MONO,fontSize:40,fontWeight:700}}>{children}</span>;
export const Head:React.FC<{text:string;dark?:boolean;color?:string;fontSize?:number;left?:number;top?:number}>=({text,dark,color,fontSize=70,left=90,top=158})=>{const f=useCurrentFrame(); const p=r(f,0,24);return text ? <div style={{position:'absolute',left,top,fontFamily:FONT,color:color||(dark?C.paper:C.ink),fontSize,fontWeight:700,letterSpacing:-3,opacity:p,transform:`translateY(${24*(1-p)}px)`}}>{text}</div> : null;};
export const Chrome:React.FC<{dark?:boolean;index?:number}>=({dark=false,index=0})=><>
 <div style={{position:'absolute',left:90,top:58,fontSize:28,letterSpacing:2,color:dark?C.mint:C.ink,fontWeight:700}}>doc-qa-factory <span style={{fontWeight:400,opacity:.6}}> / 文档问答助手工厂</span></div>
 <div style={{position:'absolute',right:90,top:60,fontSize:24,fontFamily:MONO,color:dark?C.mint:C.muted}}>FIELD NOTES / 0{index+1}</div>
 <div style={{position:'absolute',left:90,bottom:40,fontSize:36,color:dark?C.mint:C.muted}}>机制演示 · 虚构示例</div>
 <div style={{position:'absolute',right:90,bottom:48,display:'flex',gap:8}}>{SHOTS.map((s,i)=><div key={s.id} style={{height:4,width:i===index?62:22,background:i===index?(dark?C.yellow:C.ink):(dark?'#a7d2be35':'#193f3125')}}/>)}</div>
</>;

export const Open:React.FC<{title?:string}>=({title=SHOTS[0].title})=>{const f=useCurrentFrame(),p=r(f,0,90,Easing.bezier(.4,0,.2,1)),t=r(f,22,48);return <AbsoluteFill style={{background:C.mint}}><Chrome/>
 <div style={{position:'absolute',left:90,top:335,fontSize:114,fontWeight:700,lineHeight:1.24,letterSpacing:-6,opacity:t,transform:`translateY(${35*(1-t)}px)`}}>{title.split('，')[0]}，<br/><span style={{position:'relative'}}>{title.split('，')[1]}<span style={{position:'absolute',left:2,right:0,bottom:-12,height:10,background:C.coral,transform:`scaleX(${r(f,60,75)})`,transformOrigin:'left'}}/></span></div>
 <div style={{position:'absolute',left:97,top:708,fontSize:39,color:C.muted,opacity:r(f,50,72)}}>把文档装载成可追溯的问答助手</div>
 <div style={{position:'absolute',left:1150,top:273,width:510,height:550,transform:`perspective(1500px) rotateY(${-28+16*p}deg) rotateX(${7-7*p}deg) translateY(${70*(1-p)}px)`,transformStyle:'preserve-3d',opacity:r(f,0,20)}}>
  {[0,1,2,3,4,5].map(i=><div key={i} style={{position:'absolute',inset:0,background:i===5?C.yellow:C.paper,borderRadius:'10px 36px 36px 10px',borderLeft:`24px solid ${i===5?C.coral:'#d8d8c7'}`,transform:`translateZ(${i*5}px)`,boxShadow:i===0?'22px 40px 65px #193f3130':undefined}}/>)}
  <div style={{position:'absolute',inset:0,padding:50,transform:'translateZ(26px)'}}><Tag>DOC / 001</Tag><div style={{fontSize:84,fontWeight:700,marginTop:100,lineHeight:1.2}}>使用<br/>手册</div><div style={{position:'absolute',bottom:42,fontSize:34}}>从一份文档开始。</div><div style={{position:'absolute',right:40,bottom:30,fontSize:95,fontWeight:700,color:C.coral}}>?</div></div>
 </div>
 </AbsoluteFill>};

export const Answer:React.FC<{title?:string}>=({title=SHOTS[1].title})=>{const f=useCurrentFrame(),q='滤芯多久换？',a=r(f,55,85);return <AbsoluteFill style={{background:C.mint}}><Chrome index={1}/><Head text={title}/>
 <div style={{position:'absolute',left:90,top:340,width:760}}><Tag>01 / ASK IN YOUR OWN WORDS</Tag><div style={{fontSize:92,fontWeight:700,letterSpacing:-4,marginTop:60,minHeight:126}}>{q.slice(0,Math.floor(interpolate(f,[12,50],[0,q.length],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})))}<span style={{opacity:f<65?1:0,color:C.coral}}>|</span></div><div style={{height:3,width:720,background:'#193f3130',marginTop:30}}/><div style={{fontSize:40,color:C.muted,marginTop:45}}>一句人话，问你的手册。</div></div>
 <svg width="1920" height="1080" style={{position:'absolute',inset:0,pointerEvents:'none'}}><path d="M840 560 C920 560 900 560 980 560" fill="none" stroke={C.ink} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1-r(f,45,65)}/><circle cx="980" cy="560" r={8*r(f,60,68)} fill={C.coral}/></svg>
 <Paper style={{position:'absolute',left:1010,top:329,width:780,height:490,opacity:a,transform:`translateY(${60*(1-a)}px)`}}><Tag>ANSWER / 演示手册</Tag><div style={{fontSize:40,marginTop:40}}>滤芯寿命为</div><div style={{fontSize:135,lineHeight:1.25,fontWeight:700,letterSpacing:-7}}>60<span style={{fontSize:64,letterSpacing:0}}> 天</span></div><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:15}}><div style={{fontSize:35}}>到期显示「F0」提示。</div><Pill>M010 ↗</Pill></div></Paper>
 <div style={{position:'absolute',left:1010,top:867,fontSize:35,color:C.muted,opacity:r(f,95,115)}}>答案中的事实，落到原文编号。</div>
 </AbsoluteFill>};

export const Source:React.FC<{title?:string}>=({title=SHOTS[2].title})=>{const f=useCurrentFrame(),p=r(f,0,35);return <AbsoluteFill style={{background:C.paper}}><Chrome index={2}/><Head text={title}/>
 <Paper style={{position:'absolute',left:90,top:350,width:650,height:480,background:C.mint,transform:`translateX(${-55*(1-p)}px)`,opacity:p}}><Tag>ANSWER</Tag><div style={{fontSize:72,fontWeight:700,lineHeight:1.4,marginTop:55}}>滤芯寿命<br/>为 <span style={{background:C.yellow,padding:'0 12px'}}>60天</span>。</div><div style={{marginTop:35}}><Pill>M010</Pill></div></Paper>
 <svg width="1920" height="1080" style={{position:'absolute',inset:0}}><path d="M740 706 L820 706 Q850 706 850 676 L850 468 Q850 438 880 438 L958 438" stroke={C.ink} strokeWidth="4" fill="none" pathLength="1" strokeDasharray="1" strokeDashoffset={1-r(f,25,55)}/><circle cx="958" cy="438" r={8*r(f,50,60)} fill={C.coral}/></svg>
 <Paper style={{position:'absolute',left:980,top:350,width:850,height:480,border:'2px solid #193f3125',opacity:r(f,12,40),transform:`translateY(${30*(1-p)}px)`}}><div style={{display:'flex',alignItems:'center',gap:28}}><Pill>M010</Pill><Tag>滤芯更换 / 原文</Tag></div><div style={{fontSize:49,lineHeight:1.6,marginTop:45}}><span style={{background:`linear-gradient(90deg, ${C.yellow} ${r(f,55,70)*100}%, transparent 0)`}}>滤芯寿命为60天，</span><br/>到期后面板显示「F0」提示。</div><div style={{height:2,background:'#193f3120',marginTop:25}}/><div style={{fontSize:32,color:C.muted,marginTop:25}}>桌面气泡水机使用手册 · 演示文档</div></Paper>
 <div style={{position:'absolute',left:90,top:898,fontSize:40,color:C.muted,opacity:r(f,70,90)}}>逐字原文锚定，随时回查。</div>
 </AbsoluteFill>};

export const ImageShot:React.FC<{title?:string}>=({title=SHOTS[3].title})=>{const f=useCurrentFrame(),p=r(f,0,35);return <AbsoluteFill style={{background:C.mint}}><Chrome index={3}/><Head text={title}/>
 <div style={{position:'absolute',left:90,top:366,width:680}}><Tag>02 / THE ORIGINAL, ATTACHED</Tag><div style={{fontSize:91,lineHeight:1.3,fontWeight:700,marginTop:50,letterSpacing:-4}}>原图，<br/>跟着答案来。</div><div style={{fontSize:39,lineHeight:1.6,color:C.muted,marginTop:36}}>按章节找到插图，<br/>支持附件的环境中直接发送。</div></div>
 <div style={{position:'absolute',left:960,top:320,width:820,height:550,transform:`perspective(1500px) rotateY(${12*(1-p)}deg) translateX(${90*(1-p)}px)`,opacity:p}}><div style={{position:'absolute',inset:0,borderRadius:28,background:'#e6ecd9',transform:'translate(18px,16px) rotate(3deg)'}}/><Paper style={{position:'absolute',inset:0,padding:34}}><div style={{fontSize:35,display:'flex',justifyContent:'space-between',marginBottom:20}}><span>滤芯更换 · 章节原图</span><span style={{fontFamily:MONO,color:C.muted}}>01</span></div><Img src={staticFile('manual-image.png')} style={{width:'100%',height:370,objectFit:'contain',borderRadius:16,background:'#fff'}}/><div style={{fontSize:32,color:C.muted,marginTop:15}}>来源：虚构演示手册 / 原始插图</div></Paper></div>
 </AbsoluteFill>};

export const Revision:React.FC<{title?:string}>=({title=SHOTS[4].title})=>{const f=useCurrentFrame();return <AbsoluteFill style={{background:C.paper}}><Chrome index={4}/><Head text={title}/>
 <div style={{position:'absolute',left:90,top:338,width:520}}><Tag>03 / KEEP THE REFERENCES</Tag><div style={{fontSize:83,fontWeight:700,lineHeight:1.3,marginTop:45}}>内容换位置，<br/>引用跟得上。</div><div style={{fontSize:36,color:C.muted,lineHeight:1.6,marginTop:40}}>按逐行内容指纹重定位，<br/>自动改写原文编号引用。</div></div>
 <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>{[0,1,2].map((i)=><path key={i} d={`M1080 ${415+i*125} C1210 ${415+i*125} 1190 ${415+(2-i)*125} 1320 ${415+(2-i)*125}`} fill="none" stroke={i===1?C.coral:C.ink} strokeWidth="4" pathLength="1" strokeDasharray="1" strokeDashoffset={1-r(f,28+i*5,55+i*5)}/>)}</svg>
 {[0,1].map(col=><div key={col} style={{position:'absolute',left:col?1320:720,top:333,width:360}}><div style={{fontFamily:MONO,fontSize:38,marginBottom:22,color:C.muted}}>MANUAL / v{col+1}</div>{['安装','滤芯更换','清洁'].map((text,i)=>{const j=col?2-i:i,p=r(f,4+i*5+col*8,29+i*5+col*8);return <div key={text} style={{height:108,marginBottom:17,borderRadius:18,background:j===1?C.yellow:C.mint,padding:'26px 30px',fontSize:37,opacity:p,transform:`translateY(${35*(1-p)}px)`}}><span style={{fontFamily:MONO,fontSize:28,marginRight:22,opacity:.7}}>0{j+1}</span>{['安装','滤芯更换','清洁'][j]}</div>})}</div>)}
 <div style={{position:'absolute',left:720,top:837,width:960,padding:'22px 30px',borderLeft:`6px solid ${C.coral}`,background:'#ff705212',fontSize:34,opacity:r(f,72,90)}}>值变化、行删除等项，明确提示人工处理。</div>
 </AbsoluteFill>};

export const Verify:React.FC<{title?:string}>=({title=SHOTS[5].title})=>{const f=useCurrentFrame();const labels=['引用越界','截图死链','冗余图片','具体值出处','原文基准篡改','正文与原文措辞'];const n=labels.filter((_,i)=>f>=23+i*9).length;return <AbsoluteFill style={{background:C.ink,color:C.paper}}><Chrome dark index={5}/><Head text={title} dark/>
 <div style={{position:'absolute',left:90,top:365}}><Tag dark>04 / VERIFY BEFORE DELIVERY</Tag><div style={{fontSize:205,fontFamily:MONO,fontWeight:700,color:C.yellow,lineHeight:1.3,marginTop:42}}>{n}<span style={{fontSize:88,color:C.mint}}>/6</span></div><div style={{fontSize:39,color:C.mint,marginTop:20}}>任一项失败，就不宣布装载完成。</div></div>
 <div style={{position:'absolute',left:1000,top:335,width:790}}>{labels.map((s,i)=>{const p=r(f,16+i*9,37+i*9);return <div key={s} style={{display:'flex',gap:25,alignItems:'center',padding:'18px 0',borderBottom:'1px solid #a7d2be30',fontSize:39,opacity:p,transform:`translateX(${42*(1-p)}px)`}}><span style={{width:48,height:48,borderRadius:24,background:C.mint,color:C.ink,textAlign:'center',lineHeight:'48px',fontSize:31,fontWeight:700}}>✓</span>{s}</div>})}<div style={{fontSize:36,color:C.mint,marginTop:25,opacity:r(f,90,105)}}>校验机制示意</div></div>
 </AbsoluteFill>};

// Adapted from MarkerUnderlineTitle.tsx: 22f line entrance, f32–42 dry marker, 33f+ hold.
const buildStroke=(len:number)=>{let a=77;const rand=()=>{let t=(a+=0x6d2b79f5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296};const top:string[]=[],bot:string[]=[];for(let i=0;i<=40;i++){const t=i/40,wob=rand()-.5,mid=19+Math.sin(t*Math.PI*1.6+.4)*2.6+wob*1.6,w=Math.max(2.2,14+Math.sin(t*Math.PI)*6-Math.max(0,t-.86)*46-Math.max(0,.06-t)*70+wob*3);top.push(`${t*len},${mid-w/2}`);bot.push(`${t*len},${mid+w/2}`)}return `M${top.join('L')}L${bot.reverse().join('L')}Z`};
export const Boundary:React.FC<{title?:string}>=({title=SHOTS[6].title})=>{const f=useCurrentFrame(),p=r(f,0,22),p2=r(f,4,26),draw=1-Math.pow(1-interpolate(f,[32,42],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),2.2);return <AbsoluteFill style={{background:C.ink,color:C.paper}}><Chrome dark index={6}/><div style={{position:'absolute',left:90,top:326,fontSize:123,fontWeight:700,lineHeight:1.4,letterSpacing:-5}}><div style={{opacity:p,transform:`translateY(${36*(1-p)}px)`}}>{title.split('，')[0]}，</div><div style={{opacity:p2,transform:`translateY(${36*(1-p2)}px)`}}>就<span style={{position:'relative',color:C.yellow}}>{(title.split('，')[1]||'就如实说明。').replace(/^就/,'').replace(/。$/,'')}<svg width="520" height="44" style={{position:'absolute',bottom:-16,left:-10,overflow:'visible'}}><defs><clipPath id="markerReveal"><rect x="0" y="-20" width={draw*530} height="70"/></clipPath><filter id="dry"><feTurbulence type="fractalNoise" baseFrequency=".09 .5" numOctaves="2" seed="7" result="warp"/><feDisplacementMap in="SourceGraphic" in2="warp" scale="1.8" xChannelSelector="R" yChannelSelector="G"/></filter></defs><path clipPath="url(#markerReveal)" d={buildStroke(520)} fill={C.coral} filter="url(#dry)"/></svg></span>。</div></div><div style={{position:'absolute',left:98,top:783,fontSize:42,color:C.mint,opacity:r(f,45,60)}}>不猜参数 · 不编路径 · 不臆测图片</div></AbsoluteFill>};

// OutroGroupPhotoLaunch movement adaptation: 12f fly, true overshoot 1.4, 4deg crane, 42f letterpress.
const els=[{x:150,y:260,dx:-500,dy:-150,rot:-4,text:'M010 ↗',bg:C.yellow},{x:1450,y:250,dx:500,dy:-200,rot:4,text:'章节原图',bg:C.paper},{x:190,y:810,dx:-400,dy:300,rot:3,text:'改版重标定',bg:C.paper},{x:1400,y:810,dx:400,dy:300,rot:-3,text:'6 / 6 ✓',bg:C.yellow}];
export const Outro:React.FC<{title?:string}>=({title=SHOTS[7].title})=>{const f=useCurrentFrame(),cr=r(f,0,40,Easing.bezier(.3,0,.2,1)),rec=r(f,42,50);return <AbsoluteFill style={{background:C.mint}}><Chrome index={7}/><AbsoluteFill style={{transform:`perspective(1400px) rotateX(${4*(1-cr)}deg) scale(${1.06-.06*cr+.035*r(f,36,165,Easing.bezier(.4,0,.6,1))})`,transformOrigin:'50% 45%'}}>
 {f>=2&&f<14&&<div style={{position:'absolute',top:0,bottom:0,left:interpolate(f,[2,14],[-700,2020]),width:600,opacity:.12,background:'linear-gradient(90deg,transparent,#fff4e0,transparent)',mixBlendMode:'overlay'}}/>}
 <AbsoluteFill style={{background:`radial-gradient(ellipse at center, #f8f6edb0, transparent 65%)`,opacity:r(f,42,50)}}/>
 {els.map((e,i)=>{const cue=4+i*3,p=r(f,cue,cue+12,Easing.bezier(.34,1.4,.44,1)),land=interpolate(f,[cue+9,cue+12,cue+16],[0,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});const v=r(f+.5,cue,cue+12,Easing.bezier(.34,1.4,.44,1))-r(f-.5,cue,cue+12,Easing.bezier(.34,1.4,.44,1));return <SpeedBlur key={e.text} vx={-e.dx*v} vy={-e.dy*v} amount={.3} max={22}><div style={{position:'absolute',left:e.x,top:e.y,width:365,height:104,borderRadius:20,background:e.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:43,fontWeight:700,fontFamily:FONT,opacity:r(f,cue,cue+3)*(1-.12*rec),transform:`translate(${e.dx*(1-p)}px,${e.dy*(1-p)}px) rotate(${e.rot*(2-p)}deg) scale(${(1.12-.12*p)*(1-.015*land)})`,boxShadow:`0 ${10+26*Math.max(0,1-p)}px 40px #193f3120`}}>{e.text}</div></SpeedBlur>})}
 <div style={{position:'absolute',top:365,left:0,width:'100%',textAlign:'center'}}><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:26}}><Img src={staticFile('mascot.png')} style={{width:116,height:116,borderRadius:28,opacity:r(f,38,46),transform:`scale(${1.35-.35*r(f,38,46)})`}}/><div style={{fontSize:106,fontFamily:'Arial, sans-serif',fontWeight:700,letterSpacing:-5,display:'flex'}}>{'doc-qa-factory'.split('').map((ch,i)=>{const d=Math.round(42+i*1.8),p=r(f,d,d+8,Easing.bezier(.2,.75,.3,1));return <span key={i} style={{display:'inline-block',opacity:p,transform:`translateY(${28*(1-p)}px) scale(${1.35-.35*p})`,filter:p<.995?`blur(${8*(1-p)}px)`:undefined}}>{ch}</span>})}</div></div>
 <div style={{height:7,width:280,margin:'35px auto',background:C.coral,transform:`scaleX(${r(f,58,70)})`}}/>
 <div style={{fontSize:62,fontWeight:700,letterSpacing:-2,opacity:r(f,68,80)}}>{title}</div><div style={{fontFamily:MONO,fontSize:44,marginTop:46,opacity:r(f,80,95)}}>npx skills add zhanghaojie513/doc-qa-factory</div>
 </div>
 {Array.from({length:20},(_,i)=><div key={i} style={{position:'absolute',left:(i*439+137)%1920,top:(i*613+271)%1080-Math.min(f,100)*(.3+i%5*.11),width:3+i%3,height:3+i%3,borderRadius:'50%',background:C.yellow,opacity:.45*r(f,20,35)}}/>)}
 </AbsoluteFill></AbsoluteFill>};

export const COMPONENTS=[Open,Answer,Source,ImageShot,Revision,Verify,Boundary,Outro].map(Scene=>{const Unit:React.FC<{title?:string}>=(props)=><AbsoluteFill style={{fontFamily:FONT,color:C.ink}}><Scene {...props}/></AbsoluteFill>; return Unit;});
export const CAPTIONS=SHOTS.slice(1,6).map((s,i)=>({...s,text:s.title,dark:i===4}));
export const BgmUnit:React.FC=()=>{const f=useCurrentFrame();return <Audio src={staticFile('audio/bgm.mp3')} volume={interpolate(f,[0,25,TOTAL-60,TOTAL-1],[0,.2,.2,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>};
export const Main:React.FC<{bgm?:boolean}>=({bgm=true})=>{const f=useCurrentFrame();return <AbsoluteFill style={{fontFamily:FONT,color:C.ink,background:C.mint}}>{SHOTS.map((s,i)=>{const Scene=COMPONENTS[i];return <Sequence key={s.id} from={s.from} durationInFrames={s.duration}><Scene title={i>=1&&i<=5?'':s.title}/></Sequence>})}{CAPTIONS.map(s=><Sequence key={'caption-'+s.id} from={s.from} durationInFrames={s.duration}><Head text={s.text} dark={s.dark}/></Sequence>)}{SFX.map((s,i)=><Sequence key={i} from={s.from} durationInFrames={s.duration}><Audio src={staticFile(s.src)} volume={s.volume}/></Sequence>)}{bgm&&<BgmUnit/>}</AbsoluteFill>};
