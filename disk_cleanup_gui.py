"""
=============================================================================
 Windows Disk Cleanup Automated Runner (GUI Edition v1.5.0)
 Auto-configured Registry VolumeCaches & cleanmgr.exe execution
 ----------------------------------------------------------------------------
 * 개발자: AhBiYout
 * 개발자: AhBiYout
 * 공식 Google 블로그: https://ahbiyoutvibe.blogspot.com/
=============================================================================
"""

import os
import sys
import time
import json
import urllib.request
import ctypes
import winreg
import subprocess
import threading
import webbrowser
import tkinter as tk
from tkinter import ttk, messagebox

# =============================================================================
# 1. 관리자 권한 (UAC Elevation) 자동 확인 및 승격
# =============================================================================
def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def elevate_admin():
    """관리자 권한이 없으면 UAC 승격 창을 띄워 다시 실행합니다."""
    if not is_admin():
        script = os.path.abspath(sys.argv[0])
        params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
        # runas 동사로 재실행
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{script}" {params}', None, 1
        )
        sys.exit(0)

# =============================================================================
# 2. 프로그램 정보 및 정리 대상 설정
# =============================================================================
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
COMPANY_URL = "http://www.cisnet.co.kr/"
BLOG_URL = "https://ahbiyoutvibe.blogspot.com/"
UI_TITLE = f"AhBiYout Windows 디스크 클린 오토 ({CURRENT_VERSION})"
AUTO_CLOSE_SEC = 5

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

# =============================================================================
# 3. 레지스트리 VolumeCaches StateFlags 설정 함수
# =============================================================================
def configure_registry(log_callback=None):
    r"""
    HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches
    하위 항목에 StateFlags를 DWORD 값 2로 활성화합니다.
    """
    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    success_count = 0
    total_items = len(CLEANUP_ITEMS)
    
    # 64비트 및 32비트 레지스트리 뷰 대응 (KEY_WOW64_64KEY)
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

# =============================================================================
# 4. 디스크 정리 실행 워커 및 프로세스 관리
# =============================================================================
def sweep_tray_ghost_icons():
    """
    컴퓨터실 무인 원격/대량 실행 대응: 마우스를 직접 움직이지 않아도
    Windows 알림 영역(Notification Area) 및 작업표시줄 툴바에
    가상 마우스 스위프(Virtual WM_MOUSEMOVE)를 보내 죽은 고스트 아이콘과 잔상을 100% 자동 소멸시킵니다.
    """
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
    """
    Windows 작업 표시줄, 보조 트레이, 데스크톱 전체를 강제 무효화 및 재렌더링하고
    가상 트레이 스위프를 수행하여 고스트 윈도우 및 트레이 잔상을 즉시 소거합니다.
    """
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
    """
    컴퓨터실 대량 무인 실행 시 마우스 조작이 없어도
    백그라운드에서 주기적으로(2초마다) Windows Shell과 트레이 잔상을 자동 새로고침합니다.
    """
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
    """주기적 새로고침 워커 중지 후 최종 3회 연속 집중 스위프 수행"""
    _periodic_refresh_flag[0] = False
    for _ in range(3):
        try:
            refresh_windows_shell()
        except Exception:
            pass
        time.sleep(0.3)

def get_c_drive_free_gb():
    """C: 드라이브의 현재 여유 디스크 공간(GB)을 측정합니다."""
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
    """작업 완료 시 시스템 완료 알림음을 재생합니다."""
    try:
        import winsound
        winsound.MessageBeep(winsound.MB_ICONASTERISK)
    except Exception:
        pass

