from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
variables=[
 {'id':'product','type':'string','label':'产品名','default':'doc-qa-factory'},
 {'id':'title','type':'string','label':'品牌主张','default':'每个答案，都找得到原文。'},
 {'id':'install','type':'string','label':'安装命令','default':'npx skills add zhanghaojie513/doc-qa-factory'},
 {'id':'mint','type':'color','label':'品牌底色','default':'#a6d2bd'},
 {'id':'ink','type':'color','label':'文字色','default':'#1c3e30'},
 {'id':'yellow','type':'color','label':'出处高亮','default':'#ffd963'},
 {'id':'endHold','type':'number','label':'收尾停留','default':2,'min':1,'max':5,'step':.1},
]

html='''<!doctype html><html lang="zh-CN" data-composition-variables='__VARS__'>
<head><meta charset="utf-8"><title>doc-qa-factory · 空间发布片 B</title>
<script src="vendor/gsap.min.js"></script><script src="vendor/om.js"></script>
<style>
@font-face{font-family:Inter;src:url('assets/fonts/Inter-var.woff');font-weight:100 900}
@font-face{font-family:Noto;src:url('assets/fonts/NotoSansSC-500.woff');font-weight:500}
@font-face{font-family:Noto;src:url('assets/fonts/NotoSansSC-700.woff');font-weight:700}
@font-face{font-family:Noto;src:url('assets/fonts/NotoSansSC-900.woff');font-weight:900}
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}
#film{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:Inter,Noto,sans-serif;color:var(--ink);background:radial-gradient(ellipse at 30% 0%,#e3f0e8,transparent 70%),radial-gradient(ellipse at 100% 100%,#7daf92,transparent 70%),var(--mint)}
#world,#world *{transform-style:preserve-3d}#world{position:absolute}
.station{position:absolute;top:0;width:1920px;height:1080px}
.panel{position:absolute;background:#fff;border-radius:24px;box-shadow:0 28px 75px #254b3a2b,0 0 0 1px #264c3a14}
.terminal{position:absolute;background:#1e1e2e;border-radius:22px;color:#cdd6f4;box-shadow:0 35px 80px #1c3e3033}
.term-bar{height:62px;background:#313244;border-radius:22px 22px 0 0;display:flex;align-items:center;padding:0 28px;gap:12px;font-size:21px;color:#b9bad0}
.dot{width:13px;height:13px;border-radius:50%;background:#f38ba8}.dot:nth-child(2){background:#f9e2af}.dot:nth-child(3){background:#a6e3a1}
.text{padding:35px 40px}.meta{font-size:23px;letter-spacing:3px;color:#3c6550}.heavy{font-weight:900;letter-spacing:-4px}.tag{display:inline-block;background:var(--yellow);color:var(--ink);border-radius:10px;padding:8px 17px;font-weight:700}
h1,h2,p{margin:0}.sub{color:#3b634e;font-size:29px;line-height:1.8}.green{color:#a6e3a1}.small{font-size:22px}.logo{border-radius:24%}
.heading{position:absolute;left:100px;top:110px;font-size:72px;font-weight:900;letter-spacing:-3px;line-height:1.25}
.station-name{position:absolute;left:105px;top:60px;font-size:21px;letter-spacing:4px;color:#2b553f}
.floor{position:absolute;left:-1500px;top:1090px;width:16500px;height:3200px;transform:rotateX(80deg);transform-origin:0 0;background:repeating-linear-gradient(90deg,#416b5018 0px,#416b5018 1px,transparent 1px,transparent 240px);pointer-events:none}
.caption{position:absolute;left:92px;bottom:38px;font-size:21px;color:#254f3b}
.card-rule{height:2px;background:#bfd9c9;margin-top:26px}
.value-tag{position:absolute;border-radius:16px;background:#f8fcfa;padding:21px 27px;font-size:33px;box-shadow:0 20px 50px #1c3e3022}
</style></head><body>
<main id="film" data-composition-id="docqa-space" data-width="1920" data-height="1080" data-fps="30">
<div id="world" data-layout-allow-overflow>
<div class="floor"></div>

<section id="intro" class="station" style="left:0px" data-layout-allow-overflow>
 <div class="station-name" data-om-id="intro-brand">DOC-QA-FACTORY / 文档问答助手工厂</div>
 <div style="position:absolute;left:100px;top:230px;width:700px;transform:translateZ(100px)">
  <div class="meta" data-om-id="intro-kicker">作为 SKILL 使用 · 推荐</div>
  <h1 class="heavy" style="font-size:99px;line-height:1.2;margin-top:30px" data-om-id="intro-title">一本手册。<br>一个专属助手。</h1>
  <p class="sub" style="margin-top:31px" data-om-id="intro-platforms">一行安装，装进常用的 Agent。<br>Claude Code · Cursor · Codex · 70+</p>
 </div>
 <div id="intro-source" class="panel" style="left:910px;top:180px;width:660px;height:470px;transform:translateZ(-50px) rotateY(-9deg);padding:40px" data-layout-allow-occlusion>
  <p class="meta" data-om-id="intro-source-label">SOURCE / 逐字原文</p><h2 style="font-size:43px;line-height:1.5;margin-top:38px" data-om-id="intro-source-title">桌面气泡水机<br>使用手册</h2><p style="font-size:31px;margin-top:38px" data-om-id="intro-source-range">M001 — M019</p>
 </div>
 <div id="intro-verify" class="terminal" style="left:1120px;top:270px;width:680px;height:400px;transform:translateZ(120px) rotateY(-6deg)" data-layout-allow-occlusion>
  <div class="term-bar">VERIFY / 助手自动校验</div><div class="text green" style="font-size:30px;line-height:1.9"><p data-om-id="intro-check1">[OK] 原文引用</p><p data-om-id="intro-check2">[OK] 具体值出处</p><p data-om-id="intro-check3">[OK] 标定状态</p></div>
 </div>
 <div id="intro-answer" class="panel" style="left:1050px;top:570px;width:700px;height:195px;transform:translateZ(320px);padding:30px 36px" data-layout-allow-occlusion>
  <div class="meta" data-om-id="intro-answer-label">ANSWER / README 演示</div><p style="font-size:32px;margin-top:22px" data-om-id="intro-answer-text">滤芯寿命为60天。 <span class="tag">M010</span></p>
 </div>
 <div id="intro-install" class="terminal" style="left:100px;top:838px;width:1660px;padding:25px 34px;transform:translateZ(130px);font-size:31px"><span class="green">$ </span><span id="intro-command" data-om-id="intro-command" data-var-text="install">npx skills add zhanghaojie513/doc-qa-factory</span></div>
 <p class="caption" data-om-id="intro-caption">自动探测本机 Agent，装进各自的 skills 目录。</p>
</section>

<section id="ask" class="station" style="left:2200px" data-layout-allow-overflow>
 <div class="station-name">01 / 安装以后，直接说人话</div>
 <h2 class="heading" data-om-id="ask-title">把操作交给助手，把问题直接说出来。</h2>
 <div id="ask-book" class="panel" style="left:120px;top:300px;width:520px;height:570px;transform:translateZ(-70px) rotateY(8deg);padding:45px">
  <img class="logo" src="materials/logo-512.png" style="width:235px;height:235px" data-om-id="ask-mascot"><p style="font-size:38px;font-weight:700;margin-top:34px" data-om-id="ask-book-title">演示手册已就位。</p><p class="sub" style="margin-top:22px" data-om-id="ask-book-caption">标定 · 提图 · 校验<br>由助手自动完成</p>
 </div>
 <div id="ask-prompt" class="panel" style="left:730px;top:310px;width:1020px;height:195px;transform:translateZ(300px);padding:33px 42px">
  <div class="meta" data-om-id="ask-prompt-label">你只要说</div>
  <div id="load-prompt" style="position:absolute;left:42px;top:89px;font-size:44px;font-weight:700" data-om-id="load-prompt">装载演示手册</div>
  <div id="question-prompt" style="position:absolute;left:42px;top:89px;font-size:44px;font-weight:700" data-om-id="question-prompt">怎么换滤芯？</div>
 </div>
 <div id="ask-answer" class="panel" style="left:730px;top:580px;width:1040px;height:350px;transform:translateZ(180px);padding:38px 42px">
  <div class="meta" data-om-id="ask-answer-label">README 问答示例 · 虚构演示手册</div><p style="font-size:36px;font-weight:700;margin-top:22px" data-om-id="ask-answer-title">滤芯寿命为60天。 <span class="tag">M010</span></p><p style="font-size:28px;line-height:1.9;margin-top:25px" data-om-id="ask-steps">旋下旧滤芯 → 撕除密封膜 → 旋入卡座<br>长按「复位」键3秒，清除提示。</p>
 </div>
 <p class="caption">影片示意排版，非独立产品界面；处理等待已压缩。</p>
</section>

<section id="source" class="station" style="left:4400px" data-layout-allow-overflow>
 <div class="station-name">02 / 看见答案，也看见答案的来处</div>
 <div style="position:absolute;left:100px;top:255px;width:690px;transform:translateZ(130px)"><div class="meta">逐字原文锚定</div><h2 class="heavy" style="font-size:94px;line-height:1.2;margin-top:35px" data-om-id="source-title">每个答案，<br>找得到原文。</h2><p class="sub" style="margin-top:36px" data-om-id="source-subtitle">答案里的数字，<br>来自手册里的那一行。</p></div>
 <div id="source-paper" class="panel" style="left:860px;top:200px;width:940px;height:680px;transform:translateZ(0px) rotateY(-6deg);padding:48px">
  <div class="meta" data-om-id="source-document">桌面气泡水机使用手册 · 演示文档</div><h2 style="font-size:43px;margin-top:37px" data-om-id="source-section"><span class="tag">M010</span>　滤芯更换</h2><p style="font-size:30px;line-height:2.1;margin-top:30px" data-om-id="source-original"><mark style="background:#ffd963;color:#1c3e30">滤芯寿命为60天</mark>，到期后面板显示「F0」提示。更换步骤：逆时针旋下旧滤芯==》撕除新滤芯密封膜==》顺时针旋入卡座==》长按「复位」键3秒清除提示。</p>
 </div>
 <div id="source-value" class="panel" style="left:500px;top:735px;width:650px;height:140px;transform:translateZ(320px);padding:25px 35px" data-layout-allow-occlusion><span class="heavy" style="font-size:61px" data-om-id="source-value">60天</span><span style="font-size:30px;margin-left:40px" data-om-id="source-value-ref">← M010 原文</span></div>
 <p class="caption">具体值有出处 · 没写的内容，如实说明。</p>
</section>

<section id="verify" class="station" style="left:6600px" data-layout-allow-overflow>
 <div class="station-name">03 / 助手背后自动完成</div><h2 class="heading" data-om-id="verify-title">校验全绿，才算装完。</h2>
 <div id="verify-terminal" class="terminal" style="left:130px;top:295px;width:1270px;height:595px;transform:translateZ(80px) rotateY(4deg)">
  <div class="term-bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><span style="margin-left:15px" data-om-id="verify-bar">真实运行结果 · 助手自动校验</span></div><div class="text" style="font-size:28px;line-height:1.9"><p data-om-id="verify-baseline">基准原文: 19 行 (M001–M019)，共 1062 字符</p><div class="green" style="margin-top:24px"><p class="check-row" data-om-id="verify-ref">[OK] 全部 19 个引用编号都存在，无越界</p><p class="check-row" data-om-id="verify-image">[OK] 引用的 3 张截图全部存在</p><p class="check-row" data-om-id="verify-value">[OK] 以上值均有原文出处</p><p class="check-row" data-om-id="verify-lock">[OK] 基准原文与标定记录一致（未被手改）</p><p class="check-row" data-om-id="verify-word">[OK] 正文里的具体值与原文一致（逐项精确比对）</p></div></div>
 </div>
 <div style="position:absolute;left:1460px;top:330px;width:400px;transform:translateZ(-100px) rotateY(-10deg)"><img src="materials/verify-green.png" style="width:400px;border-radius:12px" data-om-id="verify-original"><p class="small" style="margin-top:20px" data-om-id="verify-original-caption">项目原始运行截图</p></div>
 <div id="verify-success" class="panel" style="left:970px;top:740px;width:810px;height:150px;padding:38px;background:#a6e3a1;transform:translateZ(330px)" data-layout-allow-occlusion><p style="font-size:42px;font-weight:900" data-om-id="verify-success">✓ 结论：全部检查通过。</p></div>
 <p class="caption">独立演示副本实际运行 · 输出摘录 · 无需记内部脚本命令。</p>
</section>

<section id="update" class="station" style="left:8800px" data-layout-allow-overflow>
 <div class="station-name">04 / 手册改版以后</div><h2 class="heading" data-om-id="update-title">手册会更新，出处也跟得上。</h2>
 <div id="old-doc" class="panel" style="left:150px;top:350px;width:580px;height:460px;transform:translateZ(0px) rotateY(9deg);padding:46px"><div class="meta">原知识库</div><div class="tag" style="font-size:88px;margin-top:42px" data-om-id="old-reference">M010</div><p class="sub" style="margin-top:33px" data-om-id="old-caption">逐行内容指纹</p></div>
 <div id="update-bridge" class="panel" style="left:800px;top:455px;width:400px;height:225px;transform:translateZ(330px);padding:34px;text-align:center"><div style="font-size:40px;font-weight:700" data-om-id="update-process">自动重标定</div><p style="font-size:25px;line-height:1.8;margin-top:25px" data-om-id="update-action">重新定位<br>改写引用 →</p></div>
 <div id="new-doc" class="panel" style="left:1300px;top:350px;width:500px;height:460px;transform:translateZ(100px) rotateY(-9deg);padding:46px"><div class="meta">新版本</div><div class="tag" style="font-size:80px;margin-top:42px" data-om-id="new-reference">M###</div><p class="sub" style="margin-top:33px" data-om-id="new-caption">引用随原文更新</p></div>
 <p class="caption">机制示意 · 变更、删除与新增内容提示人工复核。</p>
</section>

<section id="brand" class="station" style="left:11000px" data-layout-allow-overflow>
 <div class="station-name">从一份手册开始。 / OPEN SOURCE · MIT</div>
 <img id="end-logo" class="logo" src="materials/logo.png" style="position:absolute;left:100px;top:270px;width:440px;height:440px;transform:translateZ(150px)" data-om-id="end-logo">
 <div id="end-copy" style="position:absolute;left:650px;top:285px;width:1160px;transform:translateZ(80px)"><div class="meta" data-om-id="end-label">文档问答助手工厂</div><h2 class="heavy" style="font-family:Inter,Noto,sans-serif;font-size:101px;letter-spacing:-6px;margin-top:36px" data-om-id="end-product" data-var-text="product">doc-qa-factory</h2><p style="font-size:45px;font-weight:700;margin-top:35px" data-om-id="end-title" data-var-text="title">每个答案，都找得到原文。</p><p class="sub" style="margin-top:29px;font-size:27px" data-om-id="end-features">原文编号 · 插图归位 · 一致性校验 · 改版重标定</p></div>
 <div id="end-install" class="terminal" style="left:650px;top:730px;width:1160px;padding:27px 30px;transform:translateZ(180px);font-size:30px"><span class="green">$ </span><span id="end-command" data-om-id="end-command" data-var-text="install">npx skills add zhanghaojie513/doc-qa-factory</span></div>
 <p style="position:absolute;left:650px;top:895px;transform:translateZ(30px);font-size:25px" data-om-id="end-url">github.com/zhanghaojie513/doc-qa-factory</p>
</section>
</div></main>
__SCORE__
<script>
const V=OM.vars(); const tl=gsap.timeline({paused:true,defaults:{ease:'power3.out'}});OM.music({bpm:120});
const cam=OM.space('#world',{fov:38});
__CAMERA__
__ANIMATION__
tl.to({},{duration:V.endHold},28);
window.__timelines['docqa-space']=tl;
</script></body></html>'''

