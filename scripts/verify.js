#!/usr/bin/env node
'use strict';
/**
 * 一致性校验
 *
 *   node scripts/verify.js
 *
 * 检查技能是否"仍然贴着手册"：
 *   1. 每个 M### 引用都存在且未越界
 *   2. 手册每一行都被引用（无遗漏）
 *   3. 每个截图引用都存在；磁盘上的图都被引用（无死链、无冗余）
 *   4. 图片索引与磁盘一致
 *   5. 技能引用的具体值（网址/密码/电话/版本号/数字）都能在原文里找到
 *   6. 手册是否已更新（与锁定文件比对 sha256）
 *
 * 退出码：0 无失败项；1 有问题；2 尚未装载手册
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SKILL_DIR = path.resolve(__dirname, '..');
const REFS = path.join(SKILL_DIR, 'references');
const IMG_DIR = path.join(SKILL_DIR, 'assets', 'screenshots');
const LOCK = path.join(REFS, 'manual-source.lock.json');

// 逐手册配置（与 calibrate.js 同源）：knownValues / watchedValues 随知识库走，脚本本体无具体手册内容。
function loadConfig() {
  const empty = { docTitle: '', docVersion: '', expectedTitlePattern: '', imageSlugs: {}, watchedValues: [], knownValues: [] };
  try {
    return Object.assign(empty, JSON.parse(fs.readFileSync(path.join(REFS, 'manual-config.json'), 'utf8')));
  } catch (e) {
    if (e.code !== 'ENOENT') console.error('⚠ manual-config.json 解析失败（' + e.message + '），按空配置继续');
    return empty;
  }
}
const CFG = loadConfig();
const TEXT_FILES = ['SKILL.md', 'README.md', 'references/operations.md', 'references/troubleshooting.md', 'references/media-index.md', 'references/qa-playbook.md'];
// 构成"给员工的答复口径"的文件：具体值措辞比对只针对这些
// （README / traceability-report 是"讲技能"的说明，会拿数值变化当例子，参与比对照会误报）
const ANSWER_FILES = ['SKILL.md', 'references/operations.md', 'references/troubleshooting.md', 'references/qa-playbook.md'];

let problems = 0;
const ok = (m) => console.log('  [OK]   ' + m);
const bad = (m) => { problems++; console.log('  [FAIL] ' + m); };
const warn = (m) => console.log('  [WARN] ' + m);

console.log('技能目录: ' + SKILL_DIR);
console.log('');

/* 1. 读基准原文 */
const manPath = path.join(REFS, 'manual-source.md');
if (!fs.existsSync(manPath)) {
  // 全新克隆/尚未装载：给引导而不是报错
  console.log('');
  warn('尚未装载任何手册（找不到 references/manual-source.md）');
  console.log('  首次装载：node scripts/calibrate.js "<手册.docx>" --update');
  console.log('  或用仓库自带的演示文档体验完整流程（见 README 的 Quickstart）');
  process.exit(2);
}
const manRaw = fs.readFileSync(manPath, 'utf8');
const man = {};
for (const line of manRaw.split(/\r?\n/)) {
  const m = line.match(/^(?:#+\s*)?(M\d{3})\u3000(.*)$/);
  if (m && m[2].trim()) man[m[1]] = m[2];
}
const manIds = Object.keys(man).sort();
if (!manIds.length) {
  console.log('  [FAIL] 基准原文为空或没有正文非空的有效 M### 行');
  process.exit(1);
}
console.log('基准原文: ' + manIds.length + ' 行 (' + manIds[0] + '–' + manIds[manIds.length - 1] + ')，共 ' + manRaw.length + ' 字符');
console.log('');

/* 2. 收集技能全部文本（作为被检对象） */
const texts = {};
for (const f of TEXT_FILES) {
  const p = path.join(SKILL_DIR, f);
  if (fs.existsSync(p)) texts[f] = fs.readFileSync(p, 'utf8');
}
const allText = Object.values(texts).join('\n');

/* 3. M### 引用检查 */
console.log('=== 1) 原文引用 ===');
const cited = new Set();
for (const [f, t] of Object.entries(texts)) {
  for (const m of t.matchAll(/M(\d{3})\s*[–\-—~]\s*M?(\d{3})/g)) {
    const a = +m[1], b = +m[2];
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) cited.add('M' + String(i).padStart(3, '0'));
  }
  for (const m of t.matchAll(/M(\d{3})/g)) cited.add('M' + m[1]);
}
const outOfRange = [...cited].filter((c) => !man[c]);
if (outOfRange.length) bad('引用不存在/越界的编号: ' + outOfRange.join(', '));
else ok('全部 ' + cited.size + ' 个引用编号都存在，无越界');

const uncited = manIds.filter((id) => !cited.has(id));
if (uncited.length) warn('手册中有 ' + uncited.length + ' 行未被任何文件引用: ' + uncited.slice(0, 20).join(', ') + (uncited.length > 20 ? ' …' : ''));
else ok('手册 ' + manIds.length + ' 行全部被引用（无遗漏）');

/* 4. 截图引用检查 */
console.log('');
console.log('=== 2) 截图 ===');
const disk = fs.existsSync(IMG_DIR) ? new Set(fs.readdirSync(IMG_DIR).filter((f) => f.endsWith('.jpg'))) : new Set();
const refs = new Set();
for (const t of Object.values(texts)) {
  for (const m of t.matchAll(/assets\/screenshots\/([A-Za-z0-9._-]+\.jpg)/g)) refs.add(m[1]);
}
const missing = [...refs].filter((r) => !disk.has(r));
const unused = [...disk].filter((d) => !refs.has(d));
if (missing.length) bad('引用了不存在的截图 (' + missing.length + '): ' + missing.slice(0, 10).join(', '));
else ok('引用的 ' + refs.size + ' 张截图全部存在');
if (unused.length) bad('磁盘上有 ' + unused.length + ' 张图未被任何文件引用: ' + unused.slice(0, 10).join(', '));
else ok('磁盘 ' + disk.size + ' 张图全部被引用（无冗余）');

// 索引与磁盘一致性
const idx = texts['references/media-index.md'] || '';
const idxFiles = new Set([...idx.matchAll(/assets\/screenshots\/([A-Za-z0-9._-]+\.jpg)/g)].map((m) => m[1]));
if (idxFiles.size === disk.size) ok('图片索引与实际文件数量一致 (' + idxFiles.size + ')');
else warn('索引里 ' + idxFiles.size + ' 张，磁盘 ' + disk.size + ' 张');

/* 5. 具体值检查：技能里出现的"关键值"必须能在原文找到（清单来自 manual-config.json 的 knownValues） */
console.log('');
console.log('=== 3) 具体值 ===');
const VALUES = CFG.knownValues;
if (!VALUES.length) {
  warn('manual-config.json 未配置 knownValues，跳过具体值出处检查');
} else {
  let valueBad = 0;
  for (const [label, v] of VALUES) {
    const inMan = manRaw.includes(v);
    const inSkill = allText.includes(v);
    if (!inMan) { bad(label + ' 的值 "' + v + '" 在原文里找不到（原文可能已改动）'); valueBad++; }
    else if (inSkill) ok(label + ': ' + v + ' ✓有原文出处');
  }
  if (!valueBad) ok('以上值均有原文出处');
}

// 问答内容里的网址须可在手册核查；README 是项目介绍，其仓库链接和徽章不属于答复内容。
const answerAndMediaText = Object.entries(texts).filter(([f]) => f !== "README.md").map(([, t]) => t).join("\n");
const skillUrls = new Set(
  [...answerAndMediaText.matchAll(/https?:\/\/[^\s`)\]）>]+/g)].map((m) => m[0]).filter((u) => !u.includes('assets'))
);
for (const u of skillUrls) {
  if (!manRaw.includes(u)) bad('技能里的网址 "' + u + '" 在原文里找不到出处');
  else ok('网址 ' + u + ' ✓有原文出处');
}

/* 6. 手册是否已更新 */
console.log('');
console.log('=== 4) 标定状态 ===');
if (!fs.existsSync(LOCK)) {
  warn('没有标定记录 ' + path.relative(SKILL_DIR, LOCK) + '，无法判断手册是否更新');
} else {
  const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
  console.log('  标定时间: ' + lock.generatedAt);
  console.log('  标定手册: ' + (lock.source && lock.source.file) + ' (' + (lock.source && (lock.source.bytes / 1048576).toFixed(1)) + ' MB)');
  // 校验 manual-source.md 是否被手改：逐行比对纯文本指纹
  const drift = [];
  for (const l of lock.lines) {
    const cur = man[l.id];
    if (cur === undefined) { drift.push(l.id + ' 已被删除'); continue; }
    const expect = l.textHash || (l.hash || '').split(':').pop();
    const h = crypto.createHash('sha256').update(cur).digest('hex').slice(0, 12);
    if (h !== expect) drift.push(l.id + ' 内容与标定不一致');
  }
  if (drift.length) warn('基准原文与标定记录有 ' + drift.length + ' 处不一致（可能被手改过；请重新跑 calibrate）：' + drift.slice(0, 6).join('; '));
  else ok('基准原文与标定记录一致（未被手改）');
  console.log('  提示：手册若已改版，运行 node scripts/calibrate.js "<新手册.docx>" 检测漂移');
}

/* 7. 正文里的"具体值"是否与基准原文一致
 *    引用编号由 calibrate 自动改写，但正文措辞（如"24小时"）改不了。
 *    这里按【受监视的值】精确比对：技能正文写的值，必须等于基准原文当前的值。
 *    （不能只做 substring 包含判断：手册里别处可能也出现同样的数字，会漏判。） */
console.log('');
console.log('=== 5) 正文措辞 vs 原文 ===');
const WATCH = CFG.watchedValues.map((w) => ({ label: w.label, line: new RegExp(w.line), re: new RegExp(w.re) }));
if (!WATCH.length) {
  warn('manual-config.json 未配置 watchedValues，跳过正文措辞比对');
}
const manLinesArr = Object.entries(man).map(([id, text]) => ({ id, text }));
let proseBad = 0;
for (const w of WATCH) {
  // 与 calibrate 一致：先按行过滤找，找不到再退化为全行找
  let truth = null, truthId = null;
  for (const pass of [0, 1]) {
    for (const l of manLinesArr) {
      if (pass === 0 && !w.line.test(l.text)) continue;
      const m = l.text.match(w.re);
      if (m) { truth = m[1] !== undefined ? m[1] : m[0]; truthId = l.id; break; }
    }
    if (truth !== null) break;
  }
  if (truth === null) { warn(w.label + '：基准原文里找不到该值（原文可能已改动）'); continue; }
  const seen = new Set();
  // matchAll 要求带 g 标志；这里统一补上，避免手写正则漏 flag
  const gre = new RegExp(w.re.source, w.re.flags.includes('g') ? w.re.flags : w.re.flags + 'g');
  // 只比对"答复口径"文件；说明类文件（README/复核报告）会拿数值变化当例子。
  // 在口径文件里，仍跳过讲工具用法的行（如"如有效期 24→48"），那些是示例不是结论。
  for (const f of ANSWER_FILES) {
    const t = texts[f];
    if (!t) continue;
    for (const line of t.split('\n')) {
      if (line.includes('→') || line.includes('->')) continue;
      if (/calibrate|verify\.js|--update|重新标定/.test(line)) continue;
      for (const m of line.matchAll(gre)) seen.add(m[1] !== undefined ? m[1] : m[0]);
    }
  }
  const wrong = [...seen].filter((v) => v.replace(/\s/g, '') !== String(truth).replace(/\s/g, ''));
  if (wrong.length) {
    bad(w.label + '：技能正文写的是 "' + wrong.join('" / "') + '"，但基准原文（' + truthId + '）是 "' + truth + '" —— 手册已改值，需人工更新措辞');
    proseBad++;
  } else if (seen.size) {
    console.log('  [OK]   ' + w.label + ': ' + truth + '（' + truthId + '）✓正文与原文一致');
  }
}
if (WATCH.length && !proseBad) ok('正文里的具体值与原文一致（逐项精确比对）');

console.log('');
if (problems) { console.log('结论：发现 ' + problems + ' 个问题，需要处理。'); process.exit(1); }
console.log('结论：全部检查通过。');
