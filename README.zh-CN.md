<div align="center">

# doc-qa-factory · 文档问答助手工厂

[English](README.md) | 简体中文

</div>

---

**Turn any manual into a verifiable Q&A assistant.** 把任何产品手册 / 操作规程 / 制度文档，装载成一个**可追溯**的问答助手：回答带逐字原文编号出处、插图按章节归位可直发、具体值绝不编造、手册改版自动重标定。

仓库出厂自带一份**全虚构**的演示知识库（《桌面气泡水机使用手册》）——把它当 skill 装好，然后**对 agent 说人话就行**，整条流水线由它来跑。

## 作为 Skill 使用（推荐）

装进任何支持 Agent Skills 的 runtime：

| Runtime | 安装 |
|---|---|
| Claude Code | `git clone https://github.com/zhanghaojie513/doc-qa-factory ~/.claude/skills/doc-qa-factory` |
| 通用 skills 目录约定 | `git clone https://github.com/zhanghaojie513/doc-qa-factory ~/.agents/skills/doc-qa-factory` |
| 其他 Agent-Skills runtime | clone 到任意位置，再按 runtime 文档注册含 `SKILL.md` 的目录 |

然后直接说话就行——没有需要背的命令：

| 你说 | 助手做 |
|---|---|
| 「装载演示手册」 | 标定这份虚构手册：建逐字原文编号基准、提取插图按章节归位、跑六项一致性校验——你只看到**全绿** |
| 「机器显示 E1 怎么办？」 | 给出可照做的排查步骤、带原文出处（M015），并**把相关插图作为文件发给你** |
| 「换装我公司的手册：`D:\docs\打印机维修手册.docx`」 | 🔴 先与你确认方案，归档演示知识库、重写逐手册配置、重新标定、重建 Q&A 预案——**verify 全绿才算装完** |
| 「现在装载的是哪份手册？」 | 读取标定记录，报出文档名 / 版本 / 校验和 |
| 「把演示手册找回来」 | 🔴 确认后从归档恢复 |

<details>
<summary>助手背后自动执行的命令（你不需要自己敲）</summary>

<img src="docs/demo.gif" alt="助手背后自动执行的命令" width="720">

```bash
node scripts/calibrate.js demo-manual.docx --update   # 装载：编号基准 + 插图提取 + 媒体索引
node scripts/verify.js                                # 六项一致性校验 → 全绿
node scripts/calibrate.js demo-manual.docx            # 手册改版后的漂移检测
```

</details>

## 为什么是这套设计

LLM 答手册类问题的最大风险不是"答不出"，而是**自信地编造**：编一个菜单路径、猜一个参数值、把插图内容看错再讲错。本工厂用四个机制堵死：

| 机制 | 做法 |
|---|---|
| **逐字原文锚定** | 手册全文逐字编号（`M001`–`MNNN`，连错别字都保留）为唯一事实基准；答复里每个事实都要能落到编号上，如"滤芯寿命为60天（M010）" |
| **图片按章节归属** | 插图文件按"出现在手册哪一节、第几张"命名（`filter-01.jpg`），**永不按"我以为图里是什么"命名**；助手只发图或报位置，不描述、不 OCR 图片内容 |
| **六项一致性校验** | `verify.js`：引用越界 / 截图死链 / 冗余图 / 具体值出处 / 基准篡改 / 正文措辞 vs 原文——红灯就不得上线 |
| **改版自动重标定** | 手册改版后 `calibrate` 按逐行内容指纹找出每行搬到哪了，自动改写全部 `M###` 引用、重新归属图片，并报告必须人工处理的部分（值变了 / 行被删 / 新增内容） |

## 换装你自己的手册

你只提供三样东西，其余全是助手的活（见 `SKILL.md` 模式 A）：

1. **DOCX 文件**——告诉 agent 路径即可；🔴 它会先和你确认换装方案再动手
2. **确认时的点头**——归档 → 重写配置 → 重新标定 → 重建预案 → verify 门禁，一条链它自己走完
3. **内幕知识**（有则给）——术语叫法、对接人、"文档里没有的内容"；助手起草，你来纠偏

它重写的逐手册配置是 `references/manual-config.json`（**脚本本体零手册内容**）：

- `docTitle` / `docVersion` — 手册名与版本
- `expectedTitlePattern` — 文档主题守卫（防止误标定到无关文档的安全锁，跨文档换装配合 `--force-replace`）
- `headingStyles` — docx 标题样式 ID（缺省 `Heading1`/`Heading2`；中文 Word 导出的内部样式 ID 也可配置）
- `imageSlugs` — 章节标题 → 图片文件名前缀（未登记的小节自动 `sec-NN`）
- `watchedValues` / `knownValues` — 要盯的具体值清单（如"有效期 X 小时"），改版时逐项报警

备注：**没装 ffmpeg？** 照样能用——插图自动降级为原图直拷，不阻断流程。**非 DOCX**（PDF/TXT/MD）：助手按现有文件格式人工构建，然后走同一个 verify 门禁。

## 全绿为什么重要（三条硬规则）

1. **不编造具体值** — 原文里没有就明说"文档没写"，转对接人；靠 `knownValues` + 措辞比对逐项拦截"凭感觉猜网址"这类事故
2. **不描述图片** — 图片含义以该节正文文字为准；发图（首选）或报位置，不 OCR
3. **红灯门禁** — `verify.js` 有 `[FAIL]` 就不得宣布完成；高危动作（换装 / `--update` / 恢复归档）前有显式 🔴 CHECKPOINT 强制用户确认

## 仓库结构

```
doc-qa-factory/
├── SKILL.md                     助手行为规则（三模式：构建换装 / 问答 / 管理）
├── demo-manual.docx             演示手册（全虚构，可重复标定）
├── references/
│   ├── manual-config.json       逐手册配置（守卫/样式/图片命名/受监视值）← 换装时重写
│   ├── operations.md            标准流程整理（演示示例）
│   ├── troubleshooting.md       故障排查整理（演示示例）
│   ├── qa-playbook.md           专属 Q&A 预案（演示示例）
│   ├── manual-source.md         逐字原文（由 calibrate 生成，gitignore）
│   ├── manual-source.lock.json  标定记录（生成）
│   └── media-index.md           图/视频 → 章节索引（生成）
├── assets/screenshots/          按章节命名的插图（由 calibrate 从 docx 提取）
├── scripts/
│   ├── docx.js                  无依赖 .docx 读取（手写 ZIP 解析 + WordprocessingML）
│   ├── zip.js                   无依赖 zip 写入（deflate、固定时间戳 → 可字节复现）
│   ├── calibrate.js             漂移检测 + 重新标定（编号/图片/索引/引用全自动）
│   ├── verify.js                六项一致性校验
│   └── package.js               分发打包（先跑 verify，红灯拒绝打包）
└── build/                       演示素材与生成脚本（docs 的 GIF、demo docx）
```

## License

MIT
