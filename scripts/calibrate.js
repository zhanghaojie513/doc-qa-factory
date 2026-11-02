#!/usr/bin/env node
'use strict';
/**
 * 手册重新标定 / 漂移检测
 *
 * 用途：手册改版后，把技能重新"标定"到新手册上，并把技能文件里的 M### 引用
 *       自动改写到正确的新行号。默认只做检测与报告，不改任何文件。
 *
 *   node scripts/calibrate.js <新手册.docx>            只检测，报告漂移（不改文件）
 *   node scripts/calibrate.js <新手册.docx> --update   执行重新标定
 *
 * 为什么需要"重新标定"：manual-source.md 里的 M001–M141 是**位置编号**，
 * 手册只要增删一段，后面所有编号都会平移，技能里的引用就会静默指错行。
 * 本脚本用"每行内容指纹"来识别同一段文字搬到了哪里，据此重排编号并改写引用。
 *
 * 退出码：0 = 无漂移；2 = 检测到漂移（check 模式）；1 = 出错
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { openDocx, walkBlocks, readRels } = require('./docx.js');

const SKILL_DIR = path.resolve(__dirname, '..');
const REFS = path.join(SKILL_DIR, 'references');
const IMG_DIR = path.join(SKILL_DIR, 'assets', 'screenshots');
const LOCK = path.join(REFS, 'manual-source.lock.json');

/**
 * 逐手册配置（references/manual-config.json）：文档守卫、图片命名表、受监视值都随知识库走，
 * 脚本本体不含任何具体手册的内容。换装新手册时由构建流程重写此文件。
 * 缺省降级：expectedTitlePattern 为空 → 跳过主题守卫（靠共同行相似度兜底）；
 * imageSlugs 为空 → 未登记小节自动 sec-NN；watchedValues/knownValues 为空 → 对应检查跳过。
 */
function loadConfig() {
  const p = path.join(REFS, 'manual-config.json');
  const empty = {
    docTitle: '', docVersion: '', expectedTitlePattern: '',
    headingStyles: { h1: 'Heading1', h2: 'Heading2' },
    imageSlugs: {}, watchedValues: [], knownValues: [],
  };
  if (!fs.existsSync(p)) return empty;
  try {
    const cfg = Object.assign(empty, JSON.parse(fs.readFileSync(p, 'utf8')));
    cfg.headingStyles = Object.assign({ h1: 'Heading1', h2: 'Heading2' }, cfg.headingStyles || {});
    return cfg;
  } catch (e) {
    console.error('⚠ manual-config.json 解析失败（' + e.message + '），按空配置继续');
    return empty;
  }
}
const CFG = loadConfig();
// docx 里的标题样式 ID：不同手册/不同导出器样式名不同（本机这份是中文 Word 的内部 ID），
// 从 manual-config.json 的 headingStyles 读，缺省用标准 Word 样式名。
const H1_STYLE = CFG.headingStyles.h1;
const H2_STYLE = CFG.headingStyles.h2;

// 可能出现 M### 引用、需要跟随重编号的文件（含给人看的说明文档）
const TEXT_FILES = ['SKILL.md', 'README.md', 'references/operations.md', 'references/troubleshooting.md', 'references/media-index.md', 'references/qa-playbook.md'];
// 构成"给员工的答复口径"的文件：具体值措辞的比对只针对这些
// （README / traceability-report 是"讲技能"的说明，会拿数值变化当例子，不能参与比对）
const ANSWER_FILES = ['SKILL.md', 'references/operations.md', 'references/troubleshooting.md', 'references/qa-playbook.md'];

// 本技能对应的是哪份手册。用于防止"把技能标定到一份不相关的手册上"——
// 那会把原文基准和全部引用一次性毁掉（实测过：换一份别的 docx 跑 --update，
// 脚本会报"成功"，但技能内容已被换成无关文档）。
// 模式来自 manual-config.json 的 expectedTitlePattern；为空时跳过主题守卫，靠共同行相似度兜底。
const EXPECTED_DOC = CFG.expectedTitlePattern ? new RegExp(CFG.expectedTitlePattern) : null;
// 相似度的最低门槛：新手册与旧基准的"共同行"占比低于此值，即认定为不相关文档
const MIN_OVERLAP = 0.5;

