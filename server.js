import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.DEFAULT_APP_PORT || '3000', 10);
const HOST = '0.0.0.0';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AhBiYout Windows Disk Cleanup Auto (v1.6.0)</title>
    <meta name="description" content="Windows 11/10 무인 디스크 정리 자동화 도구 및 Inno Setup 인스톨러 빌더 (AhBiYout)">
    <meta property="og:title" content="AhBiYout Windows Disk Cleanup Auto (v1.6.0)">
    <meta property="og:description" content="Windows 정품 cleanmgr 엔진 & Windows.old 강제 소거 자동화 빌더">
    <link rel="icon" type="image/x-icon" href="/app.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
                <img src="/assets/app.ico" alt="Logo" class="w-8 h-8 rounded-lg shadow" onerror="this.src='/icon.png'">
                <div>
                    <h1 class="text-lg font-bold text-white flex items-center gap-2">
                        <span data-i18n="app_name">Windows Disk Cleanup Auto</span>
                        <span class="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">v1.6.0 Stable</span>
                    </h1>
                    <p class="text-xs text-slate-400">AhBiYout · <span data-i18n="locale_badge">Auto Locale</span></p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <select id="langSelect" onchange="changeLang(this.value)" class="text-xs bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer">
                    <option value="ko">한국어 (KO)</option>
                    <option value="en">English (EN)</option>
                    <option value="ja">日本語 (JA)</option>
                </select>
                <a href="https://github.com/AhBiYout-all/windows-disk-cleanup-builder" target="_blank" rel="noopener noreferrer" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5" data-i18n="github_repo">
                    GitHub Repo
                </a>
                <a href="https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases" target="_blank" rel="noopener noreferrer" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow" data-i18n="releases">
                    Releases
                </a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <!-- Hero Banner -->
        <div class="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-6 md:p-8">
            <div class="max-w-3xl space-y-3">
                <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span data-i18n="hero_badge">Windows 11 24H2 / 26H1 Windows.old 강제 권한 탈취 및 소거 지원</span>
                </div>
                <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight" data-i18n="hero_title">
                    무인 자동화 정품 Windows 디스크 클리너 & 인스톨러 빌더
                </h2>
                <p class="text-sm md:text-base text-slate-300 leading-relaxed" data-i18n="hero_desc">
                    본 저장소는 Windows 공식 cleanmgr.exe 엔진 및 커널 동기화 API를 제어하여 시스템 드라이브(%SystemDrive%)의 캐시, 휴지통, WinSxS 업데이트 찌꺼기, 잠긴 Windows.old 폴더를 안전하게 100% 소거합니다.
                </p>
            </div>
        </div>

        <!-- Core Files Grid -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-white" data-i18n="core_title">📦 GitHub 저장소 핵심 배포 구성</h3>
                    <p class="text-xs text-slate-400" data-i18n="core_desc">웹 프론트엔드 부산물 없이 순수 데스크톱 앱과 빌드 도구만 엄선되었습니다.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Card 1 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-indigo-400 font-mono text-sm font-semibold mb-1">disk_cleanup_gui.py</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card1_desc">Tkinter GUI 및 Win32 커널 연동 Windows 디스크 정리 엔진 (Python)</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card1_tag">Windows.old 강제 소거 · 다국어 자동 감지</div>
                </div>

                <!-- Card 2 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-emerald-400 font-mono text-sm font-semibold mb-1">installer.iss</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card2_desc">Inno Setup 6.x 언팩 개별 설치 & 방화벽 규칙 자동 등록</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card2_tag">한/영/일 설치 지원 · 무인 설치 지원</div>
                </div>

                <!-- Card 3 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-violet-400 font-mono text-sm font-semibold mb-1">build_exe.bat / build_exe.py</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card3_desc">원클릭 단독 포터블 EXE 및 Inno Setup 인스톨러 자동 컴파일러</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card3_tag">PyInstaller + ISCC 자동 연동</div>
                </div>

                <!-- Card 4 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-amber-400 font-mono text-sm font-semibold mb-1">.github/workflows/release.yml</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card4_desc">GitHub Actions CI/CD 릴리스 자동화 (단일 통합 잡)</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card4_tag">Windows-latest 런너 · Setup, Portable EXE & ZIP</div>
                </div>

                <!-- Card 5 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-cyan-400 font-mono text-sm font-semibold mb-1">version_info.txt & app.ico</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card5_desc">PE 리소스 속성 '자세히' 탭 메타데이터 및 멀티 해상도 아이콘</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card5_tag">16x16 ~ 256x256 멀티 아이콘</div>
                </div>

                <!-- Card 6 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-rose-400 font-mono text-sm font-semibold mb-1">docs/ & LICENSE</div>
                    <p class="text-xs text-slate-400 mb-3" data-i18n="card6_desc">다국어 문서(KO/EN/JA), 설치/빌드/보안 가이드 및 MIT 라이선스</p>
                    <div class="text-[11px] text-slate-500 font-mono" data-i18n="card6_tag">MIT License · README_EN / README_JA</div>
                </div>
            </div>
        </div>

        <!-- Dynamic Localized Script Comment Preview -->
        <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h3 class="text-md font-bold text-white" data-i18n="script_title">📝 자동 감지 언어 기반 생성 스크립트 주석 미리보기</h3>
                    <p class="text-xs text-slate-400" data-i18n="script_desc">사용자 브라우저/OS 로케일에 맞춰 스크립트 헤더 주석과 실행 안내가 동적으로 생성됩니다.</p>
                </div>
                <div class="flex items-center gap-2">
                    <button id="btnBatch" onclick="setScriptMode('bat')" class="text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono cursor-pointer transition">Batch (.bat)</button>
                    <button id="btnPs" onclick="setScriptMode('ps1')" class="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono cursor-pointer transition">PowerShell (.ps1)</button>
                    <button id="btnCopy" onclick="copyScript()" class="text-xs px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition" data-i18n="copy_btn">복사</button>
                </div>
            </div>
            <pre id="scriptOutput" class="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-emerald-300 font-mono overflow-x-auto leading-relaxed"></pre>
        </div>

        <!-- Build Instructions -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h3 class="text-md font-bold text-white flex items-center gap-2" data-i18n="build_title">
                🔨 로컬 빌드 및 배포 방법
            </h3>
            <div class="space-y-3 text-xs md:text-sm text-slate-300">
                <div class="flex items-start gap-2">
                    <span class="bg-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded">1</span>
                    <p data-i18n="build_1">Windows 로컬에서 build_exe.bat를 실행하면 Release\\DiskCleanupAuto_v1.6.0.exe, WindowsDiskCleanup_Portable_v1.6.0.zip 및 WindowsDiskCleanup_Setup_v1.6.0.exe가 자동 생성됩니다.</p>
                </div>
                <div class="flex items-start gap-2">
                    <span class="bg-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded">2</span>
                    <p data-i18n="build_2">git push 또는 버전 태그(v1.6.0) 푸시 시 .gitignore로 임시 파일이 자동 제외되고 GitHub Actions가 공식 바이너리를 자동 빌드 및 릴리스합니다.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-6 bg-slate-950 text-xs text-slate-500 text-center space-y-1.5">
        <div>
            Copyright (c) 2026 <span class="text-slate-400">AhBiYout</span>. All rights reserved.
        </div>
        <div class="text-slate-400">
            <span data-i18n="affiliation">소속회사</span>: <span class="text-slate-300 font-medium">(주)청운정보시스템</span> ( <a href="http://cisnet.co.kr" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition">cisnet.co.kr</a> )
        </div>
    </footer>
    <script>
        const i18n = {
            ko: {
                app_name: "Windows Disk Cleanup Auto",
                locale_badge: "시스템 언어 자동 감지 (KO)",
                github_repo: "GitHub Repo",
                releases: "Releases",
                hero_badge: "Windows 11 24H2 / 26H1 Windows.old 강제 권한 탈취 및 소거 지원",
                hero_title: "무인 자동화 정품 Windows 디스크 클리너 & 인스톨러 빌더",
                hero_desc: "본 저장소는 Windows 공식 cleanmgr.exe 엔진 및 커널 동기화 API를 제어하여 시스템 드라이브(%SystemDrive%)의 캐시, 휴지통, WinSxS 업데이트 찌꺼기, 잠긴 Windows.old 폴더를 안전하게 100% 소거합니다.",
                core_title: "📦 GitHub 저장소 핵심 배포 구성",
                core_desc: "웹 프론트엔드 부산물 없이 순수 데스크톱 앱과 빌드 도구만 엄선되었습니다.",
                card1_desc: "Tkinter GUI 및 Win32 커널 연동 Windows 디스크 정리 엔진 (Python)",
                card1_tag: "Windows.old 강제 소거 · 다국어 자동 감지",
                card2_desc: "Inno Setup 6.x 언팩 개별 설치 & 방화벽 규칙 자동 등록",
                card2_tag: "한/영/일 설치 지원 · 무인 설치 지원",
                card3_desc: "원클릭 단독 포터블 EXE 및 Inno Setup 인스톨러 자동 컴파일러",
                card3_tag: "PyInstaller + ISCC 자동 연동",
                card4_desc: "GitHub Actions CI/CD 릴리스 자동화 (단일 통합 잡)",
                card4_tag: "Windows-latest 런너 · Setup, Portable EXE & ZIP",
                card5_desc: "PE 리소스 속성 '자세히' 탭 메타데이터 및 멀티 해상도 아이콘",
                card5_tag: "16x16 ~ 256x256 멀티 아이콘",
                card6_desc: "다국어 문서(KO/EN/JA), 설치/빌드/보안 가이드 및 MIT 라이선스",
                card6_tag: "MIT License · README_EN / README_JA",
                script_title: "📝 자동 감지 언어 기반 생성 스크립트 주석 미리보기",
                script_desc: "사용자 브라우저/OS 로케일에 맞춰 스크립트 헤더 주석과 실행 안내가 동적으로 생성됩니다.",
                copy_btn: "복사",
                copied_btn: "복사됨!",
                build_title: "🔨 로컬 빌드 및 배포 방법",
                build_1: "Windows 로컬에서 build_exe.bat를 실행하면 Release\\\\DiskCleanupAuto_v1.6.0.exe, WindowsDiskCleanup_Portable_v1.6.0.zip 및 WindowsDiskCleanup_Setup_v1.6.0.exe가 자동 생성됩니다.",
                build_2: "git push 또는 버전 태그(v1.6.0) 푸시 시 .gitignore로 임시 파일이 자동 제외되고 GitHub Actions가 공식 바이너리를 자동 빌드 및 릴리스합니다.",
                affiliation: "소속회사",
                c_header: "자동 생성된 디스크 정리 스크립트 (AhBiYout Windows Disk Cleanup Auto v1.6.0)",
                c_step1: "1단계: 관리자 권한 확인 및 VolumeCaches StateFlags0064 레지스트리 활성화",
                c_step2: "2단계: cleanmgr.exe 무인 순차 실행 (/sagerun:64)",
                c_step3: "3단계: Windows.old 안전 가드레일 점검 후 권한 탈취 및 완전 소거"
            },
            en: {
                app_name: "Windows Disk Cleanup Auto",
                locale_badge: "Auto-Detected Locale (EN)",
                github_repo: "GitHub Repo",
                releases: "Releases",
                hero_badge: "Supports Windows 11 24H2 / 26H1 Windows.old Forced Takeown & Purge",
                hero_title: "Automated Native Windows Disk Cleaner & Installer Builder",
                hero_desc: "This repository safely purges 100% of system caches, recycle bin, WinSxS update residue, and locked Windows.old folders on the system drive (%SystemDrive%) using the official cleanmgr.exe engine and kernel sync APIs.",
                core_title: "📦 Core GitHub Deployment Manifest",
                core_desc: "Pure desktop application & build tools strictly curated without web frontend clutter.",
                card1_desc: "Tkinter GUI & Win32 kernel-hooked Windows Disk Cleanup engine (Python)",
                card1_tag: "Windows.old Force Purge · Auto Locale",
                card2_desc: "Inno Setup 6.x unpacked installation & quiet firewall registration",
                card2_tag: "KO/EN/JA Installer · Silent Mode",
                card3_desc: "One-click portable EXE & Inno Setup installer automated compiler",
                card3_tag: "PyInstaller + ISCC Integration",
                card4_desc: "GitHub Actions CI/CD automated release pipeline (Unified Job)",
                card4_tag: "windows-latest · Setup, Portable EXE & ZIP",
                card5_desc: "Windows PE Details metadata & multi-resolution app icon assets",
                card5_tag: "16x16 ~ 256x256 Multi-Icon",
                card6_desc: "Multilingual docs (KO/EN/JA), Install/Build/Security guides & MIT License",
                card6_tag: "MIT License · README_EN / README_JA",
                script_title: "📝 Dynamic Script Comment Preview (Active Locale)",
                script_desc: "Generated script header comments and step instructions automatically adapt to your detected browser/OS language.",
                copy_btn: "Copy",
                copied_btn: "Copied!",
                build_title: "🔨 Local Build & Deployment",
                build_1: "Run build_exe.bat locally on Windows to automatically generate Release\\\\DiskCleanupAuto_v1.6.0.exe, WindowsDiskCleanup_Portable_v1.6.0.zip, and WindowsDiskCleanup_Setup_v1.6.0.exe.",
                build_2: "Pushing git commits or version tags (v1.6.0) automatically excludes temp files via .gitignore and triggers GitHub Actions to build & release official binaries.",
                affiliation: "Affiliation",
                c_header: "Auto-generated Disk Cleanup Script (AhBiYout Windows Disk Cleanup Auto v1.6.0)",
                c_step1: "Step 1: Verify Admin rights & activate VolumeCaches StateFlags0064 registry keys",
                c_step2: "Step 2: Execute cleanmgr.exe unattended sequential cleanup (/sagerun:64)",
                c_step3: "Step 3: Run Windows.old safety guardrail check, takeown, and purge"
            },
            ja: {
                app_name: "Windows Disk Cleanup Auto",
                locale_badge: "システム言語自動検出 (JA)",
                github_repo: "GitHub Repo",
                releases: "Releases",
                hero_badge: "Windows 11 24H2 / 26H1 Windows.old 強制権限奪取・完全削除対応",
                hero_title: "無人自動化・純正Windowsディスククリーナー ＆ インストーラービルダー",
                hero_desc: "本リポジトリは、Windows公式cleanmgr.exeエンジンおよびカーネル同期APIを制御し、システムドライブ(%SystemDrive%)のキャッシュ、ごみ箱、WinSxSアップデート残骸、ロックされたWindows.oldフォルダを安全に100%消去します。",
                core_title: "📦 GitHubリポジトリ主要デプロイ構成",
                core_desc: "ウェブフロントエンドの成果物を除外し、純粋なデスクトップアプリとビルドツールのみを厳選。",
                card1_desc: "Tkinter GUIおよびWin32カーネル連携ディスククリーンアップエンジン (Python)",
                card1_tag: "Windows.old 強制削除 · 多言語自動検出",
                card2_desc: "Inno Setup 6.x 個別ファイル展開 ＆ ファイアウォール規則自動登録",
                card2_tag: "韓/英/日 インストーラー · サイレント対応",
                card3_desc: "ワンクリック単体ポータブルEXEおよびインストーラー自動コンパイラ",
                card3_tag: "PyInstaller + ISCC 自動連携",
                card4_desc: "GitHub Actions CI/CD リリース自動化 (単一統合ジョブ)",
                card4_tag: "windows-latest · Setup, Portable EXE & ZIP",
                card5_desc: "PEリソースプロパティ「詳細」メタデータおよび高解像度マルチアイコン",
                card5_tag: "16x16 ~ 256x256 マルチアイコン",
                card6_desc: "多言語ドキュメント(KO/EN/JA)、導入/ビルド/セキュリティガイド & MITライセンス",
                card6_tag: "MIT License · README_EN / README_JA",
                script_title: "📝 検出言語ベース 生成スクリプトコメントプレビュー",
                script_desc: "ブラウザ/OSロケールに応じてスクリプト内のヘッダーコメントや手順案内が動的に切り替わります。",
                copy_btn: "コピー",
                copied_btn: "コピー完了!",
                build_title: "🔨 ローカルビルドとデプロイ方法",
                build_1: "Windowsローカルで build_exe.bat を実行すると、Release\\\\DiskCleanupAuto_v1.6.0.exe、WindowsDiskCleanup_Portable_v1.6.0.zip、および WindowsDiskCleanup_Setup_v1.6.0.exe が自動生成されます。",
                build_2: "git push またはバージョンタグ (v1.6.0) のプッシュ時、.gitignoreにより一時ファイルが自動除外され、GitHub Actionsが公式バイナリを自動ビルド・リリースします。",
                affiliation: "所属会社",
                c_header: "自動生成されたディスククリーンアップスクリプト (AhBiYout Windows Disk Cleanup Auto v1.6.0)",
                c_step1: "ステップ1: 管理者権限の確認および VolumeCaches StateFlags0064 レジストリの有効化",
                c_step2: "ステップ2: cleanmgr.exe 無人順次実行 (/sagerun:64)",
                c_step3: "ステップ3: Windows.old 安全ガードレール確認後に権限取得・完全削除"
            }
        };

        let activeLang = "ko";
        let scriptMode = "bat";

        function detectBrowserLang() {
            const raw = (navigator.language || navigator.userLanguage || (navigator.languages && navigator.languages[0]) || "ko").toLowerCase();
            if (raw.startsWith("ja")) return "ja";
            if (raw.startsWith("en")) return "en";
            if (raw.startsWith("ko")) return "ko";
            return "ko";
        }

        function renderScriptPreview() {
            const dict = i18n[activeLang] || i18n.ko;
            const out = document.getElementById("scriptOutput");
            if (!out) return;
            if (scriptMode === "bat") {
                out.textContent = [
                    "@echo off",
                    ":: =============================================================================",
                    ":: " + dict.c_header,
                    ":: Developer: AhBiYout | Affiliation: (주)청운정보시스템 (cisnet.co.kr)",
                    ":: =============================================================================",
                    "",
                    'REM ' + dict.c_step1,
                    'reg add "HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Explorer\\\\VolumeCaches\\\\Temporary Files" /v StateFlags0064 /t REG_DWORD /d 2 /f >nul',
                    '',
                    'REM ' + dict.c_step2,
                    'cleanmgr.exe /sagerun:64',
                    '',
                    'REM ' + dict.c_step3,
                    'if exist "%SystemDrive%\\\\Windows.old" (',
                    '    takeown /F "%SystemDrive%\\\\Windows.old" /A /R /D Y >nul 2>&1',
                    '    icacls "%SystemDrive%\\\\Windows.old" /grant *S-1-5-32-544:F /T /C /Q >nul 2>&1',
                    '    rd /s /q "%SystemDrive%\\\\Windows.old"',
                    ')'
                ].join("\\n");
            } else {
                out.textContent = [
                    "# =============================================================================",
                    "# " + dict.c_header,
                    "# Developer: AhBiYout | Affiliation: (주)청운정보시스템 (cisnet.co.kr)",
                    "# =============================================================================",
                    "",
                    "# " + dict.c_step1,
                    "$regBase = 'HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Explorer\\\\VolumeCaches'",
                    "Get-ChildItem $regBase | ForEach-Object {",
                    "    Set-ItemProperty -Path $_.PSPath -Name 'StateFlags0064' -Value 2 -Type DWord -ErrorAction SilentlyContinue",
                    "}",
                    "",
                    "# " + dict.c_step2,
                    "Start-Process -FilePath 'cleanmgr.exe' -ArgumentList '/sagerun:64' -Wait",
                    "",
                    "# " + dict.c_step3,
                    "$winOld = Join-Path $env:SystemDrive 'Windows.old'",
                    "if (Test-Path $winOld) {",
                    "    takeown /F $winOld /A /R /D Y | Out-Null",
                    "    icacls $winOld /grant '*S-1-5-32-544:F' /T /C /Q | Out-Null",
                    "    Remove-Item $winOld -Recurse -Force -ErrorAction SilentlyContinue",
                    "}"
                ].join("\\n");
            }
        }

        function setScriptMode(mode) {
            scriptMode = mode;
            const bBat = document.getElementById("btnBatch");
            const bPs = document.getElementById("btnPs");
            if (bBat && bPs) {
                bBat.className = mode === "bat"
                    ? "text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono cursor-pointer transition"
                    : "text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono cursor-pointer transition";
                bPs.className = mode === "ps1"
                    ? "text-xs px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono cursor-pointer transition"
                    : "text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono cursor-pointer transition";
            }
            renderScriptPreview();
        }

        let copyResetTimer = null;

        function copyScript() {
            const out = document.getElementById("scriptOutput");
            const btn = document.getElementById("btnCopy");
            const dict = i18n[activeLang] || i18n.ko;
            if (!out) return;
            const markCopied = () => {
                if (btn) {
                    btn.textContent = dict.copied_btn;
                    if (copyResetTimer) clearTimeout(copyResetTimer);
                    copyResetTimer = setTimeout(() => {
                        const latestDict = i18n[activeLang] || i18n.ko;
                        btn.textContent = latestDict.copy_btn;
                    }, 1500);
                }
            };
            const fallbackCopy = () => {
                try {
                    const ta = document.createElement("textarea");
                    ta.value = out.textContent;
                    ta.style.position = "fixed";
                    ta.style.opacity = "0";
                    document.body.appendChild(ta);
                    ta.select();
                    const ok = document.execCommand("copy");
                    document.body.removeChild(ta);
                    if (ok) markCopied();
                } catch (_) {}
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(out.textContent).then(markCopied).catch(fallbackCopy);
                return;
            }
            fallbackCopy();
        }

        function changeLang(lang, persist = true) {
            activeLang = i18n[lang] ? lang : "ko";
            const dict = i18n[activeLang];
            document.documentElement.lang = activeLang;
            document.querySelectorAll("[data-i18n]").forEach(el => {
                const key = el.getAttribute("data-i18n");
                if (dict[key]) {
                    el.textContent = dict[key];
                }
            });
            renderScriptPreview();
            if (persist) {
                try { localStorage.setItem("disk_cleanup_lang", activeLang); } catch (_) {}
            }
        }

        window.addEventListener("DOMContentLoaded", () => {
            let saved = null;
            try { saved = localStorage.getItem("disk_cleanup_lang"); } catch (_) {}
            const initialLang = (saved && i18n[saved]) ? saved : detectBrowserLang();
            const sel = document.getElementById("langSelect");
            if (sel) {
                sel.value = initialLang;
            }
            changeLang(initialLang, false);
        });
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
        res.writeHead(405, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Allow': 'GET, HEAD',
        });
        res.end('Method Not Allowed');
        return;
    }

    const url = (req.url || '/').split('?')[0];

    if (url === '/' || url === '/index.html') {
        const buf = Buffer.from(HTML_CONTENT, 'utf8');
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Content-Length': buf.length,
            'X-Content-Type-Options': 'nosniff',
        });
        if (method === 'HEAD') {
            res.end();
        } else {
            res.end(buf);
        }
        return;
    }

    if (url === '/app.ico' || url === '/assets/app.ico' || url === '/favicon.ico' || url === '/icon.png') {
        let targetRel = 'app.ico';
        if (url === '/icon.png') targetRel = 'icon.png';
        else if (url === '/assets/app.ico') targetRel = path.join('assets', 'app.ico');
        const filePath = path.join(__dirname, targetRel);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end(method === 'HEAD' ? undefined : 'Not Found');
                return;
            }
            const ext = path.extname(filePath);
            const contentType = ext === '.ico' ? 'image/x-icon' : 'image/png';
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Length': data.length,
                'Cache-Control': 'public, max-age=3600',
                'X-Content-Type-Options': 'nosniff',
            });
            if (method === 'HEAD') {
                res.end();
            } else {
                res.end(data);
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(method === 'HEAD' ? undefined : 'Not Found');
});

server.on('error', (err) => {
    console.error('[DiskCleanupAuto Server] Error:', err);
});

server.listen(PORT, HOST, () => {
    console.log(`[DiskCleanupAuto Server] Listening on http://${HOST}:${PORT}`);
});
