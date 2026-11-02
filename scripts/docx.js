'use strict';
/**
 * Minimal, dependency-free reader for .docx (a ZIP of XML).
 *
 * Node has no built-in ZIP support, so this parses the central directory by hand
 * and inflates entries with zlib. We only ever need a handful of members
 * (word/document.xml, word/_rels/document.xml.rels, word/media/*), so there is
 * no need for a general-purpose unzip.
 */
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

function readZipEntries(buf) {
  // EOCD sits at the end, possibly followed by a comment (max 64KB).
  let eocd = -1;
  const from = Math.max(0, buf.length - 65557);
  for (let i = buf.length - 22; i >= from; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip: no End Of Central Directory record');

  const count = buf.readUInt16LE(eocd + 10);
  const cenOff = buf.readUInt32LE(eocd + 16);
  const entries = new Map();

  let p = cenOff;
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== CEN_SIG) throw new Error('bad central directory at ' + p);
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const uncompSize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const cmtLen = buf.readUInt16LE(p + 32);
    const locOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    entries.set(name, { name, method, compSize, uncompSize, locOff });
    p += 46 + nameLen + extraLen + cmtLen;
  }
  return entries;
}

function readEntry(buf, entry) {
  const p = entry.locOff;
  if (buf.readUInt32LE(p) !== LOC_SIG) throw new Error('bad local header for ' + entry.name);
  const nameLen = buf.readUInt16LE(p + 26);
  const extraLen = buf.readUInt16LE(p + 28);
  const dataOff = p + 30 + nameLen + extraLen;
  const raw = buf.subarray(dataOff, dataOff + entry.compSize);
  if (entry.method === 0) return Buffer.from(raw);
  if (entry.method === 8) return zlib.inflateRawSync(raw);
  throw new Error('unsupported compression method ' + entry.method + ' for ' + entry.name);
}

function openDocx(file) {
  const buf = fs.readFileSync(file);
  const entries = readZipEntries(buf);
  return {
    buf,
    entries,
    read(name) {
      const e = entries.get(name);
      if (!e) return null;
      return readEntry(buf, e);
    },
    readText(name) {
      const b = this.read(name);
      return b ? b.toString('utf8') : null;
    },
  };
}

/* ---------------- WordprocessingML helpers ---------------- */

function decodeXml(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, '\'')
    .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&');
}

function paragraphText(p) {
  let out = '';
  const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let m;
  while ((m = re.exec(p))) {
    if (m[1] !== undefined) out += decodeXml(m[1]);
    else if (m[0].startsWith('<w:tab')) out += '\t';
    else out += '\n';
  }
  return out;
}

function paragraphStyle(p) {
  const m = p.match(/<w:pStyle w:val="([^"]+)"/);
  return m ? m[1] : '';
}

function bodyOf(documentXml) {
  const m = documentXml.match(/<w:body>([\s\S]*)<\/w:body>/);
  if (!m) throw new Error('document.xml has no <w:body>');
  return m[1];
}

/** Walk the body in document order, emitting paragraphs and tables. */
function walkBlocks(body) {
  const topRe = /<w:p\b[\s\S]*?<\/w:p>|<w:p\b[^>]*\/>|<w:tbl>[\s\S]*?<\/w:tbl>/g;
  const blocks = [];
  let m;
  while ((m = topRe.exec(body))) {
    const chunk = m[0];
    if (chunk.startsWith('<w:tbl>')) {
      const rows = (chunk.match(/<w:tr\b[\s\S]*?<\/w:tr>/g) || []).map((r) => {
        const cells = r.match(/<w:tc>[\s\S]*?<\/w:tc>/g) || [];
        return cells.map((c) => (c.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [])
          .map((x) => paragraphText(x).trim()).filter(Boolean).join(' '));
      });
      blocks.push({ kind: 'table', rows: rows.map((r) => '| ' + r.join(' | ') + ' |').join('\n') });
    } else {
      const style = paragraphStyle(chunk);
      const text = paragraphText(chunk).replace(/\s+$/, '');
      const images = [...chunk.matchAll(/r:embed="(rId\d+)"/g)].map((x) => x[1]);
      blocks.push({ kind: 'para', style, text, images });
    }
  }
  return blocks;
}

function readRels(relsXml) {
  const map = {};
  if (!relsXml) return map;
  const re = /Id="(rId\d+)"[^>]*Target="([^"]*)"/g;
  let m;
  while ((m = re.exec(relsXml))) map[m[1]] = m[2];
  return map;
}

module.exports = { openDocx, walkBlocks, paragraphText, paragraphStyle, readRels, decodeXml, bodyOf, path };