// 换文档时的安全检查会用到；--force-replace 可显式跳过（用于真的更换手册来源）
const FORCE_REPLACE = process.argv.includes('--force-replace');

const argv = process.argv.slice(2);
const UPDATE = argv.includes('--update');
const docxPath = argv.find((a) => !a.startsWith('--'));

if (!docxPath) {
  console.error('用法: node scripts/calibrate.js <新手册.docx> [--update]');
  process.exit(1);
}
if (!fs.existsSync(docxPath)) {
  console.error('找不到文件: ' + docxPath);
  process.exit(1);
}

const rel = (p) => path.relative(SKILL_DIR, p).split(path.sep).join('/');
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 12);

/**
 * 受监视的"具体值"：这些值一旦被手册改动，技能正文的措辞就必须跟着改。
 * 清单来自 manual-config.json 的 watchedValues（label + line/re 正则字符串）。
 * calibrate 把当前值写进 lock；verify 比对"手册现值 vs 锁定值"，
 * 以及"技能正文写的值 vs 手册现值"。按行匹配，避免别处出现同样的数字造成漏判。
 * 清单为空时本检查整体跳过。
 */
const WATCHED_VALUES = CFG.watchedValues.map((w) => ({ label: w.label, line: new RegExp(w.line), re: new RegExp(w.re) }));

/**
 * 从原文行里抽取受监视的值：返回 { label: {value, id} }。
 * 先在"匹配 line 模式"的行里找；找不到就退化为在全部行里找
 * （手册的措辞可能与预期不同，不能让行过滤把真实变化漏掉）。
 */
function extractWatched(lines) {
  const out = {};
  for (const wv of WATCHED_VALUES) {
    let hit = null;
    for (const pass of [0, 1]) {
      for (const l of lines) {
        if (pass === 0 && !wv.line.test(l.text)) continue;
        const m = l.text.match(wv.re);
        if (m) { hit = { value: m[1] !== undefined ? m[1] : m[0], id: l.id }; break; }
      }
      if (hit) break;
    }
    if (hit) out[wv.label] = hit;
  }
  return out;
}

/* ---------- 1. 从 docx 抽取"逐字原文行" ---------- */

function extractLines(docxPath) {
  const doc = openDocx(docxPath);
  const documentXml = doc.readText('word/document.xml');
  if (!documentXml) throw new Error('docx 里找不到 word/document.xml');
  const blocks = walkBlocks(documentXml.match(/<w:body>([\s\S]*)<\/w:body>/)[1]);

  const lines = [];        // 占编号的"有内容行"
  const imageEvents = [];  // 图片按文档顺序出现，带当时的章节归属；不占编号
  let h1 = '', h2 = '';

  for (const b of blocks) {
    if (b.kind === 'table') {
      if (b.rows.trim()) lines.push({ text: b.rows, style: 'table', images: [] });
      continue;
    }
    // 维护当前章节归属（沿用文档自身的标题样式）
    if (b.style === H1_STYLE && b.text.trim()) { h1 = b.text.trim(); h2 = ''; }
    if (b.style === H2_STYLE && b.text.trim()) { h2 = b.text.trim(); }

    for (const rid of b.images) imageEvents.push({ rid, h1, h2 });

    // 只登记有内容的行：纯图片段落/空段落不占编号。
    // 这与既有编号方案一致（图片属于它所在的那一节，不单独占一行），
    // 否则手册里加一张图就会把后面所有编号顶掉。
    if (!b.text.trim()) continue;
    lines.push({ text: b.text, style: b.style || '', images: [] });
  }

  lines.forEach((l, i) => {
    l.id = 'M' + String(i + 1).padStart(3, '0');
    // hash 用于识别"同一段文字"（含样式，标题升降级也算变化）
    l.hash = hash(l.style + '\u0000' + l.text);
    // textHash 用于校验 manual-source.md 有没有被手改（manual-source 里样式已转成 markdown 标题，
    // 所以只能比对纯文本）
    l.textHash = hash(l.text);
  });
  return { doc, documentXml, lines, imageEvents };
}

/* ---------- 2. 图片归属：按"图片出现在哪一节"归位 ---------- */

