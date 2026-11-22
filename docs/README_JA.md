# 📚 Windows ディスククリーンアップ自動化ビルダー - ドキュメント (Japanese)

**Windows Disk Cleanup Automation Builder (`v1.5.0`)** の公式日本語ドキュメントへようこそ。本ツールは、`cleanmgr.exe` や Windows レジストリ操作を活用し、最適化されたディスク空き容量確保バッチスクリプトおよびポータブル実行ファイル (`.exe`) を構築・生成する高パフォーマンスユーティリティです。

---

## 🌐 多言語およびローカライゼーション対応 (v1.5.0)

**v1.5.0** より、**システムロケール自動検出機能**（韓国語 `ko`、英語 `en`、日本語 `ja` 対応）が搭載され、以下の要素が自動的に適用されます：
- **GUI および Web プレビュー**: ボタン、ツールチップ、ログメッセージ、ステータス表示のローカライズ。
- **生成スクリプトコメント**: 生成されるバッチおよび PowerShell スクリプト内のコメントが、ユーザーの検出言語に自動フォーマットされます。
- **所属会社およびクレジット**: 所属会社 `(주)청운정보시스템` (`cisnet.co.kr`) および開発者 `AhBiYout` のクレジットが表示されます。

---

## 📂 ドキュメント目次

1. **[インストール・無人セットアップガイド](./INSTALL.md)**
   - Inno Setup インストーラー構造、サイレントインストールスイッチ、UAC 昇格ポリシー。
2. **[ビルド・パッケージングガイド](./BUILD.md)**
   - ローカルバッチビルド、PyInstaller バンドル化、GitHub Actions CI/CD ワークフロー。
3. **[パッチノート・変更履歴](./PATCH_NOTES.md)**
   - バージョン履歴、Windows.old 強制削除機能、パフォーマンス改善。
4. **[セキュリティ・プライバシーポリシー](./SECURITY.md)**
   - `.gitignore` セキュリティ除外、管理者権限の安全なガードレール。
5. **[開発ロードマップ](./ROADMAP.md)**
   - 実装マイルストーンと今後の計画。
6. **[公式ブログ記事テンプレート](./BLOG_POST.md)**
   - Google Blogger 等の技術ブログ用マーク다운原稿テンプレート。

---

## 🛠️ プロジェクトメタデータ

- **アプリケーション名**: Windows Disk Cleanup Automation Builder
- **バージョン**: `v1.5.0`
- **開発者**: `AhBiYout` (GitHub: `AhBiYout-all`)
- **所属会社**: `(주)청운정보시스템` (`cisnet.co.kr`)
- **公式ブログ**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **ライセンス**: MIT License ([`LICENSE`](../LICENSE))
- **リポジトリ**: `https://github.com/AhBiYout-all/windows-disk-cleanup-builder`
