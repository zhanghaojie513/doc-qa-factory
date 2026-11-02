// 组装演示手册 docx：全虚构内容《桌面气泡水机使用手册（演示文档）》
// 用法: node build/make-demo-docx.mjs   （产物: ../demo-manual.docx）
import { zipDir } from "../scripts/zip.js";
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const unpacked = join(here, "unpacked");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const h1 = (t) => `<w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`;
const h2 = (t) => `<w:p><w:pPr><w:pStyle w:val="Heading2"/></w:pPr><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`;
const p = (t) => `<w:p><w:r><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`;
const img = (rid) => `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="4953000" cy="3240000"/><wp:docPr id="${rid}" name="img${rid}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${rid}" name="img${rid}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="4953000" cy="3240000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;

const body = [
  h1("桌面气泡水机使用手册（演示文档）"),
  h1("快速开始"),
  p("本手册面向首任用户，介绍桌面气泡水机的安装、制作气泡水与日常保养流程。本机由主机、气泡瓶、CO2气瓶与水瓶四部分组成。"),
  h2("部件与安装"),
  p("安装步骤：将主机放置在平稳台面==》插入CO2气瓶并顺时针旋紧==》将气泡瓶卡入卡槽==》接通电源，指示灯变为绿色即完成安装。"),
  img(2),
  h2("制作气泡水"),
  p("制作流程：向气泡瓶注入饮用水至刻度线==》按下「注气」键1次==》等待约8秒蜂鸣提示==》轻摇气泡瓶2次后静置1分钟即可饮用。"),
  img(3),
  h1("日常保养"),
  h2("滤芯更换"),
  p("滤芯寿命为60天，到期后面板显示「F0」提示。更换步骤：逆时针旋下旧滤芯==》撕除新滤芯密封膜==》顺时针旋入卡座==》长按「复位」键3秒清除提示。"),
  img(4),
  h2("清洁与存放"),
  p("清洁流程：断电==》取出气泡瓶与水瓶==》用温水冲洗==》晾干后装回。请勿将主机浸水或使用洗碗机清洗主机。"),
  h1("故障处理"),
  h2("常见故障代码"),
  p("显示「E1」为气压异常：请检查CO2气瓶是否旋紧、气瓶余量是否充足；重新旋紧后按「注气」键重试。"),
  p("显示「E2」为水温过高：请待水温降至40℃以下再制作，面板灯恢复绿色后可正常使用。"),
  p("以上步骤仍无法排除故障时，请联系购买渠道的售后支持处理，请勿自行拆卸主机。"),
  h2("安全注意事项"),
  p("儿童锁：长按「童锁」键2秒开启后，所有按键将锁定30分钟；再次长按2秒可提前解除。气瓶请存放于阴凉处，避免暴晒。"),
].join("");

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${body}<w:sectPr/></w:body></w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;

const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image2.png"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image3.png"/></Relationships>`;

rmSync(unpacked, { recursive: true, force: true });
mkdirSync(join(unpacked, "word", "media"), { recursive: true });
mkdirSync(join(unpacked, "word", "_rels"), { recursive: true });
mkdirSync(join(unpacked, "_rels"), { recursive: true });
writeFileSync(join(unpacked, "[Content_Types].xml"), contentTypes);
writeFileSync(join(unpacked, "_rels", ".rels"), rootRels);
writeFileSync(join(unpacked, "word", "document.xml"), documentXml);
writeFileSync(join(unpacked, "word", "_rels", "document.xml.rels"), docRels);
for (let i = 1; i <= 3; i++) copyFileSync(join(here, `img${i}.png`), join(unpacked, "word", "media", `image${i}.png`));

const out = join(root, "demo-manual.docx");
zipDir(out, unpacked, "");
console.log("demo-manual.docx 已生成");
