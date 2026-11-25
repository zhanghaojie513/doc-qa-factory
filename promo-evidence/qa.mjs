import {bundle} from '@remotion/bundler';
import {selectComposition,renderStill,openBrowser} from '@remotion/renderer';
const serveUrl=await bundle({entryPoint:'src/index.tsx'});
const browser=await openBrowser('chrome');
const composition=await selectComposition({serveUrl,id:'EvidencePromo',puppeteerInstance:browser});
const frames=process.argv.length>2?process.argv.slice(2).map(Number):[40,100,180,270,340,430,500,570,640,710,780,850,920,960,1020,1110];
for(const frame of frames){await renderStill({serveUrl,composition,frame,output:`out/qa/f${frame}.png`,puppeteerInstance:browser});console.log(frame);}
await browser.close({silent:true});