camera='''
cam.set({target:[960,540,140],distance:2250,yaw:-26,pitch:10,roll:-1});
cam.to(tl,0,{target:[960,540,140],distance:2420,yaw:-12,pitch:8,roll:0,duration:1.4,ease:'power3.out'});
cam.to(tl,1.4,{yaw:6,pitch:4,distance:2300,duration:1.8,ease:'sine.inOut'});
cam.to(tl,3.2,{target:[3160,550,140],distance:2250,yaw:14,pitch:8,duration:1.3,ease:'power3.inOut'});
cam.to(tl,4.5,{yaw:-8,distance:2130,pitch:4,duration:3.7,ease:'sine.inOut'});
cam.to(tl,8.2,{target:[3300,620,180],distance:2050,yaw:-2,duration:1.1,ease:'power2.inOut'});
cam.to(tl,9.3,{target:[5360,540,140],distance:2300,yaw:-17,pitch:9,duration:1.1,ease:'power3.inOut'});
cam.to(tl,10.4,{yaw:-7,pitch:5,distance:2130,duration:1.6,ease:'sine.inOut'});
cam.to(tl,12,{yaw:8,distance:2050,duration:.45,ease:'power2.inOut'});
cam.to(tl,12.5,{yaw:-4,pitch:9,distance:2240,duration:.45,ease:'power2.inOut'});
cam.to(tl,13,{yaw:12,pitch:2,distance:2050,duration:.45,ease:'power2.inOut'});
cam.to(tl,13.5,{yaw:-9,pitch:6,distance:2210,duration:.45,ease:'power2.inOut'});
cam.to(tl,14,{target:[5630,530,80],yaw:4,pitch:3,distance:1970,duration:1.2,ease:'power2.inOut'});
cam.to(tl,15.2,{target:[7560,540,140],yaw:16,pitch:8,distance:2390,duration:1.15,ease:'power3.inOut'});
cam.to(tl,16.35,{yaw:-5,pitch:4,distance:2210,duration:1.65,ease:'sine.inOut'});
cam.to(tl,18,{target:[7660,610,180],yaw:-10,pitch:3,distance:2290,duration:1.2,ease:'power2.inOut'});
cam.to(tl,19.3,{target:[9760,540,100],yaw:-13,pitch:9,distance:2350,duration:1.15,ease:'power3.inOut'});
cam.to(tl,20.45,{yaw:15,pitch:4,distance:2200,duration:2.2,ease:'sine.inOut'});
cam.to(tl,22.65,{yaw:7,pitch:6,distance:2310,duration:.65,ease:'power2.inOut'});
cam.to(tl,23.3,{target:[11960,540,80],yaw:-14,pitch:8,distance:2370,duration:1.2,ease:'power3.inOut'});
cam.to(tl,24.5,{yaw:-5,pitch:4,distance:2220,duration:1.5,ease:'sine.inOut'});
cam.to(tl,26,{yaw:2,pitch:1,distance:2110,duration:3.9,ease:'sine.inOut'});
'''

