/** 自由なHTML・CSS・URLを持たない、編集可能ブロックの固定スキーマ。 */
export const sectionIds=['news','about','menu','first-visit','staff','faq','access','reservation'] as const;
export type SectionId=typeof sectionIds[number];
export type DesignImage={kind:'default'}|{kind:'inline';data:string}|{kind:'stored';path:string};
export type DesignSettings={
 schemaVersion:1;
 theme:{main:string;background:string;text:string;accent:string;font:'classic'|'modern'|'soft';button:'square'|'rounded'|'pill';spacing:'compact'|'standard'|'airy'};
 layout:{template:'calm'|'editorial'|'compact';imagePosition:'left'|'right';columns:'auto'|'one'|'two';cards:'flat'|'outlined'|'soft'};
 hero:{headline:string;subcopy:string;bookingLabel:string;image:DesignImage;alt:string};
 sections:{id:SectionId;visible:boolean;heading:string;description:string}[];
};
export const sectionNames:Record<SectionId,string>={news:'お知らせ',about:'余白について',menu:'メニュー・料金','first-visit':'初めての方へ',staff:'スタッフ',faq:'よくある質問',access:'アクセス',reservation:'予約案内'};
export const defaultDesign:DesignSettings={schemaVersion:1,theme:{main:'#282A2C',background:'#F7F5F1',text:'#282A2C',accent:'#B39A75',font:'classic',button:'square',spacing:'standard'},layout:{template:'calm',imagePosition:'right',columns:'auto',cards:'soft'},hero:{headline:'整えることを、\n日常に。',subcopy:'仕事帰りにも、休日にも。\n自分のからだと向き合う、心地よい時間を。',bookingLabel:'WEB予約デモへ',image:{kind:'default'},alt:'柔らかな自然光が差し込む、木とアイボリーを基調とした施術室のイメージ'},sections:[
 {id:'news',visible:true,heading:'お知らせ',description:'整体室 余白のデザインプレビューを制作しました。'},
 {id:'about',visible:true,heading:'からだを整える。\n毎日に、余白がうまれる。',description:'気づけば、ずっと同じ姿勢。\n休みの日も、なんとなく忙しい。\n\nそんな日々の中で、自分のための時間を少しだけ。\n余白は、気軽に立ち寄り、からだと向き合う場所を目指す\n整体室のデザインサンプルです。'},
 {id:'menu',visible:true,heading:'今日の自分に、ちょうどいいケア。',description:'時間とご希望に合わせて、3つのコース。\n料金はすべて税込のサンプル金額です。'},
 {id:'first-visit',visible:true,heading:'はじめての日も、\nいつもの自分で。',description:'難しい準備は、いりません。\nご予約からお帰りまでの流れをご紹介します。'},
 {id:'staff',visible:true,heading:'話しやすさも、心地よさのひとつ。',description:'小さなことも、気兼ねなく。\nお一人おひとりとの会話を大切にする想定です。'},
 {id:'faq',visible:true,heading:'気になることを、\n来る前に。',description:'初めての方からよくいただくご質問を\n想定してまとめました。'},
 {id:'access',visible:true,heading:'あなたの日常の、すぐそばに。',description:'仕事帰りにも、休日にも。\n通いやすい場所を、これから。'},
 {id:'reservation',visible:true,heading:'自分のための時間を、\nひとつ。',description:'忙しい毎日に、ほっとできるひとときを。'},
]};
export const copyDesign=(design:DesignSettings):DesignSettings=>JSON.parse(JSON.stringify(design));
const hex=/^#[0-9a-f]{6}$/i;
function luminance(color:string){if(!hex.test(color))return 0;const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
export function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
export const onColor=(color:string)=>contrast(color,'#FFFFFF')>=contrast(color,'#000000')?'#FFFFFF':'#000000';
const plain=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=max&&!/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(v);
function exact(value:unknown,keys:string[]):value is Record<string,unknown>{return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k));}
export function validImage(image:unknown):image is DesignImage {
 if(exact(image,['kind'])&&image.kind==='default')return true;
 if(exact(image,['kind','path'])&&image.kind==='stored')return typeof image.path==='string'&&/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/i.test(image.path);
 if(exact(image,['kind','data'])&&image.kind==='inline'&&typeof image.data==='string'&&image.data.length<=2200000){const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.data);if(!match)return false;try{const bytes=atob(match[2].slice(0,48));return match[1]==='png'?bytes.startsWith('\x89PNG\r\n\x1a\n'):match[1]==='jpeg'?bytes.startsWith('\xff\xd8\xff'):bytes.startsWith('RIFF')&&bytes.slice(8,12)==='WEBP';}catch{return false;}}
 return false;
}
export function parseDesign(value:unknown):DesignSettings|null {
 if(!exact(value,['schemaVersion','theme','layout','hero','sections'])||value.schemaVersion!==1)return null;
 const {theme:t,layout:l,hero:h,sections:s}=value;
 if(!exact(t,['main','background','text','accent','font','button','spacing'])||!['main','background','text','accent'].every(k=>typeof t[k]==='string'&&hex.test(t[k] as string))||!['classic','modern','soft'].includes(t.font as string)||!['square','rounded','pill'].includes(t.button as string)||!['compact','standard','airy'].includes(t.spacing as string))return null;
 if(!exact(l,['template','imagePosition','columns','cards'])||!['calm','editorial','compact'].includes(l.template as string)||!['left','right'].includes(l.imagePosition as string)||!['auto','one','two'].includes(l.columns as string)||!['flat','outlined','soft'].includes(l.cards as string))return null;
 if(!exact(h,['headline','subcopy','bookingLabel','image','alt'])||!plain(h.headline,80)||!plain(h.subcopy,200)||!plain(h.bookingLabel,24)||!plain(h.alt,140)||!validImage(h.image))return null;
 if(!Array.isArray(s)||s.length!==sectionIds.length||new Set(s.map(x=>x?.id)).size!==sectionIds.length||s.some(x=>!exact(x,['id','visible','heading','description'])||!sectionIds.includes(x.id as SectionId)||typeof x.visible!=='boolean'||!plain(x.heading,80)||!plain(x.description,500)))return null;
 return copyDesign(value as unknown as DesignSettings);
}
export function designErrors(design:DesignSettings):string[]{const errors:string[]=[];if(!parseDesign(design))errors.push('入力形式や文字数をご確認ください。空欄にはできません。');if(hex.test(design.theme.text)&&hex.test(design.theme.background)&&contrast(design.theme.text,design.theme.background)<4.5)errors.push('文字色と背景色のコントラストは4.5以上にしてください。');return errors;}
export function safeDesign(value:unknown):DesignSettings {const parsed=parseDesign(value);return parsed&&designErrors(parsed).length===0?parsed:copyDesign(defaultDesign);}
function mix(a:string,b:string,weight:number){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-weight)+parseInt(b.slice(i,i+2),16)*weight).toString(16).padStart(2,'0')).join('');}
export function designVariables(d:DesignSettings){
 const surface=mix(d.theme.background,d.theme.text,.05),muted=mix(d.theme.text,d.theme.background,.22);
 const safeSurface=contrast(surface,d.theme.text)>=4.5?surface:d.theme.background;
 const cta=d.theme.background.toUpperCase()==='#F7F5F1'&&d.theme.accent.toUpperCase()==='#B39A75'?'#C7B9A7':mix(d.theme.background,d.theme.accent,.55);
 const safeCta=contrast(cta,d.theme.text)>=4.5?cta:d.theme.background;
 const readable=(color:string)=>[d.theme.background,safeSurface].every(bg=>contrast(color,bg)>=4.5);
 const accent=readable(d.theme.accent)?d.theme.accent:readable(mix(d.theme.accent,d.theme.text,.65))?mix(d.theme.accent,d.theme.text,.65):d.theme.text;
 const font={classic:'"Yu Mincho","Hiragino Mincho ProN",Georgia,serif',modern:'"Hiragino Kaku Gothic ProN","Yu Gothic",Meiryo,sans-serif',soft:'"Hiragino Maru Gothic ProN","Yu Gothic",Meiryo,sans-serif'};
 return {'--paper':d.theme.background,'--ink':d.theme.text,'--main':d.theme.main,'--on-main':onColor(d.theme.main),'--gold':d.theme.accent,'--accent':accent,'--muted':readable(muted)?muted:d.theme.text,'--surface':safeSurface,'--cta-surface':safeCta,'--on-accent':onColor(d.theme.accent),'--sand':d.theme.accent,'--serif':font[d.theme.font],'--sans':d.theme.font==='classic'?font.modern:font[d.theme.font],'--button-radius':{square:'3px',rounded:'13px',pill:'999px'}[d.theme.button],'--section-space':{compact:'80px',standard:'110px',airy:'145px'}[d.theme.spacing],'--mobile-section-space':{compact:'52px',standard:'68px',airy:'86px'}[d.theme.spacing]};
}
