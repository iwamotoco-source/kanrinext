window.ELECTRICAL_KNOWLEDGE = {
  "schemaVersion": 1,
  "version": "2026.10.05.1",
  "title": "電気技術データベース",
  "updatedAt": "2026-10-05",
  "scope": "内線規程関連119テーマと実務補足10テーマ。規程全文・全表・地域別事項・例外条件を網羅したものではありません。",
  "categories": [
    "設計の基本",
    "環境・特殊場所",
    "法規・保安",
    "試験・保守",
    "接地・雷保護",
    "保護・盤",
    "構内・外線",
    "弱電・制御",
    "高圧・受変電",
    "配線・配管",
    "照明・器具",
    "特殊設備",
    "動力・電熱",
    "発電・蓄電・EV"
  ],
  "entries": [
    {
      "id": "electrical-001",
      "title": "対地電圧と接触時の安全性",
      "category": "設計の基本",
      "keywords": [
        "対地電圧の制限",
        "単線結線図の接地方式",
        "対地電圧の測定点",
        "使用場所の制限"
      ],
      "summary": "同じ線間電圧でも接地方式によって対地電圧は変わる。",
      "body": "同じ線間電圧でも接地方式によって対地電圧は変わる。感電防止の検討では、機器に表示された定格電圧だけでなく、中性点の接地と使用場所を含めて判断する。",
      "checks": [
        "単線結線図の接地方式",
        "対地電圧の測定点",
        "使用場所の制限"
      ],
      "referenceNumber": 1,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1300%e7%af%80%e3%80%80%e5%af%be%e5%9c%b0%e9%9b%bb%e5%9c%a7%e3%81%ae%e5%88%b6%e9%99%90/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1300%e7%af%80%e3%80%80%e5%af%be%e5%9c%b0%e9%9b%bb%e5%9c%a7%e3%81%ae%e5%88%b6%e9%99%90/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-002",
      "title": "単相負荷を各相に配分する",
      "category": "設計の基本",
      "keywords": [
        "不平衡負荷の制限及び特殊な機械器具",
        "相別負荷集計",
        "単相機器の同時使用",
        "中性線の電流"
      ],
      "summary": "単相負荷が一つの相に集中すると、相電流の偏りや中性線電流の増加につながる。",
      "body": "単相負荷が一つの相に集中すると、相電流の偏りや中性線電流の増加につながる。盤ごとの回路配分を作り、実際の同時使用を考慮して各相の負荷を比較する。",
      "checks": [
        "相別負荷集計",
        "単相機器の同時使用",
        "中性線の電流"
      ],
      "referenceNumber": 2,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1305%e7%af%80-%e4%b8%8d%e5%b9%b3%e8%a1%a1%e8%b2%a0%e8%8d%b7%e3%81%ae%e5%88%b6%e9%99%90%e5%8f%8a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1305%e7%af%80-%e4%b8%8d%e5%b9%b3%e8%a1%a1%e8%b2%a0%e8%8d%b7%e3%81%ae%e5%88%b6%e9%99%90%e5%8f%8a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-003",
      "title": "末端電圧から配線を選ぶ",
      "category": "設計の基本",
      "keywords": [
        "電圧降下(1310節)の許容値とこう長早見表",
        "片道こう長",
        "力率と負荷電流",
        "幹線と分岐の合計"
      ],
      "summary": "長い配線では導体抵抗とリアクタンスによる電圧降下が生じる。",
      "body": "長い配線では導体抵抗とリアクタンスによる電圧降下が生じる。常用負荷の電流だけでなく電動機の始動時も検討し、機器端子で必要な電圧を確保できる線径と経路を選ぶ。",
      "checks": [
        "片道こう長",
        "力率と負荷電流",
        "幹線と分岐の合計"
      ],
      "referenceNumber": 3,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1310%e7%af%80%e9%9b%bb%e5%9c%a7%e9%99%8d%e4%b8%8b1310-1%e3%80%94%e9%9b%bb%e5%9c%a7%e9%99%8d%e4%b8%8b/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1310%e7%af%80%e9%9b%bb%e5%9c%a7%e9%99%8d%e4%b8%8b1310-1%e3%80%94%e9%9b%bb%e5%9c%a7%e9%99%8d%e4%b8%8b/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-004",
      "title": "塩害に備える機器と経路",
      "category": "環境・特殊場所",
      "keywords": [
        "塩害を受けるおそれがある電気設備",
        "海風の方向",
        "外箱と支持材の防食",
        "端子周りの汚損"
      ],
      "summary": "海塩粒子は金属の腐食や絶縁表面の汚損を進める。",
      "body": "海塩粒子は金属の腐食や絶縁表面の汚損を進める。屋外盤や支持材は材質・防食処理を選び、雨水の流入防止と点検しやすい配置を合わせて検討する。",
      "checks": [
        "海風の方向",
        "外箱と支持材の防食",
        "端子周りの汚損"
      ],
      "referenceNumber": 4,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1320%e7%af%80-%e5%a1%a9%e5%ae%b3%e3%82%92%e5%8f%97%e3%81%91%e3%82%8b%e3%81%8a%e3%81%9d%e3%82%8c/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1320%e7%af%80-%e5%a1%a9%e5%ae%b3%e3%82%92%e5%8f%97%e3%81%91%e3%82%8b%e3%81%8a%e3%81%9d%e3%82%8c/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-005",
      "title": "充電部への接触を防ぐ",
      "category": "法規・保安",
      "keywords": [
        "充電部分の露出制限",
        "扉を開けた時の露出",
        "保守時の隔離",
        "一般利用者の接近"
      ],
      "summary": "感電を防ぐには充電部を覆うだけでなく、開扉時や作業時に誰が触れられるかを考える。",
      "body": "感電を防ぐには充電部を覆うだけでなく、開扉時や作業時に誰が触れられるかを考える。保護カバー、隔離、施錠、停止手順を使用者と保守担当者の行動に合わせて計画する。",
      "checks": [
        "扉を開けた時の露出",
        "保守時の隔離",
        "一般利用者の接近"
      ],
      "referenceNumber": 5,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1325%e7%af%80-%e5%85%85%e9%9b%bb%e9%83%a8%e5%88%86%e3%81%ae%e9%9c%b2%e5%87%ba%e5%88%b6%e9%99%90/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1325%e7%af%80-%e5%85%85%e9%9b%bb%e9%83%a8%e5%88%86%e3%81%ae%e9%9c%b2%e5%87%ba%e5%88%b6%e9%99%90/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-006",
      "title": "電気用品を用途に合わせる",
      "category": "法規・保安",
      "keywords": [
        "電気用品の使用制限など",
        "対象製品の表示",
        "定格と用途",
        "施工説明書"
      ],
      "summary": "製品の認証や表示は確認の入口であり、施工条件まで保証するものではない。",
      "body": "製品の認証や表示は確認の入口であり、施工条件まで保証するものではない。屋外、埋込、湿潤などの使用条件と、機器定格・端子仕様・施工説明書の適合を確認して採用する。",
      "checks": [
        "対象製品の表示",
        "定格と用途",
        "施工説明書"
      ],
      "referenceNumber": 6,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1330%e7%af%80-%e9%9b%bb%e6%b0%97%e7%94%a8%e5%93%81%e3%81%ae%e4%bd%bf%e7%94%a8%e5%88%b6%e9%99%90/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%ef%bd%9c1330%e7%af%80-%e9%9b%bb%e6%b0%97%e7%94%a8%e5%93%81%e3%81%ae%e4%bd%bf%e7%94%a8%e5%88%b6%e9%99%90/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-007",
      "title": "許容電流の補正を忘れない",
      "category": "設計の基本",
      "keywords": [
        "許容電流",
        "布設方法",
        "周囲温度と集合",
        "補正後の許容電流"
      ],
      "summary": "電線の許容電流は放熱条件によって変わる。",
      "body": "電線の許容電流は放熱条件によって変わる。種類と断面積を決めた後、周囲温度、同一管内の電線数、ケーブルの集合、断熱材との接触を確認し、補正後の値で保護装置を選ぶ。",
      "checks": [
        "布設方法",
        "周囲温度と集合",
        "補正後の許容電流"
      ],
      "referenceNumber": 7,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e8%a8%b1%e5%ae%b9%e9%9b%bb%e6%b5%81/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e8%a8%b1%e5%ae%b9%e9%9b%bb%e6%b5%81/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-008",
      "title": "絶縁抵抗を回路ごとに確認する",
      "category": "試験・保守",
      "keywords": [
        "電路の絶縁",
        "機器の切離し",
        "試験電圧",
        "測定時の接続状態"
      ],
      "summary": "絶縁抵抗は感電・漏電の防止を確認する指標の一つ。",
      "body": "絶縁抵抗は感電・漏電の防止を確認する指標の一つ。測定前に電子機器やSPDなどへの試験電圧の影響を確認し、回路の接続状態と測定条件を記録して結果を評価する。",
      "checks": [
        "機器の切離し",
        "試験電圧",
        "測定時の接続状態"
      ],
      "referenceNumber": 8,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e8%b7%af%e3%81%ae%e7%b5%b6%e7%b8%81/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e8%b7%af%e3%81%ae%e7%b5%b6%e7%b8%81/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "低圧配線の完成時絶縁抵抗",
          "value": "回路ごとに5MΩ以上。機器を接続した状態は1MΩ以上。",
          "condition": "公共建築の完成時試験の契約仕様。全施設に共通する法定最低値ではない。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.18.2",
            "pdfPage": 92
          }
        },
        {
          "title": "絶縁抵抗計の測定電圧",
          "value": "100V・200V・400V級は一般の場合500V。損傷のおそれがある制御機器等接続時はそれぞれ125V・250V・500V。",
          "condition": "表2.18.2。測定で損傷する機器の扱いはメーカー資料と照合。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.18.2",
            "pdfPage": 92
          }
        }
      ]
    },
    {
      "id": "electrical-009",
      "title": "接地方式を設備の役割から選ぶ",
      "category": "接地・雷保護",
      "keywords": [
        "接地工事の種類(A・B・C・D種)と接地抵抗値",
        "接地種別と対象機器",
        "遮断時間",
        "接地抵抗と導通"
      ],
      "summary": "接地には機器外箱の保護や変圧器の系統接地など異なる役割がある。",
      "body": "接地には機器外箱の保護や変圧器の系統接地など異なる役割がある。接地種別だけで完結させず、故障時の電流経路、遮断装置との協調、接地線の連続性を確認する。",
      "checks": [
        "接地種別と対象機器",
        "遮断時間",
        "接地抵抗と導通"
      ],
      "referenceNumber": 9,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e6%8e%a5%e5%9c%b0/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e6%8e%a5%e5%9c%b0/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-010",
      "title": "開閉器で安全に切り離す",
      "category": "保護・盤",
      "keywords": [
        "低圧開閉器",
        "開閉能力",
        "切離し範囲",
        "操作表示と施錠"
      ],
      "summary": "開閉器は通常の操作と保守の切離しに使う。",
      "body": "開閉器は通常の操作と保守の切離しに使う。負荷を流したまま開閉できる能力と、断路機能を区別し、操作位置の表示や施錠方法まで含めて誤操作を防ぐ。",
      "checks": [
        "開閉能力",
        "切離し範囲",
        "操作表示と施錠"
      ],
      "referenceNumber": 10,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%90%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%96%8b%e9%96%89%e5%99%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%90%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%96%8b%e9%96%89%e5%99%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-011",
      "title": "遮断器を電線と故障電流に合わせる",
      "category": "保護・盤",
      "keywords": [
        "過電流遮断器",
        "電線の保護",
        "遮断容量",
        "上位との協調"
      ],
      "summary": "遮断器は定格電流だけで選べない。",
      "body": "遮断器は定格電流だけで選べない。電線の許容電流、負荷の始動特性、設置点の短絡電流、上位遮断器との協調を照合し、事故時に安全に遮断できる組合せを選ぶ。",
      "checks": [
        "電線の保護",
        "遮断容量",
        "上位との協調"
      ],
      "referenceNumber": 11,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%91%e3%80%91%ef%bd%9c%e9%81%8e%e9%9b%bb%e6%b5%81%e9%81%ae%e6%96%ad%e5%99%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%91%e3%80%91%ef%bd%9c%e9%81%8e%e9%9b%bb%e6%b5%81%e9%81%ae%e6%96%ad%e5%99%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-012",
      "title": "雷保護を設備全体で考える",
      "category": "接地・雷保護",
      "keywords": [
        "雷保護装置",
        "避雷設備との接続",
        "SPDの段階配置",
        "通信線の保護"
      ],
      "summary": "外部雷保護と内部のサージ保護は対象が異なる。",
      "body": "外部雷保護と内部のサージ保護は対象が異なる。建物の接地・等電位ボンディングとSPDの配置を連携させ、電源だけでなく通信線から侵入するサージも検討する。",
      "checks": [
        "避雷設備との接続",
        "SPDの段階配置",
        "通信線の保護"
      ],
      "referenceNumber": 12,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%b7%e4%bf%9d%e8%ad%b7%e8%a3%85%e7%bd%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%b7%e4%bf%9d%e8%ad%b7%e8%a3%85%e7%bd%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-013",
      "title": "分電盤に保守の余裕を確保する",
      "category": "保護・盤",
      "keywords": [
        "配電盤及び分電盤",
        "操作と点検スペース",
        "予備回路",
        "回路表示"
      ],
      "summary": "盤の設計では回路数に加えて、操作空間、放熱、配線の曲げ、将来の増設を考える。",
      "body": "盤の設計では回路数に加えて、操作空間、放熱、配線の曲げ、将来の増設を考える。回路名と相別配分を図面・盤表示で一致させ、保守時に対象を確実に識別できるようにする。",
      "checks": [
        "操作と点検スペース",
        "予備回路",
        "回路表示"
      ],
      "referenceNumber": 13,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%93%e3%80%91%ef%bd%9c%e9%85%8d%e9%9b%bb%e7%9b%a4%e5%8f%8a%e3%81%b3%e5%88%86/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%93%e3%80%91%ef%bd%9c%e9%85%8d%e9%9b%bb%e7%9b%a4%e5%8f%8a%e3%81%b3%e5%88%86/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "盤類の完成時試験",
          "value": "据付けと配線完了後、全数の構造試験と動作確認試験を行う。",
          "condition": "分電盤、OA盤、実験盤、開閉器箱。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.18.2",
            "pdfPage": 92
          }
        }
      ]
    },
    {
      "id": "electrical-014",
      "title": "引込の責任分界をそろえる",
      "category": "構内・外線",
      "keywords": [
        "引込",
        "責任分界点",
        "計量器の設置",
        "施工範囲"
      ],
      "summary": "受電点を計画する際は、電力会社と需要家の設備境界を明確にする。",
      "body": "受電点を計画する際は、電力会社と需要家の設備境界を明確にする。引込位置、計量設備、保護装置、接地、施工範囲を協議し、建築工事と電気工事の取り合いを整理する。",
      "checks": [
        "責任分界点",
        "計量器の設置",
        "施工範囲"
      ],
      "referenceNumber": 14,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%94%e3%80%91%ef%bd%9c%e5%bc%95%e8%be%bc/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%94%e3%80%91%ef%bd%9c%e5%bc%95%e8%be%bc/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-015",
      "title": "漏電保護を使用場所で選ぶ",
      "category": "保護・盤",
      "keywords": [
        "漏電遮断器",
        "感度と動作時間",
        "正常時漏れ電流",
        "上下位の協調"
      ],
      "summary": "漏電遮断器は感度電流と動作時間を用途に合わせる。",
      "body": "漏電遮断器は感度電流と動作時間を用途に合わせる。インバータや多数の電子機器を含む回路では正常時の漏れ電流も把握し、上位装置との協調と感電保護を両立させる。",
      "checks": [
        "感度と動作時間",
        "正常時漏れ電流",
        "上下位の協調"
      ],
      "referenceNumber": 15,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%95%e3%80%91%ef%bd%9c%e6%bc%8f%e9%9b%bb%e9%81%ae%e6%96%ad%e5%99%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%95%e3%80%91%ef%bd%9c%e6%bc%8f%e9%9b%bb%e9%81%ae%e6%96%ad%e5%99%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-016",
      "title": "漏電火災警報の検出範囲を決める",
      "category": "保護・盤",
      "keywords": [
        "漏電火災警報器",
        "検出する回路",
        "零相変流器の貫通",
        "警報試験"
      ],
      "summary": "漏電火災警報器は遮断器とは役割が異なり、警報によって異常を知らせる。",
      "body": "漏電火災警報器は遮断器とは役割が異なり、警報によって異常を知らせる。零相変流器を通す電線と検出範囲を図面で確認し、試験・復旧・警報確認の手順を管理者へ引き継ぐ。",
      "checks": [
        "検出する回路",
        "零相変流器の貫通",
        "警報試験"
      ],
      "referenceNumber": 16,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%96%e3%80%91%ef%bd%9c%e6%bc%8f%e9%9b%bb%e7%81%ab%e7%81%bd%e8%ad%a6%e5%a0%b1/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%96%e3%80%91%ef%bd%9c%e6%bc%8f%e9%9b%bb%e7%81%ab%e7%81%bd%e8%ad%a6%e5%a0%b1/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-017",
      "title": "電力線と信号線の干渉を抑える",
      "category": "弱電・制御",
      "keywords": [
        "電磁障害の防止",
        "電力線との並走",
        "シールド終端",
        "接地経路"
      ],
      "summary": "電磁障害は配線経路、接地、機器の配置が組み合わさって生じる。",
      "body": "電磁障害は配線経路、接地、機器の配置が組み合わさって生じる。動力と通信・計測の経路を整理し、離隔、シールド、交差方法をメーカーの推奨条件と照合する。",
      "checks": [
        "電力線との並走",
        "シールド終端",
        "接地経路"
      ],
      "referenceNumber": 17,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%9b%bb%e7%a3%81%e9%9a%9c%e5%ae%b3%e3%81%ae%e9%98%b2/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%9b%bb%e7%a3%81%e9%9a%9c%e5%ae%b3%e3%81%ae%e9%98%b2/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-018",
      "title": "高周波の帰路を把握する",
      "category": "弱電・制御",
      "keywords": [
        "高周波電流の漏えい防止",
        "フィルタの接続",
        "配線長",
        "シールドと接地"
      ],
      "summary": "高周波電流は配線の寄生容量を通じても流れるため、商用周波数だけの見方では説明できない。",
      "body": "高周波電流は配線の寄生容量を通じても流れるため、商用周波数だけの見方では説明できない。フィルタ、シールド、接地導体を含む帰路を整理し、機器周辺の漏えいと干渉を調べる。",
      "checks": [
        "フィルタの接続",
        "配線長",
        "シールドと接地"
      ],
      "referenceNumber": 18,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e9%9b%bb%e6%b5%81%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e9%9b%bb%e6%b5%81%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-019",
      "title": "既設機器のPCBを確認する",
      "category": "法規・保安",
      "keywords": [
        "PCBの使用電気機械器具",
        "銘板と製造時期",
        "メーカー照会",
        "現行の処分制度"
      ],
      "summary": "古い変圧器やコンデンサ等を撤去する場合は、製造時期・銘板・メーカー回答からPCBの可能性を確認する。",
      "body": "古い変圧器やコンデンサ等を撤去する場合は、製造時期・銘板・メーカー回答からPCBの可能性を確認する。含有の判断と処分期限は現行制度で確認し、通常の産業廃棄物と混同しない。",
      "checks": [
        "銘板と製造時期",
        "メーカー照会",
        "現行の処分制度"
      ],
      "referenceNumber": 19,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%99%e3%80%91%ef%bd%9c%ef%bd%90%ef%bd%83%ef%bd%82%e3%81%ae%e4%bd%bf%e7%94%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%91%ef%bc%99%e3%80%91%ef%bd%9c%ef%bd%90%ef%bd%83%ef%bd%82%e3%81%ae%e4%bd%bf%e7%94%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-020",
      "title": "構内の配線経路を総合調整する",
      "category": "構内・外線",
      "keywords": [
        "構内電線路の施設",
        "車両と樹木",
        "排水と地盤",
        "将来掘削"
      ],
      "summary": "構内配線は建物間の距離だけでなく、車両、樹木、排水、将来工事の影響を受ける。",
      "body": "構内配線は建物間の距離だけでなく、車両、樹木、排水、将来工事の影響を受ける。架空・地中・建物沿いを比較し、保守性と機械的保護を含む経路を決定する。",
      "checks": [
        "車両と樹木",
        "排水と地盤",
        "将来掘削"
      ],
      "referenceNumber": 20,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%90%e3%80%91%ef%bd%9c%e6%a7%8b%e5%86%85%e9%9b%bb%e7%b7%9a%e8%b7%af%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%90%e3%80%91%ef%bd%9c%e6%a7%8b%e5%86%85%e9%9b%bb%e7%b7%9a%e8%b7%af%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-021",
      "title": "屋外変圧器の立地条件を整理する",
      "category": "高圧・受変電",
      "keywords": [
        "屋外配電用変圧器などの施設",
        "接近防止",
        "交換経路",
        "浸水と排水"
      ],
      "summary": "屋外変圧器は雨水や腐食への対応に加えて、第三者の接近、点検、搬入交換を考える。",
      "body": "屋外変圧器は雨水や腐食への対応に加えて、第三者の接近、点検、搬入交換を考える。周囲の可燃物や建物との関係も確認し、設備形式に適した囲いと基礎を計画する。",
      "checks": [
        "接近防止",
        "交換経路",
        "浸水と排水"
      ],
      "referenceNumber": 21,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%91%e3%80%91%ef%bd%9c%e5%b1%8b%e5%a4%96%e9%85%8d%e9%9b%bb%e7%94%a8%e5%a4%89/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%91%e3%80%91%ef%bd%9c%e5%b1%8b%e5%a4%96%e9%85%8d%e9%9b%bb%e7%94%a8%e5%a4%89/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-022",
      "title": "構内引込線の経路を守る",
      "category": "構内・外線",
      "keywords": [
        "構内引込線",
        "支持点",
        "責任区分",
        "接近する車両"
      ],
      "summary": "構内引込線は受電設備への供給経路であり、他設備との取り合いが多い。",
      "body": "構内引込線は受電設備への供給経路であり、他設備との取り合いが多い。支持点と経路の責任を整理し、人や車両が触れない配置、引張力への対策、点検方法を決める。",
      "checks": [
        "支持点",
        "責任区分",
        "接近する車両"
      ],
      "referenceNumber": 22,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%92%e3%80%91%ef%bd%9c%e6%a7%8b%e5%86%85%e5%bc%95%e8%be%bc%e7%b7%9a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%92%e3%80%91%ef%bd%9c%e6%a7%8b%e5%86%85%e5%bc%95%e8%be%bc%e7%b7%9a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-023",
      "title": "架空配線の離隔と支持を確認する",
      "category": "構内・外線",
      "keywords": [
        "架空電線路",
        "たるみと最低点",
        "道路横断",
        "支持物の強度"
      ],
      "summary": "架空配線では電線のたるみ、風、温度変化により位置が動く。",
      "body": "架空配線では電線のたるみ、風、温度変化により位置が動く。通常時の高さだけで判断せず、道路や建物への最小離隔、支持物の強度、保守作業を含めて検討する。",
      "checks": [
        "たるみと最低点",
        "道路横断",
        "支持物の強度"
      ],
      "referenceNumber": 23,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%92%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e9%9b%bb%e7%b7%9a%e8%b7%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%92%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e9%9b%bb%e7%b7%9a%e8%b7%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-024",
      "title": "メッセンジャーで張力を受ける",
      "category": "構内・外線",
      "keywords": [
        "架空ケーブル(メッセンジャーワイヤー)",
        "メッセンジャー固定",
        "吊り支持",
        "端末の張力"
      ],
      "summary": "架空ケーブルは電気的な性能と支持方法を分けて確認する。",
      "body": "架空ケーブルは電気的な性能と支持方法を分けて確認する。メッセンジャーワイヤーの固定、ケーブルの吊り間隔、端末への荷重を調整し、ケーブル自身が不適切な張力を受けないようにする。",
      "checks": [
        "メッセンジャー固定",
        "吊り支持",
        "端末の張力"
      ],
      "referenceNumber": 24,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%94%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e3%82%b1%e3%83%bc%e3%83%96%e3%83%ab/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%94%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e3%82%b1%e3%83%bc%e3%83%96%e3%83%ab/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-025",
      "title": "引込小柱の基礎と支持を選ぶ",
      "category": "構内・外線",
      "keywords": [
        "引込小柱などの施設",
        "地盤と基礎",
        "支線の位置",
        "車両衝突"
      ],
      "summary": "引込小柱は電線の張力や風荷重を地盤へ伝える。",
      "body": "引込小柱は電線の張力や風荷重を地盤へ伝える。柱の高さと材質だけでなく、埋設・基礎、支線、周辺通行、交換作業を検討し、地盤条件に適した施工方法を選ぶ。",
      "checks": [
        "地盤と基礎",
        "支線の位置",
        "車両衝突"
      ],
      "referenceNumber": 25,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%95%e3%80%91%ef%bd%9c%e5%bc%95%e8%be%bc%e5%b0%8f%e6%9f%b1%e3%81%aa%e3%81%a9/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%95%e3%80%91%ef%bd%9c%e5%bc%95%e8%be%bc%e5%b0%8f%e6%9f%b1%e3%81%aa%e3%81%a9/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-026",
      "title": "外壁沿いの配線を保護する",
      "category": "構内・外線",
      "keywords": [
        "屋側電線路",
        "耐候性",
        "開口部への接近",
        "支持と防水"
      ],
      "summary": "外壁の配線は日射・雨・振動と、建物の伸縮を受ける。",
      "body": "外壁の配線は日射・雨・振動と、建物の伸縮を受ける。ケーブルや管の耐候性を確認し、開口部周辺の接近防止、防水処理、壁面支持を納まり図で整理する。",
      "checks": [
        "耐候性",
        "開口部への接近",
        "支持と防水"
      ],
      "referenceNumber": 26,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%96%e3%80%91%ef%bd%9c%e5%b1%8b%e5%81%b4%e9%9b%bb%e7%b7%9a%e8%b7%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%96%e3%80%91%ef%bd%9c%e5%b1%8b%e5%81%b4%e9%9b%bb%e7%b7%9a%e8%b7%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-027",
      "title": "屋上配線に保守動線を確保する",
      "category": "構内・外線",
      "keywords": [
        "屋上電線路",
        "防水層との取り合い",
        "歩行経路",
        "日射と温度"
      ],
      "summary": "屋上は直射日光や温度変化の影響が大きく、設備交換の動線にもなる。",
      "body": "屋上は直射日光や温度変化の影響が大きく、設備交換の動線にもなる。配線を人が踏む経路から避け、防水層を傷めない支持方法と、排水を妨げないルートを選ぶ。",
      "checks": [
        "防水層との取り合い",
        "歩行経路",
        "日射と温度"
      ],
      "referenceNumber": 27,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%97%e3%80%91%ef%bd%9c%e5%b1%8b%e4%b8%8a%e9%9b%bb%e7%b7%9a%e8%b7%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%97%e3%80%91%ef%bd%9c%e5%b1%8b%e4%b8%8a%e9%9b%bb%e7%b7%9a%e8%b7%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-028",
      "title": "地上配線への衝撃を避ける",
      "category": "構内・外線",
      "keywords": [
        "地上に施設する電線路",
        "踏圧と衝撃",
        "浸水",
        "仮設の使用期間"
      ],
      "summary": "地表付近の配線は歩行者や車両の接触を受けやすい。",
      "body": "地表付近の配線は歩行者や車両の接触を受けやすい。常設か仮設かを明確にし、踏圧・引掛け・水溜まりに対応した保護と固定を行い、使用後の撤去まで管理する。",
      "checks": [
        "踏圧と衝撃",
        "浸水",
        "仮設の使用期間"
      ],
      "referenceNumber": 28,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%97%e3%80%91%ef%bd%9c%e5%9c%b0%e4%b8%8a%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%97%e3%80%91%ef%bd%9c%e5%9c%b0%e4%b8%8a%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-029",
      "title": "屋内の高圧等の配線経路を区分する",
      "category": "配線・配管",
      "keywords": [
        "屋内に施設する電線路",
        "電圧区分",
        "管理区域",
        "他配線との取り合い"
      ],
      "summary": "屋内に設ける電線路は、電圧と使用者の接近条件から工法を選ぶ。",
      "body": "屋内に設ける電線路は、電圧と使用者の接近条件から工法を選ぶ。電気室やシャフトの管理範囲を明確にし、低圧・弱電配線との取り合いと点検可能性を確認する。",
      "checks": [
        "電圧区分",
        "管理区域",
        "他配線との取り合い"
      ],
      "referenceNumber": 29,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%98%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%98%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-030",
      "title": "一般工法以外の電線路を検討する",
      "category": "構内・外線",
      "keywords": [
        "その他の電線路",
        "工法の適用範囲",
        "保護方法",
        "保守手順"
      ],
      "summary": "標準的な工法に当てはまらない経路では、名称だけで適否を決めない。",
      "body": "標準的な工法に当てはまらない経路では、名称だけで適否を決めない。支持、絶縁、接触防止、事故時の保護を個別に説明できる資料をそろえ、設計条件と施工条件を確認する。",
      "checks": [
        "工法の適用範囲",
        "保護方法",
        "保守手順"
      ],
      "referenceNumber": 30,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%99%e3%80%91%ef%bd%9c%e3%81%9d%e3%81%ae%e4%bb%96%e3%81%ae%e9%9b%bb%e7%b7%9a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%92%ef%bc%99%e3%80%91%ef%bd%9c%e3%81%9d%e3%81%ae%e4%bb%96%e3%81%ae%e9%9b%bb%e7%b7%9a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-031",
      "title": "地中ケーブルを掘削と浸水から守る",
      "category": "構内・外線",
      "keywords": [
        "地中電線路",
        "交通荷重",
        "管路と排水",
        "埋設位置の記録"
      ],
      "summary": "地中配線は埋設深さだけでなく、車両荷重、他埋設物、引入れ時の張力を検討する。",
      "body": "地中配線は埋設深さだけでなく、車両荷重、他埋設物、引入れ時の張力を検討する。管路とハンドホールの排水、防護、標識を計画し、竣工図で位置を残す。",
      "checks": [
        "交通荷重",
        "管路と排水",
        "埋設位置の記録"
      ],
      "referenceNumber": 31,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%90%e3%80%91%ef%bd%9c%e5%9c%b0%e4%b8%ad%e9%9b%bb%e7%b7%9a%e8%b7%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%90%e3%80%91%ef%bd%9c%e5%9c%b0%e4%b8%ad%e9%9b%bb%e7%b7%9a%e8%b7%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-032",
      "title": "場所に適した低圧工法を選ぶ",
      "category": "配線・配管",
      "keywords": [
        "低圧配線方法",
        "場所の区分",
        "点検性",
        "機械的保護"
      ],
      "summary": "低圧配線の工法は隠蔽・露出、乾燥・湿潤、点検可能性によって選択範囲が変わる。",
      "body": "低圧配線の工法は隠蔽・露出、乾燥・湿潤、点検可能性によって選択範囲が変わる。施工しやすさだけで決めず、機械的保護と将来の引替えを含めて適用条件を確認する。",
      "checks": [
        "場所の区分",
        "点検性",
        "機械的保護"
      ],
      "referenceNumber": 32,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%91%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%85%8d%e7%b7%9a%e6%96%b9%e6%b3%95/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%91%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%85%8d%e7%b7%9a%e6%96%b9%e6%b3%95/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-033",
      "title": "配線下地と点検性をそろえる",
      "category": "配線・配管",
      "keywords": [
        "低圧配線方法に関する共通事項",
        "支持下地",
        "接続箇所",
        "点検口"
      ],
      "summary": "配線を隠す前に支持下地、接続箇所、貫通処理を確認する。",
      "body": "配線を隠す前に支持下地、接続箇所、貫通処理を確認する。天井や壁の仕上げ後に点検できない接続を残さないよう、ボックスと点検口の位置を建築側と調整する。",
      "checks": [
        "支持下地",
        "接続箇所",
        "点検口"
      ],
      "referenceNumber": 33,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%92%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%85%8d%e7%b7%9a%e6%96%b9%e6%b3%95/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%92%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%85%8d%e7%b7%9a%e6%96%b9%e6%b3%95/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-034",
      "title": "がいし引きの絶縁距離を維持する",
      "category": "配線・配管",
      "keywords": [
        "がいし引き配線",
        "がいしの固定",
        "周囲との離隔",
        "後施工との干渉"
      ],
      "summary": "がいし引き配線は支持物と離隔によって絶縁を確保する工法。",
      "body": "がいし引き配線は支持物と離隔によって絶縁を確保する工法。後から接触物や配線が増えると条件が変わるため、支持状態、周囲との距離、適用場所を一体で確認する。",
      "checks": [
        "がいしの固定",
        "周囲との離隔",
        "後施工との干渉"
      ],
      "referenceNumber": 34,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%93%e3%80%91%ef%bd%9c%e3%81%8c%e3%81%84%e3%81%97%e5%bc%95%e3%81%8d%e9%85%8d/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%93%e3%80%91%ef%bd%9c%e3%81%8c%e3%81%84%e3%81%97%e5%bc%95%e3%81%8d%e9%85%8d/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-035",
      "title": "金属管で電線と接地連続性を守る",
      "category": "配線・配管",
      "keywords": [
        "金属管配線(使用電線・電磁的平衡・管の厚さ)",
        "管端の処理",
        "回路電線のまとめ方",
        "接続部の導通"
      ],
      "summary": "金属管配線では管内の接続点を避け、同じ交流回路の電線をまとめて通すことが基本となる。",
      "body": "金属管配線では管内の接続点を避け、同じ交流回路の電線をまとめて通すことが基本となる。管端のバリ、接続部の導通、曲げと支持を確認し、電線の損傷と局部加熱を防ぐ。",
      "checks": [
        "管端の処理",
        "回路電線のまとめ方",
        "接続部の導通"
      ],
      "referenceNumber": 35,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%94%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e7%ae%a1%e9%85%8d%e7%b7%9a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%94%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e7%ae%a1%e9%85%8d%e7%b7%9a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "金属管の曲げ",
          "value": "内側曲げ半径は原則管内径の6倍以上、曲げ角は90度以下。",
          "condition": "管の太さ25mm以下で施工上やむを得ない場合の例外は原文で確認。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.2.3",
            "pdfPage": 66
          }
        },
        {
          "title": "金属管の支持",
          "value": "支持間隔は2m以下。ボックスとの接続点や管端付近も固定。",
          "condition": "隠ぺい配管。露出は2.2.4から同項を参照。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.2.3",
            "pdfPage": 66
          }
        },
        {
          "title": "一つの通線区間の屈曲",
          "value": "分岐配管1区間の曲がりは4箇所以下、曲げ角の合計270度以下。",
          "condition": "分岐回路の配管1区間。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.2.3",
            "pdfPage": 66
          }
        }
      ]
    },
    {
      "id": "electrical-036",
      "title": "PF管とCD管の用途を区別する",
      "category": "配線・配管",
      "keywords": [
        "合成樹脂管配線",
        "製品種別",
        "露出と埋込",
        "支持と曲げ"
      ],
      "summary": "合成樹脂管は製品種別ごとに使える場所が異なる。",
      "body": "合成樹脂管は製品種別ごとに使える場所が異なる。PF管とCD管を色だけで判断せず表示で確認し、露出かコンクリート埋込か、支持・曲げ・貫通部の納まりを照合する。",
      "checks": [
        "製品種別",
        "露出と埋込",
        "支持と曲げ"
      ],
      "referenceNumber": 36,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%95%e3%80%91%ef%bd%9c%e5%90%88%e6%88%90%e6%a8%b9%e8%84%82%e7%ae%a1%e9%85%8d/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%95%e3%80%91%ef%bd%9c%e5%90%88%e6%88%90%e6%a8%b9%e8%84%82%e7%ae%a1%e9%85%8d/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "CD管の用途",
          "value": "CD管はコンクリート埋込部分のみに使用。",
          "condition": "この公共建築仕様のPF・CD管配線に適用。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.3.2",
            "pdfPage": 69
          }
        },
        {
          "title": "PF・CD管の隠ぺい支持",
          "value": "支持間隔1.5m以下。コンクリート埋込みは1m以下で鉄筋へ結束。",
          "condition": "軽鉄間仕切内の支持方法も同項で確認。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.3.3",
            "pdfPage": 69
          }
        },
        {
          "title": "PF管の露出支持",
          "value": "露出の支持間隔1m以下。接続点の両側と管端付近にも固定。",
          "condition": "CD管の露出使用を認めるものではない。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.3.4",
            "pdfPage": 70
          }
        }
      ]
    },
    {
      "id": "electrical-037",
      "title": "可とう管の曲げと固定を確認する",
      "category": "配線・配管",
      "keywords": [
        "金属製可とう電線管配線",
        "管の形式",
        "端末固定",
        "曲げと接地"
      ],
      "summary": "可とう管は機器への短い接続や振動の吸収に便利だが、自由な形状のまま放置すると負荷が端末へ集中する。",
      "body": "可とう管は機器への短い接続や振動の吸収に便利だが、自由な形状のまま放置すると負荷が端末へ集中する。形式に合うコネクタを選び、曲げ、支持、接地の方法を確認する。",
      "checks": [
        "管の形式",
        "端末固定",
        "曲げと接地"
      ],
      "referenceNumber": 37,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%96%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e8%a3%bd%e5%8f%af%e3%81%a8%e3%81%86/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%96%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e8%a3%bd%e5%8f%af%e3%81%a8%e3%81%86/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "可とう管の曲げ",
          "value": "内側曲げ半径は原則管内径の6倍以上。",
          "condition": "露出又は点検できる隠ぺいで管を取り外せる場所は3倍以上とできる。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.5.3",
            "pdfPage": 72
          }
        },
        {
          "title": "可とう管の支持",
          "value": "原則1m以下で支持し、接続点や管端から0.3m以下も固定。",
          "condition": "垂直で人が触れない場合又は施工上やむを得ない場合は2m以下の例外。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.5.3",
            "pdfPage": 72
          }
        }
      ]
    },
    {
      "id": "electrical-038",
      "title": "金属モールの納まりを整える",
      "category": "配線・配管",
      "keywords": [
        "金属線ぴ配線",
        "収容量",
        "継手と端部",
        "ボックスの点検"
      ],
      "summary": "金属線ぴは露出改修で用いられるが、収容量、端部、接続箇所の納まりを確認する必要がある。",
      "body": "金属線ぴは露出改修で用いられるが、収容量、端部、接続箇所の納まりを確認する必要がある。継手とボックスを組み合わせ、電線を挟み込まず、接地連続性と点検性を維持する。",
      "checks": [
        "収容量",
        "継手と端部",
        "ボックスの点検"
      ],
      "referenceNumber": 38,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%97%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e7%b7%9a%e3%81%b4%e9%85%8d%e7%b7%9a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%97%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e7%b7%9a%e3%81%b4%e9%85%8d%e7%b7%9a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "金属線ぴの支持",
          "value": "1種のベースは1m以下の間隔で固定。2種の支持間隔は1.5m以下。",
          "condition": "2種のつりボルト呼び径は9mm以上。接続部と端部付近の支持も必要。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.8.3",
            "pdfPage": 74
          }
        },
        {
          "title": "金属線ぴ内の接続",
          "value": "1種の内部に電線接続は設けない。",
          "condition": "2種は点検可能な部分で分岐する場合に限って接続できる。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.8.5",
            "pdfPage": 74
          }
        }
      ]
    },
    {
      "id": "electrical-039",
      "title": "樹脂モールに適用条件を合わせる",
      "category": "配線・配管",
      "keywords": [
        "合成樹脂線ぴ配線",
        "強度と耐熱",
        "ふたの保持",
        "角部の付属品"
      ],
      "summary": "樹脂線ぴは機械的強度や耐熱性を確認して使う。",
      "body": "樹脂線ぴは機械的強度や耐熱性を確認して使う。壁面への固定とふたの保持を確実にし、角部の通線で被覆を傷めないよう、専用付属品と適切な収容量で施工する。",
      "checks": [
        "強度と耐熱",
        "ふたの保持",
        "角部の付属品"
      ],
      "referenceNumber": 39,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%98%e3%80%91%ef%bd%9c%e5%90%88%e6%88%90%e6%a8%b9%e8%84%82%e7%b7%9a%e3%81%b4/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%98%e3%80%91%ef%bd%9c%e5%90%88%e6%88%90%e6%a8%b9%e8%84%82%e7%b7%9a%e3%81%b4/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-040",
      "title": "床ダクトの位置を竣工図に残す",
      "category": "配線・配管",
      "keywords": [
        "フロアダクト配線",
        "打設前の防水",
        "アウトレット位置",
        "床仕上げ厚"
      ],
      "summary": "フロアダクトは床仕上げと一体になるため、打設前の接続・防水・配置確認が重要。",
      "body": "フロアダクトは床仕上げと一体になるため、打設前の接続・防水・配置確認が重要。アウトレット位置を家具計画と合わせ、床仕上げ後も使用口と点検箇所が分かるように記録する。",
      "checks": [
        "打設前の防水",
        "アウトレット位置",
        "床仕上げ厚"
      ],
      "referenceNumber": 40,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%99%e3%80%91%ef%bd%9c%e3%83%95%e3%83%ad%e3%82%a2%e3%83%80%e3%82%af%e3%83%88/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%93%ef%bc%99%e3%80%91%ef%bd%9c%e3%83%95%e3%83%ad%e3%82%a2%e3%83%80%e3%82%af%e3%83%88/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-041",
      "title": "セルラダクトの点検経路を確保する",
      "category": "配線・配管",
      "keywords": [
        "セルラダクト",
        "構造材との関係",
        "配線区分",
        "引出し口"
      ],
      "summary": "床構造を利用するセルラダクトでは、構造材と配線の取り合いを設計段階で確認する。",
      "body": "床構造を利用するセルラダクトでは、構造材と配線の取り合いを設計段階で確認する。電力と弱電の区分、引出し口、通線経路を整理し、後からの変更で構造を損なわないようにする。",
      "checks": [
        "構造材との関係",
        "配線区分",
        "引出し口"
      ],
      "referenceNumber": 41,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%90%e3%80%91%ef%bd%9c%e3%82%bb%e3%83%ab%e3%83%a9%e3%83%80%e3%82%af%e3%83%88/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%90%e3%80%91%ef%bd%9c%e3%82%bb%e3%83%ab%e3%83%a9%e3%83%80%e3%82%af%e3%83%88/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-042",
      "title": "金属ダクトの支持と収容を検討する",
      "category": "配線・配管",
      "keywords": [
        "金属ダクト配線",
        "荷重と支持",
        "放熱と集合",
        "ふたの開閉"
      ],
      "summary": "ダクトは電線の重さ、支持間隔、放熱条件を含めて選ぶ。",
      "body": "ダクトは電線の重さ、支持間隔、放熱条件を含めて選ぶ。大きいダクトでも許容電流の補正や電力・弱電の区分が不要になるわけではなく、ふたの開閉と内部点検の空間を確保する。",
      "checks": [
        "荷重と支持",
        "放熱と集合",
        "ふたの開閉"
      ],
      "referenceNumber": 42,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%91%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e3%83%80%e3%82%af%e3%83%88%e9%85%8d/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%91%e3%80%91%ef%bd%9c%e9%87%91%e5%b1%9e%e3%83%80%e3%82%af%e3%83%88%e9%85%8d/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "金属ダクトの支持",
          "value": "原則支持間隔3m以下。",
          "condition": "配線室等で垂直敷設する場合は6m以下の範囲で各階支持とできる。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.7.2",
            "pdfPage": 73
          }
        },
        {
          "title": "金属ダクト内の配線",
          "value": "原則内部に電線接続を設けない。ふたに電線荷重をかけない。",
          "condition": "点検できる分岐接続は例外。垂直部の電線は1.5m以下ごとに固定。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.7.4",
            "pdfPage": 73
          }
        }
      ]
    },
    {
      "id": "electrical-043",
      "title": "ライティングダクトを専用部品で構成する",
      "category": "照明・器具",
      "keywords": [
        "ライティングダクト配線",
        "給電容量",
        "器具の荷重",
        "終端と継手"
      ],
      "summary": "ライティングダクトは器具の配置変更をしやすくするが、電源容量と取付荷重は別々に確認する。",
      "body": "ライティングダクトは器具の配置変更をしやすくするが、電源容量と取付荷重は別々に確認する。専用の給電・継手・終端を用い、極性、接地、支持位置を施工説明書と照合する。",
      "checks": [
        "給電容量",
        "器具の荷重",
        "終端と継手"
      ],
      "referenceNumber": 43,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%92%e3%80%91%ef%bd%9c%e3%83%a9%e3%82%a4%e3%83%86%e3%82%a3%e3%83%b3%e3%82%b0/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%92%e3%80%91%ef%bd%9c%e3%83%a9%e3%82%a4%e3%83%86%e3%82%a3%e3%83%b3%e3%82%b0/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "ライティングダクトの支持",
          "value": "支持間隔2m以下、かつダクト1本あたり2箇所以上。",
          "condition": "接続部と端部の近くにも支持。電気容量と器具荷重は別途確認。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.6.2",
            "pdfPage": 73
          }
        },
        {
          "title": "ライティングダクトの開口",
          "value": "原則開口部を下向きにし、終端はエンドキャップで閉じる。",
          "condition": "簡易接触防護又はJIS C 8366の固定Ⅱ形に適合する場合の横向き例外あり。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.6.2",
            "pdfPage": 73
          }
        }
      ]
    },
    {
      "id": "electrical-044",
      "title": "床用平形配線を仕上げと合わせる",
      "category": "配線・配管",
      "keywords": [
        "床面に施設する平形保護層配線",
        "専用保護層",
        "仕上げの適合",
        "家具荷重"
      ],
      "summary": "床面に敷く平形配線は専用の保護構成と床仕上げによって成立する。",
      "body": "床面に敷く平形配線は専用の保護構成と床仕上げによって成立する。一般のケーブルの代用と考えず、重ね方、曲げ、接続、家具脚による荷重を製品の適用条件で確認する。",
      "checks": [
        "専用保護層",
        "仕上げの適合",
        "家具荷重"
      ],
      "referenceNumber": 44,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%93%e3%80%91%ef%bd%9c%e5%ba%8a%e9%9d%a2%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%93%e3%80%91%ef%bd%9c%e5%ba%8a%e9%9d%a2%e3%81%ab%e6%96%bd%e8%a8%ad%e3%81%99/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-045",
      "title": "壁・天井用平形配線を保護する",
      "category": "配線・配管",
      "keywords": [
        "天井面・壁面に施設する平形保護層配線",
        "下地の固定",
        "ビスとの干渉",
        "接続部の点検"
      ],
      "summary": "壁や天井に施工する平形配線は、下地への固定と仕上げ工事の影響を受ける。",
      "body": "壁や天井に施工する平形配線は、下地への固定と仕上げ工事の影響を受ける。施工後の釘やビスが配線へ達しないよう経路を共有し、接続部を点検できる位置に設ける。",
      "checks": [
        "下地の固定",
        "ビスとの干渉",
        "接続部の点検"
      ],
      "referenceNumber": 45,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%94%e3%80%91%ef%bd%9c%e5%a4%a9%e4%ba%95%e9%9d%a2%e3%83%bb%e5%a3%81%e9%9d%a2/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%94%e3%80%91%ef%bd%9c%e5%a4%a9%e4%ba%95%e9%9d%a2%e3%83%bb%e5%a3%81%e9%9d%a2/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-046",
      "title": "ケーブルの曲げと支持をそろえる",
      "category": "配線・配管",
      "keywords": [
        "ビニル外装ケーブル配線など",
        "曲げ半径",
        "支持と引張力",
        "外装の損傷"
      ],
      "summary": "ケーブル配線は電線管がなくてもよい場合があるが、外装の保護と固定は必要。",
      "body": "ケーブル配線は電線管がなくてもよい場合があるが、外装の保護と固定は必要。引張力、曲げ半径、支持、鋭い端部との接触を確認し、断熱材や集合による放熱の悪化も調べる。",
      "checks": [
        "曲げ半径",
        "支持と引張力",
        "外装の損傷"
      ],
      "referenceNumber": 46,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%93%e3%83%8b%e3%83%ab%e5%a4%96%e8%a3%85%e3%82%b1/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%93%e3%83%8b%e3%83%ab%e5%a4%96%e8%a3%85%e3%82%b1/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-047",
      "title": "床下ケーブルを踏圧から守る",
      "category": "配線・配管",
      "keywords": [
        "アクセスフロア内のケーブル配線",
        "床脚とパネル",
        "経路区分",
        "点検時の保護"
      ],
      "summary": "アクセスフロア内では床脚やパネルの縁がケーブルを傷めることがある。",
      "body": "アクセスフロア内では床脚やパネルの縁がケーブルを傷めることがある。電力・弱電の経路を分け、パネルの着脱や清掃時にも損傷しない保護と配線余長を確保する。",
      "checks": [
        "床脚とパネル",
        "経路区分",
        "点検時の保護"
      ],
      "referenceNumber": 47,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%a2%e3%82%af%e3%82%bb%e3%82%b9%e3%83%95%e3%83%ad/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%a2%e3%82%af%e3%82%bb%e3%82%b9%e3%83%95%e3%83%ad/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-048",
      "title": "直埋ケーブルの製品条件を確認する",
      "category": "配線・配管",
      "keywords": [
        "コンクリート直埋用ケーブル配線",
        "直埋対応",
        "打設時の固定",
        "引出し部の保護"
      ],
      "summary": "コンクリートへ直接埋設する場合は対応する専用ケーブルを選ぶ。",
      "body": "コンクリートへ直接埋設する場合は対応する専用ケーブルを選ぶ。一般ケーブルを同じように扱わず、打設時の保持、被覆の傷、引出し部の保護、交換できない区間の管理を確認する。",
      "checks": [
        "直埋対応",
        "打設時の固定",
        "引出し部の保護"
      ],
      "referenceNumber": 48,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%97%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%b3%e3%82%af%e3%83%aa%e3%83%bc%e3%83%88/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%97%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%b3%e3%82%af%e3%83%aa%e3%83%bc%e3%83%88/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-049",
      "title": "金属被覆ケーブルの腐食を防ぐ",
      "category": "配線・配管",
      "keywords": [
        "鉛被又はアルミ被のあるケーブル配線",
        "金属の組合せ",
        "腐食環境",
        "シース端末"
      ],
      "summary": "金属シースを持つケーブルは被覆材と周囲の環境の相性を確認する。",
      "body": "金属シースを持つケーブルは被覆材と周囲の環境の相性を確認する。異種金属接触、湿気、薬品に対する防食を行い、端末と接続部でシースの保護・接地を連続させる。",
      "checks": [
        "金属の組合せ",
        "腐食環境",
        "シース端末"
      ],
      "referenceNumber": 49,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%98%e3%80%91%ef%bd%9c%e9%89%9b%e8%a2%ab%e5%8f%88%e3%81%af%e3%82%a2%e3%83%ab/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%98%e3%80%91%ef%bd%9c%e9%89%9b%e8%a2%ab%e5%8f%88%e3%81%af%e3%82%a2%e3%83%ab/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-050",
      "title": "キャブタイヤの可動条件を整理する",
      "category": "配線・配管",
      "keywords": [
        "キャブタイヤケーブル配線",
        "可動範囲",
        "油と水",
        "張力止め"
      ],
      "summary": "キャブタイヤケーブルは用途ごとの柔軟性と耐久性を持つが、固定配線の全用途へ使えるとは限らない。",
      "body": "キャブタイヤケーブルは用途ごとの柔軟性と耐久性を持つが、固定配線の全用途へ使えるとは限らない。可動範囲、摩耗、引張力、水・油への耐性を確認し、端末に張力止めを設ける。",
      "checks": [
        "可動範囲",
        "油と水",
        "張力止め"
      ],
      "referenceNumber": 50,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%99%e3%80%91%ef%bd%9c%e3%82%ad%e3%83%a3%e3%83%96%e3%82%bf%e3%82%a4%e3%83%a4/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%94%ef%bc%99%e3%80%91%ef%bd%9c%e3%82%ad%e3%83%a3%e3%83%96%e3%82%bf%e3%82%a4%e3%83%a4/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-051",
      "title": "MIケーブルの端末を乾燥状態に保つ",
      "category": "配線・配管",
      "keywords": [
        "MIケーブル",
        "端末封止",
        "吸湿防止",
        "シース接地"
      ],
      "summary": "MIケーブルは無機絶縁材と金属シースを用いるため、端末加工の品質が性能に影響する。",
      "body": "MIケーブルは無機絶縁材と金属シースを用いるため、端末加工の品質が性能に影響する。絶縁材の吸湿を防ぎ、専用の封止・端末処理、曲げ加工、シースの接地を確認する。",
      "checks": [
        "端末封止",
        "吸湿防止",
        "シース接地"
      ],
      "referenceNumber": 51,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%90%e3%80%91%ef%bd%9c%ef%bd%8d%ef%bd%89%e3%82%b1%e3%83%bc%e3%83%96%e3%83%ab/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%90%e3%80%91%ef%bd%9c%ef%bd%8d%ef%bd%89%e3%82%b1%e3%83%bc%e3%83%96%e3%83%ab/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-052",
      "title": "端子とコンセントを定格に合わせる",
      "category": "照明・器具",
      "keywords": [
        "その他電気機械器具類",
        "端子の適合",
        "締付条件",
        "コンセント定格"
      ],
      "summary": "器具の電源接続は端子形状、導体種類、締付方法を一致させる。",
      "body": "器具の電源接続は端子形状、導体種類、締付方法を一致させる。コンセントの定格と回路容量を照合し、複数線の共締めや被覆のかみ込みなど接触不良につながる施工を避ける。",
      "checks": [
        "端子の適合",
        "締付条件",
        "コンセント定格"
      ],
      "referenceNumber": 52,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%91%e3%80%91%ef%bd%9c%e3%81%9d%e3%81%ae%e4%bb%96%e9%9b%bb%e6%b0%97%e6%a9%9f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%91%e3%80%91%ef%bd%9c%e3%81%9d%e3%81%ae%e4%bb%96%e9%9b%bb%e6%b0%97%e6%a9%9f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-053",
      "title": "コードに固定配線の役割を持たせない",
      "category": "配線・配管",
      "keywords": [
        "コード及び移動電線など",
        "使用電流",
        "通路の保護",
        "巻いた状態の発熱"
      ],
      "summary": "コードや移動電線は使用機器と可動条件に合わせて選ぶ。",
      "body": "コードや移動電線は使用機器と可動条件に合わせて選ぶ。通路横断、延長の連結、巻いたままの使用などは損傷と発熱の原因となるため、使用電流と機械的保護を確認する。",
      "checks": [
        "使用電流",
        "通路の保護",
        "巻いた状態の発熱"
      ],
      "referenceNumber": 53,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%92%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%bc%e3%83%89%e5%8f%8a%e3%81%b3%e7%a7%bb/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%92%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%bc%e3%83%89%e5%8f%8a%e3%81%b3%e7%a7%bb/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-054",
      "title": "屋内照明の支持と接続を確認する",
      "category": "照明・器具",
      "keywords": [
        "屋内灯",
        "取付下地",
        "温度と断熱材",
        "電源の切離し"
      ],
      "summary": "照明器具は重さを支持材へ確実に伝え、電線で吊らない。",
      "body": "照明器具は重さを支持材へ確実に伝え、電線で吊らない。器具の周囲温度、天井材や断熱材との関係を調べ、点検・交換時に安全に切り離せる配線と操作を計画する。",
      "checks": [
        "取付下地",
        "温度と断熱材",
        "電源の切離し"
      ],
      "referenceNumber": 54,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%93%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e7%81%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%93%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e7%81%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ],
      "rules": [
        {
          "title": "竣工時の点灯試験",
          "value": "器具の取付けと配線完了後、全数の点灯試験を行う。",
          "condition": "一般照明の照度測定は特記による。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.18.2",
            "pdfPage": 92
          }
        }
      ]
    },
    {
      "id": "electrical-055",
      "title": "屋外照明に浸水対策を合わせる",
      "category": "照明・器具",
      "keywords": [
        "屋外灯",
        "取付方向",
        "引込部の防水",
        "腐食と結露"
      ],
      "summary": "屋外照明は防水表示だけでなく取付方向と接続部の処理が重要。",
      "body": "屋外照明は防水表示だけでなく取付方向と接続部の処理が重要。器具、端子箱、ケーブル引込部を一つの経路として確認し、排水と結露、腐食、雷サージを考慮する。",
      "checks": [
        "取付方向",
        "引込部の防水",
        "腐食と結露"
      ],
      "referenceNumber": 55,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%94%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e7%81%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%94%e3%80%91%ef%bd%9c%e5%b1%8b%e5%86%85%e7%81%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-056",
      "title": "電柱灯の支持と点検を計画する",
      "category": "照明・器具",
      "keywords": [
        "電柱外灯",
        "柱の所有と許可",
        "落下防止",
        "高所点検"
      ],
      "summary": "電柱灯は高所にあるため、器具の固定と保守方法を先に決める。",
      "body": "電柱灯は高所にあるため、器具の固定と保守方法を先に決める。柱の所有者と施工条件を確認し、落下防止、配線の保護、道路上での点検作業まで取り合いを整理する。",
      "checks": [
        "柱の所有と許可",
        "落下防止",
        "高所点検"
      ],
      "referenceNumber": 56,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%95%e3%80%91%ef%bd%9c%e9%9b%bb%e6%9f%b1%e5%a4%96%e7%81%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%95%e3%80%91%ef%bd%9c%e9%9b%bb%e6%9f%b1%e5%a4%96%e7%81%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-057",
      "title": "LED電源と制御の相性を確認する",
      "category": "照明・器具",
      "keywords": [
        "LED照明",
        "調光方式",
        "突入電流",
        "既設安定器との関係"
      ],
      "summary": "LED器具への更新では消費電力だけでなく、調光方式、突入電流、既設配線の接続方法を確認する。",
      "body": "LED器具への更新では消費電力だけでなく、調光方式、突入電流、既設配線の接続方法を確認する。ランプのみの交換と器具全体の更新を区別し、メーカーが指定する組合せを選ぶ。",
      "checks": [
        "調光方式",
        "突入電流",
        "既設安定器との関係"
      ],
      "referenceNumber": 57,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%96%e3%80%91%ef%bd%9c%ef%bd%8c%ef%bd%85%ef%bd%84%e7%85%a7%e6%98%8e/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%96%e3%80%91%ef%bd%9c%ef%bd%8c%ef%bd%85%ef%bd%84%e7%85%a7%e6%98%8e/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-058",
      "title": "放電灯の安定器を適合させる",
      "category": "照明・器具",
      "keywords": [
        "1,000V以下の放電灯",
        "ランプと安定器",
        "入力電圧",
        "高温部の離隔"
      ],
      "summary": "放電灯はランプと安定器の組合せで特性が決まる。",
      "body": "放電灯はランプと安定器の組合せで特性が決まる。入力電圧、ランプ種類、始動方式を一致させ、高温になる部品の離隔、劣化、交換時の配線接続を確認する。",
      "checks": [
        "ランプと安定器",
        "入力電圧",
        "高温部の離隔"
      ],
      "referenceNumber": 58,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%97%e3%80%91%ef%bd%9c1000%ef%bd%96%e4%bb%a5%e4%b8%8b%e3%81%ae%e6%94%be/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%97%e3%80%91%ef%bd%9c1000%ef%bd%96%e4%bb%a5%e4%b8%8b%e3%81%ae%e6%94%be/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-059",
      "title": "高電圧放電灯の二次側を保護する",
      "category": "照明・器具",
      "keywords": [
        "1,000Vを超える放電灯",
        "二次側の絶縁",
        "接近防止",
        "残留電荷"
      ],
      "summary": "高電圧を発生する放電灯設備では一次側を切った状態の確認と二次配線の保護が重要。",
      "body": "高電圧を発生する放電灯設備では一次側を切った状態の確認と二次配線の保護が重要。器具・電源装置の専用構成を保ち、接近防止、配線の絶縁、保守時の残留電荷を検討する。",
      "checks": [
        "二次側の絶縁",
        "接近防止",
        "残留電荷"
      ],
      "referenceNumber": 59,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%98%e3%80%91%ef%bd%9c1000%ef%bd%96%e3%82%92%e8%b6%85%e3%81%88%e3%82%8b/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%98%e3%80%91%ef%bd%9c1000%ef%bd%96%e3%82%92%e8%b6%85%e3%81%88%e3%82%8b/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-060",
      "title": "高電圧ネオン設備を隔離する",
      "category": "照明・器具",
      "keywords": [
        "1,000Vを超えるネオン放電灯",
        "専用電源",
        "二次側の経路",
        "看板保守との接近"
      ],
      "summary": "ネオン管の高電圧回路は一般照明の接続方法を流用できない。",
      "body": "ネオン管の高電圧回路は一般照明の接続方法を流用できない。専用変圧器、二次側配線、支持、接地を設計資料で照合し、清掃や看板工事の担当者が触れない配置にする。",
      "checks": [
        "専用電源",
        "二次側の経路",
        "看板保守との接近"
      ],
      "referenceNumber": 60,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%99%e3%80%91%ef%bd%9c1000%ef%bd%96%e3%82%92%e8%b6%85%e3%81%88%e3%82%8b/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%95%ef%bc%99%e3%80%91%ef%bd%9c1000%ef%bd%96%e3%82%92%e8%b6%85%e3%81%88%e3%82%8b/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-061",
      "title": "低電圧側でもネオン専用構成を守る",
      "category": "照明・器具",
      "keywords": [
        "1,000V以下のネオン放電灯",
        "電源と管の対応",
        "配線長",
        "端末の保護"
      ],
      "summary": "ネオン設備は電圧区分が低い場合でも製品の専用構成が必要になる。",
      "body": "ネオン設備は電圧区分が低い場合でも製品の専用構成が必要になる。変圧器と管の対応、配線の長さ、端末保護を確認し、他の照明回路と混在させて誤接続しないようにする。",
      "checks": [
        "電源と管の対応",
        "配線長",
        "端末の保護"
      ],
      "referenceNumber": 61,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%90%e3%80%91%ef%bd%9c1000%ef%bd%96%e4%bb%a5%e4%b8%8b%e3%81%ae%e3%83%8d/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%90%e3%80%91%ef%bd%9c1000%ef%bd%96%e4%bb%a5%e4%b8%8b%e3%81%ae%e3%83%8d/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-062",
      "title": "アーケード照明を通行環境に合わせる",
      "category": "照明・器具",
      "keywords": [
        "アーケード照明施設",
        "吹込み雨",
        "通行者の接近",
        "電源管理区分"
      ],
      "summary": "アーケードは屋内と屋外の条件が混在しやすい。",
      "body": "アーケードは屋内と屋外の条件が混在しやすい。雨の吹込み、通行者の接近、店舗ごとの電源管理を整理し、器具の落下防止と点検時の停電範囲を計画する。",
      "checks": [
        "吹込み雨",
        "通行者の接近",
        "電源管理区分"
      ],
      "referenceNumber": 62,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%91%e3%80%91%ef%bd%9c%e3%82%a2%e3%83%bc%e3%82%b1%e3%83%bc%e3%83%89%e7%85%a7/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%91%e3%80%91%ef%bd%9c%e3%82%a2%e3%83%bc%e3%82%b1%e3%83%bc%e3%83%89%e7%85%a7/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-063",
      "title": "電光看板の保守電源を明確にする",
      "category": "照明・器具",
      "keywords": [
        "電光サイン",
        "放熱と防水",
        "支持荷重",
        "保守用開閉器"
      ],
      "summary": "電光サインは建物外装と電気設備の取り合いを持つ。",
      "body": "電光サインは建物外装と電気設備の取り合いを持つ。表示装置、電源装置、制御回路を区別し、放熱・防水と支持を確保する。保守用開閉器の位置と管理者も明確にする。",
      "checks": [
        "放熱と防水",
        "支持荷重",
        "保守用開閉器"
      ],
      "referenceNumber": 63,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e5%85%89%e3%82%b5%e3%82%a4%e3%83%b3/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e5%85%89%e3%82%b5%e3%82%a4%e3%83%b3/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-064",
      "title": "空中の電飾を確実に支持する",
      "category": "照明・器具",
      "keywords": [
        "架空電飾",
        "支持索",
        "通行空間",
        "風と揺れ"
      ],
      "summary": "架空電飾は軽く見えても風と揺れを受ける。",
      "body": "架空電飾は軽く見えても風と揺れを受ける。電線へ器具や装飾の張力を集中させず、支持索、落下防止、通行空間との離隔、電源保護を設計してから設置する。",
      "checks": [
        "支持索",
        "通行空間",
        "風と揺れ"
      ],
      "referenceNumber": 64,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%93%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e9%9b%bb%e9%a3%be/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%93%e3%80%91%ef%bd%9c%e6%9e%b6%e7%a9%ba%e9%9b%bb%e9%a3%be/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-065",
      "title": "アドバルン電飾の可動範囲を管理する",
      "category": "特殊設備",
      "keywords": [
        "電飾アドバルン",
        "上空の障害物",
        "係留と電源",
        "運用中止条件"
      ],
      "summary": "電飾アドバルンは電源線と係留の双方が動く設備。",
      "body": "電飾アドバルンは電源線と係留の双方が動く設備。専用設備の安全条件と運用条件を照合し、上空の電線への接近、地上の電源保護、風による中止基準を管理する。",
      "checks": [
        "上空の障害物",
        "係留と電源",
        "運用中止条件"
      ],
      "referenceNumber": 65,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%94%e3%80%91%ef%bd%9c%e9%9b%bb%e9%a3%be%e3%82%a2%e3%83%89%e3%83%90%e3%83%ab/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%94%e3%80%91%ef%bd%9c%e9%9b%bb%e9%a3%be%e3%82%a2%e3%83%89%e3%83%90%e3%83%ab/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-066",
      "title": "航空障害灯の維持管理を設計する",
      "category": "照明・器具",
      "keywords": [
        "航空障害灯",
        "設置要否",
        "点灯監視",
        "保守アクセス"
      ],
      "summary": "航空障害灯は建築物の高さ等による設置要否と照明設備としての施工条件を合わせて確認する。",
      "body": "航空障害灯は建築物の高さ等による設置要否と照明設備としての施工条件を合わせて確認する。器具の仕様、点灯監視、保守のアクセスを整理し、関連する航空法上の条件を現行資料で照合する。",
      "checks": [
        "設置要否",
        "点灯監視",
        "保守アクセス"
      ],
      "referenceNumber": 66,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%95%e3%80%91%ef%bd%9c%e8%88%aa%e7%a9%ba%e9%9a%9c%e5%ae%b3%e7%81%af/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%95%e3%80%91%ef%bd%9c%e8%88%aa%e7%a9%ba%e9%9a%9c%e5%ae%b3%e7%81%af/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-067",
      "title": "電動機の操作器と保護を組み合わせる",
      "category": "動力・電熱",
      "keywords": [
        "低圧電動機・各装置類への電路に施設する機器類",
        "接触器の使用区分",
        "過負荷保護",
        "停止と再始動"
      ],
      "summary": "電動機回路では開閉、短絡保護、過負荷保護を分けて整理する。",
      "body": "電動機回路では開閉、短絡保護、過負荷保護を分けて整理する。電磁接触器と保護器の組合せを確認し、非常停止や再始動の挙動を機械側の制御と一致させる。",
      "checks": [
        "接触器の使用区分",
        "過負荷保護",
        "停止と再始動"
      ],
      "referenceNumber": 67,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%96%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f%e3%83%bb/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%96%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f%e3%83%bb/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-068",
      "title": "低圧電動機の始動を考慮する",
      "category": "動力・電熱",
      "keywords": [
        "低圧電動機",
        "始動方式",
        "始動電圧降下",
        "インバータの条件"
      ],
      "summary": "電動機の配線は定格電流と始動時の条件の両方で確認する。",
      "body": "電動機の配線は定格電流と始動時の条件の両方で確認する。始動方式、電圧降下、過負荷保護、接地を調整し、インバータを使う場合は出力側配線と漏れ電流にも対応する。",
      "checks": [
        "始動方式",
        "始動電圧降下",
        "インバータの条件"
      ],
      "referenceNumber": 68,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%97%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%97%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-069",
      "title": "電熱器の温度制御に独立保護を設ける",
      "category": "動力・電熱",
      "keywords": [
        "電熱器",
        "温度制御",
        "異常過熱保護",
        "可燃物との離隔"
      ],
      "summary": "電熱器は電気回路が正常でも放熱不足で危険な温度になることがある。",
      "body": "電熱器は電気回路が正常でも放熱不足で危険な温度になることがある。温度調節と異常過熱保護の役割を分け、可燃物との関係、周囲温度、停止後の余熱を確認する。",
      "checks": [
        "温度制御",
        "異常過熱保護",
        "可燃物との離隔"
      ],
      "referenceNumber": 69,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e7%86%b1%e5%99%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e7%86%b1%e5%99%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-070",
      "title": "赤外線加熱の放射範囲を囲う",
      "category": "動力・電熱",
      "keywords": [
        "工業用赤外線灯加熱装置",
        "放射範囲",
        "遮熱と換気",
        "配線の耐熱"
      ],
      "summary": "赤外線加熱では発熱体だけでなく被加熱物と周囲にも熱が伝わる。",
      "body": "赤外線加熱では発熱体だけでなく被加熱物と周囲にも熱が伝わる。放射範囲、遮熱、換気、取扱者への保護を確認し、温度上昇に耐える配線と器具を選ぶ。",
      "checks": [
        "放射範囲",
        "遮熱と換気",
        "配線の耐熱"
      ],
      "referenceNumber": 70,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%99%e3%80%91%ef%bd%9c%e5%b7%a5%e6%a5%ad%e7%94%a8%e8%b5%a4%e5%a4%96%e7%b7%9a/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%96%ef%bc%99%e3%80%91%ef%bd%9c%e5%b7%a5%e6%a5%ad%e7%94%a8%e8%b5%a4%e5%a4%96%e7%b7%9a/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-071",
      "title": "高周波加熱を専用設備として設計する",
      "category": "動力・電熱",
      "keywords": [
        "高周波加熱装置",
        "インターロック",
        "電磁場の管理",
        "電源条件"
      ],
      "summary": "高周波加熱装置は感電対策に加えて電磁場や漏えいへの対策が必要。",
      "body": "高周波加熱装置は感電対策に加えて電磁場や漏えいへの対策が必要。専用装置の囲い、接地、インターロック、電源条件を確認し、一般電熱器の仕様をそのまま適用しない。",
      "checks": [
        "インターロック",
        "電磁場の管理",
        "電源条件"
      ],
      "referenceNumber": 71,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%90%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e5%8a%a0%e7%86%b1%e8%a3%85/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%90%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e5%8a%a0%e7%86%b1%e8%a3%85/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-072",
      "title": "誘導炉の大電流と冷却を管理する",
      "category": "動力・電熱",
      "keywords": [
        "高周波及び低周波誘導炉",
        "接続部の発熱",
        "冷却水",
        "高調波と力率"
      ],
      "summary": "誘導炉は大電流回路と冷却設備を一体で扱う。",
      "body": "誘導炉は大電流回路と冷却設備を一体で扱う。導体の支持、接続部の発熱、漏水時の停止、力率や高調波への対策を機械仕様に合わせ、保守時の切離し手順を定める。",
      "checks": [
        "接続部の発熱",
        "冷却水",
        "高調波と力率"
      ],
      "referenceNumber": 72,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%91%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e5%8f%8a%e3%81%b3%e4%bd%8e/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%91%e3%80%91%ef%bd%9c%e9%ab%98%e5%91%a8%e6%b3%a2%e5%8f%8a%e3%81%b3%e4%bd%8e/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-073",
      "title": "溶接機の使用率を配線へ反映する",
      "category": "動力・電熱",
      "keywords": [
        "溶接機",
        "入力と使用率",
        "同時運転",
        "溶接電流の帰路"
      ],
      "summary": "溶接機は断続運転でも瞬間の負荷が大きい。",
      "body": "溶接機は断続運転でも瞬間の負荷が大きい。銘板の入力と使用率、同時運転台数を確認して配線を検討し、戻り電流を建物の金属体や他の接地線へ流さないようにする。",
      "checks": [
        "入力と使用率",
        "同時運転",
        "溶接電流の帰路"
      ],
      "referenceNumber": 73,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%92%e3%80%91%ef%bd%9c%e6%ba%b6%e6%8e%a5%e6%a9%9f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%92%e3%80%91%ef%bd%9c%e6%ba%b6%e6%8e%a5%e6%a9%9f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-075",
      "title": "可燃性粉じんの危険を分類する",
      "category": "環境・特殊場所",
      "keywords": [
        "粉じん危険場所",
        "粉じんの種類",
        "堆積と浮遊",
        "機器の温度等級"
      ],
      "summary": "粉じん危険場所は堆積や浮遊状態によって着火条件が異なる。",
      "body": "粉じん危険場所は堆積や浮遊状態によって着火条件が異なる。粉じんの性質、発生源、換気・清掃を調査し、適した防爆構造と温度条件を専門設計資料で照合する。",
      "checks": [
        "粉じんの種類",
        "堆積と浮遊",
        "機器の温度等級"
      ],
      "referenceNumber": 75,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%94%e3%80%91%ef%bd%9c%e7%b2%89%e3%81%98%e3%82%93%e5%8d%b1%e9%99%ba%e5%a0%b4/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%94%e3%80%91%ef%bd%9c%e7%b2%89%e3%81%98%e3%82%93%e5%8d%b1%e9%99%ba%e5%a0%b4/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-076",
      "title": "不燃性じんあいでも放熱を守る",
      "category": "環境・特殊場所",
      "keywords": [
        "不燃性じんあいの多い場所",
        "外箱の防じん",
        "放熱経路",
        "清掃周期"
      ],
      "summary": "燃えない粉じんであっても機器内部に入ると絶縁や冷却に影響する。",
      "body": "燃えない粉じんであっても機器内部に入ると絶縁や冷却に影響する。外箱の防じん性能、フィルタ、清掃方法を検討し、粉じんが積もった状態で温度が上がらないよう管理する。",
      "checks": [
        "外箱の防じん",
        "放熱経路",
        "清掃周期"
      ],
      "referenceNumber": 76,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%95%e3%80%91%ef%bd%9c%e4%b8%8d%e7%87%83%e6%80%a7%e3%81%98%e3%82%93%e3%81%82/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%95%e3%80%91%ef%bd%9c%e4%b8%8d%e7%87%83%e6%80%a7%e3%81%98%e3%82%93%e3%81%82/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-077",
      "title": "ガス危険場所の区分を先に確定する",
      "category": "環境・特殊場所",
      "keywords": [
        "ガス蒸気危険場所",
        "危険区域",
        "ガスグループ",
        "温度と引込"
      ],
      "summary": "可燃性ガスや蒸気がある場所は、危険区域の区分と物質の性質から機器を選ぶ。",
      "body": "可燃性ガスや蒸気がある場所は、危険区域の区分と物質の性質から機器を選ぶ。防爆表示だけで判断せず、ガスグループ、温度等級、配線引込方法まで合わせて確認する。",
      "checks": [
        "危険区域",
        "ガスグループ",
        "温度と引込"
      ],
      "referenceNumber": 77,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%ac%e3%82%b9%e8%92%b8%e6%b0%97%e5%8d%b1%e9%99%ba/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%ac%e3%82%b9%e8%92%b8%e6%b0%97%e5%8d%b1%e9%99%ba/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-078",
      "title": "危険物の取扱条件を電気設計へ渡す",
      "category": "環境・特殊場所",
      "keywords": [
        "危険物などの存在する場所",
        "物質と数量",
        "換気と工程",
        "消防上の条件"
      ],
      "summary": "危険物の存在する場所では電気設備以外の管理条件も重要。",
      "body": "危険物の存在する場所では電気設備以外の管理条件も重要。物質、数量、容器、換気、取扱工程を確認し、消防関係の条件と電気設備の適用条件を設計担当者間で共有する。",
      "checks": [
        "物質と数量",
        "換気と工程",
        "消防上の条件"
      ],
      "referenceNumber": 78,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%97%e3%80%91%ef%bd%9c%e5%8d%b1%e9%99%ba%e7%89%a9%e3%81%aa%e3%81%a9%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%97%e3%80%91%ef%bd%9c%e5%8d%b1%e9%99%ba%e7%89%a9%e3%81%aa%e3%81%a9%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-079",
      "title": "腐食性雰囲気に材質を合わせる",
      "category": "環境・特殊場所",
      "keywords": [
        "腐食性ガスなどのある場所",
        "ガスの種類",
        "材料の耐性",
        "結露と換気"
      ],
      "summary": "腐食性ガスは金属だけでなく被覆や絶縁材料にも影響する。",
      "body": "腐食性ガスは金属だけでなく被覆や絶縁材料にも影響する。物質と濃度、温湿度を確認して外箱・端子・ケーブルを選び、密閉や換気が結露を悪化させないか調べる。",
      "checks": [
        "ガスの種類",
        "材料の耐性",
        "結露と換気"
      ],
      "referenceNumber": 79,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%98%e3%80%91%ef%bd%9c%e8%85%90%e9%a3%9f%e6%80%a7%e3%82%ac%e3%82%b9%e3%81%aa/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%98%e3%80%91%ef%bd%9c%e8%85%90%e9%a3%9f%e6%80%a7%e3%82%ac%e3%82%b9%e3%81%aa/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-080",
      "title": "火薬庫の設備を専門条件で確認する",
      "category": "環境・特殊場所",
      "keywords": [
        "火薬庫などの危険場所",
        "施設の分類",
        "静電気と雷",
        "専用設計条件"
      ],
      "summary": "火薬庫等は通常の危険場所とは別に施設と運用の条件を確認する必要がある。",
      "body": "火薬庫等は通常の危険場所とは別に施設と運用の条件を確認する必要がある。照明、電源、接地、雷保護、静電気への対策を関連法令と専用の設計条件で照合する。",
      "checks": [
        "施設の分類",
        "静電気と雷",
        "専用設計条件"
      ],
      "referenceNumber": 80,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%99%e3%80%91%ef%bd%9c%e7%81%ab%e8%96%ac%e5%ba%ab%e3%81%aa%e3%81%a9%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%97%ef%bc%99%e3%80%91%ef%bd%9c%e7%81%ab%e8%96%ac%e5%ba%ab%e3%81%aa%e3%81%a9%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-081",
      "title": "湿潤場所は人の接触条件も確認する",
      "category": "環境・特殊場所",
      "keywords": [
        "湿気の多い場所又は水気のある場所",
        "洗浄と浸水",
        "接地と漏電保護",
        "操作場所"
      ],
      "summary": "水気のある場所は人体の抵抗が下がるなど感電の条件が変わる。",
      "body": "水気のある場所は人体の抵抗が下がるなど感電の条件が変わる。機器の防水と取付方法に加え、接地、漏電保護、操作場所、洗浄水の方向を組み合わせて検討する。",
      "checks": [
        "洗浄と浸水",
        "接地と漏電保護",
        "操作場所"
      ],
      "referenceNumber": 81,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%90%e3%80%91%ef%bd%9c%e6%b9%bf%e6%b0%97%e3%81%ae%e5%a4%9a%e3%81%84%e5%a0%b4/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%90%e3%80%91%ef%bd%9c%e6%b9%bf%e6%b0%97%e3%81%ae%e5%a4%9a%e3%81%84%e5%a0%b4/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-082",
      "title": "興行場の仮設と常設を管理する",
      "category": "環境・特殊場所",
      "keywords": [
        "興行場",
        "仮設負荷",
        "吊物と配線",
        "避難経路"
      ],
      "summary": "舞台や催事の設備は移動や変更が多く、常設配線と仮設配線の境界が曖昧になりやすい。",
      "body": "舞台や催事の設備は移動や変更が多く、常設配線と仮設配線の境界が曖昧になりやすい。負荷、吊物、操作、避難経路を整理し、設置ごとの検査と撤去手順を決める。",
      "checks": [
        "仮設負荷",
        "吊物と配線",
        "避難経路"
      ],
      "referenceNumber": 82,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%91%e3%80%91%ef%bd%9c%e8%88%88%e8%a1%8c%e5%a0%b4/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%91%e3%80%91%ef%bd%9c%e8%88%88%e8%a1%8c%e5%a0%b4/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-083",
      "title": "電気さくには専用電源を用いる",
      "category": "特殊設備",
      "keywords": [
        "電気さくの施設",
        "専用電源装置",
        "危険表示",
        "電源の保護"
      ],
      "summary": "電気さくは一般の電源を直接つなぐ設備ではない。",
      "body": "電気さくは一般の電源を直接つなぐ設備ではない。専用電源装置と適用条件を確認し、人が近づける場所の標識、電源保護、停止操作を施設管理者と共有する。",
      "checks": [
        "専用電源装置",
        "危険表示",
        "電源の保護"
      ],
      "referenceNumber": 83,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e3%81%95%e3%81%8f%e3%81%ae%e6%96%bd/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e3%81%95%e3%81%8f%e3%81%ae%e6%96%bd/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-084",
      "title": "電撃殺虫器の接近を防ぐ",
      "category": "特殊設備",
      "keywords": [
        "電撃殺虫器の施設",
        "取付位置",
        "可燃性雰囲気",
        "清掃時の停止"
      ],
      "summary": "電撃殺虫器は内部の高電圧部へ人や物が触れない構造を維持する。",
      "body": "電撃殺虫器は内部の高電圧部へ人や物が触れない構造を維持する。取付位置、雨や可燃性雰囲気との関係を確認し、清掃時に電源を切り残留電荷へ対応できる手順を整える。",
      "checks": [
        "取付位置",
        "可燃性雰囲気",
        "清掃時の停止"
      ],
      "referenceNumber": 84,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%93%e3%80%91%ef%bd%9c%e9%9b%bb%e6%92%83%e6%ae%ba%e8%99%ab%e5%99%a8%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%93%e3%80%91%ef%bd%9c%e9%9b%bb%e6%92%83%e6%ae%ba%e8%99%ab%e5%99%a8%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-085",
      "title": "X線装置の電源と管理区分を確認する",
      "category": "特殊設備",
      "keywords": [
        "エックス線発生装置の施設",
        "メーカー電源仕様",
        "接地",
        "管理区域と連動"
      ],
      "summary": "X線装置はメーカーの電源仕様と医療・放射線管理の条件を合わせて確認する。",
      "body": "X線装置はメーカーの電源仕様と医療・放射線管理の条件を合わせて確認する。電源容量、接地、インターロック、保守時の切離しを図面化し、電気工事の責任範囲を明確にする。",
      "checks": [
        "メーカー電源仕様",
        "接地",
        "管理区域と連動"
      ],
      "referenceNumber": 85,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%94%e3%80%91%ef%bd%9c%e3%82%a8%e3%83%83%e3%82%af%e3%82%b9%e7%b7%9a%e7%99%ba/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%94%e3%80%91%ef%bd%9c%e3%82%a8%e3%83%83%e3%82%af%e3%82%b9%e7%b7%9a%e7%99%ba/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-086",
      "title": "配管加熱の温度と保護を確認する",
      "category": "動力・電熱",
      "keywords": [
        "パイプラインなどの電熱装置の施設",
        "流体と保温",
        "温度保護",
        "端末の防水"
      ],
      "summary": "パイプライン加熱は流体や保温材の条件で必要な熱量が変わる。",
      "body": "パイプライン加熱は流体や保温材の条件で必要な熱量が変わる。ヒータ形式、温度制御、過熱保護、接続部の防水を確認し、断熱工事の後でも点検できる位置に端末を設ける。",
      "checks": [
        "流体と保温",
        "温度保護",
        "端末の防水"
      ],
      "referenceNumber": 86,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%91%e3%82%a4%e3%83%97%e3%83%a9%e3%82%a4%e3%83%b3/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%91%e3%82%a4%e3%83%97%e3%83%a9%e3%82%a4%e3%83%b3/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-087",
      "title": "電気浴設備を専用の安全条件で扱う",
      "category": "特殊設備",
      "keywords": [
        "電気浴器の施設",
        "専用装置の仕様",
        "人体への電流",
        "操作と保守"
      ],
      "summary": "電気浴設備は人体と水に関係するため、通常の湿潤機器と同じ扱いでは不十分。",
      "body": "電気浴設備は人体と水に関係するため、通常の湿潤機器と同じ扱いでは不十分。専用装置の電流制限、絶縁、操作、保守条件をメーカー資料と関連基準で照合する。",
      "checks": [
        "専用装置の仕様",
        "人体への電流",
        "操作と保守"
      ],
      "referenceNumber": 87,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%96%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e6%b5%b4%e5%99%a8%e3%81%ae%e6%96%bd/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%96%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e6%b5%b4%e5%99%a8%e3%81%ae%e6%96%bd/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-088",
      "title": "銀イオン装置の電極回路を確認する",
      "category": "特殊設備",
      "keywords": [
        "銀イオン殺菌装置の施設",
        "専用電源",
        "水処理側の連動",
        "電極交換"
      ],
      "summary": "銀イオンによる処理設備では電極と水処理装置の制御を一体で確認する。",
      "body": "銀イオンによる処理設備では電極と水処理装置の制御を一体で確認する。専用電源、絶縁、接地、薬液との材料適合を調べ、電極交換時の停止と誤接続防止を計画する。",
      "checks": [
        "専用電源",
        "水処理側の連動",
        "電極交換"
      ],
      "referenceNumber": 88,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%97%e3%80%91%ef%bd%9c%e9%8a%80%e3%82%a4%e3%82%aa%e3%83%b3%e6%ae%ba%e8%8f%8c/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%97%e3%80%91%ef%bd%9c%e9%8a%80%e3%82%a4%e3%82%aa%e3%83%b3%e6%ae%ba%e8%8f%8c/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-089",
      "title": "電極加熱を水質と連動させる",
      "category": "特殊設備",
      "keywords": [
        "電極式温泉昇温器の施設",
        "水質と電流",
        "入浴側との隔離",
        "異常停止"
      ],
      "summary": "電極式の温泉昇温設備は水の導電性によって運転条件が変わる。",
      "body": "電極式の温泉昇温設備は水の導電性によって運転条件が変わる。専用装置の電流制御、絶縁、接地、入浴側との隔離を確認し、水質変化や異常時の停止手順を定める。",
      "checks": [
        "水質と電流",
        "入浴側との隔離",
        "異常停止"
      ],
      "referenceNumber": 89,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e6%a5%b5%e5%bc%8f%e6%b8%a9%e6%b3%89%e6%98%87/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%98%e3%80%91%ef%bd%9c%e9%9b%bb%e6%a5%b5%e5%bc%8f%e6%b8%a9%e6%b3%89%e6%98%87/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-090",
      "title": "電気防食の意図した電流を管理する",
      "category": "特殊設備",
      "keywords": [
        "電気防食施設",
        "電極と被防食物",
        "迷走電流",
        "保護接地との関係"
      ],
      "summary": "電気防食は腐食を抑えるために電流を流す設備。",
      "body": "電気防食は腐食を抑えるために電流を流す設備。一般の保護接地と目的を混同せず、電極・被防食物・電源の関係を図示し、迷走電流と他設備への影響を確認する。",
      "checks": [
        "電極と被防食物",
        "迷走電流",
        "保護接地との関係"
      ],
      "referenceNumber": 90,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%99%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e9%98%b2%e9%a3%9f%e6%96%bd%e8%a8%ad/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%98%ef%bc%99%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e9%98%b2%e9%a3%9f%e6%96%bd%e8%a8%ad/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-091",
      "title": "遊戯用電車の給電と接近を分ける",
      "category": "特殊設備",
      "keywords": [
        "遊戯用電車の施設",
        "給電部の保護",
        "乗降場所",
        "停止操作"
      ],
      "summary": "遊戯用電車は可動する車両と一般利用者が近接する。",
      "body": "遊戯用電車は可動する車両と一般利用者が近接する。給電方式、乗降場所、停止操作、導電部への接近防止を合わせて計画し、運転前点検と設備の隔離手順を整える。",
      "checks": [
        "給電部の保護",
        "乗降場所",
        "停止操作"
      ],
      "referenceNumber": 91,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%90%e3%80%91%ef%bd%9c%e9%81%8a%e6%88%af%e7%94%a8%e9%9b%bb%e8%bb%8a%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%90%e3%80%91%ef%bd%9c%e9%81%8a%e6%88%af%e7%94%a8%e9%9b%bb%e8%bb%8a%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-092",
      "title": "交通信号の電源管理を整理する",
      "category": "特殊設備",
      "keywords": [
        "交通信号灯の施設",
        "管理者の仕様",
        "道路上の経路",
        "停電と交通運用"
      ],
      "summary": "交通信号灯の施工は管理者の指定条件と電気設備の保護を合わせて行う。",
      "body": "交通信号灯の施工は管理者の指定条件と電気設備の保護を合わせて行う。制御盤、配線、接地、道路上の施工範囲を確認し、更新中の交通運用と停電手順を事前に調整する。",
      "checks": [
        "管理者の仕様",
        "道路上の経路",
        "停電と交通運用"
      ],
      "referenceNumber": 92,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%91%e3%80%91%ef%bd%9c%e4%ba%a4%e9%80%9a%e4%bf%a1%e5%8f%b7%e7%81%af%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%91%e3%80%91%ef%bd%9c%e4%ba%a4%e9%80%9a%e4%bf%a1%e5%8f%b7%e7%81%af%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-093",
      "title": "電気温床を土と水の条件に合わせる",
      "category": "動力・電熱",
      "keywords": [
        "電気温床などの施設",
        "専用加熱線",
        "作業工具の接触",
        "温度と漏電保護"
      ],
      "summary": "農業用の電気温床では加熱線が水分や農作業の影響を受ける。",
      "body": "農業用の電気温床では加熱線が水分や農作業の影響を受ける。専用加熱線、温度制御、漏電保護を確認し、埋設位置を表示して工具による損傷と交換時の誤操作を防ぐ。",
      "checks": [
        "専用加熱線",
        "作業工具の接触",
        "温度と漏電保護"
      ],
      "referenceNumber": 93,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e6%b8%a9%e5%ba%8a%e3%81%aa%e3%81%a9/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e6%b8%a9%e5%ba%8a%e3%81%aa%e3%81%a9/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-094",
      "title": "養生加熱線を仮設設備として管理する",
      "category": "動力・電熱",
      "keywords": [
        "コンクリート養生線の施設",
        "施工工程",
        "温度測定",
        "終了後の処理"
      ],
      "summary": "コンクリート養生の加熱設備は温度管理と電気保護の両方が必要。",
      "body": "コンクリート養生の加熱設備は温度管理と電気保護の両方が必要。打設・脱型の工程に合わせ、専用加熱線の施工、温度測定、漏電保護、使用終了時の処理を確認する。",
      "checks": [
        "施工工程",
        "温度測定",
        "終了後の処理"
      ],
      "referenceNumber": 94,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%93%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%b3%e3%82%af%e3%83%aa%e3%83%bc%e3%83%88/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%93%e3%80%91%ef%bd%9c%e3%82%b3%e3%83%b3%e3%82%af%e3%83%aa%e3%83%bc%e3%83%88/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-095",
      "title": "床暖房を床仕上げと合わせる",
      "category": "動力・電熱",
      "keywords": [
        "フロアヒーティングなどの施設",
        "床材の適合",
        "温度センサ",
        "家具と後施工"
      ],
      "summary": "床加熱はヒータだけでなく床材、接着剤、家具配置の影響を受ける。",
      "body": "床加熱はヒータだけでなく床材、接着剤、家具配置の影響を受ける。発熱体の配置と温度センサ、過熱保護を確認し、後施工のビスや断熱性の高い敷物による異常加熱を避ける。",
      "checks": [
        "床材の適合",
        "温度センサ",
        "家具と後施工"
      ],
      "referenceNumber": 95,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%94%e3%80%91%ef%bd%9c%e3%83%95%e3%83%ad%e3%82%a2%e3%83%92%e3%83%bc%e3%83%86/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%94%e3%80%91%ef%bd%9c%e3%83%95%e3%83%ad%e3%82%a2%e3%83%92%e3%83%bc%e3%83%86/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-096",
      "title": "蓄熱機器の運転時間を確認する",
      "category": "動力・電熱",
      "keywords": [
        "深夜電力機器の施設",
        "現行の契約",
        "時間制御",
        "過熱保護"
      ],
      "summary": "夜間運転や蓄熱を行う設備は、契約条件、制御時間、負荷の同時使用を確認する。",
      "body": "夜間運転や蓄熱を行う設備は、契約条件、制御時間、負荷の同時使用を確認する。古い料金制度を前提にせず現行契約を照合し、制御故障時の過熱と電源切離しにも対応する。",
      "checks": [
        "現行の契約",
        "時間制御",
        "過熱保護"
      ],
      "referenceNumber": 96,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%95%e3%80%91%ef%bd%9c%e6%b7%b1%e5%a4%9c%e9%9b%bb%e5%8a%9b%e6%a9%9f%e5%99%a8/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%95%e3%80%91%ef%bd%9c%e6%b7%b1%e5%a4%9c%e9%9b%bb%e5%8a%9b%e6%a9%9f%e5%99%a8/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-097",
      "title": "水中照明の電源方式を確認する",
      "category": "特殊設備",
      "keywords": [
        "水中照明灯などの施設",
        "専用機器",
        "電源の絶縁",
        "水中の接続部"
      ],
      "summary": "水中照明は人体、水、金属体が近接するため専用の安全条件で設計する。",
      "body": "水中照明は人体、水、金属体が近接するため専用の安全条件で設計する。電源の絶縁と電圧、機器の適合、ケーブルと接続部の防水を確認し、水中で一般接続を行わない。",
      "checks": [
        "専用機器",
        "電源の絶縁",
        "水中の接続部"
      ],
      "referenceNumber": 97,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%96%e3%80%91%ef%bd%9c%e6%b0%b4%e4%b8%ad%e7%85%a7%e6%98%8e%e7%81%af%e3%81%aa/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%96%e3%80%91%ef%bd%9c%e6%b0%b4%e4%b8%ad%e7%85%a7%e6%98%8e%e7%81%af%e3%81%aa/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-098",
      "title": "滑走路灯の給電方式を区別する",
      "category": "特殊設備",
      "keywords": [
        "滑走路灯など配線の施設",
        "指定給電方式",
        "地中配線",
        "空港運用との調整"
      ],
      "summary": "滑走路灯等は一般照明と異なる給電や制御を用いる場合がある。",
      "body": "滑走路灯等は一般照明と異なる給電や制御を用いる場合がある。空港管理者の指定、専用機器、地中配線、試験方法を確認し、運用中の施工範囲と停止手順を管理する。",
      "checks": [
        "指定給電方式",
        "地中配線",
        "空港運用との調整"
      ],
      "referenceNumber": 98,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%97%e3%80%91%ef%bd%9c%e6%bb%91%e8%b5%b0%e8%b7%af%e7%81%af%e3%81%aa%e3%81%a9/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%97%e3%80%91%ef%bd%9c%e6%bb%91%e8%b5%b0%e8%b7%af%e7%81%af%e3%81%aa%e3%81%a9/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-099",
      "title": "小勢力回路の電源条件を確認する",
      "category": "弱電・制御",
      "keywords": [
        "小勢力回路の施設",
        "電源の電圧と容量",
        "低圧回路との区分",
        "誤接続防止"
      ],
      "summary": "小勢力回路は名称だけで弱電と判断せず、電源の電圧・容量・絶縁条件を確認する。",
      "body": "小勢力回路は名称だけで弱電と判断せず、電源の電圧・容量・絶縁条件を確認する。低圧電力回路と交差・併設する場合は区分と保護を整理し、誤って電力が流入しない構成にする。",
      "checks": [
        "電源の電圧と容量",
        "低圧回路との区分",
        "誤接続防止"
      ],
      "referenceNumber": 99,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%98%e3%80%91%ef%bd%9c%e5%b0%8f%e5%8b%a2%e5%8a%9b%e5%9b%9e%e8%b7%af%e3%81%ae/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%98%e3%80%91%ef%bd%9c%e5%b0%8f%e5%8b%a2%e5%8a%9b%e5%9b%9e%e8%b7%af%e3%81%ae/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-100",
      "title": "表示回路の電源と配線を整える",
      "category": "弱電・制御",
      "keywords": [
        "出退表示灯回路の施設",
        "電源と表示器",
        "末端電圧",
        "回路の区分"
      ],
      "summary": "出退表示等の回路は電源装置と表示器を対応させる。",
      "body": "出退表示等の回路は電源装置と表示器を対応させる。複数箇所へ配線する場合は末端電圧や極性も確認し、電力線との区分と故障時に切り分けられる回路表示を残す。",
      "checks": [
        "電源と表示器",
        "末端電圧",
        "回路の区分"
      ],
      "referenceNumber": 100,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%99%e3%80%91%ef%bd%9c%e5%87%ba%e5%ba%ab%e8%a1%a8%e7%a4%ba%e7%81%af%e5%9b%9e/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%90%ef%bc%99%ef%bc%99%e3%80%91%ef%bd%9c%e5%87%ba%e5%ba%ab%e8%a1%a8%e7%a4%ba%e7%81%af%e5%9b%9e/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-101",
      "title": "特別低電圧照明の絶縁を保つ",
      "category": "弱電・制御",
      "keywords": [
        "特別低電圧照明回路の施設",
        "供給電源",
        "他回路との分離",
        "電圧降下"
      ],
      "summary": "特別低電圧照明は低い電圧だけで安全条件を満たすわけではない。",
      "body": "特別低電圧照明は低い電圧だけで安全条件を満たすわけではない。供給電源の絶縁・構成、配線の電流容量、他回路との分離を確認し、長距離配線の電圧降下も計算する。",
      "checks": [
        "供給電源",
        "他回路との分離",
        "電圧降下"
      ],
      "referenceNumber": 101,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%90%e3%80%91%ef%bd%9c%e7%89%b9%e5%88%a5%e5%ae%9a%e9%9b%bb%e5%9c%a7%e7%85%a7/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%90%e3%80%91%ef%bd%9c%e7%89%b9%e5%88%a5%e5%ae%9a%e9%9b%bb%e5%9c%a7%e7%85%a7/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-102",
      "title": "自走搬送装置の集電部を防護する",
      "category": "特殊設備",
      "keywords": [
        "集電式自走搬送装置の施設",
        "集電部の防護",
        "走行範囲",
        "保守時の隔離"
      ],
      "summary": "集電式の搬送装置では可動部と充電部が同時に存在する。",
      "body": "集電式の搬送装置では可動部と充電部が同時に存在する。集電レールへの接近防止、機械側の停止操作、保守時の隔離を検討し、走行範囲に人が入る条件を管理する。",
      "checks": [
        "集電部の防護",
        "走行範囲",
        "保守時の隔離"
      ],
      "referenceNumber": 102,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%91%e3%80%91%ef%bd%9c%e9%9b%86%e9%9b%bb%e5%bc%8f%e8%87%aa%e8%b5%b0%e6%90%ac/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%91%e3%80%91%ef%bd%9c%e9%9b%86%e9%9b%bb%e5%bc%8f%e8%87%aa%e8%b5%b0%e6%90%ac/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-103",
      "title": "電気集じんの高電圧部を隔離する",
      "category": "特殊設備",
      "keywords": [
        "電気集じん装置などの施設",
        "残留電荷",
        "扉の連動",
        "粉じんと清掃"
      ],
      "summary": "電気集じん装置は停止後にも電荷が残る場合がある。",
      "body": "電気集じん装置は停止後にも電荷が残る場合がある。専用電源、扉のインターロック、放電手順を確認し、粉じんの性質と清掃時の安全条件を一体で管理する。",
      "checks": [
        "残留電荷",
        "扉の連動",
        "粉じんと清掃"
      ],
      "referenceNumber": 103,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e9%9b%86%e3%81%98%e3%82%93%e8%a3%85/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e9%9b%86%e3%81%98%e3%82%93%e8%a3%85/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-104",
      "title": "めっき槽の電流経路を明確にする",
      "category": "特殊設備",
      "keywords": [
        "電気めっき槽の施設",
        "直流の極性",
        "接続部の発熱",
        "薬液と腐食"
      ],
      "summary": "電気めっきでは低い電圧でも大きな電流が流れる。",
      "body": "電気めっきでは低い電圧でも大きな電流が流れる。直流の極性、導体と接続部の発熱、薬液による腐食を確認し、作業者が触れる金属体の保護と保守停止を整理する。",
      "checks": [
        "直流の極性",
        "接続部の発熱",
        "薬液と腐食"
      ],
      "referenceNumber": 104,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%93%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e3%82%81%e3%81%a3%e3%81%8d%e6%a7%bd/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%93%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e3%82%81%e3%81%a3%e3%81%8d%e6%a7%bd/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-105",
      "title": "屋外低圧照明の回路を区分する",
      "category": "照明・器具",
      "keywords": [
        "低圧屋外照明の施設",
        "防水と接地",
        "点灯制御",
        "停電範囲"
      ],
      "summary": "屋外の低圧照明は人の接近、雨水、地中からの引出しを受ける。",
      "body": "屋外の低圧照明は人の接近、雨水、地中からの引出しを受ける。器具と配線の防水、接地、漏電保護、点灯制御をまとめて確認し、異常時の停電範囲を小さくできる回路を計画する。",
      "checks": [
        "防水と接地",
        "点灯制御",
        "停電範囲"
      ],
      "referenceNumber": 105,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%94%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e5%b1%8b%e5%a4%96%e7%85%a7%e6%98%8e/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%94%e3%80%91%ef%bd%9c%e4%bd%8e%e5%9c%a7%e5%b1%8b%e5%a4%96%e7%85%a7%e6%98%8e/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-106",
      "title": "トンネル配線の維持管理を確保する",
      "category": "環境・特殊場所",
      "keywords": [
        "トンネル、坑道その他これらに類する場所の施設",
        "湿気と振動",
        "点検アクセス",
        "非常時の照明"
      ],
      "summary": "トンネルや坑道では湿気、粉じん、車両振動、避難時の照明が関係する。",
      "body": "トンネルや坑道では湿気、粉じん、車両振動、避難時の照明が関係する。配線の防護と支持、点検アクセス、非常時の電源を確認し、使用環境に適合する設備を選ぶ。",
      "checks": [
        "湿気と振動",
        "点検アクセス",
        "非常時の照明"
      ],
      "referenceNumber": 106,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%88%e3%83%b3%e3%83%8d%e3%83%ab%e3%80%81%e5%9d%91/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%95%e3%80%91%ef%bd%9c%e3%83%88%e3%83%b3%e3%83%8d%e3%83%ab%e3%80%81%e5%9d%91/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-107",
      "title": "サウナの温度に配線を合わせる",
      "category": "環境・特殊場所",
      "keywords": [
        "サウナ風呂などの施設",
        "温度分布",
        "耐熱配線",
        "異常過熱保護"
      ],
      "summary": "サウナは高温と湿気が組み合わさる。",
      "body": "サウナは高温と湿気が組み合わさる。室内の温度分布を確認し、耐熱配線、器具の適合、ヒータの制御・過熱保護を選ぶ。一般浴室と同じ温度条件で設計しない。",
      "checks": [
        "温度分布",
        "耐熱配線",
        "異常過熱保護"
      ],
      "referenceNumber": 107,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%b5%e3%82%a6%e3%83%8a%e9%a2%a8%e5%91%82%e3%81%aa/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%96%e3%80%91%ef%bd%9c%e3%82%b5%e3%82%a6%e3%83%8a%e9%a2%a8%e5%91%82%e3%81%aa/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-108",
      "title": "異常温度を負荷条件と比較する",
      "category": "試験・保守",
      "keywords": [
        "電線異常温度",
        "測定時の負荷",
        "接続部の温度",
        "比較条件"
      ],
      "summary": "電線の発熱を調べるときは、電流、周囲温度、接続部、放熱状態を同時に記録する。",
      "body": "電線の発熱を調べるときは、電流、周囲温度、接続部、放熱状態を同時に記録する。サーモ画像だけで正常異常を決めず、同じ負荷条件で比較し、接触不良や過負荷を切り分ける。",
      "checks": [
        "測定時の負荷",
        "接続部の温度",
        "比較条件"
      ],
      "referenceNumber": 108,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%97%e3%80%91%ef%bd%9c%e9%9b%bb%e7%b7%9a%e7%95%b0%e5%b8%b8%e6%b8%a9%e5%ba%a6/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%97%e3%80%91%ef%bd%9c%e9%9b%bb%e7%b7%9a%e7%95%b0%e5%b8%b8%e6%b8%a9%e5%ba%a6/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-109",
      "title": "臨時電飾の使用期間を管理する",
      "category": "照明・器具",
      "keywords": [
        "臨時架空電飾の施設",
        "設置期間",
        "支持と電源",
        "雨と風"
      ],
      "summary": "臨時の架空電飾でも感電・落下・過負荷対策は必要。",
      "body": "臨時の架空電飾でも感電・落下・過負荷対策は必要。支持物と電源容量を確認し、雨天や風の条件、通行者の接近、点検担当者、使用後の撤去を設置計画へ含める。",
      "checks": [
        "設置期間",
        "支持と電源",
        "雨と風"
      ],
      "referenceNumber": 109,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%98%e3%80%91%ef%bd%9c%e8%87%a8%e6%99%82%e6%9e%b6%e7%a9%ba%e9%9b%bb%e9%a3%be/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%98%e3%80%91%ef%bd%9c%e8%87%a8%e6%99%82%e6%9e%b6%e7%a9%ba%e9%9b%bb%e9%a3%be/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-110",
      "title": "太陽光の直流側と連系側を分ける",
      "category": "発電・蓄電・EV",
      "keywords": [
        "系統連系型小出力太陽光発電設備の施設",
        "直流側の電圧",
        "連系保護",
        "停電時の隔離"
      ],
      "summary": "太陽光設備は日射があると直流側が発電を続ける。",
      "body": "太陽光設備は日射があると直流側が発電を続ける。交流の主遮断器だけで無電圧と判断せず、直流配線・コネクタ・開閉器と連系保護、表示、点検時の隔離を確認する。",
      "checks": [
        "直流側の電圧",
        "連系保護",
        "停電時の隔離"
      ],
      "referenceNumber": 110,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e7%b3%bb%e7%b5%b1%e9%80%a3%e6%90%ba%e5%9e%8b%e5%b0%8f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%90%ef%bc%99%e3%80%91%ef%bd%9c%e7%b3%bb%e7%b5%b1%e9%80%a3%e6%90%ba%e5%9e%8b%e5%b0%8f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-111",
      "title": "蓄電池と燃料電池の連系条件を整理する",
      "category": "発電・蓄電・EV",
      "keywords": [
        "系統連系型小出力燃料電池発電設備及び系統連系型小出力蓄電池設備の施設",
        "連系の協議",
        "充放電と切替",
        "換気と停止条件"
      ],
      "summary": "連系設備は電源装置の仕様と電力会社の条件を確認する。",
      "body": "連系設備は電源装置の仕様と電力会社の条件を確認する。蓄電池は充放電と非常時の切替、燃料電池は燃料系統や換気も関係するため、電気と機械の停止条件を共有する。",
      "checks": [
        "連系の協議",
        "充放電と切替",
        "換気と停止条件"
      ],
      "referenceNumber": 111,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%90%e3%80%91%ef%bd%9c%e7%b3%bb%e7%b5%b1%e9%80%a3%e7%b3%bb%e5%9e%8b%e5%b0%8f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%90%e3%80%91%ef%bd%9c%e7%b3%bb%e7%b5%b1%e9%80%a3%e7%b3%bb%e5%9e%8b%e5%b0%8f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-112",
      "title": "EV充電を長時間負荷として検討する",
      "category": "発電・蓄電・EV",
      "keywords": [
        "電気自動車等を充電するための設備等の施設",
        "同時充電台数",
        "専用回路",
        "漏電と衝突対策"
      ],
      "summary": "EV充電は継続時間が長く複数台の同時使用で負荷が増える。",
      "body": "EV充電は継続時間が長く複数台の同時使用で負荷が増える。受電容量、専用回路、端子の発熱、漏電保護、屋外での防水と車両衝突への対策を確認する。",
      "checks": [
        "同時充電台数",
        "専用回路",
        "漏電と衝突対策"
      ],
      "referenceNumber": 112,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%91%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e8%87%aa%e5%8b%95%e8%bb%8a%e7%ad%89/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%91%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e8%87%aa%e5%8b%95%e8%bb%8a%e7%ad%89/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-113",
      "title": "車両給電の切替と逆送を防ぐ",
      "category": "発電・蓄電・EV",
      "keywords": [
        "電気自動車等から電気を供給するための設備等の施設",
        "連系方式",
        "停電時の切替",
        "供給する負荷"
      ],
      "summary": "車両から建物へ供給する設備は、充電のみの設備とは構成が異なる。",
      "body": "車両から建物へ供給する設備は、充電のみの設備とは構成が異なる。連系方式、停電時の切替、接地と負荷範囲を確認し、意図しない系統側への逆送が起きない構成を選ぶ。",
      "checks": [
        "連系方式",
        "停電時の切替",
        "供給する負荷"
      ],
      "referenceNumber": 113,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e8%87%aa%e5%8b%95%e8%bb%8a%e7%ad%89/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%92%e3%80%91%ef%bd%9c%e9%9b%bb%e6%b0%97%e8%87%aa%e5%8b%95%e8%bb%8a%e7%ad%89/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-114",
      "title": "予備電源の必要負荷と時間を決める",
      "category": "発電・蓄電・EV",
      "keywords": [
        "予備電源施設",
        "優先負荷",
        "必要継続時間",
        "切替時の瞬断"
      ],
      "summary": "予備電源は容量だけでなく負荷の優先度と継続時間を決める。",
      "body": "予備電源は容量だけでなく負荷の優先度と継続時間を決める。発電機、UPS、蓄電池の特性を比べ、切替時の瞬断、始動電流、点検時の代替運転を含めて計画する。",
      "checks": [
        "優先負荷",
        "必要継続時間",
        "切替時の瞬断"
      ],
      "referenceNumber": 114,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%93%e3%80%91%ef%bd%9c%e4%ba%88%e5%82%99%e9%9b%bb%e6%ba%90%e6%96%bd%e8%a8%ad/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%93%e3%80%91%ef%bd%9c%e4%ba%88%e5%82%99%e9%9b%bb%e6%ba%90%e6%96%bd%e8%a8%ad/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-115",
      "title": "負荷集計から配線を組み立てる",
      "category": "設計の基本",
      "keywords": [
        "配線設計",
        "負荷集計",
        "電源方式と経路",
        "増設余裕"
      ],
      "summary": "配線設計は機器容量の一覧から始め、同時使用、電源方式、距離、工法を整理する。",
      "body": "配線設計は機器容量の一覧から始め、同時使用、電源方式、距離、工法を整理する。許容電流・電圧降下・保護協調を別々に照合し、盤と配線の増設余裕を図面へ反映する。",
      "checks": [
        "負荷集計",
        "電源方式と経路",
        "増設余裕"
      ],
      "referenceNumber": 115,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%94%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%94%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-116",
      "title": "電動機幹線の同時運転を整理する",
      "category": "動力・電熱",
      "keywords": [
        "配線設計(電動機)",
        "機器別定格",
        "始動の重なり",
        "幹線と分岐"
      ],
      "summary": "複数の電動機を含む回路は、各機器の定格と始動方式を集計する。",
      "body": "複数の電動機を含む回路は、各機器の定格と始動方式を集計する。始動が重なる場面、運転台数、過負荷保護を確認し、幹線と分岐の双方で適用する選定条件を照合する。",
      "checks": [
        "機器別定格",
        "始動の重なり",
        "幹線と分岐"
      ],
      "referenceNumber": 116,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%95%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88%ef%bc%88%e9%9b%bb/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%95%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88%ef%bc%88%e9%9b%bb/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-117",
      "title": "加熱負荷の連続使用を反映する",
      "category": "動力・電熱",
      "keywords": [
        "配線設計(加熱装置)",
        "入力と通電時間",
        "周囲温度",
        "独立の過熱保護"
      ],
      "summary": "加熱装置の配線では入力容量と運転時間、温度制御による通電割合を確認する。",
      "body": "加熱装置の配線では入力容量と運転時間、温度制御による通電割合を確認する。周囲温度による許容電流の低下も見込み、過熱時に制御だけに依存しない保護を計画する。",
      "checks": [
        "入力と通電時間",
        "周囲温度",
        "独立の過熱保護"
      ],
      "referenceNumber": 117,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%96%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88%ef%bc%88%e5%8a%a0/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%96%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%e8%a8%ad%e8%a8%88%ef%bc%88%e5%8a%a0/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-118",
      "title": "高圧設備の保安範囲を整理する",
      "category": "高圧・受変電",
      "keywords": [
        "高圧受電設備・高圧配線及び高圧機械器具に関するその他事項",
        "責任分界",
        "保護と接地",
        "保安体制"
      ],
      "summary": "高圧受電設備は責任分界、保護、接地、点検体制を一つの系統として整理する。",
      "body": "高圧受電設備は責任分界、保護、接地、点検体制を一つの系統として整理する。設備区分と届出等は現行制度で確認し、保安担当者と停電・点検・復電手順を共有する。",
      "checks": [
        "責任分界",
        "保護と接地",
        "保安体制"
      ],
      "referenceNumber": 118,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%ab%98%e5%9c%a7%e5%8f%97%e9%9b%bb%e8%a8%ad%e5%82%99/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%97%e3%80%91%ef%bd%9c%e9%ab%98%e5%9c%a7%e5%8f%97%e9%9b%bb%e8%a8%ad%e5%82%99/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-119",
      "title": "高圧ケーブルの施工履歴を残す",
      "category": "高圧・受変電",
      "keywords": [
        "配線(高圧配線)",
        "曲げと張力",
        "端末処理",
        "試験記録"
      ],
      "summary": "高圧配線はケーブルの曲げ、引張力、端末処理の品質が重要。",
      "body": "高圧配線はケーブルの曲げ、引張力、端末処理の品質が重要。電圧区分に適合する材料と施工条件を確認し、接地、識別、試験の記録を保守担当者へ引き継ぐ。",
      "checks": [
        "曲げと張力",
        "端末処理",
        "試験記録"
      ],
      "referenceNumber": 119,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%98%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%ef%bc%88%e9%ab%98%e5%9c%a7%e9%85%8d/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%98%e3%80%91%ef%bd%9c%e9%85%8d%e7%b7%9a%ef%bc%88%e9%ab%98%e5%9c%a7%e9%85%8d/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "electrical-120",
      "title": "高圧電動機の保護を機械と合わせる",
      "category": "高圧・受変電",
      "keywords": [
        "高圧電動機",
        "始動方式",
        "保護継電器",
        "保守時の隔離"
      ],
      "summary": "高圧電動機は始動方式、保護継電器、絶縁、接地を機器仕様と合わせる。",
      "body": "高圧電動機は始動方式、保護継電器、絶縁、接地を機器仕様と合わせる。機械側の異常停止や再始動条件を共有し、保守時の切離しと検電・接地の手順を定める。",
      "checks": [
        "始動方式",
        "保護継電器",
        "保守時の隔離"
      ],
      "referenceNumber": 120,
      "referenceUrl": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%99%e3%80%91%ef%bd%9c%e9%ab%98%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f/",
      "kind": "独自の実務概説",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "この概説への逐条適合を保証するものではない"
        },
        {
          "label": "HARITA：関連テーマの解説",
          "url": "https://harita2021.com/%e5%86%85%e7%b7%9a%e8%a6%8f%e7%a8%8b%e3%81%ae%e8%a7%a3%e9%87%88%e3%81%a8%e8%a7%a3%e8%aa%ac%e3%80%90%ef%bc%91%ef%bc%91%ef%bc%99%e3%80%91%ef%bd%9c%e9%ab%98%e5%9c%a7%e9%9b%bb%e5%8b%95%e6%a9%9f/",
          "role": "二次資料・テーマ参照",
          "scope": "本文・図表は収録していない"
        }
      ]
    },
    {
      "id": "practice-001",
      "title": "法令・民間規程・契約仕様を使い分ける",
      "category": "設計の基本",
      "keywords": [
        "資料の版",
        "契約で採用した仕様",
        "設計条件"
      ],
      "summary": "電気設備技術基準の省令、解釈、内線規程、契約図書は性格が異なる。",
      "body": "電気設備技術基準の省令、解釈、内線規程、契約図書は性格が異なる。工事の判断では法令への適合を確認した上で、契約で採用した仕様と設計条件を照合する。公共建築の標準仕様を全施設の法定最低値と考えない。",
      "checks": [
        "資料の版",
        "契約で採用した仕様",
        "設計条件"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-002",
      "title": "占積率と通線性を別々に確認する",
      "category": "配線・配管",
      "keywords": [
        "電線の実外径",
        "管の内径",
        "曲げと管長"
      ],
      "summary": "電線管の占積率は電線外径から占有断面積を計算する。",
      "body": "電線管の占積率は電線外径から占有断面積を計算する。占積率を満たしていても曲がりが多いと引入れが難しいため、管長、曲げ、プルボックス、将来の引替えも確認する。",
      "checks": [
        "電線の実外径",
        "管の内径",
        "曲げと管長"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ],
      "example": "例：外径4mmの電線3本は占有断面積約37.7mm²。内径16mmの管の断面積約201mm²に対し約18.8%。適用する占積率上限と通線性は別途確認する。"
    },
    {
      "id": "practice-003",
      "title": "防火区画貫通は認定工法で施工する",
      "category": "配線・配管",
      "keywords": [
        "区画の壁・床",
        "認定条件",
        "施工写真と表示"
      ],
      "summary": "防火区画の貫通は一般の穴埋めと区別する。",
      "body": "防火区画の貫通は一般の穴埋めと区別する。壁・床の種類、開口、配管やケーブルの構成が適合する認定工法を選び、材料、施工寸法、表示と記録をそろえる。",
      "checks": [
        "区画の壁・床",
        "認定条件",
        "施工写真と表示"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-004",
      "title": "保護協調で事故の停電範囲を抑える",
      "category": "保護・盤",
      "keywords": [
        "故障電流",
        "動作特性曲線",
        "メーカー協調資料"
      ],
      "summary": "下位の故障が上位まで停電を広げないよう、遮断器や継電器の動作特性を比較する。",
      "body": "下位の故障が上位まで停電を広げないよう、遮断器や継電器の動作特性を比較する。定格電流の大小だけで決めず、想定短絡電流とメーカーの協調資料で成立する範囲を確認する。",
      "checks": [
        "故障電流",
        "動作特性曲線",
        "メーカー協調資料"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-005",
      "title": "保護接地線と中性線を区別する",
      "category": "接地・雷保護",
      "keywords": [
        "系統接地方式",
        "所定接続点",
        "線色と端子"
      ],
      "summary": "保護接地線は故障時の安全、中性線は通常の負荷電流に関係する。",
      "body": "保護接地線は故障時の安全、中性線は通常の負荷電流に関係する。両者を現場判断で接続せず、系統の接地方式と所定の接続点を確認する。色と記号、端子を図面と一致させる。",
      "checks": [
        "系統接地方式",
        "所定接続点",
        "線色と端子"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-006",
      "title": "等電位ボンディングの対象を整理する",
      "category": "接地・雷保護",
      "keywords": [
        "対象金属体",
        "接続点",
        "導通確認"
      ],
      "summary": "接地抵抗が低いだけで近接する金属体の電位差がなくなるとは限らない。",
      "body": "接地抵抗が低いだけで近接する金属体の電位差がなくなるとは限らない。接触する可能性のある金属体と配管等の関係を調べ、所定のボンディングと導通確認を行う。",
      "checks": [
        "対象金属体",
        "接続点",
        "導通確認"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-007",
      "title": "ラックの荷重とケーブル固定を確認する",
      "category": "配線・配管",
      "keywords": [
        "許容荷重",
        "支持と耐震",
        "縦配線の固定"
      ],
      "summary": "ケーブルラックはケーブル重量、支持間隔、耐震条件を含めて選ぶ。",
      "body": "ケーブルラックはケーブル重量、支持間隔、耐震条件を含めて選ぶ。将来の増設を見込んでも許容荷重を超えないか確認し、縦配線や端末でケーブルへ張力が集中しないよう固定する。",
      "checks": [
        "許容荷重",
        "支持と耐震",
        "縦配線の固定"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ],
      "rules": [
        {
          "title": "ラックの水平支持",
          "value": "鋼製ラックは2m以下、その他は1.5m以下。",
          "condition": "接続部と端部付近にも支持する。許容荷重・耐震は別途確認。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.10.1",
            "pdfPage": 76
          }
        },
        {
          "title": "ラックの垂直支持",
          "value": "垂直支持間隔は原則3m以下。",
          "condition": "配線室等では6m以下の範囲で各階支持とできる。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.10.1",
            "pdfPage": 76
          }
        },
        {
          "title": "ラック支持用つりボルト",
          "value": "呼び幅600mm以下は呼び径9mm以上、600mm超は12mm以上。",
          "condition": "ラックの幅に対する標準仕様。荷重と耐震条件を追加確認。",
          "source": {
            "label": "国土交通省：公共建築工事標準仕様書（電気設備工事編）令和7年版",
            "url": "https://www.mlit.go.jp/gobuild/content/001888825.pdf",
            "role": "契約で採用した場合の標準仕様",
            "scope": "2025年5月12日改定。法定最低値と区別する。",
            "locator": "第2編 第2章 2.10.1",
            "pdfPage": 76
          }
        }
      ]
    },
    {
      "id": "practice-008",
      "title": "既設回路の実測から改修を判断する",
      "category": "試験・保守",
      "keywords": [
        "図面と現物",
        "実負荷",
        "絶縁と保護"
      ],
      "summary": "既設図面があっても現状と一致するとは限らない。",
      "body": "既設図面があっても現状と一致するとは限らない。回路の追跡、電圧・負荷電流、電線種類、遮断器、絶縁を確認し、増設可否を実測と現行条件で判断する。",
      "checks": [
        "図面と現物",
        "実負荷",
        "絶縁と保護"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    },
    {
      "id": "practice-009",
      "title": "三相入力の単位と効率をそろえる",
      "category": "設計の基本",
      "keywords": [
        "入力と出力",
        "力率と効率",
        "平衡条件"
      ],
      "summary": "平衡した三相負荷の有効入力はP=√3×線間電圧×電流×力率。",
      "body": "平衡した三相負荷の有効入力はP=√3×線間電圧×電流×力率。電動機の出力から入力を推定する場合は効率も必要で、銘板の出力kWをそのまま入力容量として使わない。",
      "checks": [
        "入力と出力",
        "力率と効率",
        "平衡条件"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ],
      "example": "例：平衡三相200V、10A、力率0.8なら、有効入力は約2.77kW。電動機出力を求めるには効率を別に掛ける。"
    },
    {
      "id": "practice-010",
      "title": "竣工試験を回路と記録で引き継ぐ",
      "category": "試験・保守",
      "keywords": [
        "試験項目",
        "測定条件",
        "未確認箇所"
      ],
      "summary": "竣工時は絶縁抵抗だけでなく、接地抵抗、導通、極性、動作、回路表示等を仕様に応じて確認する。",
      "body": "竣工時は絶縁抵抗だけでなく、接地抵抗、導通、極性、動作、回路表示等を仕様に応じて確認する。測定器、試験条件、対象回路、結果を記録し、未確認箇所を明確にして引き継ぐ。",
      "checks": [
        "試験項目",
        "測定条件",
        "未確認箇所"
      ],
      "kind": "独自の実務補足",
      "reviewStatus": "適用条件・数値は原典で個別確認",
      "updatedAt": "2026-10-05",
      "sources": [
        {
          "label": "経済産業省：電気保安関係の告示・内規",
          "url": "https://www.meti.go.jp/policy/safety_security/industrial_safety/law/denjikokuji.html",
          "role": "一次資料の確認先",
          "scope": "現行資料と施設条件を確認"
        }
      ]
    }
  ],
  "research": {
    "referenceIndex": "https://harita2021.com/naisen-kitei-matome/",
    "articleCount": 119,
    "method": "各テーマの独自概説を作成。原サイトの本文・画像・表を収録しない。",
    "limitations": [
      "特殊設備は概要のみ。専用規格の全条件は未収録。",
      "METI現行解釈PDFの直接取得は403。数値表は読めた公式資料の版と範囲を明示。"
    ],
    "accessedAt": "2026-10-05",
    "verifiedAccessibleArticleCount": 119
  }
};
