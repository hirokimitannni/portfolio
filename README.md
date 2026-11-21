# HIROKI MITA — Portfolio

公開用のサイト一式です。このフォルダ（`site/`）の中身をそのままアップすれば動きます。

## 構成
- `index.html` … ページ本体（文章の修正はここ）
- `css/style.css` … デザイン
- `js/main.js` … 動き・動画プレイヤー・お問い合わせフォーム
- `assets/video/` … Web用に圧縮した動画（元データは `../MOVIE` などにそのまま残っています）
- `assets/img/` … 写真とサムネイル

## お問い合わせフォームを有効にする
`js/main.js` の `FORM_ENDPOINT` に、フォーム送信サービス（例: Formspree）の送信先URLを入れると、
フォームの内容がメールで届くようになります。未設定の間は「準備中」と表示されます。

```js
const FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

## ローカルで確認
```bash
python3 -m http.server 8765 --directory site
```
→ http://localhost:8765
