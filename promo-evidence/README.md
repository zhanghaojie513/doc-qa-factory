# 每个答案，都有来处

全新制作的 doc-qa-factory 产品宣传片。38秒 / 1920×1080 / 30fps。以品牌薄荷绿、暖黄手册和原文编号连接线，展示问答出处、原图交付、改版标定、六项校验与知识边界。无配音，音乐+拟音，大标题承担解说。

- `out/promo.mp4`：带音乐版。
- `out/promo-nobgm.mp4`：相同画面、保留音效，无音乐。
- `out/INDEPENDENT-REVIEW.md`：独立终检。
- `out/qa/`：风格样张、逐镜静帧、成片抽帧、工作台截图。
- `DESIGN.md`：产品简报、品牌tokens、功能映射、分镜与决策。
- `public/audio/`：音频、来源与许可记录；SFX为CC0 MP3预览或增益处理副本。

## 重新渲染

```powershell
npm install
npm run check
npm run render
npm run render:nobgm
```

字体使用Windows自带 Microsoft YaHei / Arial / Consolas。固定帧驱动，伪随机固定种子。使用素材均在public下。

## 可视化编辑

当前机器已准备兼容Windows目录联接的工作台副本：http://localhost:5198/?import=project 。镜头、标题、音效和配乐独立上轨，五段功能标题支持文案/字号/颜色/位置编辑。预览显示39秒是工作台额外1秒余量，导出按38秒内容边界。

重新启动：

```powershell
node editor-runtime/workbench/scripts/open.mjs "C:\work\myProject\doc-qa-factory\promo-evidence"
```

editor-runtime按机器准备、不进入git。源码src和public素材是成片的持久来源。src/workbench.ts与主合成同源，parity检查同帧画面。

片中是机制演示，非产品Web界面，不伪造终端结果。文案与图片来自仓库公开虚构手册；未运行calibrate或修改知识库。主观试听能力不可用，已做解码、峰值与源/输出偏移技术测量，听感可在播放器中复核。
