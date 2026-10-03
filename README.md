# AI WorkLab Link Hub

AI WorkLabのアフィリエイト運用向け、軽量な計測リンク発行・分析ツールです。

## v0.1

- 商品 / 用途 / 訴求メモ / A8 URL を入力して計測URLを管理
- `/go/{id}` から広告URLへ302リダイレクト
- ZENCHORD 1 の初期リンクを登録済み
- 管理画面の入力内容はブラウザの localStorage に保存
- DBなし

## 次に実装するもの

1. GA4 Measurement Protocolで `/go/*` のクリックイベントを保存
2. GA4 Data APIからクリック数を管理画面へ表示
3. PLAUD / Aiarty の計測リンク登録
4. 投稿本文・訴求タイプをリンクに紐付ける
5. 成績の良い訴求から次のX投稿案を生成

## Local

```bash
npm install
npm run dev
```

http://localhost:3000

## 方針

分析のための入力作業を増やさず、普段どおりXや記事にリンクを貼るだけで改善データが蓄積する仕組みを目指します。
