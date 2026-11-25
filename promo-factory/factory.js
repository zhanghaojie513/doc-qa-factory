/* One world, one operator, one document. All state is a function of film time. */
'use strict';
const T=THREE,E=OM.ease,L=OM.lerp,cl=OM.clamp,DUR=23.5;
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const phase=(t,a,b,e=E.cubicInOut)=>e(OM.seg(t,a,b));
const span=(t,a,b,c,d)=>phase(t,a,b)*(1-phase(t,c,d));
function keys(t,list){if(t<=list[0].t)return {...list[0]};if(t>=list.at(-1).t)return {...list.at(-1)};let i=0;while(list[i+1].t<t)i++;const a=list[i],b=list[i+1],p=(b.e||E.cubicInOut)(OM.seg(t,a.t,b.t)),out={};for(const n of Object.keys(a))if(n!=='t'&&n!=='e')out[n]=Array.isArray(a[n])?a[n].map((v,j)=>L(v,b[n][j],p)):L(a[n],b[n],p);return out;}
const scene=new T.Scene();scene.background=new T.Color(LOOK.color.ground);scene.fog=new T.Fog(LOOK.color.ground,44,100);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(1920,1080);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.NeutralToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;document.getElementById('stage').appendChild(renderer.domElement);
const camera=new T.PerspectiveCamera(34,1920/1080,.08,160);
const hemi=new T.HemisphereLight('#fffdf4','#746c5e',1.65);scene.add(hemi);
const key=new T.DirectionalLight('#fff7e5',3.4);key.position.set(-9,16,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-20,right:20,top:13,bottom:-13,near:.1,far:60});key.shadow.bias=-.0003;key.shadow.normalBias=.025;key.shadow.radius=3;scene.add(key);
const fill=new T.DirectionalLight('#dce7ff',1.4);fill.position.set(12,8,-7);scene.add(fill);
function environment(){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d');g.fillStyle='#a39f96';g.fillRect(0,0,1024,512);for(const [x,y,w,h] of [[110,60,210,290],[640,100,280,150],[395,40,70,180]]){const gr=g.createRadialGradient(x+w/2,y+h/2,1,x+w/2,y+h/2,w*.72);gr.addColorStop(0,'#ffffff');gr.addColorStop(.62,'#eeeae1');gr.addColorStop(1,'#a39f96');g.fillStyle=gr;g.fillRect(x-50,y-30,w+100,h+60);}g.fillStyle='#22252a';g.fillRect(0,365,1024,147);const tx=new T.CanvasTexture(c);tx.mapping=T.EquirectangularReflectionMapping;tx.colorSpace=T.SRGBColorSpace;const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(tx).texture;pm.dispose();}
environment();
const mats={
 metal:new T.MeshStandardMaterial({color:'#b7bab7',metalness:.82,roughness:.28}),
 brushed:new T.MeshPhysicalMaterial({color:'#d2d3cd',metalness:.8,roughness:.36,anisotropy:.65}),
 ceramic:new T.MeshPhysicalMaterial({color:'#fffdf5',roughness:.28,clearcoat:.35,clearcoatRoughness:.28}),
 black:new T.MeshStandardMaterial({color:'#252927',roughness:.82}),
 rubber:new T.MeshStandardMaterial({color:'#343834',roughness:.96}),
 orange:new T.MeshPhysicalMaterial({color:'#f15a35',roughness:.26,metalness:.05,clearcoat:.8,clearcoatRoughness:.2}),
 paper:new T.MeshStandardMaterial({color:'#fffdf5',roughness:.94}),
 green:new T.MeshStandardMaterial({color:'#2a805c',emissive:'#2a805c',emissiveIntensity:.18,roughness:.4}),
 darkLED:new T.MeshStandardMaterial({color:'#a4aaa1',roughness:.6})
};
const floor=new T.Mesh(new T.PlaneGeometry(250,250),new T.MeshBasicMaterial({color:LOOK.color.ground,toneMapped:false}));floor.rotation.x=-Math.PI/2;floor.position.y=-.025;scene.add(floor);
const shadowPlane=new T.Mesh(new T.PlaneGeometry(120,120),new T.ShadowMaterial({color:'#504936',opacity:.22}));shadowPlane.rotation.x=-Math.PI/2;shadowPlane.position.y=-.018;shadowPlane.receiveShadow=true;scene.add(shadowPlane);
function roundShape(w,h,r){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
const boxCache=new Map();
function block(w,h,d,mat,x=0,y=0,z=0,r=.06,parent=scene){const id=[w,h,d,r].join('/');let geo=boxCache.get(id);if(!geo){geo=new T.ExtrudeGeometry(roundShape(w-2*r,d-2*r,Math.min(r,.1)),{depth:Math.max(.005,h-2*r),bevelEnabled:r>0,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});geo.rotateX(-Math.PI/2);geo.translate(0,-h/2+r,0);boxCache.set(id,geo);}const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function cylinder(r,h,mat,x,y,z,axis='y',parent=scene){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,40),mat);if(axis==='x')m.rotation.z=Math.PI/2;if(axis==='z')m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function ring(r,tube,x,y,z,axis='z',mat=mats.metal,parent=scene){const m=new T.Mesh(new T.TorusGeometry(r,tube,10,52),mat);if(axis==='y')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.y=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
function bolt(x,y,z,parent=scene){cylinder(.085,.038,mats.metal,x,y,z,'y',parent);block(.087,.007,.012,mats.black,x,y+.023,z,.002,parent);}
function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;return tx;}
function ink(g,s,x,y,size,role='text',color='#202522',align='left'){g.font=LOOK.font(role,size);g.letterSpacing=LOOK.track(role,size);g.fillStyle=color;g.textAlign=align;g.fillText(s,x,y);}
function textPlane(tx,w,h,x,y,z,rx=0,parent=scene,unlit=false){const mat=unlit?new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide}):new T.MeshStandardMaterial({map:tx,roughness:.94,side:T.DoubleSide});const m=new T.Mesh(new T.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.x=rx;m.receiveShadow=!unlit;parent.add(m);return m;}
function plaque(s,w,h,x,y,z,rx=-Math.PI/2,color='#202522',back='#fffdf5',parent=scene){const tx=texture(640,Math.round(640*h/w),g=>{g.fillStyle=back;g.fillRect(0,0,g.canvas.width,g.canvas.height);ink(g,s,320,g.canvas.height*.68,Math.min(92,g.canvas.height*.6),'mono',color,'center');});return textPlane(tx,w,h,x,y,z,rx,parent);}
function ao(x,z,w,d){const tx=texture(128,128,g=>{const a=g.createRadialGradient(64,64,2,64,64,62);a.addColorStop(0,'rgba(63,54,38,.23)');a.addColorStop(.5,'rgba(63,54,38,.11)');a.addColorStop(1,'rgba(63,54,38,0)');g.fillStyle=a;g.fillRect(0,0,128,128);});const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;m.position.set(x,-.012,z);scene.add(m);}
function bed(x,w,d){const a=block(w,.27,d,mats.brushed,x,.19,0,.12);for(const sx of [-1,1])for(const sz of [-1,1]){cylinder(.22,.16,mats.black,x+sx*(w/2-.38),.05,sz*(d/2-.38));bolt(x+sx*(w/2-.35),.35,sz*(d/2-.35));}ao(x,0,w+1,d+1);return a;}
bed(-7.2,6.9,4.3);bed(-1.1,4.5,4.3);bed(3.9,4.8,4.3);bed(9.1,5.7,4.3);bed(13.4,3.5,4.3);
// A continuous conveyor and an independent control rail make the geography legible.
block(25.7,.22,2.75,mats.black,1.4,.53,0,.09);
const ribs=[];for(let i=0;i<58;i++)ribs.push(block(.055,.016,2.65,mats.rubber,-11+i*.45,.655,0,.004));
const rollerRubber=mats.black.clone();rollerRubber.map=texture(256,32,g=>{g.fillStyle='#252927';g.fillRect(0,0,256,32);g.fillStyle='#383e38';for(let x=0;x<256;x+=16)g.fillRect(x,0,2,32);});rollerRubber.roughness=.88;
const rollers=[];for(const x of [-10.5,-8.4,-6.4,-3.4,1.1,5.8,11.8,14.1]){rollers.push(cylinder(.31,2.95,rollerRubber,x,.59,0,'z'));cylinder(.11,3.2,mats.metal,x,.59,0,'z');for(const z of [-1.52,1.52])ring(.18,.035,x,.59,z);}
for(const z of [3.36,3.91])cylinder(.057,25.4,mats.metal,1.2,.49,z,'x');
for(const x of [-10.8,-7.3,-2,3.8,8.8,13.7]){block(.45,.13,.9,mats.brushed,x,.15,3.63,.045);for(const z of [3.36,3.91])cylinder(.07,.34,mats.metal,x,.31,z);ao(x,3.63,1,.9);}
// The confirmed question climbs a short rail into its answer dock.
for(const z of [3.36,3.91]){const a=V(10.6,.49,z),b=V(13.4,1.14,z),direction=b.clone().sub(a);const ramp=new T.Mesh(new T.CylinderGeometry(.057,.057,direction.length(),32),mats.metal);ramp.position.copy(a).add(b).multiplyScalar(.5);ramp.quaternion.setFromUnitVectors(V(0,1,0),direction.normalize());scene.add(ramp);}
cylinder(.29,1.06,mats.brushed,13.4,.61,3.63);cylinder(.6,.12,mats.ceramic,13.4,1.13,3.63);
bed(16.6,3.2,3.4);
// The first key, machined from ceramic and aluminium.
cylinder(.94,.18,mats.brushed,-10.8,.32,3.63);ring(.73,.05,-10.8,.43,3.63,'y');
const startKey=cylinder(.64,.13,mats.ceramic,-10.8,.46,3.63);const startLabel=plaque('ASK',.54,.22,-10.8,.535,3.63,-Math.PI/2,'#6a6a63');
const levers=[];
for(const [x,hit] of [[-8.5,2.6],[-1.2,6.25],[3.8,8.45],[6.7,11.15]]){const root=new T.Group();root.position.set(x+.46,.51,3.63);scene.add(root);cylinder(.115,.54,mats.metal,0,0,0,'z',root);block(.24,.75,.42,mats.black,0,.36,0,.045,root);block(.3,.12,.5,mats.orange,0,.75,0,.035,root);levers.push({root,hit});}
// Source feed: rubber rollers, white stock roll, tension hoops.
const spool=cylinder(.65,2.1,mats.paper,-8.55,1.03,-.05,'z');cylinder(.16,2.7,mats.metal,-8.55,1.03,-.05,'z');
for(const z of [-1.28,1.18]){ring(.65,.025,-8.55,1.03,z);block(.35,.9,.22,mats.ceramic,-8.55,.65,z,.04);}
const tension=cylinder(.16,2.4,mats.black,-6.9,.96,0,'z');
plaque('01 / SOURCE',2.1,.3,-8.0,.37,1.74);plaque('02 / TRACE',2.0,.3,-1.1,.37,1.74);plaque('03 / ATTACH',2.1,.3,3.9,.37,1.74);plaque('04 / VERIFY',2.2,.3,9.1,.37,1.74);
// The traceability press. Posts stay behind the document; the die meets its front margin.
for(const x of [-2.55,.15]){cylinder(.13,2.5,mats.metal,x,1.65,-.95);cylinder(.25,.13,mats.black,x,.49,-.95);cylinder(.24,.15,mats.brushed,x,2.83,-.95);}
block(3.25,.34,1.5,mats.ceramic,-1.2,2.84,-.45,.13);
block(.5,.22,2.1,mats.brushed,.23,2.84,.15,.055);
const pressRod=cylinder(.115,1.0,mats.metal,.23,2.1,.96);
const head=new T.Group();head.position.set(.23,1.85,.96);scene.add(head);block(1.4,.38,.8,mats.black,0,0,0,.08,head);block(1.18,.07,.65,mats.orange,0,-.22,0,.025,head);plaque('M010',1.13,.25,0,.025,.414,0,'#fffdf5','#252927',head);
ring(.17,.045,-1.2,2.99,-.45,'y',mats.orange);
// A real manual illustration is emitted from a side slot, rather than replacing the document.
block(3.25,1.45,1.9,mats.ceramic,3.9,1.13,-1.8,.16);block(2.72,.14,.06,mats.black,3.9,.77,-.82,.025);
block(2.7,.06,.7,mats.brushed,3.9,.67,-.48,.025);plaque('ORIGINAL / .jpg',1.95,.22,3.9,1.65,-.83,0,'#6a6a63');
const imageSwitch=cylinder(.12,.07,mats.orange,5.12,1.9,-1.8);
// Six physical checks. This is a mechanism illustration, not a fabricated terminal run.
block(5.4,.18,.5,mats.brushed,9.05,2.15,-.86,.055);
const checks=[];
for(let i=0;i<6;i++){const x=7.25+i*.7,hit=11.85+i*.17;const pl=new T.Group();pl.position.set(x,1.35,-.55);scene.add(pl);cylinder(.065,1.0,mats.metal,0,.45,0,'y',pl);cylinder(.23,.12,mats.ceramic,0,0,0,'y',pl);const led=cylinder(.075,.035,mats.darkLED,x,2.265,-.86);plaque(String(i+1).padStart(2,'0'),.3,.18,x,.375,1.74,-Math.PI/2,'#6a6a63');checks.push({pl,led,hit});}
for(const x of [6.5,11.6])block(.18,1.9,.3,mats.ceramic,x,1.21,-.86,.055);
const barrier=new T.Group();barrier.position.set(13.1,.65,1.15);scene.add(barrier);cylinder(.12,.35,mats.metal,0,0,0,'z',barrier);block(.12,.12,2.7,mats.orange,0,0,-1.35,.04,barrier);
// Main document: a rigid printed sheet. No tail, no warped glyphs.
const documentRig=new T.Group();scene.add(documentRig);
block(4.75,.055,2.75,mats.paper,0,-.025,0,.018,documentRig);
const docMaterial=new T.MeshStandardMaterial({roughness:.94,side:T.DoubleSide});
const docFace=new T.Mesh(new T.PlaneGeometry(4.72,2.72),docMaterial);docFace.rotation.x=-Math.PI/2;docFace.position.y=.008;docFace.receiveShadow=true;documentRig.add(docFace);
const originalDocUV=docFace.geometry.attributes.uv.array.slice();let lastFeed=-1;
const photoRig=new T.Group();scene.add(photoRig);block(3.0,.045,2.1,mats.paper,0,-.025,0,.015,photoRig);
const photoMaterial=new T.MeshStandardMaterial({roughness:.7,side:T.DoubleSide});const photoFace=new T.Mesh(new T.PlaneGeometry(2.82,1.91),photoMaterial);photoFace.rotation.x=-Math.PI/2;photoFace.position.y=.005;photoFace.receiveShadow=true;photoRig.add(photoFace);
const hero=new T.Group();scene.add(hero);const ball=new T.Mesh(new T.SphereGeometry(.46,48,32),mats.orange);ball.castShadow=true;ball.receiveShadow=true;hero.add(ball);
const badge=new T.Mesh(new T.PlaneGeometry(.54,.67),new T.MeshBasicMaterial({transparent:true,side:T.DoubleSide,depthWrite:false}));scene.add(badge);
let maps={},figure=new Image();figure.src=FILTER_IMAGE_DATA;
function printedPage(stamped=false,answer=false){return texture(1600,930,g=>{g.fillStyle='#fffdf5';g.fillRect(0,0,1600,930);ink(g,answer?'Q / 怎么换滤芯？':'桌面气泡水机使用手册 · 演示',120,124,43,'text','#6a6a63');g.fillStyle='#d7d3c9';g.fillRect(120,170,1360,2);ink(g,answer?'滤芯寿命':'滤芯更换',120,325,86,'display');ink(g,answer?'60天':'滤芯寿命为60天',120,520,answer?190:119,'display');ink(g,'到期后面板显示「F0」提示。',120,665,65,'text','#6a6a63');if(stamped){g.fillStyle='#f15a35';g.beginPath();g.roundRect(1090,738,390,110,14);g.fill();ink(g,'M010',1285,816,68,'mono','#fffdf5','center');}ink(g,answer?'回答带原文编号':'逐字原文 · 可回查',120,820,40,'text','#6a6a63');});}
function glyph(s){return texture(256,320,g=>{g.clearRect(0,0,256,320);ink(g,s,128,249,s==='?'?288:235,'display','#fffdf5','center');});}
function initMaps(){maps.raw=printedPage();maps.stamped=printedPage(true);maps.answer=printedPage(true,true);maps.question=glyph('?');maps.ok=glyph('✓');maps.photo=texture(1100,770,g=>{g.fillStyle='#fffdf5';g.fillRect(0,0,1100,770);g.drawImage(figure,50,36,1000,655);ink(g,'filter-01.jpg / 原图',55,741,32,'mono','#6a6a63');});photoMaterial.map=maps.photo;photoMaterial.needsUpdate=true;}
const HERO=[
 {t:0,x:-10.8,y:2.45,z:3.63},{t:.65,x:-10.8,y:2.45,z:3.63},
 {t:1.05,x:-10.8,y:.985,z:3.63,e:E.expoIn},{t:1.35,x:-10.8,y:.985,z:3.63},
 {t:2.6,x:-8.5,y:1.0,z:3.63,e:E.quadOut},{t:3.9,x:-6.3,y:1.0,z:3.63,e:E.quadOut},
 {t:5.2,x:-6.3,y:1.0,z:3.63},{t:6.25,x:-1.2,y:1.0,z:3.63,e:E.quintInOut},
 {t:7.6,x:-1.2,y:1.0,z:3.63},{t:8.45,x:3.8,y:1.0,z:3.63,e:E.quintInOut},
 {t:10.55,x:3.8,y:1.0,z:3.63},{t:11.15,x:6.7,y:1.0,z:3.63,e:E.quintInOut},
 {t:13.15,x:10.6,y:1.0,z:3.63,e:E.sineInOut},{t:14.55,x:13.4,y:1.65,z:3.63,e:E.cubicOut},
 {t:23.5,x:13.4,y:1.65,z:3.63}
];
const DOC=[{t:0,x:-8.5},{t:2.6,x:-8.5},{t:3.9,x:-4.35,e:E.cubicOut},{t:5.2,x:-4.35},{t:6.2,x:-1.2,e:E.quintInOut},{t:7.6,x:-1.2},{t:8.45,x:3.9,e:E.quintInOut},{t:11.15,x:3.9},{t:13.15,x:10.6,e:E.cubicInOut},{t:14.55,x:13.4,e:E.cubicOut},{t:23.5,x:13.4}];
const CAM=[
 {t:0,aim:[-10.8,1.4,3.5],eye:[-8.5,3.9,8.4],fov:32},{t:.65,aim:[-10.8,1.4,3.5],eye:[-8.5,3.9,8.4],fov:32},
 {t:1.55,aim:[-9.6,.85,2.7],eye:[-6.5,4.8,9.3],fov:34,e:E.sineInOut},
 {t:2.9,aim:[-7.7,1.0,1.7],eye:[-3.8,5.3,8.4],fov:34,e:E.sineInOut},
 {t:3.9,aim:[-4.9,1.0,1.5],eye:[-3.8,7.2,7.4],fov:33,e:E.cubicInOut},
 {t:5.2,aim:[-4.9,1.0,1.5],eye:[-3.8,7.2,7.4],fov:33},
 {t:6.1,aim:[-1.8,1.0,1.5],eye:[-3.9,5.1,7.8],fov:34,e:E.quintInOut},
 {t:6.75,aim:[-1.2,1.05,1.3],eye:[-3.9,5.1,7.6],fov:32,e:E.expoOut},
 {t:7.6,aim:[-1.2,1.05,1.3],eye:[-3.9,5.1,7.6],fov:32},
 {t:8.5,aim:[3.9,.9,1.2],eye:[6.8,5.8,8.2],fov:34,e:E.quintInOut},
 {t:9.55,aim:[3.9,.9,1.2],eye:[4.2,7.5,7.4],fov:34,e:E.cubicInOut},
 {t:10.55,aim:[3.9,.9,1.2],eye:[4.2,7.5,7.4],fov:34},
 {t:11.55,aim:[7.6,1.0,1.5],eye:[4.6,5.9,8.0],fov:34,e:E.quintInOut},
 {t:12.85,aim:[9.6,1.05,1.5],eye:[7.4,5.1,8.9],fov:33,e:E.sineInOut},
 {t:13.2,aim:[9.6,1.05,1.5],eye:[7.4,5.1,8.9],fov:33},
 {t:14.55,aim:[14.5,1.95,1.5],eye:[15.5,6.0,12.6],fov:34,e:E.quintInOut},
 {t:16.5,aim:[14.5,1.95,1.5],eye:[15.5,6.0,12.6],fov:34},
 {t:19.2,aim:[3.0,-1.6,0],eye:[10.5,18.4,30.5],fov:34,e:E.quintInOut},
 {t:23.5,aim:[3.0,-1.6,0],eye:[10.5,18.4,30.5],fov:34}
];
const CONTACTS=[1.05,2.6,6.6,8.45,9.55,...checks.map(c=>c.hit),14.55];
const CAPTIONS=[
 {a:1.65,b:2.0,c:3.55,d:3.85,k:'01 / SOURCE',h:'从手册里，取出原文。',s:'每个具体值，都有依据。'},
 {a:5.55,b:5.95,c:7.25,d:7.55,k:'02 / TRACE',h:'给答案，压上出处。',s:'M010 · 逐字原文编号'},
 {a:8.0,b:8.45,c:10.15,d:10.5,k:'03 / ATTACH',h:'相关插图，也一起交付。',s:'原图按章节归位，作为文件发送。'},
 {a:10.9,b:11.3,c:12.85,d:13.2,k:'04 / VERIFY',h:'六项校验，通过才放行。',s:'引用 · 图片 · 冗余 · 数值 · 基准 · 措辞'},
 {a:14.0,b:14.45,c:16.0,d:16.5,k:'ANSWER / VERIFIED SOURCE',h:'一句回答，一条回查路径。',s:'具体值不猜，文档没写就如实说明。'}
];
function opacity(id,a,y=0){const e=document.getElementById(id);e.style.opacity=cl(a,0,1);e.style.transform=`translateY(${y}px)`;}
function overlay(t){
 const hp=1-phase(t,1.2,1.7);opacity('hook',hp,0);
 const c=CAPTIONS.find(c=>t>=c.a&&t<=c.d),a=c?span(t,c.a,c.b,c.c,c.d):0;
 for(const [id,val] of [['eyebrow',c?.k||''],['headline',c?.h||''],['detail',c?.s||'']])document.getElementById(id).textContent=val;
 opacity('caption',a,12*(1-a));
 const n=OM.wordRise(Math.min(t,21),19.15,{dist:24,omega:26});opacity('mark',n.op,n.y);
 const ins=OM.wordRise(Math.min(t,21),19.8,{dist:15});opacity('install',ins.op,ins.y);
 opacity('note',1-phase(t,18,19));
}
let docMap=null,badgeMap=null;
function seek(t,render=true){
 t=cl(t,0,DUR);const p=keys(t,HERO),d=keys(t,DOC),c=keys(t,CAM);
 const hit=OM.impact(Math.min(t,1.6),1.05,{decay:13,omega:24,sqx:.11,sqy:.13}),startPress=span(t,1.05,1.14,1.28,1.5);hero.position.set(p.x,p.y-.095*startPress-.46*(1-hit.sy),p.z);hero.scale.set(hit.sx,hit.sy,hit.sx);ball.rotation.z=-p.x*1.6;
 startKey.position.y=.46-.095*startPress;startLabel.position.y=startKey.position.y+.075;
 for(const {root,hit:th} of levers){const down=OM.spring(Math.min(t-th,.8),.65,28)* (1-phase(t,th+.6,th+1.1));root.rotation.z=-1.36*down;}
 const feed=phase(t,2.6,3.9,E.cubicOut);spool.rotation.y=-feed*3.0;tension.rotation.y=-d.x*2;
 for(const r of rollers)r.rotation.y=-d.x*2.1;
 for(let i=0;i<ribs.length;i++)ribs[i].position.x=-11+(((i*.45+(d.x+8.5))%26.1)+26.1)%26.1;
 documentRig.visible=feed>.0001;documentRig.position.set(d.x,.94,0);
 documentRig.scale.set(Math.max(.0001,feed),1,1);
 if(feed!==lastFeed){const uv=docFace.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,originalDocUV[i*2]*feed);uv.needsUpdate=true;lastFeed=feed;}
 const stand=phase(t,13.55,14.55,E.expoOut);documentRig.position.y=.94+stand*1.78;
 // Its long side stands vertically via local Z rotation, then rotates toward the reading camera.
 documentRig.rotation.set(stand*Math.PI/2,0,0);
 const map=t<6.62?maps.raw:t<13.55?maps.stamped:maps.answer;if(map!==docMap){docMaterial.map=map;docMaterial.needsUpdate=true;docMap=map;}
 const dip=span(t,6.32,6.6,6.72,7.03);head.position.y=1.85-.65*dip;pressRod.position.y=(2.85+head.position.y+.18)/2;pressRod.scale.y=Math.max(.15,2.85-head.position.y-.18);
 const eject=phase(t,8.5,9.55,E.quintOut);photoRig.visible=t>=8.5;photoRig.position.set(t<11.15?3.9:keys(t,[{t:11.15,x:3.9},{t:13.15,x:10.6},{t:14.55,x:17.0},{t:23.5,x:17.0}]).x,.96+Math.sin(Math.PI*eject)*.65,L(-.95,1.75,eject));photoRig.scale.setScalar(.12+.88*eject);photoRig.rotation.set(.09*Math.sin(Math.PI*eject),-.07*eject,.055*Math.sin(Math.PI*eject));
 const imageStand=phase(t,13.55,14.55,E.expoOut);photoRig.rotation.x+=imageStand*Math.PI/2;photoRig.position.y+=imageStand*1.65;photoRig.position.z-=imageStand*1.2;
 imageSwitch.position.y=1.9-.04*span(t,8.36,8.45,8.6,8.8);
 checks.forEach(({pl,led,hit:th})=>{pl.position.y=1.35-.35*span(t,th-.09,th,th+.055,th+.2);led.material=t>=th+.05?mats.green:mats.darkLED;});
 barrier.rotation.y=-Math.PI/2*phase(t,12.75,13.05,E.expoOut);
 camera.position.fromArray(c.eye);const aim=V(...c.aim),air=span(t,1.3,2.1,13.4,14.4);aim.z+=.8*air;aim.y-=.3*air;camera.position.sub(aim).multiplyScalar(1+.18*air).add(aim);let sx=0,sy=0;for(const h of CONTACTS){if(t>h&&t<h+.4){const s=OM.shake(t,h,{amp:h===6.6?.025:.012,decay:15,seed:Math.round(h*100)});sx+=s.x;sy+=s.y;}}camera.position.x+=sx;camera.position.y+=sy;camera.fov=c.fov;camera.lookAt(aim);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const bm=t<13.4?maps.question:maps.ok;if(badgeMap!==bm){badge.material.map=bm;badge.material.needsUpdate=true;badgeMap=bm;}
 const toward=camera.position.clone().sub(hero.position).normalize();badge.position.copy(hero.position).addScaledVector(toward,.464);badge.quaternion.copy(camera.quaternion);badge.scale.set(hit.sx,hit.sy,1);
 overlay(t);scene.updateMatrixWorld(true);if(render)renderer.render(scene,camera);return true;
}
function project(p){const a=p.clone().project(camera);return [(a.x+1)*960,(1-a.y)*540];}
function worldBox(min,max,op=1,cull=false){if(cull){const f=new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));if(!f.intersectsBox(new T.Box3(min,max)))return {x:0,y:0,w:0,h:0,op:0};}const ps=[];for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z]){const p=V(x,y,z);if(cull&&p.clone().applyMatrix4(camera.matrixWorldInverse).z>=-camera.near)continue;ps.push(project(p));}if(!ps.length)return{x:0,y:0,w:0,h:0,op:0};const xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys),op};}
function objectBox(obj,op=1,cull=false){const b=new T.Box3().setFromObject(obj);return worldBox(b.min,b.max,op,cull);}
function tracks(t){seek(t,false);return {operator:worldBox(hero.position.clone().addScalar(-.47),hero.position.clone().addScalar(.47)),document:objectBox(documentRig,documentRig.visible?1:0),photo:objectBox(photoRig,photoRig.visible?1:0),press:objectBox(head,1,true),source:worldBox(V(-10.5,.1,-2.2),V(-3.7,1.8,2.2),1,true),trace:worldBox(V(-3.4,.1,-2.2),V(1.2,3.1,2.2),1,true),attach:worldBox(V(1.5,.1,-2.8),V(6.3,2.0,2.2),1,true),verify:worldBox(V(6.3,.1,-2.2),V(12,2.4,2.2),1,true)};}
window.__seek=seek;window.__track=tracks;
window.__meta={dur:DUR,fps:30,cuts:[],inFrame:{operator:[.12,16.5,'whole'],document:[3.95,5.1,'whole'],photo:[9.65,10.5,'whole']}};
window.__motion=(a,b)=>{const A=tracks(a),B=tracks(b);let m=0;for(const id of Object.keys(A)){const x=A[id],y=B[id];const visible=o=>o.op>.05&&o.x<2100&&o.x+o.w>-180&&o.y<1260&&o.y+o.h>-180;if(visible(x)||visible(y))m=Math.max(m,Math.hypot(x.x-y.x,x.y-y.y),Math.abs(x.w-y.w),Math.abs(x.h-y.h));}return m;};
window.__events=()=>[{t:1.05,kind:'key',pan:-.1},{t:2.6,kind:'lever',pan:-.4},{t:2.72,kind:'roll',pan:-.3,dur:1.2},{t:5.25,kind:'air',pan:-.3,dur:.8},{t:6.6,kind:'stamp',pan:0},{t:7.63,kind:'air',pan:.1,dur:.7},{t:8.45,kind:'lever',pan:.3},{t:8.6,kind:'paper',pan:.2,dur:.8},{t:9.55,kind:'paperland',pan:0},{t:11.16,kind:'roll',pan:-.2,dur:1.9},...checks.map((c,i)=>({t:c.hit,kind:'check',pan:-.35+i*.14})),{t:13,kind:'gate',pan:.4},{t:14.55,kind:'paperland',pan:0},{t:16.65,kind:'air',pan:0,dur:2.4},{t:19.2,kind:'seal',pan:0}];
function resize(){const s=Math.min(innerWidth/1920,innerHeight/1080),f=document.getElementById('frame');f.style.transform=`scale(${s})`;f.style.left=(innerWidth-1920*s)/2+'px';f.style.top=(innerHeight-1080*s)/2+'px';}resize();addEventListener('resize',resize);
const audio=new Audio('sound-master.wav');let playing=false,at=0,start=0;
function play(t=0){playing=true;at=t;start=performance.now()-t*1000;audio.currentTime=t;audio.play().catch(()=>{});requestAnimationFrame(loop);}
function loop(now){if(!playing)return;at=Math.min(DUR,(now-start)/1000);seek(at);if(at<DUR)requestAnimationFrame(loop);else{playing=false;audio.pause();}}
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(playing){playing=false;audio.pause();}else play(at>=DUR?0:at);}else if(e.code==='ArrowLeft'||e.code==='ArrowRight'){playing=false;audio.pause();at=cl(at+(e.code==='ArrowRight'?1:-1),0,DUR);seek(at);}});addEventListener('click',()=>play());
window.__ready=Promise.all([LOOK.ready,figure.decode()]).then(()=>{initMaps();seek(0);const q=new URLSearchParams(location.search);if(q.has('play'))play();else{document.body.classList.add('render');if(q.has('t'))seek(+q.get('t'));}return true;});
