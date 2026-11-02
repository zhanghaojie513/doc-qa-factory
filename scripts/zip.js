'use strict';
/**
 * 极简 ZIP 写入器（deflate 压缩）。
 *
 * 为什么自己写：Node 没有内置 zip，而不同机器上未必有 zip/7z 命令
 * （本环境就只有 tar）。压缩用 Node 自带的 zlib，因此**零外部依赖**。
 *
 * 条目一律使用固定时间戳（1980-01-01），这样"同样的内容"每次打包得到
 * 完全相同的字节，便于用 SHA256 做完整性校验。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/**
 * 把目录打包成 zip。
 * @param {string} outFile  目标 zip
 * @param {string} srcDir   源目录
 * @param {string} [rootName]  zip 内的顶层目录名；省略则条目直接位于根
 * @returns {{entries:number, bytes:number, files:{name:string,size:number,sha256:string}[]}}
 */
function zipDir(outFile, srcDir, rootName) {
  const files = walk(srcDir);
  const chunks = [];
  const central = [];
  const manifest = [];
  const crypto = require('crypto');
  let offset = 0;

  for (const abs of files) {
    const relName = path.relative(srcDir, abs).split(path.sep).join('/');
    const name = rootName ? rootName + '/' + relName : relName;
    const data = fs.readFileSync(abs);
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    // 压缩后没变小就用存储法，避免"越压越大"
    const useDeflate = deflated.length < data.length;
    const payload = useDeflate ? deflated : data;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(data);
    const nameBuf = Buffer.from(name, 'utf8');

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);            // version needed
    local.writeUInt16LE(0x0800, 6);        // flag: UTF-8 文件名
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);            // time = 0
    local.writeUInt16LE(0x21, 12);         // date = 1980-01-01
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(payload.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, nameBuf, payload);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(method, 10);
    cen.writeUInt16LE(0, 12);
    cen.writeUInt16LE(0x21, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(payload.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt16LE(0, 30);
    cen.writeUInt16LE(0, 32);
    cen.writeUInt16LE(0, 34);
    cen.writeUInt16LE(0, 36);
    cen.writeUInt32LE(0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, nameBuf);

    manifest.push({
      name: relName,
      size: data.length,
      sha256: crypto.createHash('sha256').update(data).digest('hex'),
    });
    offset += local.length + nameBuf.length + payload.length;
  }

  const cenBuf = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cenBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(outFile, Buffer.concat([...chunks, cenBuf, eocd]));
  return { entries: files.length, bytes: fs.statSync(outFile).size, files: manifest };
}

module.exports = { zipDir, crc32 };
