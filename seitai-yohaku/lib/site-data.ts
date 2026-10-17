/** このファイルの店舗・人物・料金・営業時間は、すべて編集可能な架空の仮データです。 */
export const site = {
  name: '整体室 余白', reading: 'せいたいしつ よはく', english: 'YOHAKU',
  tagline: '整えることを、日常に。',
  subcopy: '仕事帰りにも、休日にも。自分のからだと向き合う、心地よい時間を。',
  address: null as string | null,
  phone: null as string | null,
  access: '所在地・アクセスは準備中です。',
  sampleHours: '10:00–20:00', sampleHoliday: '水曜日',
  booking: { status: 'demo' as const, externalUrl: '' },
};
export const navigation = [
  { href: '#about', label: '余白について' },
  { href: '#menu', label: 'メニュー・料金' },
  { href: '#first-visit', label: '初めての方へ' },
  { href: '#staff', label: 'スタッフ' },
  { href: '#faq', label: 'よくある質問' },
  { href: '#access', label: 'アクセス' },
];
export const menus = [
  { id: 'short', name: 'ショートケア', english: 'QUICK RESET', duration: 30, price: 3800,
    caption: '忙しい毎日に、短い休息を。', description: '気になる箇所を中心に、短時間でからだをいたわるコースです。まとまった時間を取りにくい方に。',
    detail: 'ご希望を伺い、首・肩まわりなど気になる部分を中心に施術する想定のコースです。カウンセリングやお着替えの時間は別途お取りする仮設定です。', label: 'すきま時間に', recommended: false },
  { id: 'standard', name: '全身バランスケア', english: 'WHOLE BODY', duration: 60, price: 6600,
    caption: '自分のからだを、ひと通り。', description: 'その日の状態やお悩みを伺いながら、全身を丁寧にケア。初めての方にもおすすめのコースです。',
    detail: '生活習慣や気になる箇所について相談し、全身をケアする想定のコースです。無理な力を加えない方針のイメージであり、実際の施術方法は納品する店舗への確認が必要です。', label: '初めての方にも', recommended: true },
  { id: 'long', name: 'ゆったり全身ケア', english: 'DEEP REST', duration: 90, price: 9000,
    caption: '今日は、ゆっくり整える日。', description: '全身のケアに、気になる部分への時間をプラス。自分のための時間をゆっくり取りたい方に。',
    detail: '全身をケアしながら、ご相談の多い箇所にも時間を取る想定のコースです。ご希望や状態に応じて内容を相談する仮設定です。', label: 'じっくり相談したい日に', recommended: false },
];
export type Treatment = (typeof menus)[number];
export const features = [
  { icon: 'clock', title: '日常の予定に、なじむ。', description: '仕事の合間や帰り道にも立ち寄れる、30分からのメニュー。自分のペースで、無理なく。' },
  { icon: 'price', title: '選ぶ前に、料金がわかる。', description: '時間と税込料金を、分かりやすく。初めての方も、納得してから選べるメニューをご用意。' },
  { icon: 'chat', title: '話すことから、はじめる。', description: '気になることも、小さな違和感も。まずはお話を伺い、施術の内容を一緒に考えます。' },
];
export const steps = [
  { number: '01', title: 'WEBからご予約', copy: 'メニューとご希望の日時を選択。現在はサンプルの空き時間で予約の流れを体験できます。' },
  { number: '02', title: 'お話を、じっくり', copy: '気になる箇所や日々の過ごし方を伺い、施術の内容をご相談します。' },
  { number: '03', title: '状態に合わせてケア', copy: 'ご希望を確認しながら進める想定です。強さなども遠慮なくご相談ください。' },
  { number: '04', title: '日常へ、ゆっくりと', copy: '施術後の状態や、日常で気をつけたいことを一緒に振り返ります。' },
];
export const staff = [
  { id: 'ao', name: '青木 悠', reading: 'HARU AOKI', initials: 'HA', role: 'スタッフ紹介サンプル',
    message: '「うまく説明できない」からでも、大丈夫。いつもの過ごし方を、一緒に振り返るところから。', focus: 'デスクワークの方へのヒアリング' },
  { id: 'mi', name: '三浦 栞', reading: 'SHIORI MIURA', initials: 'SM', role: 'スタッフ紹介サンプル',
    message: '忙しい日々の中で、ひと息つける場所に。初めての方にも、気軽に話していただける時間を。', focus: '初めての方の不安に寄り添うご案内' },
];
export const faqs = [
  { question: '整体が初めてでも大丈夫ですか？', answer: '初めての方にも分かりやすくご案内する方針のサンプルです。気になることや施術へのご希望は、事前にご相談いただける構成にしています。実際の受付条件は店舗にご確認ください。' },
  { question: 'どのメニューを選べばよいですか？', answer: '初めての方には、60分の全身バランスケアを目安としてご紹介しています。お時間やご希望に合わせて相談する想定です。掲載している料金・施術内容は仮設定です。' },
  { question: 'どんな服装で行けばよいですか？', answer: '動きやすく、締め付けの少ない服装をおすすめする想定です。お着替えの貸し出しの有無は未設定のため、実際の店舗での運用開始前に確認します。' },
  { question: '予約の変更やキャンセルはできますか？', answer: '予約デモの完了画面から、日時変更・キャンセルの流れを体験できます。実際の予約は成立せず、記録はページを開いている間だけ有効です。本番の受付期限やキャンセル料などは未設定です。' },
  { question: '支払い方法は何がありますか？', answer: '決済方法は未設定です。実際に利用できるお支払い方法を確認したうえで掲載します。現在のサイトには決済機能はありません。' },
];
export const news = { date: '2026.10.17', label: 'お知らせ', text: '整体室 余白のデザインプレビューを制作しました。' };
export const money = (price: number) => price.toLocaleString('ja-JP');
