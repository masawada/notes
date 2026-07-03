# notes.masawada.me

Obsidian vault を GitHub Pages で公開するためのリポジトリ。[Quartz v5](https://quartz.jzhao.xyz/) でビルドし、https://notes.masawada.me で配信する。

## 構成

```
pages/     Markdown ファイル (TITLE.md をフラットに配置)
images/    画像ファイル (ユニーク名でフラットに配置)
```

## 仕組み

- Obsidian で `pages/` と `images/` を編集する
- 自作プラグイン `note-sync` が保存を検知し、自動で git commit & push する
- GitHub Actions が Quartz v5 でビルドし、GitHub Pages にデプロイする

### note-sync プラグイン

`.obsidian/plugins/note-sync/` に配置。以下の機能を持つ。

- **自動同期**: `pages/` `images/` の変更を検知 → 10秒デバウンス → commit → push
- **画像リネーム**: ペースト/ドロップされた画像をユニーク名にリネームして `images/` に保存

プラグインのソース修正後は以下でリビルドする:

```
cd .obsidian/plugins/note-sync
npm install
npm run build
```

## セットアップ

1. GitHub リポジトリの Settings → Pages → Source を **GitHub Actions** に変更
2. DNS に CNAME レコードを追加: `notes.masawada.me` → `masawada.github.io`
3. Obsidian で vault を開き、Settings → Community plugins → 制限モードを解除 → note-sync を有効化
4. Obsidian からの自動 push 用に SSH キーまたは credential helper を設定
