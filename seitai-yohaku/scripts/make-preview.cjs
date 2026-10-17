/* Next.jsと同じコンポーネントを使い、オフラインで開けるデザイン確認用HTMLを作成。 */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
function files(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item => item.isDirectory() ? files(path.join(dir,item.name)) : [path.join(dir,item.name)]); }
(async () => {
  const studio = 'data:image/webp;base64,' + fs.readFileSync(path.join(root,'public/images/studio.webp')).toString('base64');
  const imagePlugin = { name:'inline-studio', setup(build) { build.onLoad({filter:/home\.tsx$/}, async args => ({contents:fs.readFileSync(args.path,'utf8').replaceAll('"/images/studio.webp"',JSON.stringify(studio)),loader:'tsx'})); } };
  const options = {bundle:true,absWorkingDir:root,jsx:'automatic',plugins:[imagePlugin],define:{'process.env.NODE_ENV':'"production"','process.env.NEXT_PUBLIC_SUPABASE_URL':'""','process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY':'""'},write:false,logLevel:'silent'};
  const client = await esbuild.build({...options,entryPoints:['scripts/preview-entry.tsx'],platform:'browser',format:'iife',target:'es2020',minify:true,legalComments:'inline'});
  fs.writeFileSync(path.join(root,'preview-app.js'),client.outputFiles[0].text);
  const css = files(path.join(root,'out','_next')).filter(file=>file.endsWith('.css')).map(file=>fs.readFileSync(file,'utf8')).join('\n');
  if(!css)throw Error('先に npm run build を実行してください。');
  const favicon='data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'public/favicon.svg')).toString('base64');
  for (const page of ['home','reservation','design-editor']) {
    const component=page==='home'?'<SiteHome bookingPath="reservation.html" editorPath="design-editor.html"/>':page==='reservation'?'<Booking homePath="preview.html"/>':'<DesignEditor homePath="preview.html"/>';
    const server=await esbuild.build({...options,stdin:{contents:"import {renderToString} from 'react-dom/server'; import SiteHome from './components/site-home'; import DesignEditor from './components/design-editor'; import Booking from './components/booking'; export const html = renderToString("+component+");",resolveDir:root,loader:'tsx'},platform:'node',format:'cjs',target:'node22'});
    const generated=new Module(path.join(root,'scripts','generated-preview.cjs'),module);
    generated.filename=path.join(root,'scripts','generated-preview.cjs');generated.paths=Module._nodeModulePaths(root);
    generated._compile(server.outputFiles[0].text,generated.filename);
    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow"><title>整体室 余白｜${page==='home'?'デザインプレビュー':page==='reservation'?'WEB予約デモ':'デザイン編集デモ'}</title><link rel="icon" href="${favicon}"><style>${css}</style></head><body><div id="preview-root">${generated.exports.html}</div><script>window.__YOHAKU_PAGE__=${JSON.stringify(page)};</script><script src="preview-app.js"></script></body></html>`;
    const name=page==='home'?'preview.html':page==='reservation'?'reservation.html':'design-editor.html';
    fs.writeFileSync(path.join(root,name),html);console.log('Created '+name+' ('+Buffer.byteLength(html)+' bytes).');
  }
  const licenses=['react','react-dom','scheduler'].map(name=>'# '+name+'\n'+fs.readFileSync(require.resolve(name+'/package.json').replace('package.json','LICENSE'),'utf8')).join('\n\n');
  fs.writeFileSync(path.join(root,'preview.LICENSE.txt'),licenses);

})().catch(error=>{console.error(error);process.exitCode=1});