// 手册小节标题 -> 文件名前缀。映射来自 manual-config.json 的 imageSlugs（随知识库走）；
// 新手册出现没登记过的小节时，自动给 sec-NN 并提示人工命名（写回 config 或 lock）。
const DEFAULT_SLUGS = CFG.imageSlugs;

function planImages(imageEvents, doc, sectionSlugMap) {
  const relsPath = 'word/_rels/document.xml.rels';
  const rels = readRels(doc.readText(relsPath) || '');
  const plan = [];
  const counts = {};
  const seenRid = new Map();
  const newSections = [];
  let autoN = 0;

  for (const ev of imageEvents) {
    const target = rels[ev.rid];
    if (!target) continue;
    const h2 = ev.h2;
    let slug = sectionSlugMap[h2];
    if (!slug) {
      slug = DEFAULT_SLUGS[h2];
      if (!slug) { slug = 'sec-' + String(++autoN).padStart(2, '0'); newSections.push({ h2, slug }); }
      sectionSlugMap[h2] = slug;
    }
    if (!counts[slug]) counts[slug] = 0;

    // 同一张图被多节引用：沿用第一次的文件名，不重复出图
    if (seenRid.has(ev.rid)) {
      plan.push({ rid: ev.rid, target, name: seenRid.get(ev.rid), section: h2, h1: ev.h1, reused: true, newIndex: null });
      continue;
    }
    const idx = ++counts[slug];
    const name = `${slug}-${String(idx).padStart(2, '0')}.jpg`;
    seenRid.set(ev.rid, name);
    plan.push({ rid: ev.rid, target, name, section: h2, h1: ev.h1, reused: false, newIndex: idx });
  }
  return { plan, newSections };
}

// 从图片归属计划生成 media-index.md 需要的小节分组
function groupBySection(plan) {
  const groups = [];
  for (const p of plan) {
    const key = p.h1 + ' » ' + p.section;
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, h1: p.h1, section: p.section, files: [], reused: [] }; groups.push(g); }
    (p.reused ? g.reused : g.files).push(p.name);
  }
  return groups;
}

/* ---------- 3. 旧->新 行号映射（按内容指纹识别同一段文字搬去了哪） ---------- */

function buildIdMap(oldLines, newLines, report) {
  const queue = new Map();
  for (const l of newLines) {
    if (!queue.has(l.hash)) queue.set(l.hash, []);
    queue.get(l.hash).push(l.id);
  }
  const map = {};           // 旧 id -> 新 id
  const changed = [];       // 文字变了的
  for (const o of oldLines) {
    const q = queue.get(o.hash);
    if (q && q.length) { map[o.id] = q.shift(); }
    else changed.push(o.id);
  }
  // 新手册里没被匹配上的 = 新增
  const usedNew = new Set(Object.values(map));
  const added = newLines.filter((l) => !usedNew.has(l.id)).map((l) => l.id);

  // 位移：旧新 id 不一致即"搬动了"
  const moved = Object.entries(map).filter(([o, n]) => o !== n);
  report.map = map;
  report.changed = changed;
  report.added = added;
  report.moved = moved;
  return map;
}

/* ---------- 4. 生成 manual-source.md ---------- */

function renderManualSource(lines, meta) {
  const out = [];
  out.push('# 手册原文（基准文件，逐字）');
  out.push('');
  out.push('> 来源：' + meta.source);
  out.push('> 本文件是手册正文的**逐字原文**——保留原文的错别字、断句和截断（如"==》弹出"）。');
  out.push('> 编号 ' + lines[0].id + '–' + lines[lines.length - 1].id + ' 由 `references/manual-source.lock.json` 固定，供引用定位。');
  out.push('> **任何答复里的事实都必须能在这里找到对应行**；本文件没出现的，就不是手册内容。');
  out.push('>');
  out.push('> 原文中提到的 .mp4 / .docx 附件**均未随手册附带**，本文件只有文件名。');
  out.push('>');
  out.push('> ⚠️ 本文件由 `node scripts/calibrate.js <手册.docx> --update` 生成，**不要手改**——手改会在下次重新标定时丢失。');
  out.push('');
  out.push('---');
  out.push('');
  for (const l of lines) {
    const prefix = l.style === H1_STYLE ? '## ' : (l.style === H2_STYLE ? '### ' : '');
    if (prefix) { out.push(''); out.push(`${prefix}${l.id}　${l.text}`); }
    else out.push(`${l.id}　${l.text}`);
  }
  out.push('');
  return out.join('\n');
}

