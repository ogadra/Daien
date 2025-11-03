# Daien (代演)

LLM の代わりに人力で Playwright MCP を呼び出すための Web アプリケーションです。

[Work≠Build Meetup Tokyo feat ryoppippi](https://wnb.connpass.com/event/371722/)にて、デモを行いました。

当日のスライドは[深堀り! Playwright MCP](https://slide.ogadra.com/playwright-mcp-deep-dive/)をご覧ください。

## 概要

Daien は、LLM による自動実行ではなく、手動で MCP ツールを呼び出すことができる Web アプリケーションです。

MCP サーバーに接続し、利用可能なツールの一覧を表示し、手動でパラメータを入力してツールを実行できます。

## 起動

```bash
docker compose up -d

# http://localhost:5173 で Daien クライアントにアクセスできます。
# http://localhost:8010/vnc.html で Playwright MCP サーバーが起動している Chrome ブラウザを確認できます。
```

## 機能

- MCP サーバーへの接続
- 利用可能なツールの一覧表示
- 手動でのツール実行とパラメータ入力
- 実行結果の表示

## 技術スタック

- **フロントエンド**: React 19 + TypeScript + Vite
- **UI ライブラリ**: Yamada UI
- **通信**: Model Context Protocol SDK (HTTP Transport)
- **開発環境**: Docker Compose


## プロジェクト構成

```
daien/
├── packages/
│   ├── client/          # React アプリケーション
│   └── ui/              # 共有 UI コンポーネント
└── compose.yml          # Docker Compose 設定
```

## MCP について

Model Context Protocol (MCP) は、AI アシスタントとローカルおよびリモートリソース間の標準化された通信プロトコルです。

Daien は Playwright MCP に接続し、ツールを手動で実行することで、LLM と MCP の動作を理解するのに役立ちます。
