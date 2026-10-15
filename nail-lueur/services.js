/* 通信を行わないデモ用アダプター。将来のバックエンド接続箇所です。 */
(function(root){
'use strict';
const api={
 async completeReservation(selection){
  // 氏名・メール・電話・備考を受け取らず、送信も永続保存もしません。
  return {demo:true,reference:'DEMO-'+Date.now().toString(36).toUpperCase()};
 },
 async completeContact(){return {demo:true};}
};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.LueurServices=api;
})(typeof window!=='undefined'?window:globalThis);
