from pathlib import Path
root=Path(__file__).resolve().parent
p=root/'comp.html';s=p.read_text(encoding='utf-8')
old='paper.add(sheet,sheetBack);'
new=old+'''
// A blank paper extension carries the speech tail; the printed body stays rectangular.
const tailGeo=new T.BufferGeometry();
const tailBase=new Float32Array([-3.36,-2.47,0,-2.24,-3.35,0,-1.12,-2.47,0]);
tailGeo.setAttribute('position',new T.BufferAttribute(tailBase.slice(),3));
const tailMesh=new T.Mesh(tailGeo,new T.MeshStandardMaterial({color:'#fff8e7',roughness:.96,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
tailMesh.castShadow=true;tailMesh.receiveShadow=true;paper.add(tailMesh);
'''
assert old in s;s=s.replace(old,new,1)
old='a[i]=ox*rounded*(1-s.close*.08);a[i+1]=oy-tail;a[i+2]=bend+closing;'
new='a[i]=ox*rounded*(1-s.close*.08);a[i+1]=oy;a[i+2]=bend+closing;'
assert old in s;s=s.replace(old,new)
old='paper.position.set(lerp(0,-4.2,s.close),lerp(-.44,2.0,s.lift)+1.1*s.close,0);'
new='''const tp=tailGeo.attributes.position.array,extension=s.bubble*(1-s.close);
 for(let i=0;i<tp.length;i+=3){const x=tailBase[i],u=(x+4)/8;tp[i]=x*(1-s.close*.08);tp[i+1]=-2.47+(tailBase[i+1]+2.47)*extension;tp[i+2]=s.fold*2.8*Math.pow(u,1.7)+s.close*.85*Math.abs(x)-.001;}
 tailGeo.attributes.position.needsUpdate=true;tailGeo.computeVertexNormals();tailGeo.computeBoundingBox();tailMesh.visible=extension>0.0001;
 '''+old
assert old in s;s=s.replace(old,new)
old='if(obj===paper){const a=geo.attributes.position;for(let i=0;i<a.count;i++)ps.push(project(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(paper.matrixWorld)));}'
new='if(obj===paper){for(const geometry of (tailMesh.visible?[geo,tailGeo]:[geo])){const a=geometry.attributes.position;for(let i=0;i<a.count;i++)ps.push(project(new T.Vector3(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(paper.matrixWorld)));}}'
assert old in s;s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
p=root/'polish.js';s=p.read_text(encoding='utf-8')
old="if(t<6.0){inkKey='';fg.putImageData(coverImg,0,0);fg.globalAlpha=k(filmTime(t),3.65,4.65,E.sineInOut);fg.drawImage(boards.answer,0,0);fg.globalAlpha=1;frontTex.needsUpdate=true;return;}"
new="if(t<6.0){const f=k(filmTime(t),3.65,4.65,E.sineInOut),key='initial/'+f;if(key===inkKey)return;inkKey=key;fg.putImageData(coverImg,0,0);fg.globalAlpha=f;fg.drawImage(boards.answer,0,0);fg.globalAlpha=1;frontTex.needsUpdate=true;return;}"
assert old in s;s=s.replace(old,new)
old='if(crease>0){const a=geo.attributes.position.array,b=backGeo.attributes.position.array;'
new='if(crease>0){const tp=tailGeo.attributes.position.array;for(let i=0;i<tp.length;i+=3)tp[i+2]+=crease*Math.abs(tailBase[i])*.6;tailGeo.attributes.position.needsUpdate=true;tailGeo.computeVertexNormals();tailGeo.computeBoundingBox();const a=geo.attributes.position.array,b=backGeo.attributes.position.array;'
assert old in s;s=s.replace(old,new)
p.write_text(s,encoding='utf-8')
print('Separated blank tail geometry from the printed page body; included tail in tracking and folding.')