animation='''
gsap.set('.station',{visibility:'hidden'});gsap.set('#intro',{visibility:'visible'});
[['intro','ask',3.2],['ask','source',9.3],['source','verify',15.2],['verify','update',19.3],['update','brand',23.3]].forEach(([old,next,t])=>{tl.set('#'+next,{visibility:'visible'},t);tl.set('#'+old,{visibility:'hidden'},t+1.05);});
['intro','ask','source','verify','update','brand'].forEach((s,i)=>tl.addLabel('scene:'+s,[0,4,10,16,20,24][i]));
gsap.set('#question-prompt,#ask-answer,#verify-success',{opacity:0});
tl.fromTo('#intro-source',{z:-150},{z:-50,duration:1.2,immediateRender:false},0);
tl.fromTo('#intro-verify',{z:310},{z:120,duration:1.1,immediateRender:false},0);
tl.fromTo('#intro-answer',{z:510},{z:320,duration:1.3,immediateRender:false},0);
tl.to('#load-prompt',{opacity:0,duration:.18},6.8);
tl.fromTo('#question-prompt',{opacity:0,y:12},{opacity:1,y:0,duration:.3,immediateRender:false},7);
tl.fromTo('#ask-answer',{opacity:0,z:80},{opacity:1,z:180,duration:.6,immediateRender:false},7.6);
tl.fromTo('#source-value',{z:180},{z:320,duration:.7,immediateRender:false},10.3);
tl.fromTo('#verify-success',{opacity:0,z:140},{opacity:1,z:330,duration:.6,immediateRender:false},18);
tl.fromTo('#update-bridge',{z:150},{z:330,duration:.8,immediateRender:false},21);
tl.fromTo('#end-install',{z:60},{z:180,duration:1.1,immediateRender:false},25);
const proofs=[['60天','← M010 原文'],['M010','逐字原文锚定'],['60天','具体值有出处'],['3张图','按章节归位'],['M###','改版重标定']];
OM.clock(tl,t=>{const i=t<12?0:t<12.5?1:t<13?2:t<13.5?3:t<14?4:0;document.querySelector('#source-value .heavy').textContent=proofs[i][0];document.querySelector('#source-value span:nth-child(2)').textContent=proofs[i][1];},30);
OM.sfx('whoosh',.2,{gain:.25});OM.sfx('thud',1.1,{gain:.3});OM.sfx('whip',3.8,{gain:.25});
OM.sfx('click',7.1,{gain:.3});OM.sfx('pop',7.9,{gain:.3});OM.sfx('whoosh',9.8,{gain:.25});
[12,12.5,13,13.5].forEach(t=>OM.sfx('tick',t,{gain:.3}));
OM.sfx('whip',15.7,{gain:.25});OM.sfx('impact',16.4,{gain:.28});OM.sfx('chime',18.3,{gain:.4});
OM.sfx('whoosh',19.8,{gain:.25});OM.sfx('click',21.6,{gain:.3});OM.sfx('whip',23.8,{gain:.25});OM.sfx('thud',24.5,{gain:.3});OM.sfx('ding',26.2,{gain:.25});
'''