/* ---------- 5. 改写技能文件里的 M### 引用 ---------- */

function rewriteCitations(idMap) {
  const results = [];
  for (const f of TEXT_FILES) {
    const p = path.join(SKILL_DIR, f);
    if (!fs.existsSync(p)) continue;
    const before = fs.readFileSync(p, 'utf8');
    // 先替换成占位符，避免 A->B、B->C 这类链式覆盖
    let after = before.replace(/M(\d{3})/g, (m) => {
      const n = idMap[m];
      return n ? '\u0000' + n + '\u0000' : '\u0000UNMAPPED' + m + '\u0000';
    });
    after = after.replace(/\u0000(UNMAPPED)?(M\d{3})\u0000/g, (_, bad, id) => id);
    const n = (before.match(/M\d{3}/g) || []).length;
    if (after !== before) fs.writeFileSync(p, after, 'utf8');
    results.push({ file: f, citations: n, rewritten: after !== before });
  }
  return results;
}

/* ---------- 6. 出图（ffmpeg） ---------- */

function haveFfmpeg() {
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return true; } catch { return false; }
}

/** 转一张图；对偶发的编码器初始化失败做降级重试。 */
function encodeOne(srcBuf, ext, outPath) {
  const tmp = path.join(require('os').tmpdir(), 'calib-' + hash(outPath) + ext);
  fs.writeFileSync(tmp, srcBuf);
  const variants = [
    [],
    ['-threads', '1'],
    ['-threads', '1', '-filter_threads', '1'],
  ];
  let lastErr = null;
  for (const extra of variants) {
    try {
      execFileSync('ffmpeg', ['-loglevel', 'error', '-i', tmp,
        '-vf', "scale='min(1100,iw)':-2:flags=lanczos", '-pix_fmt', 'yuvj444p', '-q:v', '5',
        ...extra, '-y', outPath], { stdio: 'pipe' });
      fs.unlinkSync(tmp);
      return true;
    } catch (e) {
      // 没装 ffmpeg（ENOENT）= 环境限制而非图片问题：降级为原图直拷（字节不动，
      // 浏览器/看图软件按内容嗅探都能打开；命名仍是 <slug>-NN.jpg）。其他错误继续重试。
      if (e.code === 'ENOENT') {
        fs.copyFileSync(tmp, outPath);
        fs.unlinkSync(tmp);
        console.warn('  ⚠ 未检测到 ffmpeg，跳过重编码（原图直拷: ' + path.basename(outPath) + '）');
        return true;
      }
      lastErr = e;
    }
  }
  try { fs.unlinkSync(tmp); } catch {}
  throw lastErr;
}

/**
 * 出图。**先全部写到暂存目录，全部成功后再整体替换**——
 * 旧的实现是"先删目标目录再逐张写"，一旦中途失败（例如某张图编码失败），
 * 技能就会留下一个不完整的图片目录。这里的写法保证失败时旧图完好无损。
 */
function writeImages(doc, plan, report) {
  if (!haveFfmpeg()) { report.imageNote = '未检测到 ffmpeg，跳过出图（仅更新文字索引）'; return false; }
  const staging = IMG_DIR + '.staging';
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });

  let n = 0;
  const hashes = {};
  const failed = [];
  for (const p of plan) {
    if (p.reused) continue;
    const rel = 'word/' + p.target.replace(/^\.\//, '');
    const buf = doc.read(rel);
    if (!buf) { failed.push(p.name + ' (docx 里缺 ' + rel + ')'); continue; }
    try {
      encodeOne(buf, path.extname(p.target) || '.png', path.join(staging, p.name));
      hashes[p.name] = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 12);
      n++;
    } catch (e) {
      failed.push(p.name + ' (' + String(e && e.stderr ? e.stderr : e).slice(0, 160).replace(/\s+/g, ' ') + ')');
    }
  }

  const expected = plan.filter((x) => !x.reused).length;
  if (failed.length) {
    fs.rmSync(staging, { recursive: true, force: true });
    report.imageNote = '出图有 ' + failed.length + ' 张失败，已放弃替换（旧图未动）：' + failed.slice(0, 5).join('; ');
    return false;
  }
  if (n !== expected) {
    fs.rmSync(staging, { recursive: true, force: true });
    report.imageNote = '出图数量不符（期望 ' + expected + '，实得 ' + n + '），已放弃替换';
    return false;
  }
  // 全部就绪，整体替换
  fs.rmSync(IMG_DIR, { recursive: true, force: true });
  fs.renameSync(staging, IMG_DIR);
  report.imageCount = n;
  report.imageHashes = hashes;
  return true;
}

