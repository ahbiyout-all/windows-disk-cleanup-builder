# 📚 Windows ディスククリーンアップ自動化ビルダー - ドキュメント (Japanese)

**Windows Disk Cleanup Automation Builder (`v1.5.0`)** の公式日本語ドキュメントへようこそ。本ツールは、Windows レジストリ (`VolumeCaches`) と純正 `cleanmgr.exe` を連携させ、さらにロックされた `C:\Windows.old` フォルダも安全に消去する、Windows 10 / 11 向け無人ディスククリーンアップ自動化ツール（ポータブル EXE ＆ Inno Setup インストーラー）です。

---

## 🌐 多言語およびローカライゼーション対応 (v1.5.0)

**v1.5.0** より、**システムロケール自動検出機能**（韓国語 `ko`、英語 `en`、日本語 `ja` 対応）が搭載されました：
- **デスクトップ GUI (`disk_cleanup_gui.py`)**: Win32 API `GetUserDefaultUILanguage()`（および POSIX `locale` フォールバック）により OS の表示言語を自動判別し、UI ラベル、5段階の進行ログ、`Windows.old` 処理状況、GitHub 更新通知ダイアログをすべて日本語表示します。実行中に右上のコンボボックスから手動切り替えも可能です。
- **Inno Setup インストーラー (`installer.iss`)**: 韓国語 (`Korean.isl`)、英語 (`Default.isl`)、日本語 (`Japanese.isl`) に対応し、実行中プロセスの強制終了、旧バージョンを完全削除してからクリーンインストールする確認ダイアログ、MIT ライセンス同意、デスクトップショートカット既定オン、インストール完了後の自動起動を備えています。
- **Web プレビューサーバー (`server.js`)**: ブラウザの `navigator.language` を自動検出し、UI や生成される `.bat` / `.ps1` スクリプト内のコメントを動的に日本語化します。

---

## ⚡ クイックスタート (Quick Start)

### 1. インストール・サイレント導入
[GitHub Releases](https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases) から `WindowsDiskCleanup_Setup_v1.5.0.exe`、`DiskCleanupAuto_v1.5.0.exe`、または `WindowsDiskCleanup_Portable_v1.5.0.zip` をダウンロードしてください。

```cmd
:: 完全サイレントインストール（PC教室・社内一括展開向け）
WindowsDiskCleanup_Setup_v1.5.0.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART

:: サイレントアンインストール
"C:\Program Files\Windows Disk Cleanup Automation Builder\unins000.exe" /VERYSILENT /SUPPRESSMSGBOXES
```

### 2. 安全ガードレールとクリーンアップ手順
1. **UAC 管理者昇格**: `ShellExecuteW("runas")` により透明な管理者権限昇格を実行。
2. **レジストリ一括有効化**: `Previous Installations` や `Update Cleanup` を含む 15 項目の `VolumeCaches` に `StateFlags0064 = 2` を設定。
3. **カーネル同期監視**: `WaitForSingleObject` および `EnumWindows` により `cleanmgr.exe` 終了を正確に検知し、トレイのゴースト残像を自動リフレッシュ。
4. **Windows.old 安全ガードレール**: 3段階の強制削除 (`takeown` -> `icacls` -> `rd /s /q` および `\\?\` 長パス対応フォールバック) を実行する前に `%SystemDrive%\Windows.old\Users` 内の個人ファイルを事前スキャンし、個人データが検出された場合は安全のため削除を自動的にスキップします。

### 3. ローカルビルド手順 (Windows)
```cmd
:: ポータブル EXE・ポータブル ZIP・Inno Setup インストーラーを Release\ へ一括生成
build_exe.bat
```

---

## 📂 ドキュメント目次

1. **[インストール・無人セットアップガイド](./INSTALL.md)** — Inno Setup 構造、サイレントスイッチ、ファイアウォール規則自動登録。
2. **[ビルド・パッケージングガイド](./BUILD.md)** — ローカルバッチビルド、PyInstaller + ISCC、GitHub Actions CI/CD ワークフロー。
3. **[パッチノート・変更履歴](./PATCH_NOTES.md)** — `v1.0.0` 〜 `v1.5.0` の詳細な更新履歴。
4. **[セキュリティ・プライバシーポリシー](./SECURITY.md)** — UAC 権限モデル、`.gitignore` 除外、個人データ保護ガードレール。
5. **[開発ロードマップ](./ROADMAP.md)** — Phase 1〜24 の実装状況と今後の計画。
6. **[公式ブログ記事テンプレート](./BLOG_POST.md)** — Google Blogger 等の技術ブログ用マークダウン原稿テンプレート。

---

## 🛠️ プロジェクトメタデータ

- **アプリケーション名**: Windows Disk Cleanup Automation Builder (`DiskCleanupAuto`)
- **バージョン**: `v1.5.0`
- **開発者**: `AhBiYout` (GitHub: `AhBiYout-all`)
- **所属会社**: [(주)청운정보시스템](http://cisnet.co.kr) (`cisnet.co.kr`)
- **公式ブログ**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **ライセンス**: MIT License ([`LICENSE`](../LICENSE))
- **リポジトリ**: `https://github.com/AhBiYout-all/windows-disk-cleanup-builder`
