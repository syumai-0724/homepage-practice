/* データからFAQを作り、開閉・カテゴリー・質問/回答検索を行います。 */
(function(){
 "use strict";
 const data=window.NagiFAQData;
 if(!Array.isArray(data))return;
 const normalize=value=>String(value).normalize("NFKC").toLocaleLowerCase("ja-JP").trim();
 const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 for(const [instance,widget] of Array.from(document.querySelectorAll("[data-faq]")).entries()){
  const search=widget.querySelector('input[type="search"]'),categories=widget.querySelector("[data-faq-categories]"),groups=widget.querySelector("[data-faq-groups]"),counter=widget.querySelector("[data-faq-count]"),empty=widget.querySelector("[data-faq-empty]"),reset=widget.querySelector("[data-faq-reset]");
  let selected="all";const entries=[],buttons=[],sections=[];const categoryHeading=widget.dataset.faqHeading==="2"?"h2":"h3";const questionHeading=categoryHeading==="h2"?"h3":"h4";
  const total=data.reduce((n,c)=>n+c.items.length,0);
  function addText(parent,tag,value,cls){const element=document.createElement(tag);element.textContent=value;if(cls)element.className=cls;parent.append(element);return element;}
  for(const category of [{id:"all",title:"すべて",count:total},...data.map(c=>({id:c.id,title:c.title,count:c.items.length}))]){
   const button=addText(categories,"button",category.title+"（"+category.count+"）");button.type="button";button.dataset.category=category.id;button.setAttribute("aria-pressed",String(category.id===selected));button.setAttribute("aria-controls",groups.id);button.addEventListener("click",()=>{selected=category.id;filter();});buttons.push(button);
  }
  for(const category of data){
   const section=document.createElement("section");section.className="faq-group";const heading=addText(section,categoryHeading,category.title);heading.id="faq-category-"+instance+"-"+category.id;section.setAttribute("aria-labelledby",heading.id);groups.append(section);sections.push({id:category.id,element:section});
   for(const item of category.items){
    const article=document.createElement("article");article.className="faq-item";const heading=document.createElement(questionHeading);heading.className="faq-question-heading";const button=document.createElement("button");button.type="button";button.className="faq-question";button.id="faq-question-"+instance+"-"+item.id;button.setAttribute("aria-expanded","false");button.setAttribute("aria-controls","faq-answer-"+instance+"-"+item.id);
    addText(button,"span","Q","faq-q").setAttribute("aria-hidden","true");addText(button,"span",item.question,"faq-question-text");const icon=addText(button,"span","＋","faq-icon");icon.setAttribute("aria-hidden","true");heading.append(button);article.append(heading);
    const panel=document.createElement("div");panel.id="faq-answer-"+instance+"-"+item.id;panel.className="faq-panel";panel.hidden=true;panel.inert=true;panel.setAttribute("role","group");panel.setAttribute("aria-labelledby",button.id);const inner=document.createElement("div");inner.className="faq-panel-inner";const content=document.createElement("div");content.className="faq-answer-text";if(item.needsConfirmation)addText(content,"span","要確認","faq-pending");addText(content,"p",item.answer);inner.append(content);panel.append(inner);article.append(panel);section.append(article);
    let timer;
    button.addEventListener("click",()=>{
     clearTimeout(timer);const open=button.getAttribute("aria-expanded")!=="true";button.setAttribute("aria-expanded",String(open));icon.textContent=open?"−":"＋";article.classList.toggle("is-open",open);panel.inert=!open;
     if(open){panel.hidden=false;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(button.getAttribute("aria-expanded")==="true")panel.classList.add("is-open");}));}
     else {panel.classList.remove("is-open");if(reduced())panel.hidden=true;else timer=setTimeout(()=>{if(button.getAttribute("aria-expanded")==="false")panel.hidden=true;},250);}
    });
    entries.push({element:article,category:category.id,search:normalize(item.question+" "+item.answer+" "+category.title)});
   }
  }
  function filter(){
   const terms=normalize(search.value).split(/\s+/).filter(Boolean);let visible=0;
   for(const entry of entries){const show=(selected==="all"||entry.category===selected)&&terms.every(term=>entry.search.includes(term));entry.element.hidden=!show;if(show)visible++;}
   for(const group of sections)group.element.hidden=!entries.some(e=>e.category===group.id&&!e.element.hidden);
   for(const button of buttons)button.setAttribute("aria-pressed",String(button.dataset.category===selected));
   empty.hidden=visible!==0;const title=data.find(c=>c.id===selected)?.title;
   counter.textContent=(title?title+"：":"")+visible+"件の質問"+(terms.length?"（検索結果）":"");
  }
  search.addEventListener("input",filter);reset.addEventListener("click",()=>{selected="all";search.value="";filter();search.focus();});filter();
 }
})();
