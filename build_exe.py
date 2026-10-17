#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
[CISNET] Python to Portable Single EXE Auto Builder (v1.5.0)
Robust Python-native compiler runner that never crashes or closes silently.
Self-contained: auto-generates disk_cleanup_gui.py if missing.
"""

import sys
import os
import subprocess
import shutil
import time

DEFAULT_GUI_SOURCE = '''"""
=============================================================================
 Windows Disk Cleanup Automated Runner (GUI Edition v1.5.0)
 Auto-configured Registry VolumeCaches & cleanmgr.exe execution
 ----------------------------------------------------------------------------
 * 회사: CISNET CORPORATION (http://www.cisnet.co.kr/)
 * 개발자: AhBiYout
 * 공식 Google 블로그: https://ahbiyoutvibe.blogspot.com/
=============================================================================
"""

import os
import sys
import time
import ctypes
import winreg
import subprocess
import threading
import webbrowser
import tkinter as tk
from tkinter import ttk

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def elevate_admin():
    if not is_admin():
        script = os.path.abspath(sys.argv[0])
        params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{script}" {params}', None, 1
        )
        sys.exit(0)

FLAG_NAME = "StateFlags0064"
SAGESET_ID = 64
COMPANY_NAME = "CISNET CORPORATION"
DEVELOPER_NAME = "AhBiYout"
COMPANY_URL = "http://www.cisnet.co.kr/"
BLOG_URL = "https://ahbiyoutvibe.blogspot.com/"
UI_TITLE = "AhBiYout Windows 디스크 클린 오토"
AUTO_CLOSE_SEC = 5

CLEANUP_ITEMS = [
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
    base_path = r"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VolumeCaches"
    success_count = 0
    total_items = len(CLEANUP_ITEMS)
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY

    for idx, item in enumerate(CLEANUP_ITEMS, start=1):
        key_path = f"{base_path}\\\\{item}"
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
                hwnd = user32.FindWindowExW(hwnd, 0, c1, None)
            if c2 and hwnd:
                hwnd = user32.FindWindowExW(hwnd, 0, c2, None)
            if target_cls and hwnd:
                tb = user32.FindWindowExW(hwnd, 0, target_cls, None)
                if tb:
                    toolbars.append(tb)

        WM_MOUSEMOVE = 0x0200
        for tb in toolbars:
            rect = (ctypes.c_long * 4)()
            if user32.GetClientRect(tb, ctypes.byref(rect)):
                w = max(1, rect[2] - rect[0])
                h = max(1, rect[3] - rect[1])
                mid_y = h // 2
                for x in range(0, w, 15):
                    lparam = (mid_y << 16) | (x & 0xFFFF)
                    user32.PostMessageW(tb, WM_MOUSEMOVE, 0, lparam)
    except Exception:
        pass

def refresh_windows_shell():
    try:
        user32 = ctypes.windll.user32
        tray_hwnd = user32.FindWindowW("Shell_TrayWnd", None)
        if tray_hwnd:
            user32.RedrawWindow(tray_hwnd, None, None, 0x0185)
        sec_tray = user32.FindWindowW("Shell_SecondaryTrayWnd", None)
        if sec_tray:
            user32.RedrawWindow(sec_tray, None, None, 0x0185)
        user32.RedrawWindow(0, None, None, 0x0185)
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
            ctypes.c_wchar_p("C:\\\\"),
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
        user32 = ctypes.windll.user32
        def enum_cb(hwnd, extra):
            try:
                if user32.IsWindow(hwnd):
                    w_pid = ctypes.c_ulong()
                    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(w_pid))
                    if w_pid.value == target_pid:
                        hwnds.append(hwnd)
            except Exception:
                pass
            return True
        WNDENUMPROC = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)
        user32.EnumWindows(WNDENUMPROC(enum_cb), 0)
    except Exception:
        pass
    return hwnds

def monitor_and_wait_cleanmgr(proc, update_status_cb, max_timeout_sec=1800):
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

def force_cleanup_and_exit(root):
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

def perform_cleanup(status_label, progress_bar, detail_label, root):
    def update_ui(status_text, detail_text=""):
        try:
            root.after(0, lambda: [
                status_label.config(text=status_text),
                detail_label.config(text=detail_text) if detail_text else None
            ])
        except Exception:
            pass

    def registry_log(idx, total, item, status):
        status_text = f"2단계: 레지스트리 항목 등록 중... [{idx}/{total}]"
        detail_text = f"HKLM VolumeCaches\\\\{item} ({FLAG_NAME}=2) [{status}]"
        update_ui(status_text, detail_text)
        time.sleep(0.02)

    start_total_time = time.time()
    initial_free_gb = get_c_drive_free_gb()

    def format_time_str(secs):
        if secs < 60:
            return f"{secs:.1f}초"
        mins = int(secs // 60)
        rem_secs = secs % 60
        return f"{mins}분 {rem_secs:.1f}초"

    try:
        time.sleep(0.2)
        update_ui("1단계: 관리자 권한 및 실행 환경 확인 완료", "Windows 디스크 정리 설정을 준비 중입니다...")
        time.sleep(0.4)

        update_ui(f"2단계: 레지스트리 정리 항목 ({len(CLEANUP_ITEMS)}개) 활성화 시작...", f"대상 플래그: {FLAG_NAME}")
        time.sleep(0.2)
        configured = configure_registry(registry_log)
        update_ui(f"2단계 완료: 총 {configured}/{len(CLEANUP_ITEMS)}개 항목 활성화 완료", "다음 단계인 Windows 디스크 정리 엔진(cleanmgr.exe)을 호출합니다...")
        time.sleep(0.6)

        start_periodic_shell_refresher(interval_sec=2.0)
        progress_bar.config(mode="indeterminate")
        progress_bar.start(12)

        cleanmgr_cmd = ["cleanmgr.exe", f"/sagerun:{SAGESET_ID}"]
        start_cleanmgr_time = time.time()
        has_update_cleanup = "Update Cleanup" in CLEANUP_ITEMS

        def on_cleanmgr_progress(elapsed, saw_visible, win_closed):
            time_str = format_time_str(elapsed)
            if win_closed:
                status_msg = f"3단계: cleanmgr 작업 완료 감지 (⏱️ {time_str} 경과)"
                detail_msg = "디스크 정리 창 닫힘 감지됨 · 프로세스 핸들 및 잔여 세션 즉시 해제 중..."
            elif saw_visible:
                status_msg = f"3단계: Windows 디스크 정리 실행 중... (⏱️ {time_str} 경과)"
                detail_msg = f"cleanmgr UI/진행 다이얼로그 실시간 후킹 중 (총 {configured}개 항목 직렬 정리)"
            else:
                status_msg = f"3단계: Windows 디스크 정리 순차 실행 중... (⏱️ {time_str} 경과)"
                if has_update_cleanup:
                    detail_msg = f"cleanmgr 엔진이 {configured}개 등록 항목을 순서대로(직렬) 정리하고 있습니다.\\n(※ 'Windows 업데이트 정리' 등 대용량 항목 처리 시 수 분 소요 가능)"
                else:
                    detail_msg = f"cleanmgr 엔진이 {configured}개 등록 항목을 순서대로(직렬) 정리하고 있습니다."
            update_ui(status_msg, detail_msg)

        try:
            proc = subprocess.Popen(
                cleanmgr_cmd,
                shell=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
            monitor_and_wait_cleanmgr(proc, on_cleanmgr_progress, max_timeout_sec=1800)
        except Exception as e:
            print(f"cleanmgr 실행 예외: {e}")

        update_ui("4단계: 백그라운드 프로세스 및 윈도우 잔상 갱신 중...", "cleanmgr 프로세스 정리 및 고스트 창 즉시 소거 완료")
        kill_lingering_cleanmgr()
        stop_periodic_shell_refresher()
        time.sleep(0.3)

        total_elapsed = round(time.time() - start_total_time, 1)
        total_time_str = format_time_str(total_elapsed)

        final_free_gb = get_c_drive_free_gb()
        freed_str = ""
        if initial_free_gb is not None and final_free_gb is not None:
            freed_diff = round(final_free_gb - initial_free_gb, 2)
            if freed_diff > 0:
                freed_str = f" · 💾 여유 공간 +{freed_diff:.2f} GB 확보"
            else:
                freed_str = f" · 💾 현재 C: 여유 {final_free_gb:.1f} GB"

        play_completion_sound()
        progress_bar.stop()
        progress_bar.config(mode="determinate", value=100)

        is_closing = [False]
        def on_mouse_action(event=None):
            if not is_closing[0]:
                is_closing[0] = True
                update_ui("✨ 디스크 정리 완료!", "마우스 감지: 창을 즉시 닫습니다...")
                time.sleep(0.2)
                force_cleanup_and_exit(root)

        root.after(0, lambda: [
            root.bind("<Enter>", on_mouse_action),
            root.bind("<Button-1>", on_mouse_action)
        ])

        for remaining in range(AUTO_CLOSE_SEC, 0, -1):
            if is_closing[0]:
                break
            status_text = f"5단계: ✨ 모든 디스크 정리 완료! (소요: {total_time_str}{freed_str})"
            detail_text = f"⏱️ {remaining}초 후 자동 종료 (💡 마우스를 창 위로 올리면 즉시 닫힙니다)"
            update_ui(status_text, detail_text)
            time.sleep(1)

    except Exception as e:
        progress_bar.stop()
        update_ui("❌ 오류 발생", str(e))
        time.sleep(3)
    finally:
        force_cleanup_and_exit(root)

def open_url(url):
    try:
        webbrowser.open_new_tab(url)
    except Exception as e:
        print(f"웹 브라우저 열기 실패: {e}")

def main():
    elevate_admin()

    root = tk.Tk()
    root.title(UI_TITLE)
    
    # 앱 창 및 작업표시줄 아이콘 설정
    base_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
    bundle_dir = getattr(sys, "_MEIPASS", base_dir)
    icon_candidates = [
        os.path.join(bundle_dir, "assets", "app.ico"),
        os.path.join(bundle_dir, "app.ico"),
        os.path.join(base_dir, "assets", "app.ico"),
        os.path.join(base_dir, "app.ico"),
    ]
    for ic in icon_candidates:
        if os.path.exists(ic):
            try:
                root.iconbitmap(ic)
                break
            except Exception:
                pass

    root.geometry("480x290")
    root.resizable(False, False)

    root.update_idletasks()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    win_w = 480
    win_h = 290
    x = max(0, (screen_w - win_w) // 2)
    y = max(40, int((screen_h - win_h) * 0.22))
    root.geometry(f"{win_w}x{win_h}+{x}+{y}")

    root.lift()
    root.attributes("-topmost", True)
    root.after_idle(root.attributes, "-topmost", False)

    bg_color = "#f8fafc"
    card_color = "#ffffff"
    root.configure(bg=bg_color)

    container = tk.Frame(root, bg=card_color, padx=20, pady=16, relief="groove", bd=1)
    container.pack(fill="both", expand=True, padx=12, pady=12)

    header_label = tk.Label(
        container,
        text=f"{COMPANY_NAME}\\n{UI_TITLE}",
        font=("Segoe UI", 11, "bold"),
        fg="#0f172a",
        bg=card_color,
        justify="center"
    )
    header_label.pack(pady=(0, 4))

    dev_label = tk.Label(
        container,
        text=f"Developed by {DEVELOPER_NAME}",
        font=("Segoe UI", 8, "italic"),
        fg="#64748b",
        bg=card_color
    )
    dev_label.pack(pady=(0, 8))

    status_label = tk.Label(
        container,
        text="디스크 정리 작업을 준비하는 중...",
        font=("Segoe UI", 10, "bold"),
        fg="#2563eb",
        bg=card_color
    )
    status_label.pack(pady=2)

    detail_label = tk.Label(
        container,
        text=f"설정 플래그: {FLAG_NAME} ({len(CLEANUP_ITEMS)}개 항목)",
        font=("Segoe UI", 8),
        fg="#64748b",
        bg=card_color,
        wraplength=420
    )
    detail_label.pack(pady=2)

    progress = ttk.Progressbar(container, length=420, mode="indeterminate")
    progress.pack(pady=10)
    progress.start(10)

    footer_frame = tk.Frame(container, bg=card_color)
    footer_frame.pack(fill="x", side="bottom", pady=(6, 0))

    btn_home = tk.Label(
        footer_frame,
        text="🌐 CISNET 홈페이지",
        font=("Segoe UI", 8, "underline"),
        fg="#0284c7",
        bg=card_color,
        cursor="hand2"
    )
    btn_home.pack(side="left", padx=4)
    btn_home.bind("<Button-1>", lambda e: open_url(COMPANY_URL))

    sep_label = tk.Label(footer_frame, text="|", font=("Segoe UI", 8), fg="#cbd5e1", bg=card_color)
    sep_label.pack(side="left", padx=2)

    btn_blog = tk.Label(
        footer_frame,
        text="📝 AhBiYoutVibe 블로그",
        font=("Segoe UI", 8, "underline"),
        fg="#0284c7",
        bg=card_color,
        cursor="hand2"
    )
    btn_blog.pack(side="left", padx=4)
    btn_blog.bind("<Button-1>", lambda e: open_url(BLOG_URL))

    worker = threading.Thread(
        target=perform_cleanup,
        args=(status_label, progress, detail_label, root),
        daemon=True
    )
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
            StringStruct('CompanyName', 'CISNET CORPORATION'),
            StringStruct('FileDescription', 'AhBiYout Windows 디스크 클린 오토'),
            StringStruct('FileVersion', '{ver_str}'),
            StringStruct('InternalName', '{APP_INTERNAL_NAME}'),
            StringStruct('LegalCopyright', 'Copyright (C) 2026 AhBiYout. All rights reserved.'),
            StringStruct('OriginalFilename', '{exe_name}.exe'),
            StringStruct('ProductName', 'AhBiYout Windows 디스크 클린 오토 ({APP_INTERNAL_NAME})'),
            StringStruct('ProductVersion', '{ver_str}'),
            StringStruct('Comments', 'Windows VolumeCaches 및 cleanmgr.exe 자동화 순차 정리 도구 (개발자: AhBiYout / http://www.cisnet.co.kr/)'),
            StringStruct('LegalTrademarks', 'AhBiYout'),
          ]
        ),
        StringTable(
          '040904b0',
          [
            StringStruct('CompanyName', 'CISNET CORPORATION'),
            StringStruct('FileDescription', 'CISNET Windows Disk Cleanup Auto Runner'),
            StringStruct('FileVersion', '{ver_str}'),
            StringStruct('InternalName', '{APP_INTERNAL_NAME}'),
            StringStruct('LegalCopyright', 'Copyright (C) 2026 AhBiYout. All rights reserved.'),
            StringStruct('OriginalFilename', '{exe_name}.exe'),
            StringStruct('ProductName', 'CISNET Windows Disk Cleanup Auto'),
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

    print_header("[CISNET] Python to Portable EXE Auto Builder (v1.5.0)")
    print(f"Working Directory: {script_dir}")
    print(f"Python Version   : {sys.version.split()[0]} ({sys.executable})")

    # 1. Check / Install PyInstaller
    print_header("[1/4] Checking PyInstaller Compiler")
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
    print_header("[2/4] Detecting Target Python Script")
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
            if APP_VERSION_STR not in v_content or APP_EXE_NAME not in v_content:
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
    print_header("[3/4] Compiling Single Standalone EXE with Windows File Details")
    exe_name = APP_EXE_NAME
    dist_dir = os.path.join(script_dir, "dist")
    build_dir = os.path.join(script_dir, "build")
    release_dir = os.path.join(script_dir, "Release")

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
        print(f"  - [아이콘 리소스] 앱 및 실행 파일 아이콘 적용: {icon_path}")

    if os.path.exists(version_file):
        cmd.append(f"--version-file={version_file}")
        print("  - [자세히 속성] 파일 설명 : AhBiYout Windows 디스크 클린 오토")
        print(f"  - [자세히 속성] 제품 이름 : AhBiYout Windows 디스크 클린 오토 ({APP_INTERNAL_NAME})")
        print(f"  - [자세히 속성] 파일 버전 : {APP_VERSION_STR}")
        print(f"  - [자세히 속성] 제품 버전 : {APP_VERSION_STR}")
        print(f"  - [자세히 속성] 원본 파일 : {exe_name}.exe")
        print("  - [자세히 속성] 저 작 권  : Copyright (C) 2026 AhBiYout. All rights reserved.")
        print("  - [자세히 속성] 회 사 명  : CISNET CORPORATION (http://www.cisnet.co.kr/)")
        print("  - [자세히 속성] 언    어  : 한국어 (대한민국) / Unicode\n")

    cmd.append(target_file)

    print(f"Running command: {' '.join(cmd)}\n")
    build_success = run_cmd(cmd, "PyInstaller Compilation")
    if not build_success:
        print("\n[ERROR] PyInstaller compilation failed!")
        input("\nPress Enter to exit...")
        sys.exit(1)

    # 4. Copy to Release folder & Clean artifacts
    print_header("[4/4] Finalizing Executable Deployment")
    os.makedirs(release_dir, exist_ok=True)
    source_exe = os.path.join(dist_dir, f"{exe_name}.exe")
    final_exe = os.path.join(release_dir, f"{exe_name}.exe")

    if os.path.exists(source_exe):
        try:
            subprocess.run(["taskkill", "/F", "/IM", f"{exe_name}.exe"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(0.5)
            shutil.copy2(source_exe, final_exe)
            print(f"[OK] Output binary saved to: {final_exe}")
        except Exception as e:
            print(f"[WARN] Could not move to Release folder ({e}). Exe is located at: {source_exe}")
            final_exe = source_exe

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
    if final_installer and os.path.exists(final_installer):
        print(f"  [2] Windows Installer  : {final_installer}")
    print("- Standalone Single EXE & Inno Setup Installer")
    print("- Built-in UAC Administrator privileges & Quiet Firewall Registration")
    print("=" * 79)

    try:
        subprocess.Popen(f'explorer.exe /select,"{final_exe}"')
    except Exception:
        pass

    print("\nPress Enter to exit...")
    input()

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\n[FATAL ERROR] {exc}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
        sys.exit(1)
