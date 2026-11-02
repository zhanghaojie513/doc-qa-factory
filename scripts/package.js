#!/usr/bin/env node
'use strict';
/**
 * 内部分发打包
 *
 *   node scripts/package.js                    打包到 dist/ 并生成校验清单
 *   node scripts/package.js --out <目录>       指定输出目录
 *   node scripts/package.js --name <前缀>      指定包名前缀
 *
 * 产出：
 *   <前缀>-<版本>.zip          可直接拷贝分发的技能包（内含 seal-assistant/ 目录）
 *   <前缀>-<版本>.zip.sha256   包文件的 SHA256
 *   <前缀>-<版本>.manifest.json 包内每个文件的 SHA256（用于逐文件校验完整性）
 *
 * 注意：本脚本**只做打包**，不修改技能内容。
 *
 * ⚠ 本技能含企业内部内容（手册原文、实拍截图、联系人电话、密码），
 *   产物仅限内部渠道分发。对公网发布前必须完成脱敏与授权评估，
 *   详见 README「九之二、打内部分发包 → 分发范围：仅限内部」一节。
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { zipDir } = require('./zip.js');

const SKILL_DIR = path.resolve(__dirname, '..');
const PKG_NAME = 'doc-qa-factory';

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

// 版本号：优先取 README/package 里声明的版本；本技能没有，则用标定日期 + 手册指纹
function detectVersion() {
  const lockPath = path.join(SKILL_DIR, 'references', 'manual-source.lock.json');
  let stamp = 'unknown', docSha = 'unknown';
  if (fs.existsSync(lockPath)) {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
    stamp = (lock.generatedAt || '').slice(0, 10).replace(/-/g, '') || 'unknown';
    docSha = ((lock.source && lock.source.sha256) || '').slice(0, 8) || 'unknown';
  }
  return { version: stamp + '-' + docSha, stamp, docSha };
}

const outDir = path.resolve(arg('--out', path.join(SKILL_DIR, 'dist')));
const prefix = arg('--name', PKG_NAME);
const { version, stamp, docSha } = detectVersion();

console.log('技能目录: ' + SKILL_DIR);
console.log('输出目录: ' + outDir);
console.log('版本标识: ' + version + '（标定日期 ' + stamp + ' + 手册指纹 ' + docSha + '）');
console.log('');

// 打包前必须通过校验：不把"坏掉"的技能发出去
console.log('=== 打包前校验 ===');
let verifyOk = true;
try {
  require('child_process').execFileSync(process.execPath,
    [path.join(__dirname, 'verify.js')], { stdio: 'inherit' });
} catch (e) {
  verifyOk = false;
}
if (!verifyOk) {
  console.error('');
  console.error('✋ 校验未通过，已中止打包。请先修复上面 [FAIL] 的问题，避免把不可靠的技能分发出去。');
  process.exit(1);
}

// 排除项：dist 自身、.git、临时/暂存目录
const EXCLUDE = new Set(['dist', '.git', 'node_modules']);
const staging = fs.mkdtempSync(path.join(require('os').tmpdir(), 'seal-pkg-'));
const stageRoot = path.join(staging, PKG_NAME);
fs.mkdirSync(stageRoot, { recursive: true });

let copied = 0, bytes = 0;
(function copyInto(src, dst) {
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (EXCLUDE.has(e.name)) continue;
    if (e.name.endsWith('.staging')) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyInto(s, d); }
    else {
      // 分发件里不需要本机生成的临时文件
      if (/\.(tmp|log|bak)$/i.test(e.name)) continue;
      fs.copyFileSync(s, d);
      copied++; bytes += fs.statSync(s).size;
    }
  }
})(SKILL_DIR, stageRoot);

console.log('');
console.log('=== 打包 ===');
console.log('  纳入文件: ' + copied + ' 个，原始大小 ' + (bytes / 1048576).toFixed(2) + ' MB');

fs.mkdirSync(outDir, { recursive: true });
const zipPath = path.join(outDir, prefix + '-' + version + '.zip');
const res = zipDir(zipPath, stageRoot, PKG_NAME);
const zipBuf = fs.readFileSync(zipPath);
const zipSha = crypto.createHash('sha256').update(zipBuf).digest('hex');

// 逐文件清单
const manifest = {
  package: prefix,
  version,
  generatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
  baseline: { calibratedAt: stamp, manualSha256Prefix: docSha },
  counts: { files: res.entries, screenshots: res.files.filter((f) => f.name.startsWith('assets/screenshots/')).length },
  bytes: { unpacked: bytes, zip: res.bytes },
  zip: { file: path.basename(zipPath), sha256: zipSha },
  files: res.files,
};
const manifestPath = path.join(outDir, prefix + '-' + version + '.manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 1), 'utf8');
const shaPath = path.join(outDir, prefix + '-' + version + '.zip.sha256');
fs.writeFileSync(shaPath, zipSha + '  ' + path.basename(zipPath) + '\n', 'utf8');

fs.rmSync(staging, { recursive: true, force: true });

console.log('  ' + path.basename(zipPath) + '  ' + (res.bytes / 1048576).toFixed(2) + ' MB');
console.log('  ' + path.basename(manifestPath));
console.log('  ' + path.basename(shaPath));
console.log('');
console.log('  SHA256: ' + zipSha);
console.log('');
console.log('=== 分发给同事 ===');
console.log('  1) 把 ' + path.basename(zipPath) + ' 发给对方（内部渠道）');
console.log('  2) 对方解压后，把 ' + PKG_NAME + '/ 整个目录放到 ~/.agents/skills/ 下');
console.log('  3) 校验完整性：');
console.log('       sha256sum -c ' + path.basename(shaPath));
console.log('       （或对照 manifest.json 里的逐个文件 sha256）');
console.log('  4) 自检：cd ' + PKG_NAME + ' && node scripts/verify.js   （应输出「结论：全部检查通过」）');
console.log('');
console.log('⚠ 本包含企业内部内容（手册原文、实拍截图、联系人电话、初始密码）。');
console.log('  仅限内部渠道分发；发到公网前必须先完成脱敏与授权评估。');