def make_score():
    mel=['D F A z E z F z','D z A d c z A z','F z A z E z D z','E z G B A z F z','D F A z E z F z','D2 z2 F A z2','D F A d c A F E','E G B e d B G E','d2 c B A2 F2','B2 A F E2 D2','F z A z F z E z','E z G z B z A z','D F A z B A F E','D2 F2 A2 F2','D2 F2 A2 D2']
    harm=['[DFA]4 z4','[EGB]4 z4','[DFA]4 z4','[CEA]4 z4','[DFA]4 z4','[B,DF]4 z4','[B,DF]2 z2 [B,DF]2 z2','[CEA]2 z2 [CEA]2 z2','[DFA]2 z2 [DFA]2 z2','[B,DF]2 z2 [B,DF]2 z2','[EGB]4 z4','[CEA]4 z4','[DFA]4 z4','[EGB]2 z2 [CEA]2 z2','[DFA]4 z4']
    roots=['D,,','E,,','D,,','A,,','D,,','B,,,','B,,,','A,,','D,,','B,,,','E,,','A,,','D,,','A,,','D,,']
    bass=[r+'3 z '+r+'2 z2' for r in roots];bass[-1]='D,,4 z4'
    pad=[f'[{c}]8' for c in ['DFA','EGB','DFA','CEA','DFA','B,DF','B,DF','CEA','DFA','B,DF','EGB','CEA','DFA','CEA','DFA']]
    drum=['C,, z ^F,, z D,, z ^F,, z']*15
    drum[6]=drum[7]='C,, ^F,, D,, ^F,, C,, ^F,, D,, ^F,,'
    drum[8]=drum[9]='[C,,^C,] ^F,, D,, ^F,, C,, ^F,, D,, ^F,,'
    drum[-1]='C,, z7'
    marks={0:'intro',2:'ask',5:'source',8:'verify',10:'update',12:'brand'}
    def part(bars,mark=False):
        return '\n'.join((f'!mark:{marks[i]}! ' if mark and i in marks else '')+('!mp! ' if i==0 else '!mf! ' if i==6 else '!f! ' if i==8 else '!mp! ' if i==14 else '')+b+' |' for i,b in enumerate(bars))
    voices=[('GL inst=glass role=melody gain=0.45',mel),('PN inst=piano gain=0.48',harm),('PD inst=warmpad gain=0.2',pad),('SB inst=sinebass gain=0.5',bass),('DR inst=drums kit=808 gain=0.45',drum)]
    return '<script type="text/vnd.abc" id="om-score">\nX:1\nT:出处的空间 · Source in Space\nM:4/4\nL:1/8\nQ:1/4=120\nK:D\n'+'\n'.join('V:'+v+'\n'+part(b,i==0) for i,(v,b) in enumerate(voices))+'\n</script>'

