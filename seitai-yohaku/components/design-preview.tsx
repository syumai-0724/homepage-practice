'use client';
import { createPortal } from 'react-dom';
import { useEffect,useRef,useState } from 'react';
import Home from './home';
import type { DesignSettings } from '@/lib/design-model';
export default function DesignPreview({design,device,imageUrl}:{design:DesignSettings;device:'pc'|'mobile';imageUrl?:string|null}){
 const host=useRef<HTMLDivElement>(null),frame=useRef<HTMLIFrameElement>(null);const [width,setWidth]=useState(900),[html,setHtml]=useState(''),[mount,setMount]=useState<HTMLElement|null>(null);
 useEffect(()=>{const css=Array.from(document.styleSheets).map(sheet=>{try{return Array.from(sheet.cssRules).map(r=>r.cssText).join('\n');}catch{return '';}}).join('\n');setHtml('<!doctype html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+css.replaceAll('</style','<\\/style')+'</style></head><body><div id="design-preview-root"></div></body></html>');const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));if(host.current)observer.observe(host.current);return()=>observer.disconnect();},[]);
 const actual=device==='pc'?1280:390,scale=Math.min(1,width/actual),height=device==='pc'?900:850;
 return <div className="editor-canvas" ref={host}><div className="editor-frame-space" style={{width:actual*scale,height:height*scale}}>{html&&<iframe ref={frame} title={device==='pc'?'PC表示のデザインプレビュー':'スマートフォン表示のデザインプレビュー'} sandbox="allow-same-origin" srcDoc={html} style={{width:actual,height,transform:'scale('+scale+')'}} onLoad={()=>setMount(frame.current?.contentDocument?.getElementById('design-preview-root')||null)}/>}</div>{mount&&createPortal(<div inert><Home design={design} heroImageUrl={imageUrl} previewMode/></div>,mount)}</div>;
}
