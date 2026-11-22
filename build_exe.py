#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[AhBiYout] Python to Portable Single EXE Auto Builder (v1.5.0)
Robust Python-native compiler runner that never crashes or closes silently.
Self-contained: auto-generates disk_cleanup_gui.py if missing.
"""

import sys
import os
import subprocess
import shutil
import time
import zipfile

DEFAULT_GUI_SOURCE = r'''"""
=============================================================================
 Windows Disk Cleanup Automated Runner (GUI Edition v1.5.0)
 Auto-configured Registry VolumeCaches & cleanmgr.exe execution
 ----------------------------------------------------------------------------
 * 개발자: AhBiYout
 * Copyright (c) 2026 AhBiYout. All rights reserved.
 * 공식 Google 블로그: https://ahbiyoutvibe.blogspot.com/
=============================================================================
"""

import os
import sys
import time
import json
import locale
import warnings
import urllib.request
import ctypes
from ctypes import wintypes
import winreg
import subprocess
import threading
import webbrowser
import tkinter as tk
from tkinter import ttk

_win32_types_initialized = False

def _init_win32_types():
    global _win32_types_initialized
    if _win32_types_initialized or os.name != "nt":
        return
    try:
        user32 = ctypes.windll.user32
        kernel32 = ctypes.windll.kernel32
        shell32 = ctypes.windll.shell32

        user32.FindWindowW.argtypes = [wintypes.LPCWSTR, wintypes.LPCWSTR]
        user32.FindWindowW.restype = wintypes.HWND
        user32.FindWindowExW.argtypes = [wintypes.HWND, wintypes.HWND, wintypes.LPCWSTR, wintypes.LPCWSTR]
        user32.FindWindowExW.restype = wintypes.HWND
        user32.IsWindow.argtypes = [wintypes.HWND]
        user32.IsWindow.restype = wintypes.BOOL
        user32.IsWindowVisible.argtypes = [wintypes.HWND]
        user32.IsWindowVisible.restype = wintypes.BOOL
        user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
        user32.GetWindowThreadProcessId.restype = wintypes.DWORD
        user32.GetClientRect.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.RECT)]
        user32.GetClientRect.restype = wintypes.BOOL
        user32.PostMessageW.argtypes = [wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM]
        user32.PostMessageW.restype = wintypes.BOOL
        user32.RedrawWindow.argtypes = [wintypes.HWND, ctypes.c_void_p, ctypes.c_void_p, wintypes.UINT]
        user32.RedrawWindow.restype = wintypes.BOOL

        kernel32.OpenProcess.argtypes = [wintypes.DWORD, wintypes.BOOL, wintypes.DWORD]
        kernel32.OpenProcess.restype = wintypes.HANDLE
        kernel32.WaitForSingleObject.argtypes = [wintypes.HANDLE, wintypes.DWORD]
        kernel32.WaitForSingleObject.restype = wintypes.DWORD
        kernel32.CloseHandle.argtypes = [wintypes.HANDLE]
        kernel32.CloseHandle.restype = wintypes.BOOL
        kernel32.GetDiskFreeSpaceExW.argtypes = [
            wintypes.LPCWSTR,
            ctypes.POINTER(ctypes.c_ulonglong),
            ctypes.POINTER(ctypes.c_ulonglong),
            ctypes.POINTER(ctypes.c_ulonglong),
        ]
        kernel32.GetDiskFreeSpaceExW.restype = wintypes.BOOL

        shell32.SHEmptyRecycleBinW.argtypes = [wintypes.HWND, wintypes.LPCWSTR, wintypes.DWORD]
        shell32.SHEmptyRecycleBinW.restype = ctypes.c_long
        _win32_types_initialized = True
    except Exception:
        pass

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def elevate_admin():
    if not is_admin():
        params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
        if getattr(sys, "frozen", False):
            arg_str = params
        else:
            script = os.path.abspath(sys.argv[0])
            arg_str = f'"{script}" {params}'.strip()
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, arg_str, None, 1
        )
        os._exit(0)

CURRENT_VERSION = "v1.5.0"
FLAG_NAME = "StateFlags0064"
SAGESET_ID = 64
COMPANY_NAME = "AhBiYout"
DEVELOPER_NAME = "AhBiYout"
GITHUB_USER = "AhBiYout-all"
GITHUB_REPO = "windows-disk-cleanup-builder"
GITHUB_REPO_URL = f"https://github.com/{GITHUB_USER}/{GITHUB_REPO}"
GITHUB_RELEASES_URL = f"{GITHUB_REPO_URL}/releases"
GITHUB_API_LATEST = f"https://api.github.com/repos/{GITHUB_USER}/{GITHUB_REPO}/releases/latest"
BLOG_URL = "https://ahbiyoutvibe.blogspot.com/"
AFFILIATION_URL = "http://cisnet.co.kr"
AUTO_CLOSE_SEC = 5

def _match_lang_code(loc_str):
    if not loc_str:
        return None
    lc = str(loc_str).lower()
    if lc.startswith("ja") or "japanese" in lc or "jpn" in lc:
        return "ja"
    if lc.startswith("en") or "english" in lc:
        return "en"
    if lc.startswith("ko") or "korean" in lc or "kor" in lc:
        return "ko"
    return None

def detect_system_lang():
    try:
        if os.name == 'nt':
            try:
                lang_id = ctypes.windll.kernel32.GetUserDefaultUILanguage()
                primary = lang_id & 0x3FF
                if primary == 0x11:
                    return "ja"
                elif primary == 0x09:
                    return "en"
                elif primary == 0x12:
                    return "ko"
            except Exception:
                pass
        for env_key in ("LC_ALL", "LC_MESSAGES", "LANG", "LANGUAGE"):
            env_val = os.environ.get(env_key)
            if env_val and env_val.upper() not in ("C", "POSIX", "C.UTF-8"):
                matched = _match_lang_code(env_val)
                return matched if matched else "ko"
        try:
            loc, _ = locale.getlocale()
            matched = _match_lang_code(loc)
            if matched:
                return matched
        except Exception:
            pass
    except Exception:
        pass
    return "ko"

LANG_LABELS = {"ko": "한국어 (KO)", "en": "English (EN)", "ja": "日本語 (JA)"}

TRANSLATIONS = {
    "ko": {
        "title": f"AhBiYout Windows 디스크 클린 오토 ({CURRENT_VERSION})",
        "preparing": "디스크 정리 작업을 준비하는 중...",
        "init_detail": "설정 플래그: {flag} ({count}개 항목)",
        "step1": "1단계: 관리자 권한 및 실행 환경 확인 완료",
        "step1_detail": "Windows 디스크 정리 설정을 준비 중입니다...",
        "step2_start": "2단계: 레지스트리 정리 항목 ({count}개) 활성화 시작...",
        "step2_detail": "대상 플래그: {flag}",
        "step2_reg": "2단계: 레지스트리 항목 등록 중... [{idx}/{total}]",
        "step2_done": "2단계 완료: 총 {configured}/{total}개 항목 활성화 완료",
        "step2_done_detail": "다음 단계인 Windows 디스크 정리 엔진(cleanmgr.exe)을 호출합니다...",
        "recycle_title": "휴지통 비우기 실행 중...",
        "recycle_detail": "SHEmptyRecycleBinW API를 통해 모든 드라이브의 휴지통을 비웁니다.",
        "sec_fmt": "{secs:.1f}초",
        "min_sec_fmt": "{mins}분 {rem:.1f}초",
        "step3_closed": "3단계: cleanmgr 작업 완료 감지 (⏱️ {time} 경과)",
        "step3_closed_detail": "디스크 정리 창 닫힘 감지됨 · 프로세스 핸들 및 잔여 세션 즉시 해제 중...",
        "step3_visible": "3단계: Windows 디스크 정리 실행 중... (⏱️ {time} 경과)",
        "step3_visible_detail": "cleanmgr UI/진행 다이얼로그 실시간 후킹 중 (총 {configured}개 항목 직렬 정리)",
        "step3_running": "3단계: Windows 디스크 정리 순차 실행 중... (⏱️ {time} 경과)",
        "step3_running_update_detail": "cleanmgr 엔진이 {configured}개 등록 항목을 순서대로(직렬) 정리하고 있습니다.\n(※ 'Windows 업데이트 정리' 등 대용량 항목 처리 시 수 분 소요 가능)",
        "step3_running_detail": "cleanmgr 엔진이 {configured}개 등록 항목을 순서대로(직렬) 정리하고 있습니다.",
        "step4": "4단계: 백그라운드 프로세스 및 윈도우 잔상 갱신 중...",
        "step4_detail": "cleanmgr 프로세스 정리 및 고스트 창(DWM 잔상) 즉시 소거 완료",
        "winold_not_found": "C:\\Windows.old 폴더가 존재하지 않거나 이미 정리되었습니다.",
        "winold_scan": "안전 점검: Windows.old 사용자 파일 가드레일 검사 중...",
        "winold_scan_detail": "C:\\Windows.old\\Users 내 개인 파일 잔여 여부를 점검합니다.",
        "winold_guard_title": "⚠️ [안전 가드레일] Windows.old 개인 문서 발견됨",
        "winold_guard_detail": "C:\\Windows.old\\Users 내 개인 파일({count}개+)이 감지되어 사용자 보호를 위해 삭제를 안전하게 건너뜁니다.",
        "winold_p1": "Windows.old 강제 정리 [1/3]: NTFS 소유권 탈취 중 (takeown)...",
        "winold_p1_detail": "C:\\Windows.old 및 하위 트리 전체의 관리자(Administrators) 소유권을 확보합니다.",
        "winold_p2": "Windows.old 강제 정리 [2/3]: ACL 모든 권한 부여 중 (icacls)...",
        "winold_p2_detail": "Administrators 그룹에 모든 파일/디렉터리 F(Full Control) 권한을 상속 주입합니다.",
        "winold_p3": "Windows.old 강제 정리 [3/3]: 디렉터리 트리 완전 소거 중 (rd /s /q)...",
        "winold_p3_detail": "읽기 전용/시스템 속성 해제 및 Windows.old 폴더 영구 삭제를 진행합니다.",
        "winold_ok": "✨ Windows.old 완전 소거 성공!",
        "winold_ok_detail": "C:\\Windows.old 폴더가 100% 영구 삭제되었습니다.",
        "winold_partial": "Windows.old 정리 완료",
        "winold_partial_detail": "일부 백그라운드 락 파일을 제외한 대다수 기가바이트 데이터가 정리되었습니다.",
        "freed_fmt": " · 💾 여유 공간 +{diff:.2f} GB 확보",
        "free_fmt": " · 💾 현재 C: 여유 {free:.1f} GB",
        "mouse_close_title": "✨ 디스크 정리 완료!",
        "mouse_close_detail": "마우스 감지: 창을 즉시 닫습니다...",
        "step5_status": "5단계: ✨ 모든 디스크 정리 완료! (소요: {time}{freed})",
        "step5_detail": "⏱️ {sec}초 후 자동 종료 (💡 마우스를 창 위로 올리면 즉시 닫힙니다)",
        "error_title": "❌ 오류 발생",
        "releases": "📦 최신 릴리스",
        "blog": "📝 AhBiYoutVibe 블로그",
        "github": "🐙 GitHub",
        "affiliation": "소속회사: (주)청운정보시스템 ( cisnet.co.kr )",
    },
    "en": {
        "title": f"AhBiYout Windows Disk Cleanup Auto ({CURRENT_VERSION})",
        "preparing": "Preparing disk cleanup tasks...",
        "init_detail": "Target Flag: {flag} ({count} items)",
        "step1": "Step 1: Admin privileges and environment confirmed",
        "step1_detail": "Preparing Windows Disk Cleanup configuration...",
        "step2_start": "Step 2: Activating registry cleanup items ({count} items)...",
        "step2_detail": "Target Flag: {flag}",
        "step2_reg": "Step 2: Registering registry items... [{idx}/{total}]",
        "step2_done": "Step 2 Done: {configured}/{total} cleanup items activated",
        "step2_done_detail": "Launching Windows Disk Cleanup engine (cleanmgr.exe)...",
        "recycle_title": "Emptying Recycle Bin...",
        "recycle_detail": "Emptying Recycle Bin across all drives via SHEmptyRecycleBinW API.",
        "sec_fmt": "{secs:.1f}s",
        "min_sec_fmt": "{mins}m {rem:.1f}s",
        "step3_closed": "Step 3: cleanmgr completion detected (⏱️ {time} elapsed)",
        "step3_closed_detail": "Cleanup dialog closed · Releasing process handles & leftover sessions...",
        "step3_visible": "Step 3: Running Windows Disk Cleanup... (⏱️ {time} elapsed)",
        "step3_visible_detail": "Hooking cleanmgr progress dialog in real time ({configured} items sequential)",
        "step3_running": "Step 3: Running Windows Disk Cleanup sequentially... (⏱️ {time} elapsed)",
        "step3_running_update_detail": "cleanmgr engine is sequentially cleaning {configured} registered items.\n(Note: Large items like Windows Update Cleanup may take several minutes)",
        "step3_running_detail": "cleanmgr engine is sequentially cleaning {configured} registered items.",
        "step4": "Step 4: Cleaning background processes & refreshing shell...",
        "step4_detail": "Terminated residual cleanmgr processes & cleared DWM ghost icons",
        "winold_not_found": "C:\\Windows.old does not exist or has already been cleaned.",
        "winold_scan": "Safety Check: Scanning Windows.old user files guardrail...",
        "winold_scan_detail": "Checking C:\\Windows.old\\Users for unbacked personal files.",
        "winold_guard_title": "⚠️ [Safe-Guard] Personal files found in Windows.old",
        "winold_guard_detail": "Detected personal files ({count}+) in C:\\Windows.old\\Users. Skipping deletion safely to protect your data.",
        "winold_p1": "Windows.old Force Purge [1/3]: Taking NTFS ownership (takeown)...",
        "winold_p1_detail": "Acquiring Administrators ownership across C:\\Windows.old tree.",
        "winold_p2": "Windows.old Force Purge [2/3]: Granting ACL Full Control (icacls)...",
        "winold_p2_detail": "Granting Full Control (F) permissions to Administrators recursively.",
        "winold_p3": "Windows.old Force Purge [3/3]: Removing directory tree (rd /s /q)...",
        "winold_p3_detail": "Clearing read-only/system attributes and permanently deleting Windows.old.",
        "winold_ok": "✨ Windows.old purged completely!",
        "winold_ok_detail": "C:\\Windows.old has been 100% permanently deleted.",
        "winold_partial": "Windows.old cleanup completed",
        "winold_partial_detail": "Most gigabytes were freed except a few files locked in background.",
        "freed_fmt": " · 💾 Freed +{diff:.2f} GB",
        "free_fmt": " · 💾 C: Free {free:.1f} GB",
        "mouse_close_title": "✨ Disk Cleanup Complete!",
        "mouse_close_detail": "Mouse detected: Closing window immediately...",
        "step5_status": "Step 5: ✨ All disk cleanup tasks completed! (Time: {time}{freed})",
        "step5_detail": "⏱️ Auto-closing in {sec}s (💡 Hover mouse over window to close immediately)",
        "error_title": "❌ Error Occurred",
        "releases": "📦 Latest Releases",
        "blog": "📝 AhBiYoutVibe Blog",
        "github": "🐙 GitHub",
        "affiliation": "Affiliation: (주)청운정보시스템 ( cisnet.co.kr )",
    },
    "ja": {
        "title": f"AhBiYout Windows ディスククリーンオート ({CURRENT_VERSION})",
        "preparing": "ディスククリーンアップの準備中...",
        "init_detail": "設定フラグ: {flag} ({count} 項目)",
        "step1": "ステップ1: 管理者権限と実行環境の確認完了",
        "step1_detail": "Windows ディスククリーンアップ設定を準備しています...",
        "step2_start": "ステップ2: レジストリクリーンアップ項目 ({count}件) の有効化を開始...",
        "step2_detail": "対象フラグ: {flag}",
        "step2_reg": "ステップ2: レジストリ項目を登録中... [{idx}/{total}]",
        "step2_done": "ステップ2完了: 合計 {configured}/{total} 件の項目を有効化しました",
        "step2_done_detail": "次のステップとして Windows ディスククリーンアップ (cleanmgr.exe) を起動します...",
        "recycle_title": "ごみ箱を空にしています...",
        "recycle_detail": "SHEmptyRecycleBinW API を通じて全ドライブのごみ箱を空にします。",
        "sec_fmt": "{secs:.1f}秒",
        "min_sec_fmt": "{mins}分 {rem:.1f}秒",
        "step3_closed": "ステップ3: cleanmgr 完了を検知 (⏱️ {time} 経過)",
        "step3_closed_detail": "クリーンアップウィンドウ終了を検知 · ハンドルと残留セッションを解放中...",
        "step3_visible": "ステップ3: Windows ディスククリーンアップ実行中... (⏱️ {time} 経過)",
        "step3_visible_detail": "cleanmgr 進行ダイアログをリアルタイム監視中 (計 {configured} 項目順次実行)",
        "step3_running": "ステップ3: Windows ディスククリーンアップを順次実行中... (⏱️ {time} 経過)",
        "step3_running_update_detail": "cleanmgr エンジンが登録済みの {configured} 項目を順次クリーンアップしています。\n(※ Windows Update のクリーンアップ等は数分かかる場合があります)",
        "step3_running_detail": "cleanmgr エンジンが登録済みの {configured} 項目を順次クリーンアップしています。",
        "step4": "ステップ4: バックグラウンドプロセスの整理とシェル更新中...",
        "step4_detail": "cleanmgr プロセス整理およびゴースト残像(DWM)の消去完了",
        "winold_not_found": "C:\\Windows.old フォルダは存在しないか、すでに削除されています。",
        "winold_scan": "安全確認: Windows.old ユーザーファイルガードレール検査中...",
        "winold_scan_detail": "C:\\Windows.old\\Users 内の個人ファイル残存を確認しています。",
        "winold_guard_title": "⚠️ [安全ガードレール] Windows.old に個人ファイルを検出",
        "winold_guard_detail": "C:\\Windows.old\\Users 内に個人ファイル ({count}件以上) を検出したため、データ保護のため削除をスキップします。",
        "winold_p1": "Windows.old 強制削除 [1/3]: NTFS 所有権を取得中 (takeown)...",
        "winold_p1_detail": "C:\\Windows.old 配下全体の Administrators 所有権を取得します。",
        "winold_p2": "Windows.old 強制削除 [2/3]: ACL フルコントロール付与中 (icacls)...",
        "winold_p2_detail": "Administrators グループへ全ファイル・フォルダのフルコントロール権限を付与します。",
        "winold_p3": "Windows.old 強制削除 [3/3]: ディレクトリツリー完全削除中 (rd /s /q)...",
        "winold_p3_detail": "読み取り専用/システム属性を解除し Windows.old を完全に削除しています。",
        "winold_ok": "✨ Windows.old の完全削除に成功しました！",
        "winold_ok_detail": "C:\\Windows.old フォルダが 100% 完全に削除されました。",
        "winold_partial": "Windows.old クリーンアップ完了",
        "winold_partial_detail": "ロック中の一部ファイルを除く大半のデータが解放されました。",
        "freed_fmt": " · 💾 空き容量 +{diff:.2f} GB 確保",
        "free_fmt": " · 💾 現在の C: 空き {free:.1f} GB",
        "mouse_close_title": "✨ クリーンアップ完了！",
        "mouse_close_detail": "マウス操作を検知: ウィンドウを即座に閉じます...",
        "step5_status": "ステップ5: ✨ すべてのディスククリーンアップが完了しました！ (所要: {time}{freed})",
        "step5_detail": "⏱️ {sec}秒後に自動終了 (💡 ウィンドウにマウスを合わせると即時に閉じます)",
        "error_title": "❌ エラー発生",
        "releases": "📦 最新リリース",
        "blog": "📝 AhBiYoutVibe ブログ",
        "github": "🐙 GitHub",
        "affiliation": "所属会社: (주)청운정보시스템 ( cisnet.co.kr )",
    }
}
current_lang = [detect_system_lang()]

def tr(key, **kwargs):
    lang_dict = TRANSLATIONS.get(current_lang[0], TRANSLATIONS["ko"])
    text = lang_dict.get(key, TRANSLATIONS["ko"].get(key, key))
    if kwargs:
        try:
            return text.format(**kwargs)
        except Exception:
            return text
    return text

CLEANUP_ITEMS = [
    "Previous Installations",
    "Update Cleanup",
    "Delivery Optimization Files",
    "Temporary Files",
    "Recycle Bin",
    "Temporary Setup Files",
    "Setup Log Files",
    "Downloaded Program Files",
    "Internet Cache Files",
    "Old Chkdsk Files",
    "Thumbnail Cache",
    "Device Driver Packages",
    "DirectX Shader Cache",
    "System error memory dump files",
    "System error minidump files"
]

def configure_registry(log_callback=None):
    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    success_count = 0
    total_items = len(CLEANUP_ITEMS)
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY

    for idx, item in enumerate(CLEANUP_ITEMS, start=1):
        key_path = f"{base_path}\\{item}"
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, access_flags) as key:
                winreg.SetValueEx(key, FLAG_NAME, 0, winreg.REG_DWORD, 2)
                success_count += 1
                if log_callback:
                    log_callback(idx, total_items, item, "OK")
        except FileNotFoundError:
            if log_callback:
                log_callback(idx, total_items, item, "SKIPPED")
        except PermissionError:
            if log_callback:
                log_callback(idx, total_items, item, "PERM_ERROR")
        except Exception as e:
            if log_callback:
                log_callback(idx, total_items, item, f"ERROR: {e}")

    return success_count

def sweep_tray_ghost_icons():
    try:
        _init_win32_types()
        user32 = ctypes.windll.user32
        tray_targets = [
            ("Shell_TrayWnd", "TrayNotifyWnd", "SysPager", "ToolbarWindow32"),
            ("Shell_SecondaryTrayWnd", "TrayNotifyWnd", "SysPager", "ToolbarWindow32"),
            ("NotifyIconOverflowWindow", None, None, "ToolbarWindow32"),
        ]
        toolbars = []
        for root_cls, c1, c2, target_cls in tray_targets:
            hwnd = user32.FindWindowW(root_cls, None)
            if not hwnd:
                continue
            if c1:
                hwnd = user32.FindWindowExW(hwnd, None, c1, None)
            if c2 and hwnd:
                hwnd = user32.FindWindowExW(hwnd, None, c2, None)
            if target_cls and hwnd:
                tb = user32.FindWindowExW(hwnd, None, target_cls, None)
                if tb:
                    toolbars.append(tb)

        WM_MOUSEMOVE = 0x0200
        for tb in toolbars:
            rect = wintypes.RECT()
            if user32.GetClientRect(tb, ctypes.byref(rect)):
                w = max(1, rect.right - rect.left)
                h = max(1, rect.bottom - rect.top)
                mid_y = h // 2
                for x in range(0, w, 15):
                    lparam = (mid_y << 16) | (x & 0xFFFF)
                    user32.PostMessageW(tb, WM_MOUSEMOVE, 0, lparam)
    except Exception:
        pass

def refresh_windows_shell():
    try:
        _init_win32_types()
        user32 = ctypes.windll.user32
        tray_hwnd = user32.FindWindowW("Shell_TrayWnd", None)
        if tray_hwnd:
            user32.RedrawWindow(tray_hwnd, None, None, 0x0185)
        sec_tray = user32.FindWindowW("Shell_SecondaryTrayWnd", None)
        if sec_tray:
            user32.RedrawWindow(sec_tray, None, None, 0x0185)
        user32.RedrawWindow(None, None, None, 0x0185)
        sweep_tray_ghost_icons()
    except Exception:
        pass

_periodic_refresh_flag = [True]

def start_periodic_shell_refresher(interval_sec=2.0):
    _periodic_refresh_flag[0] = True
    def _worker():
        while _periodic_refresh_flag[0]:
            try:
                refresh_windows_shell()
            except Exception:
                pass
            time.sleep(interval_sec)
    t = threading.Thread(target=_worker, daemon=True)
    t.start()
    return t

def stop_periodic_shell_refresher():
    _periodic_refresh_flag[0] = False
    for _ in range(3):
        try:
            refresh_windows_shell()
        except Exception:
            pass
        time.sleep(0.3)

def get_c_drive_free_gb():
    try:
        free_bytes = ctypes.c_ulonglong(0)
        total_bytes = ctypes.c_ulonglong(0)
        total_free = ctypes.c_ulonglong(0)
        ret = ctypes.windll.kernel32.GetDiskFreeSpaceExW(
            ctypes.c_wchar_p("C:\\"),
            ctypes.byref(free_bytes),
            ctypes.byref(total_bytes),
            ctypes.byref(total_free)
        )
        if ret:
            return round(free_bytes.value / (1024 ** 3), 2)
    except Exception:
        pass
    return None

def play_completion_sound():
    try:
        import winsound
        winsound.MessageBeep(winsound.MB_ICONASTERISK)
    except Exception:
        pass

def get_cleanmgr_hwnds(target_pid):
    hwnds = []
    try:
        _init_win32_types()
        user32 = ctypes.windll.user32
        def enum_cb(hwnd, extra):
            try:
                if user32.IsWindow(hwnd):
                    w_pid = wintypes.DWORD()
                    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(w_pid))
                    if w_pid.value == target_pid:
                        hwnds.append(hwnd)
            except Exception:
                pass
            return True
        WNDENUMPROC = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
        cb_ref = WNDENUMPROC(enum_cb)
        user32.EnumWindows(cb_ref, 0)
    except Exception:
        pass
    return hwnds

def monitor_and_wait_cleanmgr(proc, update_status_cb, max_timeout_sec=1800):
    _init_win32_types()
    start_time = time.time()
    pid = proc.pid
    kernel32 = ctypes.windll.kernel32
    user32 = ctypes.windll.user32

    SYNCHRONIZE = 0x00100000
    PROCESS_QUERY_LIMITED_INFORMATION = 0x1000
    h_process = None
    try:
        h_process = kernel32.OpenProcess(SYNCHRONIZE | PROCESS_QUERY_LIMITED_INFORMATION, False, pid)
    except Exception:
        h_process = None

    saw_visible_window = False
    window_closed_detected = False
    window_closed_time = None

    try:
        while True:
            elapsed = time.time() - start_time
            if elapsed >= max_timeout_sec:
                try:
                    proc.kill()
                except Exception:
                    pass
                break

            if h_process:
                wait_res = kernel32.WaitForSingleObject(h_process, 250)
                if wait_res == 0:
                    break
                if wait_res == 0xFFFFFFFF:
                    if proc.poll() is not None:
                        break
                    time.sleep(0.25)
            else:
                if proc.poll() is not None:
                    break
                time.sleep(0.25)

            try:
                hwnds = get_cleanmgr_hwnds(pid)
                has_visible = False
                for hwnd in hwnds:
                    if user32.IsWindow(hwnd) and user32.IsWindowVisible(hwnd):
                        has_visible = True
                        saw_visible_window = True
                        break

                if saw_visible_window and not has_visible and not window_closed_detected:
                    window_closed_detected = True
                    window_closed_time = time.time()

                if window_closed_detected and (time.time() - window_closed_time >= 2.5):
                    for hwnd in hwnds:
                        if user32.IsWindow(hwnd):
                            user32.PostMessageW(hwnd, 0x0010, 0, 0)
                    break
            except Exception:
                pass

            if update_status_cb:
                update_status_cb(elapsed, saw_visible_window, window_closed_detected)

    finally:
        if h_process:
            try:
                kernel32.CloseHandle(h_process)
            except Exception:
                pass
        try:
            if proc.poll() is None:
                proc.terminate()
        except Exception:
            pass
        refresh_windows_shell()

def kill_lingering_cleanmgr():
    try:
        creation_flags = 0x08000000 if os.name == 'nt' else 0
        subprocess.run(
            ["taskkill", "/F", "/IM", "cleanmgr.exe", "/T"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags
        )
    except Exception:
        pass
    refresh_windows_shell()

_exit_started = [False]

def force_cleanup_and_exit(root):
    if _exit_started[0]:
        return
    _exit_started[0] = True
    _periodic_refresh_flag[0] = False
    kill_lingering_cleanmgr()
    refresh_windows_shell()
    try:
        root.quit()
    except Exception:
        pass
    try:
        root.destroy()
    except Exception:
        pass
    os._exit(0)

def scan_windows_old_safety():
    target_users = r"C:\Windows.old\Users"
    if not os.path.exists(target_users):
        return (False, 0, [])
    important_dirs = ["Desktop", "Documents", "Downloads", "Pictures", "바탕 화면", "내 문서", "다운로드", "사진"]
    found_files = []
    try:
        for user_folder in os.listdir(target_users):
            user_path = os.path.join(target_users, user_folder)
            if not os.path.isdir(user_path) or user_folder.lower() in ["public", "default", "all users"]:
                continue
            for imp in important_dirs:
                check_dir = os.path.join(user_path, imp)
                if os.path.exists(check_dir):
                    for r, _, fs in os.walk(check_dir):
                        for f in fs:
                            if not f.lower().endswith(('.ini', '.lnk', '.tmp')):
                                found_files.append(os.path.join(r, f))
                                if len(found_files) >= 5:
                                    return (True, len(found_files), found_files)
    except Exception:
        pass
    return (len(found_files) > 0, len(found_files), found_files)

def force_purge_windows_old(update_ui_cb=None):
    target_dir = r"C:\Windows.old"
    if not os.path.exists(target_dir):
        return (True, tr("winold_not_found"))
    creation_flags = 0x08000000 if os.name == 'nt' else 0
    if update_ui_cb:
        update_ui_cb(tr("winold_p1"), tr("winold_p1_detail"))
    try:
        subprocess.run(["takeown", "/F", target_dir, "/A", "/R", "/D", "Y"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creation_flags, timeout=180)
    except Exception:
        pass
    if update_ui_cb:
        update_ui_cb(tr("winold_p2"), tr("winold_p2_detail"))
    try:
        subprocess.run(["icacls", target_dir, "/grant", "*S-1-5-32-544:F", "/T", "/C", "/Q"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creation_flags, timeout=240)
    except Exception:
        pass
    if update_ui_cb:
        update_ui_cb(tr("winold_p3"), tr("winold_p3_detail"))
    for attrib_cmd in (["attrib", "-r", "-a", "-s", "-h", target_dir], ["attrib", "-r", "-a", "-s", "-h", f"{target_dir}\\*.*", "/s", "/d"]):
        try:
            subprocess.run(attrib_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creation_flags, timeout=60)
        except Exception:
            pass
    try:
        subprocess.run(f'rd /s /q "{target_dir}"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, creationflags=creation_flags, timeout=180)
    except Exception:
        pass
    if os.path.exists(target_dir):
        try:
            import shutil
            shutil.rmtree(target_dir, ignore_errors=True)
        except Exception:
            pass
    if not os.path.exists(target_dir):
        if update_ui_cb:
            update_ui_cb(tr("winold_ok"), tr("winold_ok_detail"))
        return (True, tr("winold_ok_detail"))
    if update_ui_cb:
        update_ui_cb(tr("winold_partial"), tr("winold_partial_detail"))
    return (False, tr("winold_partial_detail"))

def perform_cleanup(status_label, progress_bar, detail_label, root, work_started_flag=None):
    def update_ui(status_text, detail_text=""):
        def _apply():
            try:
                status_label.config(text=status_text)
                if detail_text:
                    detail_label.config(text=detail_text)
            except Exception:
                pass
        try:
            root.after(0, _apply)
        except Exception:
            pass

    def registry_log(idx, total, item, status):
        update_ui(tr("step2_reg", idx=idx, total=total), f"HKLM VolumeCaches\\{item} ({FLAG_NAME}=2) [{status}]")
        time.sleep(0.02)

    start_total_time = time.time()
    initial_free_gb = get_c_drive_free_gb()

    def format_time_str(secs):
        if secs < 60:
            return tr("sec_fmt", secs=secs)
        return tr("min_sec_fmt", mins=int(secs // 60), rem=secs % 60)

    is_closing = [False]
    try:
        if work_started_flag is not None:
            work_started_flag[0] = True
        time.sleep(0.2)
        update_ui(tr("step1"), tr("step1_detail"))
        time.sleep(0.4)

        update_ui(tr("step2_start", count=len(CLEANUP_ITEMS)), tr("step2_detail", flag=FLAG_NAME))
        time.sleep(0.2)
        configured = configure_registry(registry_log)
        update_ui(tr("step2_done", configured=configured, total=len(CLEANUP_ITEMS)), tr("step2_done_detail"))
        time.sleep(0.6)

        start_periodic_shell_refresher(interval_sec=2.0)
        try:
            root.after(0, lambda: [progress_bar.config(mode="indeterminate"), progress_bar.start(12)])
        except Exception:
            pass

        if "Recycle Bin" in CLEANUP_ITEMS:
            try:
                update_ui(tr("recycle_title"), tr("recycle_detail"))
                ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 7)
                time.sleep(0.5)
            except Exception as e:
                print(f"SHEmptyRecycleBinW error: {e}")

        cleanmgr_cmd = ["cleanmgr.exe", f"/sagerun:{SAGESET_ID}"]
        has_update_cleanup = "Update Cleanup" in CLEANUP_ITEMS

        def on_cleanmgr_progress(elapsed, saw_visible, win_closed):
            time_str = format_time_str(elapsed)
            if win_closed:
                update_ui(tr("step3_closed", time=time_str), tr("step3_closed_detail"))
            elif saw_visible:
                update_ui(tr("step3_visible", time=time_str), tr("step3_visible_detail", configured=configured))
            else:
                detail_key = "step3_running_update_detail" if has_update_cleanup else "step3_running_detail"
                update_ui(tr("step3_running", time=time_str), tr(detail_key, configured=configured))

        try:
            proc = subprocess.Popen(cleanmgr_cmd, shell=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            monitor_and_wait_cleanmgr(proc, on_cleanmgr_progress, max_timeout_sec=1800)
        except Exception as e:
            print(f"cleanmgr error: {e}")

        update_ui(tr("step4"), tr("step4_detail"))
        kill_lingering_cleanmgr()
        stop_periodic_shell_refresher()
        time.sleep(0.3)

        if os.path.exists(r"C:\Windows.old"):
            update_ui(tr("winold_scan"), tr("winold_scan_detail"))
            has_user_files, u_count, _ = scan_windows_old_safety()
            if has_user_files:
                update_ui(tr("winold_guard_title"), tr("winold_guard_detail", count=u_count))
                time.sleep(1.5)
            else:
                force_purge_windows_old(update_ui)
                time.sleep(0.5)

        total_elapsed = round(time.time() - start_total_time, 1)
        total_time_str = format_time_str(total_elapsed)

        final_free_gb = get_c_drive_free_gb()
        freed_str = ""
        if initial_free_gb is not None and final_free_gb is not None:
            freed_diff = round(final_free_gb - initial_free_gb, 2)
            freed_str = tr("freed_fmt", diff=freed_diff) if freed_diff > 0 else tr("free_fmt", free=final_free_gb)

        play_completion_sound()
        try:
            root.after(0, lambda: [progress_bar.stop(), progress_bar.config(mode="determinate", value=100)])
        except Exception:
            pass

        def on_mouse_action(event=None):
            if not is_closing[0]:
                is_closing[0] = True
                update_ui(tr("mouse_close_title"), tr("mouse_close_detail"))
                try:
                    root.after(150, lambda: force_cleanup_and_exit(root))
                except Exception:
                    force_cleanup_and_exit(root)

        root.after(0, lambda: [root.bind("<Enter>", on_mouse_action), root.bind("<Button-1>", on_mouse_action)])

        for remaining in range(AUTO_CLOSE_SEC, 0, -1):
            if is_closing[0]:
                break
            update_ui(tr("step5_status", time=total_time_str, freed=freed_str), tr("step5_detail", sec=remaining))
            time.sleep(1)

    except Exception as e:
        _periodic_refresh_flag[0] = False
        try:
            root.after(0, progress_bar.stop)
        except Exception:
            pass
        update_ui(tr("error_title"), str(e))
        time.sleep(3)
    finally:
        _periodic_refresh_flag[0] = False
        if not is_closing[0]:
            try:
                root.after(0, lambda: force_cleanup_and_exit(root))
            except Exception:
                kill_lingering_cleanmgr()
                os._exit(0)

def open_url(url):
    try:
        webbrowser.open_new_tab(url)
    except Exception as e:
        print(f"Browser open failed: {e}")

def main():
    elevate_admin()

    root = tk.Tk()
    root.title(tr("title"))

    base_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
    bundle_dir = getattr(sys, "_MEIPASS", base_dir)
    for ic in [
        os.path.join(bundle_dir, "assets", "app.ico"),
        os.path.join(bundle_dir, "app.ico"),
        os.path.join(base_dir, "assets", "app.ico"),
        os.path.join(base_dir, "app.ico"),
    ]:
        if os.path.exists(ic):
            try:
                root.iconbitmap(ic)
                break
            except Exception:
                pass

    root.geometry("480x330")
    root.resizable(False, False)

    root.update_idletasks()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    win_w, win_h = 480, 330
    x = max(0, (screen_w - win_w) // 2)
    y = max(40, int((screen_h - win_h) * 0.22))
    root.geometry(f"{win_w}x{win_h}+{x}+{y}")

    root.lift()
    root.attributes("-topmost", True)
    root.after_idle(root.attributes, "-topmost", False)

    card_color = "#ffffff"
    root.configure(bg="#f8fafc")

    container = tk.Frame(root, bg=card_color, padx=20, pady=16, relief="groove", bd=1)
    container.pack(fill="both", expand=True, padx=12, pady=12)

    header_frame = tk.Frame(container, bg=card_color)
    header_frame.pack(fill="x", pady=(0, 4))

    header_label = tk.Label(header_frame, text=tr("title"), font=("Segoe UI", 11, "bold"), fg="#0f172a", bg=card_color, justify="center")
    header_label.pack(side="left", expand=True)

    lang_var = tk.StringVar(value=LANG_LABELS.get(current_lang[0], "한국어 (KO)"))
    lang_combo = ttk.Combobox(header_frame, textvariable=lang_var, values=list(LANG_LABELS.values()), width=14, state="readonly")
    lang_combo.pack(side="right", padx=(4, 0))

    work_started = [False]

    def on_lang_change(event=None):
        sel = lang_var.get()
        current_lang[0] = "en" if "EN" in sel else ("ja" if "JA" in sel else "ko")
        root.title(tr("title"))
        header_label.config(text=tr("title"))
        if not work_started[0]:
            status_label.config(text=tr("preparing"))
            detail_label.config(text=tr("init_detail", flag=FLAG_NAME, count=len(CLEANUP_ITEMS)))
        btn_releases.config(text=tr("releases"))
        btn_blog.config(text=tr("blog"))
        btn_github.config(text=tr("github"))
        affiliation_label.config(text=tr("affiliation"))

    lang_combo.bind("<<ComboboxSelected>>", on_lang_change)

    dev_label = tk.Label(container, text=f"Developed by {DEVELOPER_NAME}", font=("Segoe UI", 8, "italic"), fg="#64748b", bg=card_color)
    dev_label.pack(pady=(0, 8))

    status_label = tk.Label(container, text=tr("preparing"), font=("Segoe UI", 10, "bold"), fg="#2563eb", bg=card_color, wraplength=420)
    status_label.pack(pady=2)

    detail_label = tk.Label(container, text=tr("init_detail", flag=FLAG_NAME, count=len(CLEANUP_ITEMS)), font=("Segoe UI", 8), fg="#64748b", bg=card_color, wraplength=420)
    detail_label.pack(pady=2)

    progress = ttk.Progressbar(container, length=420, mode="indeterminate")
    progress.pack(pady=10)
    progress.start(10)

    affiliation_label = tk.Label(container, text=tr("affiliation"), font=("Segoe UI", 8), fg="#64748b", bg=card_color, cursor="hand2")
    affiliation_label.pack(side="bottom", pady=(4, 0))
    affiliation_label.bind("<Button-1>", lambda e: open_url(AFFILIATION_URL))

    footer_frame = tk.Frame(container, bg=card_color)
    footer_frame.pack(fill="x", side="bottom", pady=(6, 0))

    btn_releases = tk.Label(footer_frame, text=tr("releases"), font=("Segoe UI", 8, "underline"), fg="#0284c7", bg=card_color, cursor="hand2")
    btn_releases.pack(side="left", padx=4)
    btn_releases.bind("<Button-1>", lambda e: open_url(GITHUB_RELEASES_URL))

    tk.Label(footer_frame, text="|", font=("Segoe UI", 8), fg="#cbd5e1", bg=card_color).pack(side="left", padx=2)

    btn_blog = tk.Label(footer_frame, text=tr("blog"), font=("Segoe UI", 8, "underline"), fg="#0284c7", bg=card_color, cursor="hand2")
    btn_blog.pack(side="left", padx=4)
    btn_blog.bind("<Button-1>", lambda e: open_url(BLOG_URL))

    tk.Label(footer_frame, text="|", font=("Segoe UI", 8), fg="#cbd5e1", bg=card_color).pack(side="left", padx=2)

    btn_github = tk.Label(footer_frame, text=tr("github"), font=("Segoe UI", 8, "underline"), fg="#0284c7", bg=card_color, cursor="hand2")
    btn_github.pack(side="left", padx=4)
    btn_github.bind("<Button-1>", lambda e: open_url(GITHUB_REPO_URL))

    worker = threading.Thread(target=perform_cleanup, args=(status_label, progress, detail_label, root, work_started), daemon=True)
    worker.start()

    root.protocol("WM_DELETE_WINDOW", lambda: force_cleanup_and_exit(root))
    root.mainloop()

if __name__ == "__main__":
    main()
'''

APP_VERSION = "v1.5.0"
APP_VERSION_TUPLE = (1, 5, 0, 0)
APP_VERSION_STR = "1.5.0.0"
APP_INTERNAL_NAME = "DiskCleanupAuto"
APP_EXE_NAME = f"{APP_INTERNAL_NAME}_{APP_VERSION}"

def generate_version_info_resource(ver_tuple=APP_VERSION_TUPLE, ver_str=APP_VERSION_STR, exe_name=APP_EXE_NAME):
    """
    Windows 파일 속성 [자세히(Details)] 탭에 영구 임베드되는
    VS_VERSIONINFO 리소스 텍스트를 버전업에 맞추어 완전 자동 생성합니다.
    """
    ver_tup_str = f"({ver_tuple[0]}, {ver_tuple[1]}, {ver_tuple[2]}, {ver_tuple[3]})"
    return f'''# UTF-8
# =============================================================================
# Windows PE Version Information Resource File (version_info.txt)
# Automatically synced by build_exe.py for Windows File Properties Details
# =============================================================================

VSVersionInfo(
  ffi=FixedFileInfo(
    filevers={ver_tup_str},
    prodvers={ver_tup_str},
    mask=0x3f,
    flags=0x0,
    OS=0x40004,
    fileType=0x1,
    subtype=0x0,
    date=(0, 0)
  ),
  kids=[
    StringFileInfo(
      [
        StringTable(
          '041204b0',
          [
            StringStruct('CompanyName', 'AhBiYout'),
            StringStruct('FileDescription', 'Windows 디스크 클린 오토'),
            StringStruct('FileVersion', '{ver_str}'),
            StringStruct('InternalName', '{APP_INTERNAL_NAME}'),
            StringStruct('LegalCopyright', 'Copyright (c) 2026 AhBiYout. All rights reserved.'),
            StringStruct('OriginalFilename', '{exe_name}.exe'),
            StringStruct('ProductName', 'Windows 디스크 클린 오토 ({APP_INTERNAL_NAME})'),
            StringStruct('ProductVersion', '{ver_str}'),
            StringStruct('Comments', 'Windows VolumeCaches 및 cleanmgr.exe 자동화 순차 정리 도구 (개발자: AhBiYout / https://ahbiyoutvibe.blogspot.com/)'),
            StringStruct('LegalTrademarks', 'AhBiYout'),
          ]
        ),
        StringTable(
          '040904b0',
          [
            StringStruct('CompanyName', 'AhBiYout'),
            StringStruct('FileDescription', 'Windows Disk Cleanup Auto Runner'),
            StringStruct('FileVersion', '{ver_str}'),
            StringStruct('InternalName', '{APP_INTERNAL_NAME}'),
            StringStruct('LegalCopyright', 'Copyright (c) 2026 AhBiYout. All rights reserved.'),
            StringStruct('OriginalFilename', '{exe_name}.exe'),
            StringStruct('ProductName', 'Windows Disk Cleanup Auto'),
            StringStruct('ProductVersion', '{ver_str}'),
            StringStruct('Comments', 'Windows VolumeCaches & cleanmgr automated sequential cleaner'),
            StringStruct('LegalTrademarks', 'AhBiYout'),
          ]
        )
      ]
    ),
    VarFileInfo([VarStruct('Translation', [1042, 1200, 1033, 1200])])
  ]
)
'''

def print_header(title):
    print("\n" + "=" * 79)
    print(f"  {title}")
    print("=" * 79 + "\n")

def run_cmd(cmd_list, description=None):
    if description:
        print(f"[*] {description}...")
    try:
        res = subprocess.run(cmd_list, check=True)
        return res.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"\n[ERROR] Command failed with exit code {e.returncode}: {' '.join(cmd_list)}")
        return False
    except Exception as e:
        print(f"\n[ERROR] Execution error: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print_header("[AhBiYout] Python to Portable EXE Auto Builder (v1.5.0)")
    print(f"Working Directory: {script_dir}")
    print(f"Python Version   : {sys.version.split()[0]} ({sys.executable})")

    # 1. Check / Install PyInstaller
    print_header("[1/5] Checking PyInstaller Compiler")
    try:
        import PyInstaller
        print(f"[OK] PyInstaller is already installed: {PyInstaller.__version__}")
    except ImportError:
        print("[*] PyInstaller not detected. Installing via pip...")
        res = subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pyinstaller"])
        if res.returncode != 0:
            print("\n[ERROR] Failed to install PyInstaller via pip!")
            print("Please check your internet connection or install manually with:")
            print("  pip install pyinstaller")
            input("\nPress Enter to exit...")
            sys.exit(1)
        print("[OK] PyInstaller installed successfully.")

    # 2. Find Target Python Source
    print_header("[2/5] Detecting Target Python Script")
    candidates = [
        "disk_cleanup_gui.py",
        "disk_cleanup.py",
        "disk_cleanup_deep.py",
        "disk_cleanup_cli.py",
        "main.py"
    ]

    target_file = None
    for cand in candidates:
        full_path = os.path.join(script_dir, cand)
        if os.path.exists(full_path):
            target_file = cand
            break

    if not target_file:
        print("[*] Target python script not found in folder.")
        print("[*] Auto-generating default 'disk_cleanup_gui.py' (v1.5.0)...")
        target_path = os.path.join(script_dir, "disk_cleanup_gui.py")
        try:
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(DEFAULT_GUI_SOURCE.strip() + "\n")
            target_file = "disk_cleanup_gui.py"
            print(f"[OK] Auto-created: {target_path}")
        except Exception as e:
            print(f"[ERROR] Could not auto-generate target file: {e}")
            input("\nPress Enter to exit...")
            sys.exit(1)

    print(f"[OK] Target script ready: {target_file}")

    # 2-1. Prepare Windows File Properties (Version Info Resource Auto-Update)
    version_file = os.path.join(script_dir, "version_info.txt")
    need_version_write = False
    if not os.path.exists(version_file):
        need_version_write = True
        print(f"[*] Creating Windows Version Resource ({version_file})...")
    else:
        try:
            with open(version_file, "r", encoding="utf-8") as vf:
                v_content = vf.read()
            if APP_VERSION_STR not in v_content or APP_EXE_NAME not in v_content or "cisnet" in v_content.lower():
                need_version_write = True
                print(f"[*] Updating Windows Version Resource to current version ({APP_VERSION_STR})...")
        except Exception:
            need_version_write = True

    if need_version_write:
        try:
            with open(version_file, "w", encoding="utf-8") as f:
                f.write(generate_version_info_resource().strip() + "\n")
            print(f"[OK] File properties metadata auto-updated: {version_file} (v{APP_VERSION_STR})")
        except Exception as e:
            print(f"[WARN] Could not write version_info.txt: {e}")
    else:
        print(f"[OK] Version Info Resource up-to-date: {version_file} (v{APP_VERSION_STR})")

    # 3. Compile EXE with PyInstaller
    print_header("[3/5] Compiling Single Standalone EXE with Windows File Details")
    exe_name = APP_EXE_NAME
    dist_dir = os.path.join(script_dir, "dist")
    build_dir = os.path.join(script_dir, "build")
    release_dir = os.path.join(script_dir, "Release")

    # 이전 빌드 잔류 디렉터리 사전 정리 (Inno Setup 충돌 방지)
    for d in (dist_dir, build_dir):
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)

    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--onefile",
        "--clean",
        f"--name={exe_name}",
        "--noconsole",
        "--uac-admin",
        f"--distpath={dist_dir}",
        f"--workpath={build_dir}",
        f"--specpath={script_dir}",
    ]

    icon_path = os.path.join(script_dir, "app.ico")
    if not os.path.exists(icon_path):
        icon_path = os.path.join(script_dir, "assets", "app.ico")
    if os.path.exists(icon_path):
        cmd.append(f"--icon={icon_path}")
        cmd.append(f"--add-data={icon_path}{os.pathsep}assets")
        print(f"  - [아이콘 리소스] 앱 및 실행 파일 아이콘 적용: {icon_path}")

    if os.path.exists(version_file):
        cmd.append(f"--version-file={version_file}")
        print("  - [자세히 속성] 파일 설명 : Windows 디스크 클린 오토")
        print(f"  - [자세히 속성] 제품 이름 : Windows 디스크 클린 오토 ({APP_INTERNAL_NAME})")
        print(f"  - [자세히 속성] 파일 버전 : {APP_VERSION_STR}")
        print(f"  - [자세히 속성] 제품 버전 : {APP_VERSION_STR}")
        print(f"  - [자세히 속성] 원본 파일 : {exe_name}.exe")
        print("  - [자세히 속성] 저 작 권  : Copyright (c) 2026 AhBiYout. All rights reserved.")
        print("  - [자세히 속성] 회 사 명  : AhBiYout (https://ahbiyoutvibe.blogspot.com/)")
        print("  - [자세히 속성] 언    어  : 한국어 (대한민국) / Unicode\n")

    cmd.append(target_file)

    print(f"Running command: {' '.join(cmd)}\n")
    build_success = run_cmd(cmd, "PyInstaller Compilation")
    if not build_success:
        print("\n[ERROR] PyInstaller compilation failed!")
        input("\nPress Enter to exit...")
        sys.exit(1)

    # 4. Move to Release folder (prevent duplicate dist+Release packaging during ISCC)
    print_header("[4/5] Finalizing Executable Deployment")
    os.makedirs(release_dir, exist_ok=True)
    source_exe = os.path.join(dist_dir, f"{exe_name}.exe")
    final_exe = os.path.join(release_dir, f"{exe_name}.exe")

    if os.path.exists(source_exe):
        try:
            if os.name == "nt":
                subprocess.run(["taskkill", "/F", "/IM", f"{exe_name}.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                time.sleep(0.5)
            shutil.move(source_exe, final_exe)
            print(f"[OK] Output binary saved to: {final_exe}")
        except Exception as e:
            print(f"[WARN] Could not move to Release folder ({e}). Exe is located at: {source_exe}")
            final_exe = source_exe

    # 4.5. Create Portable ZIP bundle (WindowsDiskCleanup_Portable_v1.5.0.zip)
    final_portable_zip = None
    if os.path.exists(final_exe):
        portable_zip_path = os.path.join(release_dir, f"WindowsDiskCleanup_Portable_{APP_VERSION}.zip")
        try:
            with zipfile.ZipFile(portable_zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                zf.write(final_exe, arcname=os.path.basename(final_exe))
                optional_files = [
                    (os.path.join(script_dir, "register_scheduler.bat"), "register_scheduler.bat"),
                    (os.path.join(script_dir, "LICENSE"), "LICENSE"),
                    (os.path.join(script_dir, "README.md"), "README.md"),
                    (os.path.join(script_dir, "docs", "README_EN.md"), os.path.join("docs", "README_EN.md")),
                    (os.path.join(script_dir, "docs", "README_JA.md"), os.path.join("docs", "README_JA.md")),
                ]
                ico_src = os.path.join(script_dir, "assets", "app.ico")
                if not os.path.exists(ico_src):
                    ico_src = os.path.join(script_dir, "app.ico")
                if os.path.exists(ico_src):
                    optional_files.append((ico_src, os.path.join("assets", "app.ico")))
                for src_path, arc_name in optional_files:
                    if os.path.exists(src_path):
                        zf.write(src_path, arcname=arc_name)
            final_portable_zip = portable_zip_path
            print(f"[OK] Portable ZIP archive created: {final_portable_zip}")
        except Exception as e:
            print(f"[WARN] Could not create Portable ZIP archive ({e}).")

    # 5. Inno Setup Installer Compilation (if ISCC is available and installer.iss exists)
    installer_iss = os.path.join(script_dir, "installer.iss")
    final_installer = None
    if os.path.exists(installer_iss):
        print_header("[5/5] Inno Setup Installer Packaging")
        iscc_candidates = [
            r"C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
            r"C:\Program Files\Inno Setup 6\ISCC.exe",
            r"C:\Inno Setup 6\ISCC.exe",
            shutil.which("iscc"),
            shutil.which("ISCC"),
        ]
        iscc_path = next((p for p in iscc_candidates if p and os.path.exists(p)), None)
        if iscc_path:
            print(f"[*] Inno Setup Compiler found: {iscc_path}")
            print("[*] Compiling installer (.iss)...")
            os.makedirs(os.path.join(script_dir, "Output"), exist_ok=True)
            res = subprocess.run([iscc_path, installer_iss], cwd=script_dir)
            if res.returncode == 0:
                print("[OK] Installer compiled successfully!")
                output_installer = os.path.join(script_dir, "Output", f"WindowsDiskCleanup_Setup_{APP_VERSION}.exe")
                if os.path.exists(output_installer):
                    final_installer = os.path.join(release_dir, f"WindowsDiskCleanup_Setup_{APP_VERSION}.exe")
                    shutil.copy2(output_installer, final_installer)
                    print(f"[OK] Installer copied to Release folder: {final_installer}")
            else:
                print(f"[WARN] Inno Setup compiler exited with code {res.returncode}")
        else:
            print("[INFO] Inno Setup (ISCC.exe) not found on system. Skipping installer packaging.")
            print("       (Download from: https://jrsoftware.org/isdl.php)")

    # Clean artifacts
    print("[*] Cleaning temporary build artifacts...")
    if os.path.exists(build_dir):
        shutil.rmtree(build_dir, ignore_errors=True)
    if os.path.exists(dist_dir) and final_exe != source_exe:
        shutil.rmtree(dist_dir, ignore_errors=True)
    spec_file = os.path.join(script_dir, f"{exe_name}.spec")
    if os.path.exists(spec_file):
        try:
            os.remove(spec_file)
        except OSError:
            pass

    print_header("[SUCCESS] Build Complete!")
    print(f"  [1] Portable Single EXE : {final_exe}")
    if final_portable_zip and os.path.exists(final_portable_zip):
        print(f"  [2] Portable ZIP Bundle : {final_portable_zip}")
    if final_installer and os.path.exists(final_installer):
        print(f"  [3] Windows Installer   : {final_installer}")
    print("- Standalone Single EXE, Portable ZIP & Inno Setup Installer")
    print("- Built-in UAC Administrator privileges & Quiet Firewall Registration")
    print("=" * 79)

    if os.name == "nt":
        try:
            subprocess.Popen(f'explorer.exe /select,"{final_exe}"')
        except Exception:
            pass

    try:
        input("\nPress Enter to exit...")
    except EOFError:
        pass

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\n[FATAL ERROR] {exc}")
        import traceback
        traceback.print_exc()
        try:
            input("\nPress Enter to exit...")
        except EOFError:
            pass
        sys.exit(1)
