/* 予約先の決定のみを担当。デモのフォーム・カレンダーとは独立しています。 */
(function(root){
  'use strict';
  function externalUrl(config){
    try{
      const value=typeof config?.externalUrl==='string'?config.externalUrl.trim():'';
      if(!value)return null;
      const url=new URL(value);
      // 外部サービスの公開予約URLのみ。実行可能URLや認証情報入りURLは使いません。
      if(url.protocol!=='https:'||!url.hostname||url.username||url.password)return null;
      return url.href;
    }catch(e){return null;}
  }
  function resolve(config,selection={}){
    const url=externalUrl(config);
    if(url)return {mode:'external',href:url};
    const params=new URLSearchParams();
    for(const key of ['menu','design']){
      const value=selection[key];
      if(typeof value==='string'&&/^[a-z0-9-]+$/i.test(value))params.set(key,value);
    }
    return {mode:'demo',href:'reservation.html'+(params.size?'?'+params.toString():'')};
  }
  const api={externalUrl,resolve};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.LueurBooking=api;
})(typeof globalThis!=='undefined'?globalThis:this);
