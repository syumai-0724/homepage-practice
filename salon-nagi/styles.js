// 選んだカテゴリーのスタイルだけを表示します。
(function(){
  "use strict";
  const buttons=Array.from(document.querySelectorAll("[data-filter]"));
  const cards=Array.from(document.querySelectorAll("#style-grid .style-card"));
  const count=document.getElementById("style-count");
  for(const button of buttons){button.addEventListener("click",()=>{
    const filter=button.dataset.filter;
    for(const item of buttons)item.setAttribute("aria-pressed",String(item===button));
    let visible=0;
    for(const card of cards){const show=filter==="すべて"||card.dataset.category.split(" ").includes(filter);card.hidden=!show;if(show)visible++;}
    count.textContent=(filter==="すべて"?"":filter+"：")+visible+"件のスタイル";
  });}
})();
