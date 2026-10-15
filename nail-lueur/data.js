/* メニュー・料金・オプション・ギャラリー・FAQ・仮予約時間はここで一元管理します。 */
(function(root){const data={
  "brand": "Nail Salon Lueur",
  "shop": {
    "address": null,
    "phone": null,
    "hours": null,
    "holiday": null,
    "access": null,
    "parking": null
  },
  "schedule": {
    "start": 600,
    "end": 1080,
    "step": 15,
    "closedWeekdays": [
      3
    ],
    "horizon": 90,
    "label": "デモ専用：10:00〜18:00／水曜休み"
  },
  "menus": [
    {
      "id": "one",
      "name": "ワンカラー",
      "price": 5500,
      "duration": 60,
      "category": "ジェル",
      "description": "肌になじむ一色を、丁寧に。指先の美しさをさりげなく引き立てるベーシックな仕上がり。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "gradation",
      "name": "グラデーション",
      "price": 6000,
      "duration": 75,
      "category": "ジェル",
      "description": "根元から爪先へ、自然に移ろう色の重なり。やわらかな印象を楽しむデザイン。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "french",
      "name": "フレンチネイル",
      "price": 7000,
      "duration": 90,
      "category": "ジェル",
      "description": "爪先の繊細なラインで、凛とした表情に。上品なコントラストを楽しみたい方へ。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "magnet",
      "name": "マグネットネイル",
      "price": 6500,
      "duration": 75,
      "category": "ジェル",
      "description": "光の角度で表情が変わる、奥行きのある輝き。控えめな華やかさを添えます。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "simple",
      "name": "定額シンプルコース",
      "price": 7500,
      "duration": 90,
      "category": "デザイン",
      "description": "さりげないアクセントを加えたデザインから選ぶ、日常になじむサンプルコース。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "design",
      "name": "定額デザインコース",
      "price": 9000,
      "duration": 120,
      "category": "デザイン",
      "description": "色や質感の組み合わせを楽しむ、少し特別な指先のためのサンプルコース。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "custom",
      "name": "持ち込みデザイン",
      "price": 10000,
      "duration": 120,
      "category": "デザイン",
      "description": "希望のイメージをもとにご相談するメニュー。再現できる範囲・価格・所要時間は事前確認が必要です。",
      "fromPrice": true,
      "fromDuration": true
    },
    {
      "id": "care",
      "name": "ネイルケア",
      "price": 3500,
      "duration": 45,
      "category": "ケア・オフ",
      "description": "爪の形や指先の印象を整えるためのケアメニュー。実際の施術内容は店舗確認後にご案内します。",
      "fromPrice": false,
      "fromDuration": false
    },
    {
      "id": "off",
      "name": "ジェルオフのみ",
      "price": 3000,
      "duration": 45,
      "category": "ケア・オフ",
      "description": "付け替えを伴わないジェルオフのサンプルメニュー。素材や状態による対応範囲は要確認です。",
      "fromPrice": false,
      "fromDuration": false
    }
  ],
  "options": [
    {
      "id": "none",
      "name": "オフなし",
      "price": 0,
      "duration": 0,
      "type": "off"
    },
    {
      "id": "our-off",
      "name": "ジェル付け替えオフ",
      "price": 1100,
      "duration": 30,
      "type": "off"
    },
    {
      "id": "other-off",
      "name": "他店ジェル付け替えオフ",
      "price": 1650,
      "duration": 45,
      "type": "off"
    },
    {
      "id": "art",
      "name": "追加アート（サンプル1本）",
      "price": 550,
      "duration": 15,
      "type": "extra"
    },
    {
      "id": "care-plus",
      "name": "保湿ケア追加",
      "price": 880,
      "duration": 15,
      "type": "extra"
    }
  ],
  "gallery": [
    {
      "id": "silk",
      "name": "Silk Beige",
      "category": "シンプル",
      "menu": "one",
      "tile": 0,
      "description": "素肌に溶け込む、やわらかなヌードベージュ。"
    },
    {
      "id": "rose",
      "name": "Rose Veil",
      "category": "オフィス",
      "menu": "gradation",
      "tile": 1,
      "description": "手元を静かに彩る、ダスティローズのグラデーション。"
    },
    {
      "id": "nuance",
      "name": "Golden Whisper",
      "category": "ニュアンス",
      "menu": "design",
      "tile": 2,
      "description": "透け感と繊細なゴールドを重ねたニュアンスデザイン。"
    },
    {
      "id": "moon",
      "name": "Champagne Moon",
      "category": "マグネット",
      "menu": "magnet",
      "tile": 3,
      "description": "光を集めて、角度で移ろうシャンパンの輝き。"
    },
    {
      "id": "french-ivory",
      "name": "Ivory Line",
      "category": "フレンチ",
      "menu": "french",
      "tile": 4,
      "description": "繊細な白いラインが引き立てる、清潔感のある指先。"
    },
    {
      "id": "autumn",
      "name": "Autumn Poetry",
      "category": "季節限定",
      "menu": "simple",
      "tile": 5,
      "description": "やわらかなモーヴと、ひとひらのゴールド。"
    }
  ],
  "faq": [
    {
      "id": "booking",
      "title": "予約について",
      "items": [
        {
          "id": "booking-1",
          "question": "当日予約はできますか？",
          "answer": "当日の受付可否や締切時間は要確認です。デモでは当日の未来の空き枠を選べますが、実際の予約は成立しません。",
          "pending": true
        },
        {
          "id": "booking-2",
          "question": "予約の変更・キャンセルはできますか？",
          "answer": "変更・キャンセルの方法や期限は、店舗の規定を確認後にご案内します。このデモは予約情報を保存しないため、実際の予約変更やキャンセルは行いません。",
          "pending": true
        },
        {
          "id": "booking-3",
          "question": "初めてでも予約できますか？",
          "answer": "初めての方にも使いやすい予約の流れを想定しています。実際の受付条件や事前の相談方法は、店舗確認後にご案内します。",
          "pending": true
        },
        {
          "id": "booking-4",
          "question": "指名予約はできますか？",
          "answer": "担当者の指名制度や指名料は要確認です。今回のデモは1席分を想定した予約体験で、スタッフの指名機能は設けていません。",
          "pending": true
        },
        {
          "id": "booking-5",
          "question": "予約時間に遅れる場合はどうすればいいですか？",
          "answer": "遅れる場合の連絡方法と、施術時間の変更などの対応は要確認です。正式な連絡先の公開後に、分かった時点で店舗へご相談ください。",
          "pending": true
        }
      ]
    },
    {
      "id": "treatment",
      "title": "施術について",
      "items": [
        {
          "id": "treatment-1",
          "question": "ネイルが初めてでも大丈夫ですか？",
          "answer": "初めての方は、普段の過ごし方や好きな色を整理しておくと相談しやすくなります。実際のカウンセリングの方法や対応範囲は、店舗確認後にご案内します。",
          "pending": true
        },
        {
          "id": "treatment-2",
          "question": "爪が短くてもジェルネイルはできますか？",
          "answer": "短い爪でも楽しめるデザインはありますが、施術できるかどうかは爪の状態によって異なります。長さに不安がある場合は、施術前に担当者へご相談ください。",
          "pending": false
        },
        {
          "id": "treatment-3",
          "question": "デザインが決まっていなくても大丈夫ですか？",
          "answer": "色や雰囲気のイメージだけでも、相談の手がかりになります。ギャラリーで気になるデザインをお気に入りにしておくのもおすすめです。相談時間や受付方法は要確認です。",
          "pending": true
        },
        {
          "id": "treatment-4",
          "question": "持ち込みデザインはできますか？",
          "answer": "サンプルメニューに持ち込みデザインを用意しています。画像の再現範囲、素材、追加料金、所要時間は店舗確認が必要です。",
          "pending": true
        },
        {
          "id": "treatment-5",
          "question": "施術時間はどれくらいですか？",
          "answer": "このデモではメニューごとに45〜120分以上の目安を設定しています。オフや追加アートを選ぶと、仮設定の時間が加算されます。実際の時間は爪の状態やデザインによって変わるため、事前にご確認ください。",
          "pending": true
        },
        {
          "id": "treatment-6",
          "question": "ジェルネイルはどれくらい持ちますか？",
          "answer": "持ちのよさは、爪の状態や生活習慣、使用する材料によって変わります。一律の期間を保証できるものではないため、付け替えの目安やお手入れ方法は担当者にご確認ください。",
          "pending": false
        },
        {
          "id": "treatment-7",
          "question": "爪が傷んでいても施術できますか？",
          "answer": "爪の状態によっては、施術を控えたほうがよい場合があります。気になる状態がある場合は無理に施術を進めず、事前に担当者へご相談ください。",
          "pending": false
        }
      ]
    },
    {
      "id": "price",
      "title": "料金について",
      "items": [
        {
          "id": "price-1",
          "question": "表示料金以外に追加料金はありますか？",
          "answer": "料金表とオプション金額はすべて税込のサンプルです。デモでは選択した内容の合計目安を確認できますが、実際の追加料金や適用条件は要確認です。",
          "pending": true
        },
        {
          "id": "price-2",
          "question": "支払い方法は何がありますか？",
          "answer": "現金・クレジットカード・電子マネーなどの対応状況は、現在未設定です。利用できる方法は店舗確認後に掲載します。デモでは決済は行いません。",
          "pending": true
        },
        {
          "id": "price-3",
          "question": "オフ料金はいくらですか？",
          "answer": "サンプルでは、オフのみ3,000円、付け替えオフは1,100円または1,650円の仮設定です。実際の金額と対応できる素材は要確認です。予約画面で選択内容に応じた合計を確認できます。",
          "pending": true
        },
        {
          "id": "price-4",
          "question": "キャンセル料はかかりますか？",
          "answer": "キャンセル料の有無、発生する時期、金額は未設定です。正式な店舗ルールを確認後に掲載します。デモの操作で料金が請求されることはありません。",
          "pending": true
        }
      ]
    },
    {
      "id": "visit",
      "title": "来店について",
      "items": [
        {
          "id": "visit-1",
          "question": "駐車場はありますか？",
          "answer": "駐車場や提携駐車場の有無は、現在未設定です。住所・アクセス情報とあわせて、店舗確認後にご案内します。",
          "pending": true
        },
        {
          "id": "visit-2",
          "question": "子どもを連れて来店できますか？",
          "answer": "お子さま同伴の可否や待ち合い設備は要確認です。正式な連絡先の公開後に、お子さまの年齢などを添えて事前にご相談ください。",
          "pending": true
        },
        {
          "id": "visit-3",
          "question": "施術前に爪を切っておく必要はありますか？",
          "answer": "ご希望の形や長さによって案内が異なるため、自己判断で短く切りすぎないほうが相談しやすい場合があります。来店前の準備については、施術内容に合わせた店舗の案内をご確認ください。",
          "pending": false
        },
        {
          "id": "visit-4",
          "question": "ハンドクリームを塗って来店しても大丈夫ですか？",
          "answer": "来店前の保湿や化粧品の使用については、施術内容や使用する材料により案内が異なります。普段使っているものや気になる点があれば、施術前に担当者へお伝えください。",
          "pending": false
        }
      ]
    }
  ]
};if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.LueurData=data;})(typeof window!=="undefined"?window:globalThis);
