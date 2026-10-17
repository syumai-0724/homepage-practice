'use client';
import { useEffect,useState } from 'react';
import Home from './home';
import { defaultDesign } from '@/lib/design-model';
import { readDemoPublished } from '@/lib/design-store';
import { designConnection } from '@/lib/design-supabase';
export default function SiteHome({bookingPath='/reservation/',editorPath='/admin/design/'}:{bookingPath?:string;editorPath?:string}){
 const [design,setDesign]=useState(defaultDesign);
 useEffect(()=>{if(designConnection().kind!=='demo')return;const refresh=()=>{try{setDesign(readDemoPublished(localStorage)||defaultDesign);}catch{setDesign(defaultDesign);}};refresh();window.addEventListener('storage',refresh);window.addEventListener('yohaku-design-demo-change',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('yohaku-design-demo-change',refresh);};},[]);
 return <><Home bookingPath={bookingPath} design={design}/><div className="demo-editor-entry"><a href={editorPath}>店舗オーナー向け・デザイン編集を試す ↗</a><p>架空店舗の管理画面デモです。本番公開は行いません。</p></div></>;
}