/* ---------- 7. 生成 media-index.md（图片/视频 -> 手册章节） ---------- */

function renderMediaIndex(lines, groups) {
  const out = [];
  out.push('# 手册插图与视频索引（按手册章节归属）');
  out.push('');
  out.push('> 本索引由 `scripts/calibrate.js` 依据手册文档结构自动生成：**只记录"这张图/这段视频出现在手册哪一节、依次第几张"**，');
  out.push('> **不描述图片内容**。图片是真实操作演示（实拍照片，有反光、遮挡、拍摄角度），');
  out.push('> 图片里画的是什么**以手册正文对应段落的文字为准**，不要靠看图（也不要 OCR）去推断或改写。');
  out.push('>');
  out.push('> 手册逐字原文见 `references/manual-source.md`（编号 ' + lines[0].id + '–' + lines[lines.length - 1].id + '）。');
  out.push('> ⚠️ 本文件自动生成，**不要手改**。');
  out.push('');
  out.push('## 怎么把图发给用户');
  out.push('');
  out.push('- 图片文件就在本技能目录下：`assets/screenshots/<name>.jpg`。**能作为文件直接发给用户就发**（附件形式）。');
  out.push('- 发不了文件时，**告诉用户在手册的位置**：手册章节名 + 该节第几张图，例如"《常见问题》里「某一操作」那一节的第 4 张图"。');
  out.push('- **不要**用"这张图显示/画的是×××"来描述图片内容——你不需要（也不应该）看图，描述容易出错。');
  out.push('  正确说法是"手册这一节有图演示，位置在……"。图片的**含义**用该节正文的文字来讲。');
  out.push('');

  // 视频：从原文里抓 .mp4 文件名，并记录它出现在哪一节
  const videos = [];
  let curH2 = '', curId = '';
  for (const l of lines) {
    if (l.style === H2_STYLE && l.text.trim()) curH2 = l.text.trim();
    const m = l.text.match(/([^\s，。"'（）]+\.mp4)/);
    if (m) videos.push({ name: m[1], section: curH2, id: l.id });
  }
  out.push('## 视频');
  out.push('');
  out.push('手册提到的演示视频**均未随手册附带**，本技能目录里**没有视频文件**。');
  out.push('用户想看视频时，只能告诉他**手册中的位置**（章节名 + 视频文件名），并说明该视频文件需要向对接人索取。');
  out.push('');
  out.push('| 视频文件名 | 所属手册章节 | 原文编号 |');
  out.push('|---|---|---|');
  for (const v of videos) out.push(`| \`${v.name}\` | ${v.section} | ${v.id} |`);
  out.push('');
  out.push('## 插图（按手册章节）');
  out.push('');
  for (const g of groups) {
    out.push(`### ${g.key}`);
    out.push('');
    if (g.files.length) {
      out.push(`本节共 ${g.files.length} 张图，按手册中的出现顺序：`);
      out.push('');
      for (let i = 0; i < g.files.length; i++) out.push(`- 第 ${i + 1} 张 —— \`assets/screenshots/${g.files[i]}\``);
    }
    if (g.reused.length) {
      out.push('');
      out.push(`> 本节另引用了前面章节已出现过的同一张图（\`assets/screenshots/${g.reused[0]}\`），不是新图。`);
    }
    out.push('');
  }
  const uniq = groups.reduce((a, g) => a + g.files.length, 0);
  out.push('---');
  out.push('');
  out.push(`合计：手册插图 **${uniq} 张**；演示视频 **${videos.length} 个**（均未附带文件）。`);
  return out.join('\n');
}

/* ---------- main ---------- */

function main() {
  const lockOld = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')) : null;
  let raw;
  try {
    raw = fs.readFileSync(docxPath);
  } catch (e) {
    console.error('无法读取文件: ' + docxPath + '（' + e.code + '）');
    process.exit(1);
  }
  // 先确认这是不是一个能解析的 .docx，给出人话错误而不是堆栈
  try {
    openDocx(docxPath);
  } catch (e) {
    console.error('这不是一个可解析的 .docx 文件: ' + path.basename(docxPath));
    console.error('  原因: ' + (e && e.message ? e.message : e));
    console.error('  提示: 请确认传入的是 Word 文档（.docx），不是 .doc / .pdf / 纯文本。');
    process.exit(1);
  }
  const sourceSha = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);

  console.log('手册: ' + docxPath);
  console.log('大小: ' + (raw.length / 1048576).toFixed(1) + ' MB | sha256(16): ' + sourceSha);
  if (lockOld) console.log('上次标定: ' + lockOld.generatedAt + ' | sha256(16): ' + (lockOld.source && lockOld.source.sha256 || '?'));
  console.log('');

  const { doc, lines, imageEvents } = extractLines(docxPath);
  if (!lines.length) {
    console.error('✋ 中止：这份 .docx 里没有解析出任何正文内容（可能是空文档或结构异常）。');
    process.exit(1);
  }
  const report = { lines: lines.length };

  const sectionSlugMap = Object.assign({}, (lockOld && lockOld.sectionSlugs) || {});
  const { plan, newSections } = planImages(imageEvents, doc, sectionSlugMap);
  const groups = groupBySection(plan);
  const uniqueImages = plan.filter((p) => !p.reused).length;

  const unchanged = lockOld && lockOld.source && lockOld.source.sha256 === sourceSha;

  // ---- 安全检查：确认这份 docx 确实是本技能对应的那份手册 ----
  // 已建立的标定不可被"另一份无关文档"覆盖。实测：换一份别的 docx 跑 --update，
  // 旧脚本会报"成功"，但技能内容已被换成无关文档、图片被清空。
  if (lockOld && !unchanged && !FORCE_REPLACE) {
    const newHashes = new Set(lines.map((l) => l.hash));
    const oldHashes = lockOld.lines.map((l) => l.hash);
    const common = oldHashes.filter((h) => newHashes.has(h)).length;
    const overlap = oldHashes.length ? common / oldHashes.length : 0;
    const title = lines.slice(0, 5).map((l) => l.text).join(' ');
    const titleOk = EXPECTED_DOC.test(title) || EXPECTED_DOC.test(lines.map((l) => l.text).join(' '));

    console.log('=== 文档一致性检查 ===');
    console.log('  与既有基准的共同行: ' + common + '/' + oldHashes.length
      + '（' + (overlap * 100).toFixed(1) + '%）');

    if (overlap < MIN_OVERLAP) {
      console.error('');
      console.error('✋ 中止：这份文档与技能当前的基准手册**差异过大**，判定为不相关文档。');
      console.error('   共同行占比 ' + (overlap * 100).toFixed(1) + '% < 门槛 ' + (MIN_OVERLAP * 100) + '%。');
      console.error('   允许运行会覆盖原文基准与全部引用编号，把技能内容换成无关文档。');
      console.error('');
      console.error('   如果你确认这是**本手册的新版本**（例如手册大改版），');
      console.error('   请先人工确认内容确实对应同一主题，再加 --force-replace 重跑：');
      console.error('     node scripts/calibrate.js "<新手册.docx>" --update --force-replace');
      process.exit(1);
    }
    if (!titleOk) {
      console.warn('  ⚠ 文档标题里没有出现预期主题（/' + CFG.expectedTitlePattern + '/）字样，请确认这不是另一份文档：');
      console.warn('    ' + title.slice(0, 80));
    } else {
      console.log('  [OK] 文档主题与技能一致，继续。');
    }
    console.log('');
  }

  if (!lockOld) {
    // 无标定记录 = 首次建立基准。此时没有"共同行"可比对，只能靠主题判断，
    // 否则一份无关文档会被当成基准写入，技能就此被改错。
    const allText = lines.map((l) => l.text).join(' ');
    if (EXPECTED_DOC && !EXPECTED_DOC.test(allText) && !FORCE_REPLACE) {
      console.error('');
      console.error('✋ 中止：当前没有标定记录，而这份文档看起来**不属于本技能的主题**。');
      console.error('   本技能对应的文档：' + (CFG.docTitle || '未配置（在 references/manual-config.json 里设置 docTitle / expectedTitlePattern）') + '。');
      console.error('   文档开头：' + lines.slice(0, 3).map((l) => l.text).join(' / ').slice(0, 80));
      console.error('');
      console.error('   若确实要用它重建基准，请加 --force-replace 明确确认：');
      console.error('     node scripts/calibrate.js "<文档.docx>" --update --force-replace');
      process.exit(1);
    }
    console.log('没有找到标定记录（' + rel(LOCK) + '），本次将建立基准。');
    report.added = lines.map((l) => l.id);
    report.moved = []; report.changed = []; report.map = {};
  } else {
    buildIdMap(lockOld.lines, lines, report);
    console.log('=== 漂移检测 ===');
    console.log('原文行数: ' + lockOld.lines.length + ' -> ' + lines.length);
    console.log('新增行: ' + report.added.length + (report.added.length ? '  (' + report.added.slice(0, 12).join(' ') + (report.added.length > 12 ? ' …' : '') + ')' : ''));
    console.log('删除/改动行(旧编号): ' + report.changed.length);
    console.log('位置平移的行数: ' + report.moved.length);
    if (!report.moved.length && !report.added.length && !report.changed.length) {
      console.log('  -> 文字与上次标定完全一致。');
    } else {
      // 改动行要**把旧文和新文并排打出来**：脚本能改引用编号，但改不了正文里的
      // 具体值（例如"24小时"变成"48小时"）——那必须由人来判断并更新措辞。
      if (report.changed.length) {
        console.log('');
        console.log('  ⚠ 以下内容与上次标定**不一致**，技能正文里的对应描述可能已过时，必须人工复核：');
        const byOld = new Map(lockOld.lines.map((l) => [l.id, l]));
        for (const id of report.changed.slice(0, 15)) {
          const oldL = byOld.get(id);
          console.log('    [' + id + '] 旧: ' + (oldL ? (oldL.head + (oldL.head.length >= 40 ? '…' : '')) : '(未知)'));
          const near = lines.filter((l) => l.id >= id).slice(0, 3).map((l) => l.id + ':' + l.text.slice(0, 30));
          console.log('           新手册邻近行: ' + near.join('  |  '));
        }
        if (report.changed.length > 15) console.log('    … 共 ' + report.changed.length + ' 行');
      }
      if (report.added.length) {
        console.log('');
        console.log('  ＋ 新手册新增的内容（技能里还没有，考虑补进 operations.md / troubleshooting.md）：');
        for (const id of report.added.slice(0, 12)) {
          const l = lines.find((x) => x.id === id);
          console.log('    [' + id + '] ' + (l ? l.text.slice(0, 70) : ''));
        }
        if (report.added.length > 12) console.log('    … 共 ' + report.added.length + ' 行');
      }

      // 受监视的"具体值"变了没有 —— 这是最容易被漏掉、也最危险的一类变化
      const oldVals = lockOld.values || {};
      const newVals = extractWatched(lines);
      const changedVals = [];
      for (const k of Object.keys(newVals)) {
        if (oldVals[k] && oldVals[k].value !== newVals[k].value) {
          changedVals.push({ label: k, from: oldVals[k].value, to: newVals[k].value, id: newVals[k].id });
        }
      }
      if (changedVals.length) {
        console.log('');
        console.log('  ‼ 具体值发生变化（技能正文里的措辞必须同步修改，引用编号改写不会改这些字）：');
        for (const c of changedVals) {
          console.log('    ' + c.label + ': ' + c.from + ' -> ' + c.to + '   (新手册 ' + c.id + ')');
        }
        report.valueChanges = changedVals;
      }
      const show = report.moved.slice(0, 6);
      if (show.length && !report.changed.length) {
        console.log('');
        console.log('  平移示例（旧 -> 新）:');
        for (const [o, n] of show) console.log('    ' + o + ' -> ' + n);
        if (report.moved.length > show.length) console.log('    … 共 ' + report.moved.length + ' 行');
      }
    }
    // 技能引用受影响面
    let affected = 0, total = 0, unmapped = 0;
    for (const f of TEXT_FILES) {
      const p = path.join(SKILL_DIR, f);
      if (!fs.existsSync(p)) continue;
      const cites = [...fs.readFileSync(p, 'utf8').matchAll(/M(\d{3})/g)].map((m) => m[0]);
      total += cites.length;
      affected += cites.filter((c) => report.map[c] && report.map[c] !== c).length;
      unmapped += cites.filter((c) => !report.map[c]).length;
    }
    console.log('');
    console.log('技能里的 M### 引用: 共 ' + total + ' 处，其中 **' + affected + ' 处位置需改写**'
      + (unmapped ? '，另有 **' + unmapped + ' 处无法自动定位**（对应行已被改动/删除，需人工处理）' : ''));
    if (newSections.length) {
      console.log('');
      console.log('出现未登记的手册小节（已自动命名，建议人工改成有意义的前缀）:');
      for (const s of newSections) console.log('  "' + s.h2 + '" -> ' + s.slug);
    }
  }

  if (!UPDATE) {
    console.log('');
    if (unchanged && lockOld) {
      console.log('手册未变化，无需重新标定。');
      process.exit(0);
    }
    console.log('以上仅为检测结果，**未改动任何文件**。执行重新标定请加 --update：');
    console.log('  node scripts/calibrate.js "' + docxPath + '" --update');
    process.exit(2);
  }

  /* ---- 执行更新 ---- */
  console.log('');
  console.log('=== 执行重新标定 ===');
  fs.mkdirSync(REFS, { recursive: true });

  // 0) 先出图：出图失败就直接中止，不动任何文字文件（保证技能不会处于半更新状态）
  const imgReport = {};
  const imgsOk = writeImages(doc, plan, imgReport);
  console.log('  出图: ' + (imgReport.imageCount != null ? imgReport.imageCount + ' 张' : '未替换') + (imgReport.imageNote ? '（' + imgReport.imageNote + '）' : ''));
  if (!imgsOk) {
    console.error('');
    console.error('出图未成功，已中止，文字文件与已有图片均未改动。修正后重试。');
    process.exit(1);
  }

  // 1) 改写引用（用旧编号映射）
  const rw = rewriteCitations(report.map || {});
  for (const r of rw) console.log((r.rewritten ? '  已改写 ' : '  未变动 ') + r.file + '（' + r.citations + ' 处引用）');

  // 2) 原文
  fs.mkdirSync(REFS, { recursive: true }); // 全新克隆可能还没有 references/ 目录
  const meta = { source: (CFG.docTitle || '未命名手册') + (!lockOld && CFG.docVersion ? '，' + CFG.docVersion : ''), count: lines.length };
  fs.writeFileSync(path.join(REFS, 'manual-source.md'), renderManualSource(lines, meta), 'utf8');
  console.log('  已重建 ' + rel(path.join(REFS, 'manual-source.md')));

  // 3) 媒体索引
  fs.writeFileSync(path.join(REFS, 'media-index.md'), renderMediaIndex(lines, groups), 'utf8');
  console.log('  已重建 ' + rel(path.join(REFS, 'media-index.md')));

  // 4) 锁定文件
  const lock = {
    generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    source: { file: path.basename(docxPath), bytes: raw.length, sha256: sourceSha },
    lineScheme: 'content-only (images do not consume an id)',
    sectionSlugs: sectionSlugMap,
    values: extractWatched(lines),
    lines: lines.map((l) => ({ id: l.id, hash: l.hash, textHash: l.textHash, head: l.text.slice(0, 40) })),
    images: imgReport.imageHashes || {},
  };
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 1), 'utf8');
  console.log('  已写入 ' + rel(LOCK));

  console.log('');
  console.log('完成。下一步务必人工过一遍：');
  console.log('  1) 复核上面列出的"删除/改动行"——技能里对应内容可能已过时或已被手册删除');
  console.log('  2) 复核新手册新增的内容，必要时补进 operations.md / troubleshooting.md');
  console.log('  3) 跑 node scripts/verify.js 做一致性校验');
  process.exit(0);
}

main();
