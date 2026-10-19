# -*- coding: utf-8 -*-
"""
DiskCleanupAuto v1.5.0 - Lightweight Web Dashboard & Script Hub
Serves interactive status, manifest viewer, and documentation on port 3000.
"""

import http.server
import socketserver
import os
import json

PORT = 3000

class DiskCleanupHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            
            html = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AhBiYout Windows Disk Cleanup Auto (v1.5.0)</title>
    <link rel="icon" type="image/x-icon" href="/app.ico">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <img src="/assets/app.ico" alt="Logo" class="w-8 h-8 rounded-lg shadow" onerror="this.src='/icon.png'">
                <div>
                    <h1 class="text-lg font-bold text-white flex items-center gap-2">
                        Windows Disk Cleanup Auto
                        <span class="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">v1.5.0 Stable</span>
                    </h1>
                    <p class="text-xs text-slate-400">AhBiYout · CISNET CORPORATION</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <a href="https://github.com/AhBiYout-all/windows-disk-cleanup-builder" target="_blank" class="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1.5">
                    GitHub Repo
                </a>
                <a href="https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases" target="_blank" class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow">
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
                    Windows 11 24H2 / 26H1 Windows.old 강제 권한 탈취 및 소거 지원
                </div>
                <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                    무인 자동화 정품 Windows 디스크 클리너 & 인스톨러 빌더
                </h2>
                <p class="text-sm md:text-base text-slate-300 leading-relaxed">
                    본 저장소는 Windows 공식 <code class="text-indigo-300 font-mono">cleanmgr.exe</code> 엔진 및 커널 동기화 API를 제어하여 C: 드라이브의 시스템 캐시, 휴지통, WinSxS 업데이트 찌꺼기, 잠긴 Windows.old 폴더를 안전하게 100% 소거합니다.
                </p>
            </div>
        </div>

        <!-- Core Files Grid -->
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-lg font-bold text-white">📦 GitHub 저장소 핵심 배포 구성</h3>
                    <p class="text-xs text-slate-400">웹 프론트엔드 부산물 없이 순수 데스크톱 앱과 빌드 도구만 엄선되었습니다.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Card 1 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-indigo-400 font-mono text-sm font-semibold mb-1">disk_cleanup_gui.py</div>
                    <p class="text-xs text-slate-400 mb-3">Tkinter GUI 및 Win32 커널 7단계 디스크 정리 엔진 (Python)</p>
                    <div class="text-[11px] text-slate-500 font-mono">36.4 KB · Windows.old 강제 소거</div>
                </div>

                <!-- Card 2 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-emerald-400 font-mono text-sm font-semibold mb-1">installer.iss</div>
                    <p class="text-xs text-slate-400 mb-3">Inno Setup 6.x 언팩 개별 설치 & 방화벽 규칙 자동 등록</p>
                    <div class="text-[11px] text-slate-500 font-mono">8.6 KB · 제어판 정식 등록</div>
                </div>

                <!-- Card 3 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-violet-400 font-mono text-sm font-semibold mb-1">build_exe.bat / build_exe.py</div>
                    <p class="text-xs text-slate-400 mb-3">원클릭 단독 포터블 EXE 및 Inno Setup 인스톨러 자동 컴파일러</p>
                    <div class="text-[11px] text-slate-500 font-mono">PyInstaller + ISCC 자동 연동</div>
                </div>

                <!-- Card 4 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-amber-400 font-mono text-sm font-semibold mb-1">.github/workflows/release.yml</div>
                    <p class="text-xs text-slate-400 mb-3">GitHub Actions CI/CD 릴리스 자동화 (Node 22 LTS 호환)</p>
                    <div class="text-[11px] text-slate-500 font-mono">Windows-latest 런너 연동</div>
                </div>

                <!-- Card 5 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-cyan-400 font-mono text-sm font-semibold mb-1">version_info.txt & app.ico</div>
                    <p class="text-xs text-slate-400 mb-3">PE 리소스 속성 '자세히' 탭 메타데이터 및 멀티 해상도 아이콘</p>
                    <div class="text-[11px] text-slate-500 font-mono">16x16 ~ 256x256 멀티 아이콘</div>
                </div>

                <!-- Card 6 -->
                <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
                    <div class="text-rose-400 font-mono text-sm font-semibold mb-1">docs/</div>
                    <p class="text-xs text-slate-400 mb-3">설치 가이드(INSTALL.md), 빌드 가이드, 패치노트, 블로그 글</p>
                    <div class="text-[11px] text-slate-500 font-mono">Blogger 마크다운 포함</div>
                </div>
            </div>
        </div>

        <!-- Build Instructions -->
        <div class="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h3 class="text-md font-bold text-white flex items-center gap-2">
                🔨 로컬 빌드 및 푸시 방법
            </h3>
            <div class="space-y-3 text-xs md:text-sm text-slate-300">
                <div class="flex items-start gap-2">
                    <span class="bg-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded">1</span>
                    <p>로컬에서 <code class="text-indigo-300 font-mono">build_exe.bat</code>를 실행하면 <code class="text-slate-200 font-mono">Release\DiskCleanupAuto_v1.5.0.exe</code> 및 <code class="text-slate-200 font-mono">Release\WindowsDiskCleanup_Setup_v1.5.0.exe</code>가 생성됩니다.</p>
                </div>
                <div class="flex items-start gap-2">
                    <span class="bg-slate-800 text-indigo-400 font-mono px-2 py-0.5 rounded">2</span>
                    <p><code class="text-indigo-300 font-mono">git_push.bat</code>를 실행하면 <strong>스크립트 본인과 빌드 임시 파일은 자동으로 제외</strong>되고 핵심 코드만 안전하게 GitHub로 푸시됩니다.</p>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-800 py-6 bg-slate-950 text-xs text-slate-500 text-center">
        Copyright (C) 2026 <span class="text-slate-400">AhBiYout</span> & CISNET CORPORATION. All rights reserved.
    </footer>
</body>
</html>
"""
            self.wfile.write(html.encode("utf-8"))
        else:
            super().do_GET()

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    with socketserver.TCPServer(("0.0.0.0", PORT), DiskCleanupHandler) as httpd:
        print(f"[*] Serving DiskCleanupAuto Hub on port {PORT}...")
        httpd.serve_forever()
