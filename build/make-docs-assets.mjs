// 生成 README 演示素材：终端风格 HTML 帧 → 截图 → GIF
// 用法: node build/make-docs-assets.mjs  （产物: docs/demo.gif + docs/*.png）
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const docs = join(root, "docs");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

mkdirSync(join(here, "frames"), { recursive: true });
mkdirSync(docs, { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const $ = (cmd) => `<span class="prompt">$</span> <span class="cmd">${esc(cmd)}</span>`;
const C = (s) => `<span class="cy">${esc(s)}</span>`;
const G = (s) => `<span class="gn">${esc(s)}</span>`;
const Y = (s) => `<span class="yl">${esc(s)}</span>`;
const D = (s) => `<span class="dim">${esc(s)}</span>`;
const W = (s) => esc(s);

const frame = (title, lines) => `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#282a36}
.term{width:880px;box-sizing:border-box;background:#1e1e2e;border-radius:10px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5);font:13px/1.55 "Cascadia Mono","Consolas","Microsoft YaHei",monospace}
.bar{background:#313244;padding:9px 14px;display:flex;align-items:center;gap:8px}
.dot{width:12px;height:12px;border-radius:50%}
.r{background:#f38ba8}.y{background:#f9e2af}.g{background:#a6e3a1}
.ttl{margin-left:8px;color:#6c7086;font-size:12px}
.body{padding:14px 18px;color:#cdd6f4;white-space:pre}
.prompt{color:#a6e3a1;font-weight:bold}.cmd{color:#f5f5f5;font-weight:bold}
.cy{color:#89b4fa;font-weight:bold}.gn{color:#a6e3a1}.yl{color:#f9e2af}.dim{color:#6c7086}
</style></head><body><div class="term">
<div class="bar"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div><div class="ttl">${title}</div></div>
<div class="body">${lines.join("\n")}</div>
</div></body></html>`;

const f1 = frame("doc-qa-factory — calibrate --update", [
  $("node scripts/calibrate.js demo-manual.docx --update"),
  W("手册: demo-manual.docx"),
  W("大小: 0.0 MB | sha256(16): db6268eca631ec35"),
  W(""),
  W("没有找到标定记录（references/manual-source.lock.json），本次将建立基准。"),
  W(""),
  C("=== 执行重新标定 ==="),
  G("  出图: 3 张"),
  D("  未变动 SKILL.md（10 处引用）"),
  D("  未变动 references/operations.md（16 处引用）"),
  D("  未变动 references/qa-playbook.md（6 处引用）"),
  W("  已重建 references/manual-source.md"),
  W("  已重建 references/media-index.md"),
  W("  已写入 references/manual-source.lock.json"),
  W(""),
  Y("完成。下一步务必人工过一遍："),
  D("  1) 复核删除/改动行   2) 复核新增内容   3) node scripts/verify.js"),
]);

const f2 = frame("doc-qa-factory — verify", [
  $("node scripts/verify.js"),
  W("基准原文: 19 行 (M001–M019)，共 1062 字符"),
  W(""),
  C("=== 1) 原文引用 ==="),
  G("  [OK]   全部 19 个引用编号都存在，无越界"),
  G("  [OK]   手册 19 行全部被引用（无遗漏）"),
  C("=== 2) 截图 ==="),
  G("  [OK]   引用的 3 张截图全部存在"),
  G("  [OK]   磁盘 3 张图全部被引用（无冗余）"),
  C("=== 3) 具体值 ==="),
  G("  [OK]   滤芯寿命: 60天 ✓有原文出处"),
  G("  [OK]   注气等待: 8秒 ✓有原文出处"),
  G("  [OK]   水温上限: 40℃ ✓有原文出处"),
  G("  [OK]   童锁时长: 30分钟 ✓有原文出处"),
  C("=== 4) 标定状态 ==="),
  G("  [OK]   基准原文与标定记录一致（未被手改）"),
  C("=== 5) 正文措辞 vs 原文 ==="),
  G("  [OK]   滤芯寿命: 60（M010）✓正文与原文一致"),
  W(""),
  Y("结论：全部检查通过。"),
]);

const f3 = frame("doc-qa-factory — drift check", [
  $("node scripts/calibrate.js demo-manual.docx"),
  W("技能里的 M### 引用: 共 40 处，其中 0 处位置需改写"),
  W(""),
  G("手册未变化，无需重新标定。"),
  W(""),
  D("# 退出码 2 = 检测到漂移（改版后先跑这个，永远安全）"),
]);

for (const [i, html] of [f1, f2, f3].entries()) {
  writeFileSync(join(here, "frames", `frame${i + 1}.html`), html);
}

const shot = (html, png, w, h) => {
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu",
    `--screenshot=${png.replace(/\//g, "\\")}`,
    `--window-size=${w},${h}`,
    "--hide-scrollbars", "--virtual-time-budget=4000",
    "file:///" + html.replace(/\\/g, "/"),
  ], { stdio: "pipe" });
};

// 固定尺寸帧（GIF 用）
for (const i of [1, 2, 3]) {
  shot(join(here, "frames", `frame${i}.html`), join(here, "frames", `frame${i}.png`), 880, 560);
}
// 自然高度单图（README 内嵌）
shot(join(here, "frames", "frame2.html"), join(docs, "verify-green.png"), 880, 520);

// GIF：image-sequence + palettegen 两遍法，每帧 2.4 秒（framerate 5/12 ≈ 0.417 帧/秒）
const gif = join(docs, "demo.gif");
rmSync(gif, { force: true });
execFileSync("ffmpeg", ["-y", "-loglevel", "error",
  "-framerate", "5/12", "-i", join(here, "frames", "frame%d.png"),
  "-vf", "scale=880:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
  "-loop", "0", gif], { stdio: "pipe" });

console.log("docs/demo.gif + docs/verify-green.png 已生成");
