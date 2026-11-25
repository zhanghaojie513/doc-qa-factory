/* v2: the same paper carries a denser feature story, with shorter holds. */
const DURATION=21,figure=new Image();figure.src=window.FILTER_IMAGE_DATA;
const TIMES=[[0,0],[.12,1.48],[.65,2.15],[1.1,2.9],[2.65,4.75],[3.05,5.55],[4,8],[4.75,9.6],[16.1,12.2],[17.25,14.3],[21,20]];
function filmTime(t){for(let i=1;i<TIMES.length;i++){if(t<=TIMES[i][0]){const a=TIMES[i-1],b=TIMES[i];return lerp(a[1],b[1],cl((t-a[0])/(b[0]-a[0]),0,1));}}return 20;}
function surface(draw){const c=document.createElement('canvas');c.width=1600;c.height=1000;const x=c.getContext('2d');x.fillStyle='#fff8e7';x.fillRect(0,0,1600,1000);draw(x);return c;}
let boards={},inkKey='';
function featureBoards(){
 boards.answer=surface(x=>x.putImageData(answerImg,0,0));
 boards.image=surface(x=>{
  tt(x,'不止文字。插图也在。',140,187,91,'display');rule(x,241);
  x.drawImage(figure,140,304,900,589);
  tt(x,'按章节',1130,466,66,'display');tt(x,'归位',1130,561,66,'display');
  tt(x,'作为文件',1130,712,44,'text','#696c79');tt(x,'直接交付',1130,776,44,'text','#696c79');
  tt(x,'filter-01.jpg · 滤芯更换 / 第1张',140,284,28,'mono','#8b5c48');
 });
 boards.revision=surface(x=>{
  tt(x,'手册改版？',140,218,112,'display');tt(x,'引用，跟着原文走。',140,388,101,'display');
  const names=['内容指纹','重新定位','改写引用'];
  names.forEach((s,i)=>{const q=140+i*462;x.fillStyle=i===2?'#ff6949':'#ede6d4';x.beginPath();x.roundRect(q,500,410,170,20);x.fill();tt(x,s,q+205,606,52,'display',i===2?'#fff8e7':'#172856','center');if(i<2)tt(x,'→',q+435,604,42,'mono','#ff6949','center');});
  tt(x,'改版后重新标定，更新原文编号引用',140,786,44,'text','#696c79');
  tt(x,'具体值变化、删除行：提示人工处理',140,851,36,'text','#8b5c48');tt(x,'改版机制示意',1460,947,26,'text','#8b5c48','right');
 });
 boards.gate=surface(x=>{
  tt(x,'六项校验，再交付。',140,200,103,'display');rule(x,265);
  const labels=['编号引用','插图链接','文件冗余','具体值出处','原文基准','正文措辞'];
  labels.forEach((s,i)=>{const px=140+(i%2)*685,py=411+Math.floor(i/2)*153;x.strokeStyle='#ff6949';x.lineWidth=7;x.beginPath();x.roundRect(px,py-57,64,64,12);x.stroke();tt(x,'✓',px+32,py-4,45,'text','#ff6949','center');tt(x,s,px+94,py,60,'display');});
  tt(x,'有一项未通过，就不算装好。',140,833,46,'text','#696c79');tt(x,'校验流程示意',1460,958,26,'text','#8b5c48','right');
 });
 boards.boundary=surface(x=>{
  tt(x,'文档没写？',140,280,113,'display');
  x.fillStyle='#ff6949';x.fillRect(140,365,1320,182);tt(x,'就如实说：没写。',190,490,105,'display','#fff8e7');
  tt(x,'具体值不猜 · 图片不臆测',140,719,57,'display');
  tt(x,'每个回答，都守住文档的边界。',140,813,44,'text','#696c79');
 });
}
function inkMix(a,b,f){const key=Object.keys(boards).find(n=>boards[n]===a)+'/'+Object.keys(boards).find(n=>boards[n]===b)+'/'+f;if(key===inkKey)return;inkKey=key;fg.globalAlpha=1;fg.drawImage(a,0,0);fg.globalAlpha=f;fg.drawImage(b,0,0);fg.globalAlpha=1;frontTex.needsUpdate=true;}
function printV2(t){
 if(t<6.0){const f=k(filmTime(t),3.65,4.65,E.sineInOut),key='initial/'+f;if(key===inkKey)return;inkKey=key;fg.putImageData(coverImg,0,0);fg.globalAlpha=f;fg.drawImage(boards.answer,0,0);fg.globalAlpha=1;frontTex.needsUpdate=true;return;}
 if(t<6.6)inkMix(boards.answer,boards.image,k(t,6.0,6.6,E.sineInOut));
 else if(t<9.25)inkMix(boards.image,boards.image,0);
 else if(t<9.55)inkMix(boards.image,boards.revision,k(t,9.25,9.55,E.expoOut));
 else if(t<12.1)inkMix(boards.revision,boards.revision,0);
 else if(t<12.45)inkMix(boards.revision,boards.gate,k(t,12.1,12.45,E.expoOut));
 else if(t<14.65)inkMix(boards.gate,boards.gate,0);
 else if(t<14.95)inkMix(boards.gate,boards.boundary,k(t,14.65,14.95,E.expoOut));
 else if(t<16.1)inkMix(boards.boundary,boards.boundary,0);
 else inkMix(boards.boundary,boards.answer,k(t,16.1,16.65,E.sineInOut));
}
const phrases=[
 {a:0,b:.08,c:.65,d:.85,lead:'一本手册，立刻开工。',sub:'',bottom:true},
 {a:1.45,b:1.7,c:3.75,d:4,lead:'',sub:'装载文档，直接提问。'},
 {a:4.25,b:4.6,c:5.9,d:6.1,lead:'答案背后，就是原文。',sub:'回答带编号，随时可回查。'},
 {a:6.2,b:6.65,c:8.85,d:9.05,lead:'插图，也一起带上。',sub:'按章节归位，文件直接交付。'},
 {a:9.25,b:9.6,c:11.75,d:12,lead:'改版了，引用也能跟上。',sub:'重新标定，原文与引用一起更新。'},
 {a:12.1,b:12.5,c:14.25,d:14.5,lead:'六项校验，装好再交付。',sub:''},
 {a:14.65,b:14.95,c:15.85,d:16.1,lead:'知道边界，才值得信赖。',sub:''}
];
function textV2(t){
 const ph=phrases.find(p=>t>=p.a&&t<=p.d),lead=document.getElementById('lead'),sub=document.getElementById('sub');
 lead.textContent=ph?ph.lead:'';sub.textContent=ph?ph.sub:'';lead.style.top=ph&&ph.bottom?'900px':'122px';lead.style.fontSize='54px';
 const a=ph?win(t,ph.a,ph.b,ph.c,ph.d):0;setOpacity('lead',a,12*(1-a));setOpacity('sub',a,8*(1-a));
 const n=OM.wordRise(Math.min(t,19.6),16.85,{dist:26,omega:27});setOpacity('end',n.op,n.y);
 const c=OM.wordRise(Math.min(t,19.6),17.1,{dist:24,omega:27});setOpacity('claim',c.op,c.y);
 const p=OM.wordRise(Math.min(t,19.6),17.5,{dist:20});setOpacity('promise',p.op,p.y);
 const x=OM.wordRise(Math.min(t,19.6),18.0,{dist:17});setOpacity('cta',x.op,x.y);
 document.getElementById('hint').style.opacity=.5*(1-k(t,16.1,16.8));
 document.getElementById('promise').textContent='可追溯问答 · 插图直发 · 改版重标定';
}
function seekV2(t,render=true){
 t=cl(t,0,DURATION);const ot=filmTime(t),previousPrint=lastPrint;seek(ot,false);if(previousPrint!==lastPrint)inkKey='';const s=state(ot);
 if(t>=6){paper.rotation.y+=Math.PI*k(t,6,6.65)*(1-s.close);}
 if(t>=16.1)paper.rotation.y=.02*(1-s.close);
 const crease=Math.sin(Math.PI*k(t,9.05,9.65))*win(t,9,9.08,9.65,9.72)*1.5;
 const tap=OM.impact(Math.min(t,13),12.4,{decay:11,omega:24,sqx:.015,sqy:.018});
 paper.scale.x*=tap.sx;paper.scale.y*=tap.sy;
 if(crease>0){const tp=tailGeo.attributes.position.array;for(let i=0;i<tp.length;i+=3)tp[i+2]+=crease*Math.abs(tailBase[i])*.6;tailGeo.attributes.position.needsUpdate=true;tailGeo.computeVertexNormals();tailGeo.computeBoundingBox();const a=geo.attributes.position.array,b=backGeo.attributes.position.array;for(let i=0;i<a.length;i+=3){const z=crease*Math.abs(base[i])*.6;a[i+2]+=z;b[i+2]+=z;}geo.attributes.position.needsUpdate=true;backGeo.attributes.position.needsUpdate=true;geo.computeVertexNormals();backGeo.computeVertexNormals();geo.computeBoundingBox();backGeo.computeBoundingBox();}
 const orbit=win(t,6.1,6.7,8.9,9.05);camera.position.x+=.5*orbit;camera.lookAt(0,camAt(ot).lookY,0);camera.updateMatrixWorld();
 printV2(t);textV2(t);if(render)renderer.render(scene,camera);return true;
}
window.__seek=seekV2;
window.__meta={dur:DURATION,fps:30,cuts:[],inFrame:{paper:[.1,DURATION,'whole'],question:[.1,.95,'whole']}};
window.__track=t=>{seekV2(t,false);return {paper:bounds(paper),book:{...bounds(book),op:1-k(filmTime(t),3.55,5.2)},question:{...bounds(qmesh),op:qmesh.material.opacity}};};
window.__events=()=>[
 {t:.12,kind:'air',pan:0},{t:.65,kind:'hit',pan:0},{t:.9,kind:'paper',pan:.2},{t:1.8,kind:'paper',pan:-.2},
 {t:2.65,kind:'land',pan:0},{t:4.02,kind:'paper',pan:-.35},{t:4.75,kind:'land',pan:0},
 {t:6.05,kind:'paper',pan:.3},{t:6.65,kind:'land',pan:.1},{t:9.08,kind:'paper',pan:-.3},
 {t:9.55,kind:'hit',pan:0},{t:12.15,kind:'air',pan:.15},{t:12.4,kind:'hit',pan:0},
 {t:14.65,kind:'paper',pan:0},{t:16.15,kind:'paper',pan:-.2},{t:17.15,kind:'hit',pan:-.4},{t:18,kind:'glass',pan:0}
];
play=function(t=0){playing=true;at=t;start=performance.now()-t*1000;audio.currentTime=t;audio.play().catch(()=>{});requestAnimationFrame(loop);};
loop=function(now){if(!playing)return;at=Math.min(DURATION,(now-start)/1000);seekV2(at);if(at<DURATION)requestAnimationFrame(loop);else{playing=false;audio.pause();}};
const previousReady=window.__ready;
window.__ready=Promise.all([previousReady,figure.decode()]).then(()=>{featureBoards();seekV2(0);const q=new URLSearchParams(location.search);if(q.has('t'))seekV2(+q.get('t'));if(q.has('play'))play();return true;});
