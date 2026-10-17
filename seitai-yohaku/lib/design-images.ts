export const MAX_UPLOAD=3*1024*1024;
export function checkImageFile(file:{size:number;type:string;name:string},bytes:Uint8Array){
 if(file.size>MAX_UPLOAD)throw Error('画像は3MB以下にしてください。');
 if(file.size===0)throw Error('空のファイルは使えません。');
 const allowed:Record<string,RegExp>={'image/jpeg':/\.jpe?g$/i,'image/png':/\.png$/i,'image/webp':/\.webp$/i};
 if(!allowed[file.type]?.test(file.name))throw Error('JPG・PNG・WebP画像を選んでください。SVGやGIFは使えません。');
 const b=String.fromCharCode(...bytes.slice(0,12));
 const valid=file.type==='image/jpeg'?b.startsWith('\xff\xd8\xff'):file.type==='image/png'?b.startsWith('\x89PNG\r\n\x1a\n'):b.startsWith('RIFF')&&b.slice(8,12)==='WEBP';
 if(!valid)throw Error('画像の中身とファイル形式が一致しません。');
}
export async function prepareImage(file:File):Promise<Blob>{
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());checkImageFile(file,bytes);
 let bitmap:ImageBitmap;try{bitmap=await createImageBitmap(file);}catch{throw Error('画像を読み込めませんでした。別の画像を選んでください。');}
 try{if(bitmap.width*bitmap.height>20000000||bitmap.width>8000||bitmap.height>8000)throw Error('画像は2,000万画素以下・一辺8,000px以下にしてください。');
 const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');if(!ctx)throw Error('この環境では画像を変換できません。');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('画像の変換に失敗しました。')),'image/webp',.84));if(blob.type!=='image/webp'||blob.size>1500000)throw Error('変換後の画像が大きすぎます。小さな画像を選んでください。');return blob;
 }finally{bitmap.close();}
}
export async function asDataUrl(blob:Blob):Promise<string>{return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(Error('画像を読み込めません。'));reader.readAsDataURL(blob);});}
