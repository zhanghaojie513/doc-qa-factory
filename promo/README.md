# doc-qa-factory 宣传片

30 秒，1920×1080，30fps，方向 A：真实示例与精准快切。音乐和音效，无口播。

主线：一行安装 Skill → 装进常用 Agent →「装载演示手册」→ 直接提问 → 回查原文 → 助手自动校验 → 改版重标定。

推荐产品安装命令：

```bash
npx skills add zhanghaojie513/doc-qa-factory
```

## 文件

- `index.html`：可编辑影片，包含 GSAP 时间轴、自写 ABC 配乐、音效标记、参数和稳定元素 ID。
- `vendor/`、`assets/fonts/`、`materials/`：本地运行依赖和真实项目素材。
- `treatment.md`：分镜、节奏、配乐、事实边界。
- `materials.md`：素材出处；`review-notes.md`：自审与检查记录。
- `out/`：本地 MP4 导出；`out/share/`：GIF 与中文分享文案。生成文件不默认提交。
- `tools/build-film.py`：源码生成器；重建会覆盖 `index.html`，如在 Studio 改过文字，先保存改动。

## 编辑与导出

在安装 huashu-motion 的机器上，于此目录运行：

```bash
npx huashu-motion studio . --no-open
npx huashu-motion check .
npx huashu-motion sound .
npx huashu-motion render . --workers 2 --blur 2
npx huashu-motion qa .
npx huashu-motion share .
```

Studio 支持播放、时间轴拖动、参数编辑和对具体帧留言。配乐由本地合成器生成，不依赖在线音频服务。导出逐帧使用本机 Chrome 和 ffmpeg；没有网络字体或运行时远程资源。

回答画面为仓库 README 示例的影片排版，已明确标示，不代表项目存在独立聊天应用。原文来自虚构演示手册，校验结果来自独立副本的真实运行。截图作为校验镜头的来源参照，字体为便于影片阅读重新排版。

片尾按 huashu-motion 默认规则保留小署名。影片未自动发布。
