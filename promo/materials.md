# Materials

What the film is made of, and where each piece came from. Real material first: the logo as a file, the product's own colours and type, its real interface. Anything rebuilt is traced over a capture listed here.

## Local · C:\work\myProject\doc-qa-factory  (2026-11-02)

- Logo / icon (12): `materials/local-doc-qa-factory/A1.png` ← docs/logo-candidates/A1.png, `materials/local-doc-qa-factory/R2.png` ← docs/logo-candidates/R2.png, `materials/local-doc-qa-factory/logo.png` ← docs/logo.png, `materials/local-doc-qa-factory/R1.png` ← docs/logo-candidates/R1.png, `materials/local-doc-qa-factory/C1.png` ← docs/logo-candidates/C1.png, `materials/local-doc-qa-factory/B2.png` ← docs/logo-candidates/B2.png, `materials/local-doc-qa-factory/B1.png` ← docs/logo-candidates/B1.png, `materials/local-doc-qa-factory/R3.png` ← docs/logo-candidates/R3.png, `materials/local-doc-qa-factory/R4.png` ← docs/logo-candidates/R4.png, `materials/local-doc-qa-factory/C2.png` ← docs/logo-candidates/C2.png, `materials/local-doc-qa-factory/A2.png` ← docs/logo-candidates/A2.png, `materials/local-doc-qa-factory/logo-512.png` ← docs/logo-512.png
- Media files (3): `materials/local-doc-qa-factory/social-card.png` ← docs/social-card.png (in the README), `materials/local-doc-qa-factory/demo.gif` ← docs/demo.gif (in the README), `materials/local-doc-qa-factory/verify-green.png` ← docs/verify-green.png
- Not captured: no screenshots or recordings — run the product and capture it

## 核验与取舍
- 已查看全部采集图片的联系表 materials/contact-sheet.jpg，并查看正式 social-card.png；只采用正式 logo.png / logo-512.png，不采用候选标志。
- 品牌色近似取样：薄荷绿 #A6D2BD，深绿 #1C3E30；黄色 #FFD963 与珊瑚色 #FF7455 来自正式吉祥物。项目未声明网页 CSS 字体，影片选本地内置 Noto Sans SC，字体许可在 assets/fonts/。
- 没有独立网页界面，不虚构应用。问答文字来源 README.zh-CN.md，演示原文来源 tools/demo-run/references/manual-source.md M010。
- 在 tools/demo-run/ 隔离副本运行 calibrate.js --update 与 verify.js，2026-11-02 校验全部通过；主项目知识库未改动。
- 终端样式来自 build/make-docs-assets.mjs，真实终端截图 docs/verify-green.png 与 demo.gif 为参考。
- 素材为项目自有；仓库 LICENSE MIT；README 声明品牌吉祥物由图像模型生成。无外部照片或商业素材。

- 最终片增加 Inter（本地随片字体）用于拉丁字与终端排版；真实终端原始截图在校验镜头左下可见，右侧文字按真实输出重排。
- 用户确认以 Skill 推荐安装方式为主线：开场与结尾均展示 npx skills add 命令；后台脚本不作为用户操作路径。
