/* 外部予約サービスの設定。公開可能な予約ページのURLだけを記入してください。 */
(function(root){
  'use strict';
  const config = {
    // 未設定（空文字）の間は、学習用の予約デモへ案内します。
    // 例: externalUrl: 'https://example.com/your-salon',
    // 別のサービスに切り替えるときも、このURLだけを変更します。
    externalUrl: ''
  };
  if(typeof module==='object'&&module.exports)module.exports=config;
  else root.LueurBookingConfig=config;
})(typeof globalThis!=='undefined'?globalThis:this);