if __name__=='__main__':
    import sys,re
    draft='--draft' in sys.argv
    cams=camera
    anim=animation
    if draft:
        cams="cam.set({target:[960,540,140],distance:2420,yaw:-12,pitch:8});\n"
        for at,x in [(4,3160),(10,5360),(16,7560),(20,9760),(24,11960)]:
            cams+=f"cam.to(tl,{at},{{target:[{x},540,140],distance:2300,yaw:-10,pitch:6,duration:.01}});\n"
        anim="gsap.set('.station',{visibility:'hidden'});gsap.set('#intro',{visibility:'visible'});['intro','ask','source','verify','update','brand'].forEach((s,i)=>{const at=[0,4,10,16,20,24][i];tl.addLabel('scene:'+s,at);tl.set('.station',{visibility:'hidden'},at);tl.set('#'+s,{visibility:'visible'},at);}); gsap.set('#load-prompt',{opacity:0});"
    cams=re.sub(r'distance:(\d+)',lambda m:'distance:'+str(round(int(m.group(1))*.86)),cams)
    page=html.replace('__VARS__',json.dumps(variables,ensure_ascii=False)).replace('__CAMERA__',cams).replace('__ANIMATION__',anim).replace('__SCORE__','' if draft else make_score())
    page=page.replace('#254f3b','#183a2b').replace('#3c6550','#254b37').replace('#3b634e','#254b37')
    page=page.replace('data-layout-allow-overflow>','data-layout-allow-overflow data-layout-allow-occlusion data-layout-allow-overlap>')
    page=page.replace('data-layout-allow-occlusion>','data-layout-allow-occlusion data-layout-allow-overlap>')
    page=page.replace('font-size:101px;letter-spacing:-6px','font-size:101px;letter-spacing:-3px;font-weight:800')
    (ROOT/'index.html').write_bytes(page.encode('utf-8'))
    print('built',ROOT/'index.html','keyframes' if draft else 'animated')
