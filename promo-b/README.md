# B · 空间发布片

doc-qa-factory 的第二版宣传片，独立保存在 promo-b，A 版保存在 ../promo。

交付：30 秒，1920×1080，30fps，音乐与音效，无口播。

六个内容站位于同一个 CSS 3D 世界。OM.space 相机穿过安装、自然语言请求、原文、校验、改版和品牌站位；卡片在近、中、远三层保持视差。

推荐产品安装方式贯穿片头和片尾：

```bash
npx skills add zhanghaojie513/doc-qa-factory
```

随后在常用 Agent 说「装载演示手册」，再直接提问。标定、提图、校验由助手自动完成。问答卡片为 README 真实示例的影片排版，不虚构独立产品界面。

## 编辑

- `index.html`：可编辑影片、时间轴、配乐、音效和稳定元素 ID。
- `tools/build-space.py`：影片源码生成器；重建会覆盖 index.html，Studio 里改过文字应先保存。
- `treatment.md`：空间路线、节奏和事实依据。
- `materials.md`：品牌、截图和字体出处。
- `out/`：MP4；`out/share/`：GIF 与中文分享文案。

```bash
npx huashu-motion studio . --no-open
npx huashu-motion check .
npx huashu-motion sound .
npx huashu-motion render . --workers 2 --blur 2
npx huashu-motion qa .
npx huashu-motion share .
```

本地合成配乐，本机 Chrome 逐帧导出，无在线字体或运行时网络依赖。片尾保留 huashu-motion 小署名。未自动发布。
