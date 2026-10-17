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
  const options = {bundle:true,absWorkingDir:root,jsx:'automatic',plugins:[imagePlugin],define:{'process.env.NODE_ENV':'"production"'},write:false,logLevel:'silent'};
  const server = await esbuild.build({...options,stdin:{contents:"import {renderToStaticMarkup} from 'react-dom/server'; import Home from './components/home'; export const html = renderToStaticMarkup(<Home/>);",resolveDir:root,loader:'tsx'},platform:'node',format:'cjs',target:'node22'});
  const generated = new Module(path.join(root,'scripts','generated-preview.cjs'),module);
  generated.filename=path.join(root,'scripts','generated-preview.cjs');generated.paths=Module._nodeModulePaths(root);
  generated._compile(server.outputFiles[0].text,generated.filename);
  const client = await esbuild.build({...options,entryPoints:['scripts/preview-entry.tsx'],platform:'browser',format:'iife',target:'es2020',minify:true,legalComments:'inline'});
  const css = files(path.join(root,'out','_next')).filter(file=>file.endsWith('.css')).map(file=>fs.readFileSync(file,'utf8')).join('\n');
  if(!css)throw Error('先に npm run build を実行してください。');
  const favicon='data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'public/favicon.svg')).toString('base64');
  const html='<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex,nofollow"><meta name="description" content="整体室 余白・架空店舗のデザイン確認版"><title>整体室 余白｜デザインプレビュー</title><link rel="icon" href="'+favicon+'"><style>'+css+'</style></head><body><div id="preview-root">'+generated.exports.html+'</div><script>'+client.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script></body></html>';
  fs.writeFileSync(path.join(root,'preview.html'),html);
  const licenses=['react','react-dom','scheduler'].map(name=>'# '+name+'\n'+fs.readFileSync(require.resolve(name+'/package.json').replace('package.json','LICENSE'),'utf8')).join('\n\n');
  fs.writeFileSync(path.join(root,'preview.LICENSE.txt'),licenses);
  console.log('Created preview.html from the same React component, with inline images/CSS/JS ('+Buffer.byteLength(html)+' bytes).');
})().catch(error=>{console.error(error);process.exitCode=1});