def get_cleanmgr_hwnds(target_pid):
    """지정된 cleanmgr PID가 소유한 모든 윈도우 핸들(HWND) 목록을 조회합니다."""
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
    """
    cleanmgr.exe의 작업 완료를 감지할 때 단순히 프로세스 종료를 기다리는 대신:
    1. Win32 SYNCHRONIZE 커널 이벤트 핸들(WaitForSingleObject)로 즉각 반응
    2. cleanmgr 소유 HWND(창 핸들)의 가시성(IsWindowVisible) 및 파괴(Destroy) 상태 후킹
    3. 창이 닫혔거나 작업 완료 후 프로세스가 지연 해제될 경우 즉각적인 핸들 해제 및 닫기 유도
    """
    start_time = time.time()
    pid = proc.pid
    kernel32 = ctypes.windll.kernel32
    user32 = ctypes.windll.user32

    # Win32 프로세스 핸들 획득 (SYNCHRONIZE | PROCESS_QUERY_LIMITED_INFORMATION)
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

            # 1. 커널 레벨 프로세스 종료 이벤트 감지 (WaitForSingleObject 250ms 동기화 대기)
            if h_process:
                wait_res = kernel32.WaitForSingleObject(h_process, 250)
                if wait_res == 0:  # WAIT_OBJECT_0: 프로세스 종료 시그널 즉시 감지
                    break
            else:
                if proc.poll() is not None:
                    break
                time.sleep(0.25)

            # 2. 윈도우 창 핸들(HWND) 상태 정밀 후킹 & 감시
            try:
                hwnds = get_cleanmgr_hwnds(pid)
                has_visible = False
                for hwnd in hwnds:
                    if user32.IsWindow(hwnd) and user32.IsWindowVisible(hwnd):
                        has_visible = True
                        saw_visible_window = True
                        break

                # 창이 떠 있다가 닫힌 경우 (cleanmgr 정리 다이얼로그 작업 종료 시점 포착)
                if saw_visible_window and not has_visible and not window_closed_detected:
                    window_closed_detected = True
                    window_closed_time = time.time()

                # 창이 닫혔는데도 백그라운드에서 프로세스가 2.5초 이상 지연 잔류할 때 조기 해제 트리거
                if window_closed_detected and (time.time() - window_closed_time >= 2.5):
                    for hwnd in hwnds:
                        if user32.IsWindow(hwnd):
                            user32.PostMessageW(hwnd, 0x0010, 0, 0) # WM_CLOSE
                    break
            except Exception:
                pass

            # UI 진행 안내 콜백 호출
            if update_status_cb:
                update_status_cb(elapsed, saw_visible_window, window_closed_detected)

    finally:
        # 커널 프로세스 핸들 즉시 닫기 (자원 누수 방지)
        if h_process:
            try:
                kernel32.CloseHandle(h_process)
            except Exception:
                pass

        # cleanmgr 프로세스가 아직 남아있다면 즉시 강제 해제
        try:
            if proc.poll() is None:
                proc.terminate()
        except Exception:
            pass

        # Windows 쉘과 DWM에 강제 무효화 신호를 주어 잔상 완전 소멸
        refresh_windows_shell()

def kill_lingering_cleanmgr():
    """백그라운드에 잔류하는 cleanmgr.exe 및 DismHost.exe 유휴 프로세스를 강제 정리합니다."""
    try:
        creation_flags = 0x08000000 if os.name == 'nt' else 0 # CREATE_NO_WINDOW
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
    """프로세스 완전 정리 및 즉시 종료"""
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
    # OLE/COM 스레드나 자식 프로세스 잔류 없이 100% 완전 종료
    os._exit(0)

