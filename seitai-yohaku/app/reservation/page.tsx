import type { Metadata } from 'next';
import Booking from '@/components/booking';
export const metadata: Metadata = { title:'WEB予約デモ｜整体室 余白',description:'整体室 余白の学習用予約デモ。メニュー・日時選択、入力確認、完了・変更・キャンセルの流れを体験できます。実際の予約は成立しません。' };
export default function Page(){return <Booking/>;}
