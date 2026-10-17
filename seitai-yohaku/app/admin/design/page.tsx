import type { Metadata } from 'next';
import DesignEditor from '@/components/design-editor';
export const metadata:Metadata={title:'店舗オーナー向け デザイン編集デモ｜整体室 余白',robots:{index:false,follow:false}};
export default function Page(){return <DesignEditor/>;}
