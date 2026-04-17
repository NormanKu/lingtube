# LingTube

一個 YouTube 語言學習網頁工具。貼上影片連結，自動擷取字幕、產出重點句、克漏字、FSI 句型操練，並支援影片段落控制與間隔重複練習。

## Features

- 🎯 **重點句抽取** — AI 自動辨識具有學習價值的句子（日常、商務、文法、慣用語、俚語）
- 📝 **克漏字測驗** — 填空練習含提示、文法解說與口語用法說明（繁體中文）
- 🔁 **FSI 句型操練** — 替換 / 轉換 / 反應三種練習
- 🎥 **影片播放控制** — 點擊句子跳轉、A/B loop、速度調整、鍵盤快捷鍵
- 📊 **間隔重複** — SM-2 演算法，標記不熟的句子自動排入複習佇列
- 🌐 **雙語介面** — 中文 / 英文切換

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數（擇一）
cp .env.example .env
# 編輯 .env 填入 OPENAI_API_KEY 或 ANTHROPIC_API_KEY

# 3. 啟動開發環境
npm run dev
# 前端：http://localhost:5173
# 後端：http://localhost:3001
```

## 使用方式

### 方式 A：API 模式（即時分析）

需要 OpenAI 或 Anthropic API key。在網頁右上角 AI Settings 設定 provider，貼上 YouTube 連結即可。

### 方式 B：CLI 模式（使用 Claude Code 訂閱，免 API key）

```bash
npm run generate "https://www.youtube.com/watch?v=VIDEO_ID"

# 指定字幕語言
npm run generate "https://youtu.be/VIDEO_ID" -- --lang ja

# 只產重點句與克漏字，跳過 FSI（較快）
npm run generate "https://youtu.be/VIDEO_ID" -- --skip-fsi
```

生成的 JSON 會存到 `data/<videoId>.json`，網頁啟動後會自動列出。

## 技術棧

- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3 + React Router 6 + TypeScript
- **Backend**: Node.js + Express + TypeScript + zod
- **AI**: OpenAI / Claude API（可切換架構）
- **Storage**: LocalStorage（客戶端）+ JSON 檔案（CLI 生成）
- **字幕**: youtube-transcript

## 專案結構

```
lingtube/
├── client/              # React 前端
├── server/              # Express 後端
├── packages/shared/     # 前後端共用型別
├── cli/                 # Claude Code 生成 CLI
├── data/                # 預先生成的學習素材 JSON
└── README.md
```

## Scripts

| 指令 | 說明 |
|------|------|
| `npm run dev` | 同時啟動前後端 |
| `npm run build` | 建置前端 |
| `npm run typecheck` | 型別檢查 |
| `npm run generate <URL>` | CLI 生成學習素材 |

## 鍵盤快捷鍵

| 按鍵 | 功能 |
|------|------|
| `Space` | 播放 / 暫停 |
| `← →` | 前 / 後跳 5 秒 |
| `[ ]` | 減速 / 加速 |
| `L` | 切換 A/B loop |

## License

MIT