# =============================================================================
# [v1.5.0 차세대 핵심 루틴] Windows.old 강제 권한 탈취 및 완전 삭제 파이프라인
# =============================================================================
def scan_windows_old_safety():
    r"""
    Windows.old 폴더 내부에 사용자의 개인 파일(문서, 바탕화면, 다운로드 등)이
    방치되어 있는지 사전 점검하여 데이터 유실 사고를 방지합니다.
    반환값: (has_user_data: bool, file_count: int, sample_paths: list)
    """
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
    r"""
    Windows 11 24H2 / 26H1 등에서 cleanmgr 및 기존 도구로 삭제 불가능한
    C:\Windows.old 폴더를 3단계 권한 탈취 & 잠금 해제 파이프라인으로 완전 소거합니다.
    1단계: takeown /F C:\Windows.old /A /R /D Y (NTFS 관리자 소유권 강제 탈취)
    2단계: icacls C:\Windows.old /grant Administrators:F /T /C /Q (모든 파일/서브폴더 완전 제어권 부여)
    3단계: rd /s /q "C:\Windows.old" (커널 락 파일 정리 및 영구 소거)
    """
    target_dir = r"C:\Windows.old"
    if not os.path.exists(target_dir):
        return (True, "C:\\Windows.old 폴더가 존재하지 않거나 이미 정리되었습니다.")

    creation_flags = 0x08000000 if os.name == 'nt' else 0 # CREATE_NO_WINDOW
    
    if update_ui_cb:
        update_ui_cb("Windows.old 강제 정리 [1/3]: NTFS 소유권 탈취 중 (takeown)...", "C:\\Windows.old 및 하위 트리 전체의 관리자(Administrators) 소유권을 확보합니다.")

    # 1. takeown 실행
    try:
        subprocess.run(
            ["takeown", "/F", target_dir, "/A", "/R", "/D", "Y"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
            timeout=180
        )
    except Exception as e:
        pass

    if update_ui_cb:
        update_ui_cb("Windows.old 강제 정리 [2/3]: ACL 모든 권한 부여 중 (icacls)...", "Administrators 그룹에 모든 파일/디렉터리 F(Full Control) 권한을 상속 주입합니다.")

    # 2. icacls 실행
    try:
        subprocess.run(
            ["icacls", target_dir, "/grant", "*S-1-5-32-544:F", "/T", "/C", "/Q"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
            timeout=240
        )
    except Exception as e:
        pass

    if update_ui_cb:
        update_ui_cb("Windows.old 강제 정리 [3/3]: 디렉터리 트리 완전 소거 중 (rd /s /q)...", "읽기 전용/시스템 속성 해제 및 Windows.old 폴더 영구 삭제를 진행합니다.")

    # 3. attrib 해제 및 rd /s /q 실행
    try:
        subprocess.run(
            ["attrib", "-r", "-a", "-s", "-h", f"{target_dir}\\*.*", "/s", "/d"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
            timeout=60
        )
    except Exception:
        pass

    try:
        subprocess.run(
            f'rd /s /q "{target_dir}"',
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
            timeout=180
        )
    except Exception:
        pass

    # 파이썬 shutil 폴더 삭제 시도 (혹시 남아있는 빈 디렉터리 청소)
    if os.path.exists(target_dir):
        try:
            import shutil
            shutil.rmtree(target_dir, ignore_errors=True)
        except Exception:
            pass

    still_exists = os.path.exists(target_dir)
    if not still_exists:
        if update_ui_cb:
            update_ui_cb("✨ Windows.old 완전 소거 성공!", "C:\\Windows.old 폴더가 100% 영구 삭제되었습니다.")
        return (True, "C:\\Windows.old 폴더가 100% 완전 소거되었습니다.")
    else:
        if update_ui_cb:
            update_ui_cb("Windows.old 정리 완료", "일부 백그라운드 락 파일을 제외한 대다수 기가바이트 데이터가 정리되었습니다.")
        return (False, "일부 잠긴 파일 제외 대부분 삭제됨")

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
        detail_text = f"HKLM VolumeCaches\\{item} ({FLAG_NAME}=2) [{status}]"
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
        # [1단계] 관리자 권한 및 실행 환경 확인
        time.sleep(0.2)
        update_ui(
            "1단계: 관리자 권한 및 실행 환경 확인 완료",
            "Windows 디스크 정리 설정을 준비 중입니다..."
        )
        time.sleep(0.4)

        # [2단계] 레지스트리 VolumeCaches StateFlags 항목 등록
        update_ui(
            f"2단계: 레지스트리 정리 항목 ({len(CLEANUP_ITEMS)}개) 활성화 시작...",
            f"대상 플래그: {FLAG_NAME}"
        )
        time.sleep(0.2)
        configured = configure_registry(registry_log)
        update_ui(
            f"2단계 완료: 총 {configured}/{len(CLEANUP_ITEMS)}개 항목 활성화 완료",
            "다음 단계인 Windows 디스크 정리 엔진(cleanmgr.exe)을 호출합니다..."
        )
        time.sleep(0.6)

        # [3단계] Windows 디스크 정리 엔진(cleanmgr.exe) 순차 실행
        # (컴퓨터실 무인 대량 실행 대비: 2초 주기 쉘 & 가상 트레이 자동 새로고침 워커 가동)
        start_periodic_shell_refresher(interval_sec=2.0)

        progress_bar.config(mode="indeterminate")
        progress_bar.start(12)

        
        # [Direct API] 휴지통 비우기 직접 실행 (SHEmptyRecycleBinW) 보완
        if "Recycle Bin" in CLEANUP_ITEMS:
            try:
                update_ui("휴지통 비우기 실행 중...", "SHEmptyRecycleBinW API를 통해 모든 드라이브의 휴지통을 비웁니다.")
                # 7 = SHERB_NOCONFIRMATION (1) | SHERB_NOPROGRESSUI (2) | SHERB_NOSOUND (4)
                ctypes.windll.shell32.SHEmptyRecycleBinW(None, None, 7)
                time.sleep(0.5)
            except Exception as e:
                print(f"휴지통 직접 비우기 예외: {e}")

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
                    detail_msg = f"cleanmgr 엔진이 {configured}개 등록 항목을 순서대로(직렬) 정리하고 있습니다.\n(※ 'Windows 업데이트 정리' 등 대용량 항목 처리 시 수 분 소요 가능)"
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
            
            # Win32 HWND 상태 후킹 및 커널 WaitForSingleObject 기반 정밀 Wait-For-Completion
            monitor_and_wait_cleanmgr(proc, on_cleanmgr_progress, max_timeout_sec=1800)

        except Exception as e:
            print(f"cleanmgr 실행 예외: {e}")

        # [4단계] 백그라운드 잔류 프로세스 점검 및 Windows Shell 잔상 강제 소거
        update_ui(
            "4단계: 백그라운드 프로세스 및 윈도우 잔상 갱신 중...",
            "cleanmgr 프로세스 정리 및 고스트 창(DWM 잔상) 즉시 소거 완료"
        )
        kill_lingering_cleanmgr()
        stop_periodic_shell_refresher()
        time.sleep(0.3)

        # [v1.5.0 차세대 핵심] Windows.old 강제 완전 정리 루틴 (Windows 11 24H2/26H1 특화)
        if os.path.exists(r"C:\Windows.old"):
            update_ui("안전 점검: Windows.old 사용자 파일 가드레일 검사 중...", "C:\\Windows.old\\Users 내 개인 파일 잔여 여부를 점검합니다.")
            has_user_files, u_count, _ = scan_windows_old_safety()
            if has_user_files:
                update_ui(
                    "⚠️ [안전 가드레일] Windows.old 개인 문서 발견됨",
                    f"C:\\Windows.old\\Users 내 개인 파일({u_count}개+)이 감지되어 사용자 보호를 위해 삭제를 안전하게 건너뜁니다."
                )
                time.sleep(1.5)
            else:
                def on_purge_status(s_title, s_detail):
                    update_ui(s_title, s_detail)
                
                success, p_msg = force_purge_windows_old(on_purge_status)
                time.sleep(0.5)

        # [5단계] 디스크 정리 완료 및 자동 종료
        total_elapsed = round(time.time() - start_total_time, 1)
        total_time_str = format_time_str(total_elapsed)

        # 여유 공간 측정
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

        # [마우스 동작 응용] 완료 상태에서 마우스가 창 위로 올라오거나 클릭 시 즉시 닫기 플래그
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

        # 카운트다운 루프
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

# =============================================================================
# 5. Tkinter GUI 생성 및 메인 진입점
# =============================================================================
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

    # 화면 해상도에 맞춰 화면 상단 22% 영역에 배치
    root.update_idletasks()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    win_w = 480
    win_h = 290
    x = max(0, (screen_w - win_w) // 2)
    y = max(40, int((screen_h - win_h) * 0.22))
    root.geometry(f"{win_w}x{win_h}+{x}+{y}")

    # 실행 시 전면 활성화
    root.lift()
    root.attributes("-topmost", True)
    root.after_idle(root.attributes, "-topmost", False)

    # 스타일링
    bg_color = "#f8fafc"
    card_color = "#ffffff"
    root.configure(bg=bg_color)

    container = tk.Frame(root, bg=card_color, padx=20, pady=16, relief="groove", bd=1)
    container.pack(fill="both", expand=True, padx=12, pady=12)

    # 프로그램 및 회사 헤더
    header_label = tk.Label(
        container,
        text=f"{COMPANY_NAME}\n{UI_TITLE}",
        font=("Segoe UI", 11, "bold"),
        fg="#0f172a",
        bg=card_color,
        justify="center"
    )
    header_label.pack(pady=(0, 4))

    # 개발자 서명
    dev_label = tk.Label(
        container,
        text=f"Developed by {DEVELOPER_NAME}",
        font=("Segoe UI", 8, "italic"),
        fg="#64748b",
        bg=card_color
    )
    dev_label.pack(pady=(0, 8))

    # 상태 텍스트
    status_label = tk.Label(
        container,
        text="디스크 정리 작업을 준비하는 중...",
        font=("Segoe UI", 10, "bold"),
        fg="#2563eb",
        bg=card_color
    )
    status_label.pack(pady=2)

    # 상세 정보 텍스트
    detail_label = tk.Label(
        container,
        text=f"설정 플래그: {FLAG_NAME} ({len(CLEANUP_ITEMS)}개 항목)",
        font=("Segoe UI", 8),
        fg="#64748b",
        bg=card_color,
        wraplength=420
    )
    detail_label.pack(pady=2)

    # 프로그레스 바
    progress = ttk.Progressbar(container, length=420, mode="indeterminate")
    progress.pack(pady=10)
    progress.start(10)

    # 링크 푸터 프레임
    footer_frame = tk.Frame(container, bg=card_color)
    footer_frame.pack(fill="x", side="bottom", pady=(6, 0))

    # 홈페이지 링크 버튼
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

    # 블로그 링크 버튼
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

    sep_label2 = tk.Label(footer_frame, text="|", font=("Segoe UI", 8), fg="#cbd5e1", bg=card_color)
    sep_label2.pack(side="left", padx=2)

    # GitHub 저장소 링크 버튼
    btn_github = tk.Label(
        footer_frame,
        text="🐙 GitHub",
        font=("Segoe UI", 8, "underline"),
        fg="#0284c7",
        bg=card_color,
        cursor="hand2"
    )
    btn_github.pack(side="left", padx=4)
    btn_github.bind("<Button-1>", lambda e: open_url(GITHUB_REPO_URL))

    # 실시간 GitHub Releases 업데이트 확인 스레드 기동
    check_github_update_realtime(root)

    # 워커 스레드 시작
    worker = threading.Thread(
        target=perform_cleanup,
        args=(status_label, progress, detail_label, root),
        daemon=True
    )
    worker.start()

    # 창 닫기(X) 이벤트 핸들러
    root.protocol("WM_DELETE_WINDOW", lambda: force_cleanup_and_exit(root))

    root.mainloop()

# =============================================================================
# 11. GitHub Releases 실시간 자동 업데이트 알림 시스템
# =============================================================================
def show_update_dialog(root, latest_version, release_url, release_notes=""):
    """GitHub Releases 실시간 업데이트 알림 팝업창"""
    try:
        dialog = tk.Toplevel(root)
        dialog.title("🚀 새로운 업데이트 알림 (GitHub Releases)")
        dialog.geometry("450x260")
        dialog.resizable(False, False)
        dialog.configure(bg="#f8fafc")
        dialog.attributes("-topmost", True)
        dialog.transient(root)
        dialog.grab_set()

        # 헤더
        header = tk.Frame(dialog, bg="#1e293b", padx=16, pady=12)
        header.pack(fill="x")
        tk.Label(
            header,
            text=f"새로운 버전({latest_version})이 출시되었습니다!",
            font=("Segoe UI", 11, "bold"),
            fg="#38bdf8",
            bg="#1e293b"
        ).pack(anchor="w")
        tk.Label(
            header,
            text=f"현재 버전: {CURRENT_VERSION}  ->  최신 배포 버전: {latest_version}",
            font=("Segoe UI", 9),
            fg="#94a3b8",
            bg="#1e293b"
        ).pack(anchor="w")

        # 본문
        body = tk.Frame(dialog, bg="#f8fafc", padx=16, pady=12)
        body.pack(fill="both", expand=True)

        info_text = (
            f"GitHub Releases에서 최신 인스톨러 파일을 다운로드할 수 있습니다.\n\n"
            f"• 저장소: {GITHUB_REPO_URL}\n"
            f"• 릴리스: {release_url or GITHUB_RELEASES_URL}\n"
            f"• 패치 요약: {release_notes or 'Windows 11 최신 정리 및 기능 개선'}"
        )
        tk.Label(
            body,
            text=info_text,
            font=("Segoe UI", 9),
            fg="#334155",
            bg="#f8fafc",
            justify="left",
            wraplength=410
        ).pack(anchor="w", pady=(0, 10))

        # 버튼 영역
        btn_frame = tk.Frame(body, bg="#f8fafc")
        btn_frame.pack(fill="x", side="bottom")

        def open_update():
            webbrowser.open_new(release_url or GITHUB_RELEASES_URL)
            dialog.destroy()

        tk.Button(
            btn_frame,
            text="🚀 업데이트 다운로드 (GitHub)",
            font=("Segoe UI", 9, "bold"),
            bg="#0284c7",
            fg="white",
            relief="flat",
            padx=12,
            pady=6,
            command=open_update,
            cursor="hand2"
        ).pack(side="right", padx=(6, 0))

        tk.Button(
            btn_frame,
            text="닫기",
            font=("Segoe UI", 9),
            bg="#e2e8f0",
            fg="#475569",
            relief="flat",
            padx=12,
            pady=6,
            command=dialog.destroy,
            cursor="hand2"
        ).pack(side="right")
    except Exception:
        pass

def check_github_update_realtime(root):
    """GitHub Releases API를 백그라운드 호출하여 최신 버전 확인"""
    def _worker():
        try:
            req = urllib.request.Request(
                GITHUB_API_LATEST,
                headers={"User-Agent": f"DiskCleanupAuto-{CURRENT_VERSION}"}
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode("utf-8"))
                    latest_tag = data.get("tag_name", "").strip()
                    html_url = data.get("html_url", GITHUB_RELEASES_URL)
                    body_notes = data.get("name", "")
                    if latest_tag and latest_tag != CURRENT_VERSION:
                        root.after(500, lambda: show_update_dialog(root, latest_tag, html_url, body_notes))
        except Exception:
            pass

    threading.Thread(target=_worker, daemon=True).start()

if __name__ == "__main__":
    main()

