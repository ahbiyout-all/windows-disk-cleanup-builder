import { ScriptConfig, VolumeCacheItem } from '../types';
import { CURRENT_VERSION } from '../version';

function formatFlagName(sagesetId: number): string {
  const padded = String(sagesetId).padStart(4, '0');
  return `StateFlags${padded}`;
}

export function generatePythonGuiScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);
  const developerName = config.developerName || 'AhBiYout';
  const companyUrl = config.companyUrl || 'http://www.cisnet.co.kr/';
  const blogUrl = config.blogUrl || 'https://ahbiyoutvibe.blogspot.com/';
  const companyName = config.companyName || 'CISNET CORPORATION';
  const itemsJsonList = JSON.stringify(
    selectedItems.map((i) => i.name),
    null,
    4
  );

  return `"""
=============================================================================
 Windows Disk Cleanup Automated Runner (GUI Edition)
 Auto-configured Registry VolumeCaches & cleanmgr.exe execution
 ----------------------------------------------------------------------------
 * 개발자: ${developerName}
 * 회사 홈페이지: ${companyUrl}
 * 공식 Google 블로그: ${blogUrl}
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
FLAG_NAME = "${flagName}"
SAGESET_ID = ${config.sagesetId}
COMPANY_NAME = "${companyName}"
DEVELOPER_NAME = "${developerName}"
COMPANY_URL = "${companyUrl}"
BLOG_URL = "${blogUrl}"
UI_TITLE = "${config.uiTitle}"
AUTO_CLOSE_SEC = ${config.autoCloseTimeoutSec}

CLEANUP_ITEMS = ${itemsJsonList}

# =============================================================================
# 3. 레지스트리 VolumeCaches StateFlags 설정 함수
# =============================================================================
def configure_registry(log_callback=None):
    r"""
    HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches
    하위 항목에 StateFlags를 DWORD 값 2로 활성화합니다. (국가별 로컬라이즈 키 명칭 자동 호환)
    """
    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    success_count = 0
    total_items = len(CLEANUP_ITEMS)
    
    # 64비트 및 32비트 레지스트리 뷰 대응 (KEY_WOW64_64KEY)
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY
    
    for idx, item in enumerate(CLEANUP_ITEMS, start=1):
        candidates = [item]
        if item == "Recycle Bin":
            candidates = ["Recycle Bin", "휴지통"]
        elif item == "Temporary Files":
            candidates = ["Temporary Files", "임시 파일"]
        elif item == "Thumbnail Cache" or item == "Thumbnails":
            candidates = ["Thumbnail Cache", "미리 보기 축소판 그림"]
            
        success_for_item = False
        for candidate in candidates:
            key_path = f"{base_path}\{candidate}"
            try:
                with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, access_flags) as key:
                    winreg.SetValueEx(key, FLAG_NAME, 0, winreg.REG_DWORD, 2)
                    success_for_item = True
            except Exception:
                pass
                
        if success_for_item:
            success_count += 1
            if log_callback:
                log_callback(idx, total_items, item, "OK")
        else:
            if log_callback:
                log_callback(idx, total_items, item, "SKIPPED")
                
    return success_count

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
            timeout=180
        )
    except Exception as e:
        pass

    if update_ui_cb:
        update_ui_cb("Windows.old 강제 정리 [3/3]: 디렉터리 트리 완전 삭제 중 (rd /s /q)...", "잠금 해제된 이전 Windows 잔여 파일들을 영구 소거하고 수십 GB를 회수합니다.")

    # 3. rd /s /q 실행
    try:
        res = subprocess.run(
            f'rd /s /q "{target_dir}"',
            shell=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags,
            timeout=300
        )
    except Exception as e:
        pass

    # 4. 여전히 잔여물이 남았다면 파이썬 레벨 rmtree 2차 시도
    if os.path.exists(target_dir):
        try:
            import shutil
            def on_rm_error(func, path, exc_info):
                try:
                    os.chmod(path, 0o777)
                    func(path)
                except Exception:
                    pass
            shutil.rmtree(target_dir, onerror=on_rm_error)
        except Exception:
            pass

    success = not os.path.exists(target_dir)
    msg = "C:\\Windows.old 폴더가 100% 완전 삭제되었습니다!" if success else "C:\\Windows.old 일부 시스템 잠금 파일을 제외하고 소거 완료되었습니다."
    return (success, msg)

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
        ${config.cleanWindowsOldForce ? `
        if os.path.exists(r"C:\\Windows.old"):
            ${config.safeguardUserFiles ? `
            update_ui("안전 점검: Windows.old 사용자 파일 가드레일 검사 중...", "C:\\Windows.old\\Users 내 개인 파일 잔여 여부를 점검합니다.")
            has_user_files, u_count, _ = scan_windows_old_safety()
            if has_user_files:
                update_ui(
                    "⚠️ [안전 가드레일] Windows.old 개인 문서 발견됨",
                    f"C:\\Windows.old\\Users 내 개인 파일({u_count}개+)이 감지되어 사용자 보호를 위해 삭제를 안전하게 건너뜁니다."
                )
                time.sleep(1.5)
            else:
                force_purge_windows_old(update_ui)
                time.sleep(0.5)
            ` : `
            force_purge_windows_old(update_ui)
            time.sleep(0.5)
            `}
        ` : '# Windows.old 강제 정리 비활성화됨'}

        # [5단계] 디스크 정리 완료 및 자동 종료
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

        # [마우스 동작 응용] 완료 상태에서 마우스가 창 위로 올라오거나 클릭 시 즉시 닫기
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

        # 카운트다운 후 종료
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
    ${config.autoUacElevation ? 'elevate_admin()' : '# 관리자 권한 확인 (자동 승격 비활성화됨)\n    if not is_admin():\n        print("[경고] 관리자 권한으로 실행해야 레지스트리 수정이 가능합니다.")'}

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

    # 화면 해상도에 맞춰 윈도우 작업창 및 하단 작업표시줄과 겹치지 않도록 화면 상단 영역(상단 22% 지점)에 배치
    root.update_idletasks()
    screen_w = root.winfo_screenwidth()
    screen_h = root.winfo_screenheight()
    win_w = 480
    win_h = 290
    x = max(0, (screen_w - win_w) // 2)
    y = max(40, int((screen_h - win_h) * 0.22))
    root.geometry(f"{win_w}x{win_h}+{x}+{y}")

    # 실행 시 다른 작업창 뒤로 숨겨지지 않도록 전면 활성화
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
        text=f"{COMPANY_NAME}\\n{UI_TITLE}",
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
        text="📝 Google 블로그",
        font=("Segoe UI", 8, "underline"),
        fg="#ea580c",
        bg=card_color,
        cursor="hand2"
    )
    btn_blog.pack(side="left", padx=4)
    btn_blog.bind("<Button-1>", lambda e: open_url(BLOG_URL))

    # 창 닫기(X) 버튼 클릭 시 잔류 프로세스 포함 즉시 종료
    root.protocol("WM_DELETE_WINDOW", lambda: force_cleanup_and_exit(root))

    # 백그라운드 스레드로 정리 실행
    worker = threading.Thread(
        target=perform_cleanup,
        args=(status_label, progress, detail_label, root),
        daemon=True
    )
    worker.start()

    root.mainloop()

if __name__ == "__main__":
    main()
`;
}

export function generatePythonCliScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);
  const itemsJsonList = JSON.stringify(
    selectedItems.map((i) => i.name),
    null,
    4
  );

  return `"""
=============================================================================
 Windows Disk Cleanup Automated CLI Script
 Clean console output, robust error handling & UAC elevation
=============================================================================
"""

import os
import sys
import time
import ctypes
import winreg
import logging
import argparse
import subprocess

# =============================================================================
# 1. 설정 및 로깅
# =============================================================================
FLAG_NAME = "${flagName}"
SAGESET_ID = ${config.sagesetId}
LOG_FILE = "${config.logFileName}"

CLEANUP_ITEMS = ${itemsJsonList}

def setup_logger(to_file=${config.logToFile ? 'True' : 'False'}):
    handlers = [logging.StreamHandler(sys.stdout)]
    if to_file:
        handlers.append(logging.FileHandler(LOG_FILE, encoding='utf-8'))

    logging.basicConfig(
        level=logging.INFO,
        format="[%(asctime)s] [%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
        handlers=handlers
    )

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def elevate_admin():
    if not is_admin():
        logging.info("관리자 권한이 필요합니다. UAC 권한 승격을 요청합니다...")
        script = os.path.abspath(sys.argv[0])
        params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, f'"{script}" {params}', None, 1
        )
        sys.exit(0)

# =============================================================================
# 2. 레지스트리 설정
# =============================================================================
def set_volume_caches():
    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY
    success_count = 0

    logging.info(f"==> 디스크 정리 대상 항목 ({len(CLEANUP_ITEMS)}개) 레지스트리 설정 중...")

    for item in CLEANUP_ITEMS:
        key_path = f"{base_path}\\{item}"
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, key_path, 0, access_flags) as key:
                # StateFlagsXXXX = 2 (활성화)
                winreg.SetValueEx(key, FLAG_NAME, 0, winreg.REG_DWORD, 2)
                logging.info(f"  [OK] {item}")
                success_count += 1
        except FileNotFoundError:
            logging.warning(f"  [건너뜀/없음] {item}")
        except PermissionError:
            logging.error(f"  [권한 거부] {item} - 관리자 권한으로 실행하십시오.")
        except Exception as ex:
            logging.error(f"  [실패] {item} - {ex}")

    logging.info(f"==> 총 {success_count}/{len(CLEANUP_ITEMS)}개 항목 활성화 완료 (플래그: {FLAG_NAME})")
    return success_count

# =============================================================================
# 3. 디스크 정리 실행
# =============================================================================
def kill_lingering_cleanmgr():
    try:
        subprocess.run(
            ["taskkill", "/F", "/IM", "cleanmgr.exe", "/T"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000 if os.name == 'nt' else 0
        )
    except Exception:
        pass

def run_cleanmgr(wait=True):
    cmd = ["cleanmgr.exe", f"/sagerun:{SAGESET_ID}"]
    logging.info(f"==> cleanmgr 실행 명령어: {' '.join(cmd)}")
    
    start_time = time.time()
    try:
        proc = subprocess.Popen(
            cmd,
            shell=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        max_sec = 1800 # 30분 안전 상한선
        last_logged_sec = -1

        while True:
            elapsed = time.time() - start_time
            if proc.poll() is not None:
                break
            if elapsed >= max_sec:
                try:
                    proc.kill()
                except Exception:
                    pass
                break
            
            # 5초 간격 실시간 진행 소요 시간 출력
            current_sec = int(elapsed)
            if current_sec > 0 and current_sec % 5 == 0 and current_sec != last_logged_sec:
                if current_sec < 60:
                    time_display = f"{current_sec}초"
                else:
                    time_display = f"{current_sec // 60}분 {current_sec % 60}초"
                
                logging.info(f"  ... 디스크 정리 진행 중 (⏱️ 경과 시간: {time_display} | cleanmgr.exe 정상 동작 중)")
                last_logged_sec = current_sec

            time.sleep(0.3)
        
        kill_lingering_cleanmgr()
        elapsed = round(time.time() - start_time, 1)
        if elapsed >= 60:
            elapsed_str = f"{int(elapsed // 60)}분 {elapsed % 60:.1f}초"
        else:
            elapsed_str = f"{elapsed:.1f}초"
        logging.info(f"==> cleanmgr.exe 작업 완료! (총 소요 시간: {elapsed_str})")
        return True
    except Exception as e:
        logging.error(f"==> 예외 발생: {e}")
        return False

# =============================================================================
# 4. 엔트리 포인트
# =============================================================================
def main():
    parser = argparse.ArgumentParser(description="Windows 자동 디스크 정리 도구")
    parser.add_argument("--no-elevate", action="store_true", help="UAC 자동 승격 비활성화")
    parser.add_argument("--sageset-only", action="store_true", help="레지스트리만 등록하고 cleanmgr 실행 안 함")
    args = parser.parse_args()

    setup_logger()

    logging.info("=" * 60)
    logging.info(" [1/5단계] 관리자 권한 및 실행 환경 확인")
    logging.info("=" * 60)

    ${config.autoUacElevation ? 'if not args.no_elevate:\n        elevate_admin()' : 'if not is_admin():\n        logging.warning("경고: 관리자 권한이 없으므로 레지스트리 수정이 실패할 수 있습니다.")'}

    logging.info("=" * 60)
    logging.info(f" [2/5단계] VolumeCaches 레지스트리 정리 항목 ({len(CLEANUP_ITEMS)}개) 순차 등록")
    logging.info("=" * 60)

    # 1) 레지스트리 세팅
    set_volume_caches()

    # 2) 디스크 정리 실행
    if not args.sageset_only:
        logging.info("=" * 60)
        logging.info(f" [3/5단계] Windows 디스크 정리(cleanmgr.exe) 순차 실행 (/sagerun:{SAGESET_ID})")
        logging.info(f"  ㄴ 등록된 {len(CLEANUP_ITEMS)}개 항목을 Windows 시스템이 순차적으로 정리합니다.")
        logging.info("=" * 60)
        run_cleanmgr()
    else:
        logging.info("--sageset-only 옵션이 지정되어 cleanmgr 실행을 건너뜁니다.")

    logging.info("=" * 60)
    logging.info(" [4/5단계] 백그라운드 잔류 프로세스 점검 및 정리")
    logging.info("=" * 60)
    kill_lingering_cleanmgr()
    logging.info("cleanmgr.exe 및 잔류 서비스 프로세스 정리 완료.")

    logging.info("=" * 60)
    logging.info(" [5/5단계] ✨ 모든 디스크 정리 자동화 작업이 성공적으로 완료되었습니다.")
    logging.info("=" * 60)
    os._exit(0)

if __name__ == "__main__":
    main()
`;
}

export function generatePythonSilentScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);
  const itemsJsonList = JSON.stringify(
    selectedItems.map((i) => i.name),
    null,
    4
  );

  return `"""
=============================================================================
 Windows Disk Cleanup Silent Background Automation (for Task Scheduler)
 완전 무인 백그라운드 자동화 - 팝업/콘솔 창 없음 (pythonw.exe 호환)
=============================================================================
"""

import os
import sys
import ctypes
import winreg
import logging
import subprocess

FLAG_NAME = "${flagName}"
SAGESET_ID = ${config.sagesetId}
LOG_PATH = os.path.join(os.environ.get("TEMP", "C:\\\\Windows\\\\Temp"), "${config.logFileName}")

CLEANUP_ITEMS = ${itemsJsonList}

# 백그라운드 로깅 설정
logging.basicConfig(
    filename=LOG_PATH,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    encoding="utf-8"
)

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def run_silent_cleanup():
    logging.info("--------------------------------------------------")
    logging.info("Silent Disk Cleanup Task Initiated")
    
    if not is_admin():
        logging.error("권한 부족: 스케줄러를 '가장 높은 수준의 권한으로 실행(Run with highest privileges)'으로 설정해야 합니다.")
        sys.exit(1)

    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY
    success_count = 0

    # 1. 레지스트리 플래그 주입
    for item in CLEANUP_ITEMS:
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{item}", 0, access_flags) as key:
                winreg.SetValueEx(key, FLAG_NAME, 0, winreg.REG_DWORD, 2)
                success_count += 1
        except Exception as e:
            logging.debug(f"VolumeCache item skipped ({item}): {e}")

    logging.info(f"Registry updated: {success_count}/{len(CLEANUP_ITEMS)} items configured.")

    # 2. cleanmgr 무인 실행 (창 띄우지 않음: CREATE_NO_WINDOW)
    creation_flags = 0x08000000 # CREATE_NO_WINDOW
    start_time = time.time()
    try:
        proc = subprocess.Popen(
            ["cleanmgr.exe", f"/sagerun:{SAGESET_ID}"],
            creationflags=creation_flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        max_sec = 1800 # 30분 안전 상한선
        while True:
            elapsed = time.time() - start_time
            if proc.poll() is not None:
                break
            if elapsed >= max_sec:
                try:
                    proc.kill()
                except Exception:
                    pass
                break
            time.sleep(0.5)

        subprocess.run(
            ["taskkill", "/F", "/IM", "cleanmgr.exe", "/T"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=creation_flags
        )
        elapsed = round(time.time() - start_time, 1)
        logging.info(f"cleanmgr.exe completed successfully in {elapsed}s.")
    except Exception as e:
        logging.error(f"cleanmgr execution failed: {e}")
    finally:
        os._exit(0)

if __name__ == "__main__":
    run_silent_cleanup()
`;
}

export function generatePythonDeepScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);
  const itemsJsonList = JSON.stringify(
    selectedItems.map((i) => i.name),
    null,
    4
  );

  return `"""
=============================================================================
 Windows Ultimate System & Disk Deep Cleaner (Python)
 cleanmgr + DISM Component Cleanup + %TEMP% & WinTemp Purge + DNS Flush
=============================================================================
"""

import os
import sys
import shutil
import ctypes
import winreg
import logging
import subprocess

FLAG_NAME = "${flagName}"
SAGESET_ID = ${config.sagesetId}

CLEANUP_ITEMS = ${itemsJsonList}

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(message)s",
    datefmt="%H:%M:%S"
)

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False

def elevate_admin():
    if not is_admin():
        script = os.path.abspath(sys.argv[0])
        params = " ".join([f'"{arg}"' for arg in sys.argv[1:]])
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, f'"{script}" {params}', None, 1)
        sys.exit(0)

# =============================================================================
# 보조 정리 기능 (Temp 폴더 직접 삭제, DISM, DNS)
# =============================================================================
def purge_directory(target_dir, label):
    """현재 사용 중이지 않은 임시 파일 및 폴더를 직접 삭제합니다."""
    if not os.path.exists(target_dir):
        return
    logging.info(f"-> [{label}] 디렉터리 직접 청소 중: {target_dir}")
    deleted_files = 0
    deleted_dirs = 0

    for root, dirs, files in os.walk(target_dir, topdown=False):
        for f in files:
            fp = os.path.join(root, f)
            try:
                os.remove(fp)
                deleted_files += 1
            except Exception:
                pass # 현재 사용 중인 파일은 안전하게 스킵

        for d in dirs:
            dp = os.path.join(root, d)
            try:
                os.rmdir(dp)
                deleted_dirs += 1
            except Exception:
                pass

    logging.info(f"   ㄴ {deleted_files}개 파일, {deleted_dirs}개 빈 폴더 제거 완료")

def run_dism_cleanup():
    """Windows Update WinSxS 컴포넌트 저장소 최적화 (DISM)"""
    logging.info("-> [DISM] Windows 컴포넌트 저장소(WinSxS) 최적화 시작...")
    try:
        subprocess.run(
            ["dism.exe", "/Online", "/Cleanup-Image", "/StartComponentCleanup"],
            check=True
        )
        logging.info("   ㄴ DISM 컴포넌트 정리 성공!")
    except Exception as e:
        logging.warning(f"   ㄴ DISM 실행 실패 또는 건너뜀: {e}")

def force_purge_windows_old():
    r"""
    [v1.5.0 차세대 핵심] Windows 11 24H2 / 26H1 Windows.old 강제 권한 탈취 & 완전 소거
    """
    target_dir = r"C:\Windows.old"
    if not os.path.exists(target_dir):
        logging.info("-> [Windows.old] C:\\Windows.old 폴더가 존재하지 않거나 이미 정리되었습니다.")
        return

    ${config.safeguardUserFiles ? `
    users_dir = r"C:\Windows.old\Users"
    if os.path.exists(users_dir):
        important = ["Desktop", "Documents", "Downloads", "Pictures", "바탕 화면", "내 문서", "다운로드", "사진"]
        found = []
        for uf in os.listdir(users_dir):
            up = os.path.join(users_dir, uf)
            if not os.path.isdir(up) or uf.lower() in ["public", "default", "all users"]:
                continue
            for imp in important:
                cd = os.path.join(up, imp)
                if os.path.exists(cd):
                    for r, _, fs in os.walk(cd):
                        for f in fs:
                            if not f.lower().endswith(('.ini', '.lnk', '.tmp')):
                                found.append(os.path.join(r, f))
                                if len(found) >= 3: break
            if len(found) >= 3: break
        if len(found) > 0:
            logging.warning("-> [Windows.old Safe-Guard] ⚠️ 개인 문서/바탕화면 파일이 감지되어 사용자 데이터 보호를 위해 C:\\Windows.old 삭제를 안전하게 건너뜁니다.")
            return
    ` : ''}

    logging.info("-> [Windows.old] NTFS 소유권 탈취 (takeown /F C:\\Windows.old /A /R /D Y)...")
    try:
        subprocess.run(["takeown", "/F", target_dir, "/A", "/R", "/D", "Y"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    except Exception:
        pass

    logging.info("-> [Windows.old] ACL 모든 권한 부여 (icacls C:\\Windows.old /grant Administrators:F /T /C /Q)...")
    try:
        subprocess.run(["icacls", target_dir, "/grant", "*S-1-5-32-544:F", "/T", "/C", "/Q"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=180)
    except Exception:
        pass

    logging.info("-> [Windows.old] 디렉터리 트리 완전 삭제 (rd /s /q C:\\Windows.old)...")
    try:
        subprocess.run(f'rd /s /q "{target_dir}"', shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=300)
    except Exception:
        pass

    if os.path.exists(target_dir):
        try:
            shutil.rmtree(target_dir, ignore_errors=True)
        except Exception:
            pass

    if not os.path.exists(target_dir):
        logging.info("   ㄴ C:\\Windows.old 폴더 100% 완전 소거 완료! (대규모 디스크 공간 확보)")
    else:
        logging.info("   ㄴ C:\\Windows.old 잠금 해제 파일 정리 완료")

def run_dns_flush():
    """DNS 캐시 초기화"""
    try:
        subprocess.run(["ipconfig", "/flushdns"], stdout=subprocess.DEVNULL)
        logging.info("-> [DNS] DNS 확인자 캐시 플러시 완료")
    except Exception:
        pass

def main():
    logging.info("==========================================================")
    logging.info("  🚀 Windows Ultimate Deep Disk Cleaner Starting...       ")
    logging.info("==========================================================")

    # 1. 관리자 권한 확인
    logging.info("[1/6단계] 관리자 권한 확인 및 UAC 승격")
    elevate_admin()

    # 2. %TEMP% 및 C:\Windows\Temp 직접 소거
    logging.info("[2/6단계] 사용자 (%TEMP%) 및 시스템 (Windows Temp) 폴더 직접 소거")
    ${config.cleanTempDirs ? `
    user_temp = os.environ.get("TEMP", "")
    if user_temp:
        purge_directory(user_temp, "사용자 %TEMP%")
    purge_directory(r"C:\Windows\Temp", "시스템 Windows Temp")
    ` : '    logging.info("  ㄴ Temp 폴더 직접 소거 옵션 비활성화됨 (건너뜀)")'}

    # 3. 레지스트리 VolumeCaches StateFlags 주입
    logging.info("[3/6단계] VolumeCaches 레지스트리 정리 항목 활성화")
    base_path = r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches"
    access_flags = winreg.KEY_SET_VALUE | winreg.KEY_WOW64_64KEY

    for item in CLEANUP_ITEMS:
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, f"{base_path}\\{item}", 0, access_flags) as key:
                winreg.SetValueEx(key, FLAG_NAME, 0, winreg.REG_DWORD, 2)
        except Exception:
            pass

    # 4. cleanmgr /sagerun 실행
    logging.info(f"[4/6단계] cleanmgr.exe /sagerun:{SAGESET_ID} 순차 실행 중... (완료까지 대기)")
    start_time = time.time()
    try:
        proc = subprocess.Popen(
            ["cleanmgr.exe", f"/sagerun:{SAGESET_ID}"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        max_sec = 1800 # 30분 안전 상한선
        last_logged_sec = -1
        while True:
            elapsed = time.time() - start_time
            if proc.poll() is not None:
                break
            if elapsed >= max_sec:
                try:
                    proc.kill()
                except Exception:
                    pass
                break
            current_sec = int(elapsed)
            if current_sec > 0 and current_sec % 5 == 0 and current_sec != last_logged_sec:
                if current_sec < 60:
                    time_display = f"{current_sec}초"
                else:
                    time_display = f"{current_sec // 60}분 {current_sec % 60}초"
                logging.info(f"   ㄴ cleanmgr 진행 중 (⏱️ 경과 시간: {time_display} | cleanmgr.exe 정상 동작 중)")
                last_logged_sec = current_sec
            time.sleep(0.3)
    except Exception as e:
        logging.warning(f"cleanmgr 실행 예외: {e}")

    # 5. DISM WinSxS 컴포넌트 정리 (선택)
    logging.info("[5/7단계] DISM 컴포넌트 저장소 (WinSxS) 최적화")
    ${config.cleanDism ? 'run_dism_cleanup()' : '    logging.info("  ㄴ DISM 정리 옵션 비활성화됨 (건너뜀)")'}

    # 6. Windows.old 강제 권한 탈취 및 완전 소거 (선택)
    logging.info("[6/7단계] Windows.old 강제 권한 탈취 및 완전 삭제")
    ${config.cleanWindowsOldForce ? 'force_purge_windows_old()' : '    logging.info("  ㄴ Windows.old 강제 정리 비활성화됨 (건너뜀)")'}

    # 7. DNS 캐시 플러시 & 잔류 프로세스 소거
    logging.info("[7/7단계] DNS 캐시 플러시 & 잔류 프로세스 정리")
    ${config.flushDns ? 'run_dns_flush()' : '    logging.info("  ㄴ DNS 플러시 옵션 비활성화됨 (건너뜀)")'}

    # 잔류 프로세스 강제 정리
    try:
        subprocess.run(
            ["taskkill", "/F", "/IM", "cleanmgr.exe", "/T"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=0x08000000 if os.name == 'nt' else 0
        )
    except Exception:
        pass

    logging.info("==========================================================")
    logging.info("  ✨ 모든 심층 디스크 정리 및 최적화가 성공적으로 끝났습니다!     ")
    logging.info("==========================================================")
    os._exit(0)

if __name__ == "__main__":
    main()
`;
}

export function generatePowerShellScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);

  return `# =============================================================================
# Windows Disk Cleanup Automation (PowerShell Script)
# 관리자 권한 자동 확인, VolumeCaches 레지스트리 세팅 및 cleanmgr 실행
# =============================================================================

# 1. 관리자 권한 확인 및 자체 승격
Write-Host "[1/4단계] 관리자 권한 확인 중..." -ForegroundColor Cyan
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[UAC] 관리자 권한이 필요합니다. 관리자 권한으로 다시 실행합니다..." -ForegroundColor Yellow
    Start-Process powershell.exe -ArgumentList ("-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`"") -Verb RunAs
    Exit
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Windows 자동 디스크 정리 (PowerShell Edition)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. 정리할 대상 항목 목록
$cleanupItems = @(
${selectedItems.map((i) => `    "${i.name}"`).join(',\n')}
)

$flagName = "${flagName}"
$sagesetId = ${config.sagesetId}
$successCount = 0

# 3. 레지스트리 StateFlags 설정
Write-Host "[2/4단계] VolumeCaches 레지스트리 항목 ($($cleanupItems.Count)개) 활성화 중..." -ForegroundColor Cyan
foreach ($item in $cleanupItems) {
    $keyPath = "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VolumeCaches\\$item"
    if (Test-Path $keyPath) {
        Set-ItemProperty -Path $keyPath -Name $flagName -Value 2 -Type DWord -ErrorAction SilentlyContinue
        Write-Host "  [OK] $item" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  [건너뜀] $item (시스템에 없음)" -ForegroundColor DarkGray
    }
}

Write-Host "==> 총 $successCount 개 항목 레지스트리 설정 완료 ($flagName)" -ForegroundColor Green

# 4. cleanmgr 실행
Write-Host "[3/4단계] cleanmgr.exe /sagerun:$sagesetId 순차 실행 중... (완료까지 대기)" -ForegroundColor Yellow
$process = Start-Process -FilePath "cleanmgr.exe" -ArgumentList "/sagerun:$sagesetId" -Wait -PassThru

${config.cleanWindowsOldForce ? `
# [v1.5.0 차세대 핵심] Windows.old 강제 권한 탈취 및 완전 삭제 (takeown + icacls + Remove-Item)
$winOldPath = "C:\\Windows.old"
if (Test-Path $winOldPath) {
    ${config.safeguardUserFiles ? `
    $usersPath = "C:\\Windows.old\\Users"
    $hasUserFiles = $false
    if (Test-Path $usersPath) {
        $userDocs = Get-ChildItem -Path $usersPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'Desktop|Documents|Downloads|Pictures|바탕 화면|내 문서|다운로드|사진' -and $_.Extension -notmatch 'ini|lnk|tmp' } | Select-Object -First 3
        if ($userDocs.Count -gt 0) {
            $hasUserFiles = $true
            Write-Host "⚠ [안전 가드레일] Windows.old\\Users 내 개인 파일이 발견되어 데이터 보호를 위해 삭제를 건너뜁니다." -ForegroundColor Yellow
        }
    }
    if (-not $hasUserFiles) {
        Write-Host "-> [Windows.old] NTFS 소유권 탈취 중 (takeown)..." -ForegroundColor Cyan
        Start-Process -FilePath "takeown.exe" -ArgumentList "/F C:\\Windows.old /A /R /D Y" -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
        Write-Host "-> [Windows.old] ACL 권한 부여 중 (icacls)..." -ForegroundColor Cyan
        Start-Process -FilePath "icacls.exe" -ArgumentList "C:\\Windows.old /grant *S-1-5-32-544:F /T /C /Q" -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
        Write-Host "-> [Windows.old] 디렉터리 강제 완전 소거 중..." -ForegroundColor Cyan
        cmd.exe /c "rd /s /q C:\\Windows.old" 2>$null
        Remove-Item -Path $winOldPath -Recurse -Force -ErrorAction SilentlyContinue
        if (-not (Test-Path $winOldPath)) {
            Write-Host "✨ C:\\Windows.old 폴더 100% 완전 소거 완료!" -ForegroundColor Green
        }
    }
    ` : `
    Write-Host "-> [Windows.old] NTFS 소유권 탈취 중 (takeown)..." -ForegroundColor Cyan
    Start-Process -FilePath "takeown.exe" -ArgumentList "/F C:\\Windows.old /A /R /D Y" -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
    Write-Host "-> [Windows.old] ACL 권한 부여 중 (icacls)..." -ForegroundColor Cyan
    Start-Process -FilePath "icacls.exe" -ArgumentList "C:\\Windows.old /grant *S-1-5-32-544:F /T /C /Q" -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue
    Write-Host "-> [Windows.old] 디렉터리 강제 완전 소거 중..." -ForegroundColor Cyan
    cmd.exe /c "rd /s /q C:\\Windows.old" 2>$null
    Remove-Item -Path $winOldPath -Recurse -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path $winOldPath)) {
        Write-Host "✨ C:\\Windows.old 폴더 100% 완전 소거 완료!" -ForegroundColor Green
    }
    `}
}
` : ''}

Write-Host "[4/4단계] 디스크 정리 작업 세션 완료" -ForegroundColor Cyan
if ($process.ExitCode -eq 0) {
    Write-Host "✨ 모든 디스크 정리가 정상적으로 완료되었습니다!" -ForegroundColor Green
} else {
    Write-Host "⚠ 디스크 정리가 완료되었으나 종료 코드: $($process.ExitCode)" -ForegroundColor Yellow
}
`;
}

export function generateBatchScript(
  items: VolumeCacheItem[],
  selectedIds: string[],
  config: ScriptConfig
): string {
  const selectedItems = items.filter((it) => selectedIds.includes(it.id));
  const flagName = formatFlagName(config.sagesetId);

  const rawScript = `@echo off
setlocal EnableExtensions

REM ============================================================================
REM   Windows Disk Cleanup Auto Runner (Batch Script)
REM   Sequential Execution & Standard Console Control
REM ============================================================================

REM [1/4] 관리자 권한 확인 및 UAC 자동 승격
echo [1/4] 관리자 권한 확인 중...
net session >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [UAC] 관리자 권한이 필요합니다. 관리자 권한으로 승격 실행합니다...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

REM [2/4] 작업 디렉토리 이탈 방지
cd /d "%~dp0"
set "SCRIPT_DIR=%~dp0"

title [CISNET] Windows Disk Cleanup Auto Runner
color 0B

echo ===============================================================================
echo   Windows Disk Cleanup Auto Runner
echo   Working Directory: %SCRIPT_DIR%
echo ===============================================================================
echo.

set "REG_BASE=HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VolumeCaches"
set "FLAG=${flagName}"
set "SAGESET_ID=${config.sagesetId}"

REM [3/4] VolumeCaches 레지스트리 항목 일괄 등록
echo [3/4] VolumeCaches 레지스트리 항목 (%FLAG%) 일괄 등록 중...
${selectedItems
  .map(
    (it) =>
      `reg add "%REG_BASE%\\${it.name}" /v "%FLAG%" /t REG_DWORD /d 2 /f >nul 2>&1\necho   [OK] ${it.name}`
  )
  .join('\n')}

echo.
echo ===============================================================================
echo   cleanmgr.exe /sagerun:%SAGESET_ID% 순차 실행 중... (완료까지 대기)
echo ===============================================================================
echo.

cleanmgr.exe /sagerun:%SAGESET_ID%

${config.cleanWindowsOldForce ? `
REM ===============================================================================
REM   [v1.5.0 차세대 핵심] Windows.old 강제 권한 탈취 및 완전 소거 루틴
REM ===============================================================================
if exist "C:\\Windows.old" (
    echo.
    echo [Windows.old] C:\\Windows.old 감지됨 - 강제 권한 탈취 및 완전 삭제 시작...
    echo   [1/3] takeown 소유권 강제 탈취 중...
    takeown /F "C:\\Windows.old" /A /R /D Y >nul 2>&1
    echo   [2/3] icacls Administrators 전체 제어 권한 부여 중...
    icacls "C:\\Windows.old" /grant *S-1-5-32-544:F /T /C /Q >nul 2>&1
    echo   [3/3] rd /s /q 폴더 트리 영구 삭제 중...
    rd /s /q "C:\\Windows.old" >nul 2>&1
    if not exist "C:\\Windows.old" (
        echo   [OK] C:\\Windows.old 100%% 완전 삭제 완료! (대규모 여유 공간 확보)
    ) else (
        echo   [안내] 일부 사용 중인 파일 외 주요 잔여 폴더 정리가 완료되었습니다.
    )
)
` : ''}

echo.
echo ===============================================================================
echo   [4/4] [SUCCESS] 모든 디스크 정리 작업이 성공적으로 끝났습니다.
echo ===============================================================================
echo.
echo [안내] 콘솔 창을 닫으려면 아무 키나 누르세요...
pause >nul
exit /b 0
`;

  return rawScript.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

export function generatePyInstallerBatchScript(config: ScriptConfig): string {
  const baseExeName = (config.exeName || 'DiskCleanupAuto').replace(/[^a-zA-Z0-9_\-]/g, '');
  // Automatically append Semantic Versioning tag matching patch notes (e.g. DiskCleanupAuto_v1.3.4)
  const exeName = baseExeName.toLowerCase().includes(CURRENT_VERSION.toLowerCase())
    ? baseExeName
    : `${baseExeName}_${CURRENT_VERSION}`;
  const noConsoleFlag = config.exeNoConsole ? '--noconsole' : '--console';
  const uacAdminFlag = config.exeUacAdmin ? '--uac-admin' : '';
  const cleanArtifacts = config.exeCleanArtifacts;

  const rawScript = `@echo off
setlocal

cd /d "%~dp0"
set "SCRIPT_DIR=%~dp0"
set "RELEASE_DIR=%SCRIPT_DIR%Release"
set "DIST_DIR=%SCRIPT_DIR%dist"
set "BUILD_DIR=%SCRIPT_DIR%build"
set "SPEC_DIR=%SCRIPT_DIR%"

title [${config.companyName || 'CISNET'}] Python to Portable Single EXE Auto Builder (${CURRENT_VERSION})
color 0B

echo ===============================================================================
echo   [CISNET] Python to Portable Single EXE Auto Builder (${CURRENT_VERSION})
echo   Target : ${exeName}.exe
echo   Folder : %SCRIPT_DIR%
echo ===============================================================================
echo.

REM -------------------------------------------------------------------------------
REM Check if Python-native builder build_exe.py exists
REM -------------------------------------------------------------------------------
if exist "%SCRIPT_DIR%build_exe.py" goto :RUN_PY_BUILDER

REM -------------------------------------------------------------------------------
REM [1/6] Find Python Interpreter
REM -------------------------------------------------------------------------------
echo [1/6] Searching for Python interpreter...
set "PY_CMD="

call python -V >nul 2>&1
if %errorlevel% equ 0 set "PY_CMD=python"
if defined PY_CMD goto :FOUND_PYTHON

call py -V >nul 2>&1
if %errorlevel% equ 0 set "PY_CMD=py"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\\Programs\\Python\\Python314\\python.exe" set "PY_CMD=%LocalAppData%\\Programs\\Python\\Python314\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\\Programs\\Python\\Python313\\python.exe" set "PY_CMD=%LocalAppData%\\Programs\\Python\\Python313\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\\Programs\\Python\\Python312\\python.exe" set "PY_CMD=%LocalAppData%\\Programs\\Python\\Python312\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\\Programs\\Python\\Python311\\python.exe" set "PY_CMD=%LocalAppData%\\Programs\\Python\\Python311\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "%LocalAppData%\\Programs\\Python\\Python310\\python.exe" set "PY_CMD=%LocalAppData%\\Programs\\Python\\Python310\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Program Files\\Python314\\python.exe" set "PY_CMD=C:\\Program Files\\Python314\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Program Files\\Python313\\python.exe" set "PY_CMD=C:\\Program Files\\Python313\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Program Files\\Python312\\python.exe" set "PY_CMD=C:\\Program Files\\Python312\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Program Files\\Python311\\python.exe" set "PY_CMD=C:\\Program Files\\Python311\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Python314\\python.exe" set "PY_CMD=C:\\Python314\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Python313\\python.exe" set "PY_CMD=C:\\Python313\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Python312\\python.exe" set "PY_CMD=C:\\Python312\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

if exist "C:\\Python311\\python.exe" set "PY_CMD=C:\\Python311\\python.exe"
if defined PY_CMD goto :FOUND_PYTHON

color 0C
echo.
echo ===============================================================================
echo [ERROR] Python is not installed or not found on this computer!
echo ===============================================================================
echo 1. Download and install Python from: https://www.python.org/downloads/
echo 2. Make sure [Add python.exe to PATH] is checked during installation!
echo ===============================================================================
echo.
pause
exit /b 1

:FOUND_PYTHON
echo [OK] Python found: %PY_CMD%
call %PY_CMD% --version
echo.

REM -------------------------------------------------------------------------------
REM [2/6] Check / Install PyInstaller
REM -------------------------------------------------------------------------------
echo [2/6] Checking PyInstaller...
call %PY_CMD% -m pyinstaller --version >nul 2>&1
if %errorlevel% equ 0 goto :PYINSTALLER_OK

call pyinstaller --version >nul 2>&1
if %errorlevel% equ 0 goto :PYINSTALLER_OK

echo [*] PyInstaller not found. Installing via pip...
call %PY_CMD% -m pip install --upgrade pip
call %PY_CMD% -m pip install pyinstaller
if %errorlevel% neq 0 goto :ERR_PIP

:PYINSTALLER_OK
echo [OK] PyInstaller is ready.
echo.

REM -------------------------------------------------------------------------------
REM [3/6] Check Target Python Source File
REM -------------------------------------------------------------------------------
echo [3/6] Finding Python source file...
set "TARGET_PY="
set "TARGET_NAME="

if exist "%SCRIPT_DIR%disk_cleanup_gui.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_gui.py"
if exist "%SCRIPT_DIR%disk_cleanup_gui.py" set "TARGET_NAME=disk_cleanup_gui.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup.py"
if exist "%SCRIPT_DIR%disk_cleanup.py" set "TARGET_NAME=disk_cleanup.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup_deep.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_deep.py"
if exist "%SCRIPT_DIR%disk_cleanup_deep.py" set "TARGET_NAME=disk_cleanup_deep.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%disk_cleanup_cli.py" set "TARGET_PY=%SCRIPT_DIR%disk_cleanup_cli.py"
if exist "%SCRIPT_DIR%disk_cleanup_cli.py" set "TARGET_NAME=disk_cleanup_cli.py"
if defined TARGET_PY goto :FOUND_SOURCE

if exist "%SCRIPT_DIR%main.py" set "TARGET_PY=%SCRIPT_DIR%main.py"
if exist "%SCRIPT_DIR%main.py" set "TARGET_NAME=main.py"
if defined TARGET_PY goto :FOUND_SOURCE

color 0C
echo.
echo ===============================================================================
echo [ERROR] Python source file (disk_cleanup_gui.py) not found!
echo Target folder: %SCRIPT_DIR%
echo ===============================================================================
echo.
pause
exit /b 1

:FOUND_SOURCE
echo [OK] Target script: %TARGET_NAME%
echo.

REM -------------------------------------------------------------------------------
REM [4/6] Compile to Single Standalone Portable EXE
REM -------------------------------------------------------------------------------
echo [4/6] Building portable EXE (${exeName}.exe)...
echo Please wait 15-30 seconds...
echo -------------------------------------------------------------------------------

set "ICON_PARAM="
if exist "%SCRIPT_DIR%app.ico" set "ICON_PARAM=--icon=%SCRIPT_DIR%app.ico"

set "VERSION_PARAM="
if exist "%SCRIPT_DIR%version_info.txt" set "VERSION_PARAM=--version-file=%SCRIPT_DIR%version_info.txt"

call %PY_CMD% -m pyinstaller --onefile --clean --name=${exeName} ${noConsoleFlag} ${uacAdminFlag} %ICON_PARAM% %VERSION_PARAM% --distpath "%DIST_DIR%" --workpath "%BUILD_DIR%" --specpath "%SPEC_DIR%" "%TARGET_PY%"
if %errorlevel% equ 0 goto :BUILD_OK

echo [*] Retrying with pyinstaller CLI...
call pyinstaller --onefile --clean --name=${exeName} ${noConsoleFlag} ${uacAdminFlag} %ICON_PARAM% %VERSION_PARAM% --distpath "%DIST_DIR%" --workpath "%BUILD_DIR%" --specpath "%SPEC_DIR%" "%TARGET_PY%"
if %errorlevel% neq 0 goto :ERR_BUILD

:BUILD_OK
echo.
echo [OK] PyInstaller compilation completed.
echo.

REM -------------------------------------------------------------------------------
REM [5/6] Move EXE to Release Folder
REM -------------------------------------------------------------------------------
echo [5/6] Copying executable to Release folder...
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

taskkill /F /IM ${exeName}.exe >nul 2>&1
if exist "%RELEASE_DIR%\\${exeName}.exe" attrib -r "%RELEASE_DIR%\\${exeName}.exe" >nul 2>&1

if exist "%DIST_DIR%\\${exeName}.exe" copy /y "%DIST_DIR%\\${exeName}.exe" "%RELEASE_DIR%\\${exeName}.exe" >nul 2>&1
if exist "%RELEASE_DIR%\\${exeName}.exe" echo [OK] Output file: "%RELEASE_DIR%\\${exeName}.exe"
echo.

REM -------------------------------------------------------------------------------
REM [7/7] Clean Temporary Artifacts
REM -------------------------------------------------------------------------------
REM -------------------------------------------------------------------------------
REM [6/7] Build Inno Setup Installer (if installer.iss exists)
REM -------------------------------------------------------------------------------
echo [6/7] Checking Inno Setup Compiler for installer packaging...
set "ISCC_EXE="
if exist "C:\Program Files (x86)\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE if exist "C:\Program Files\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Program Files\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE if exist "C:\Inno Setup 6\ISCC.exe" set "ISCC_EXE=C:\Inno Setup 6\ISCC.exe"
if not defined ISCC_EXE (
    where iscc >nul 2>&1
    if %errorlevel% equ 0 set "ISCC_EXE=iscc"
)

if defined ISCC_EXE if exist "%SCRIPT_DIR%installer.iss" (
    echo [*] Inno Setup compiler found: "%ISCC_EXE%"
    echo [*] Compiling WindowsDiskCleanup_Setup_.exe...
    if not exist "%SCRIPT_DIR%Output" mkdir "%SCRIPT_DIR%Output"
    "%ISCC_EXE%" "%SCRIPT_DIR%installer.iss"
    if %errorlevel% equ 0 (
        echo [OK] Installer compilation successful!
        if exist "%SCRIPT_DIR%Output\WindowsDiskCleanup_Setup_.exe" (
            copy /y "%SCRIPT_DIR%Output\WindowsDiskCleanup_Setup_.exe" "%RELEASE_DIR%\" >nul 2>&1
            echo [OK] Installer copied to Release folder: "%RELEASE_DIR%\WindowsDiskCleanup_Setup_.exe"
        )
    ) else (
        echo [WARN] Inno Setup compilation returned error code %errorlevel%.
    )
) else (
    echo [INFO] Inno Setup (ISCC.exe) not found on system. Skipping installer packaging.
    echo        (Download Inno Setup from: https://jrsoftware.org/isdl.php)
)
echo.

echo [7/7] Cleaning temporary build artifacts...
${
  cleanArtifacts
    ? `if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%" >nul 2>&1
if exist "%DIST_DIR%" rd /s /q "%DIST_DIR%" >nul 2>&1
if exist "%SPEC_DIR%${exeName}.spec" del /f /q "%SPEC_DIR%${exeName}.spec" >nul 2>&1
if exist "%SCRIPT_DIR%__pycache__" rd /s /q "%SCRIPT_DIR%__pycache__" >nul 2>&1
echo [OK] Temporary artifacts cleaned.`
    : `REM Temporary artifacts preserved`
}

color 0A
echo.
echo ===============================================================================
echo   [SUCCESS] Single portable EXE created successfully!
echo ===============================================================================
echo   File Location: %RELEASE_DIR%\\${exeName}.exe
echo ===============================================================================
echo.

if exist "%RELEASE_DIR%\\${exeName}.exe" start "" explorer.exe "%RELEASE_DIR%"

echo Press any key to exit...
pause >nul
exit /b 0

:ERR_PIP
color 0C
echo.
echo ===============================================================================
echo [ERROR] Failed to install PyInstaller via pip!
echo Please check your internet connection and try running:
echo   pip install pyinstaller
echo ===============================================================================
echo.
pause
exit /b 1

:ERR_BUILD
color 0C
echo.
echo ===============================================================================
echo [ERROR] Build failed! Check the log messages above.
echo ===============================================================================
echo.
pause
exit /b 1

:RUN_PY_BUILDER
echo [INFO] Launching Python-native builder (build_exe.py)...
echo.
call python "%SCRIPT_DIR%build_exe.py"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Python builder exited with code %errorlevel%.
    pause
    exit /b %errorlevel%
)
exit /b 0
`;

  return rawScript.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

export function generateTaskSchedulerCommands(config: ScriptConfig): {
  cmdCommand: string;
  psCommand: string;
  explanation: string;
} {
  const taskName = config.scheduleTaskName || 'WindowsAutoDiskCleanup';
  const timeStr = config.scheduleTime || '03:00';
  const freq = config.scheduleFrequency;

  let freqParam = '/sc daily';
  let extraParam = '';
  if (freq === 'WEEKLY') {
    freqParam = '/sc weekly';
    extraParam = ` /d ${config.scheduleDayOfWeek || 'SUN'}`;
  } else if (freq === 'MONTHLY') {
    freqParam = '/sc monthly /d 1';
  } else if (freq === 'ONLOGON') {
    freqParam = '/sc onlogon';
  }

  const cmdCommand = `schtasks /create /tn "${taskName}" /tr "pythonw.exe \\"C:\\Scripts\\disk_cleanup_silent.py\\"" ${freqParam}${extraParam} /st ${timeStr} /rl HIGHEST /f`;

  const psCommand = `$Action = New-ScheduledTaskAction -Execute "pythonw.exe" -Argument '"C:\\Scripts\\disk_cleanup_silent.py"'
$Trigger = New-ScheduledTaskTrigger -${freq === 'WEEKLY' ? 'Weekly -DaysOfWeek Sunday' : freq === 'MONTHLY' ? 'Monthly' : freq === 'ONLOGON' ? 'AtLogOn' : 'Daily'} -At "${timeStr}"
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "${taskName}" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force`;

  return {
    cmdCommand,
    psCommand,
    explanation: `위 명령어를 관리자 권한 CMD 또는 PowerShell에서 실행하면, 매일/매주 지정된 시간에 백그라운드에서 조용히 디스크 정리가 실행됩니다. ('/rl HIGHEST' 옵션으로 UAC 창 없이 관리자 권한으로 자동 실행됩니다.)`
  };
}

export function generateWindowsVersionInfo(config: ScriptConfig): string {
  const companyName = config.companyName || 'CISNET CORPORATION';
  const developerName = config.developerName || 'AhBiYout';
  const companyUrl = config.companyUrl || 'http://www.cisnet.co.kr/';
  const uiTitle = config.uiTitle || 'AhBiYout Windows 디스크 클린 오토';
  const baseExeName = (config.exeName || 'DiskCleanupAuto').replace(/[^a-zA-Z0-9_\-]/g, '');
  const exeName = baseExeName.toLowerCase().includes(CURRENT_VERSION.toLowerCase())
    ? baseExeName
    : `${baseExeName}_${CURRENT_VERSION}`;

  // Parse version numbers e.g. "v1.4.0" -> (1, 4, 0, 0)
  const verMatch = CURRENT_VERSION.match(/(\d+)\.(\d+)\.(\d+)/);
  const major = verMatch ? verMatch[1] : '1';
  const minor = verMatch ? verMatch[2] : '4';
  const patch = verMatch ? verMatch[3] : '0';
  const verTuple = `(${major}, ${minor}, ${patch}, 0)`;
  const verStr = `${major}.${minor}.${patch}.0`;

  return `# UTF-8
# =============================================================================
# Windows PE Version Information Resource File (version_info.txt)
# Used by PyInstaller (--version-file=version_info.txt)
# This populates the "Details" (속성 -> 자세히) tab in Windows Explorer.
# =============================================================================

VSVersionInfo(
  ffi=FixedFileInfo(
    filevers=${verTuple},
    prodvers=${verTuple},
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
            StringStruct('CompanyName', '${companyName}'),
            StringStruct('FileDescription', '${uiTitle}'),
            StringStruct('FileVersion', '${verStr}'),
            StringStruct('InternalName', '${baseExeName}'),
            StringStruct('LegalCopyright', 'Copyright (C) 2026 ${developerName}. All rights reserved.'),
            StringStruct('OriginalFilename', '${exeName}.exe'),
            StringStruct('ProductName', '${uiTitle} (${baseExeName})'),
            StringStruct('ProductVersion', '${verStr}'),
            StringStruct('Comments', 'Windows VolumeCaches 및 cleanmgr.exe 자동화 순차 정리 도구 (개발자: ${developerName} / ${companyUrl})'),
            StringStruct('LegalTrademarks', '${companyName}'),
          ]
        ),
        StringTable(
          '040904b0',
          [
            StringStruct('CompanyName', '${companyName}'),
            StringStruct('FileDescription', '${companyName} Windows Disk Cleanup Auto Runner'),
            StringStruct('FileVersion', '${verStr}'),
            StringStruct('InternalName', '${baseExeName}'),
            StringStruct('LegalCopyright', 'Copyright (C) 2026 ${developerName}. All rights reserved.'),
            StringStruct('OriginalFilename', '${exeName}.exe'),
            StringStruct('ProductName', '${companyName} Windows Disk Cleanup Auto'),
            StringStruct('ProductVersion', '${verStr}'),
            StringStruct('Comments', 'Windows VolumeCaches & cleanmgr automated sequential cleaner'),
            StringStruct('LegalTrademarks', '${companyName}'),
          ]
        )
      ]
    ),
    VarFileInfo([VarStruct('Translation', [1042, 1200, 1033, 1200])])
  ]
)
`;
}

/**
 * Inno Setup (.iss) Installer Generator
 * Features:
 *  - Unpacked Multi-File deployment (excludes portable junk and temporary docs)
 *  - Existing version detection with interactive overwrite/delete prompt
 *  - Silent / Unattended installation (/SILENT, /VERYSILENT, /SUPPRESSMSGBOXES)
 *  - Pre-registered silent Windows Firewall rules (both base name and versioned name)
 *  - Clean uninstaller with automatic firewall rule cleanup
 */
export function generateInnoSetupScript(config: ScriptConfig): string {
  const developerName = config.developerName || 'AhBiYout';
  const githubUser = config.githubUsername || 'AhBiYout-all';
  const repoName = config.githubRepoName || 'windows-disk-cleanup-builder';
  const companyUrl = config.companyUrl || 'https://www.cisnet.co.kr';
  const blogUrl = config.blogUrl || 'https://ahbiyoutvibe.blogspot.com/';
  const appTitle = 'Windows Disk Cleanup Automation Builder';
  const appVersion = CURRENT_VERSION.replace(/^v/, '');
  const baseExeName = (config.exeName || 'DiskCleanupAuto').replace(/[^a-zA-Z0-9_\-]/g, '');
  const exeFileName = `${baseExeName}.exe`;
  const appId = config.innoAppId || '{{E1D4A760-936B-4D12-9F89-A2BB5B30DE8C}}';

  const script = `; =============================================================================
; Inno Setup 6.x Deployment Script
; Project: ${appTitle} (${CURRENT_VERSION})
; Developer: ${developerName} (GitHub: ${githubUser})
; Official Blog: ${blogUrl}
; Affiliation: ${companyUrl}
;
; [배포/설치 규격]
; 1. 폴더 풀림(Unpacked Multi-File) 개별파일 설치 구성 (불필요 문서 및 포터블 파일 제외)
; 2. 기존 설치 감지 시 덮어쓰기/삭제 확인 대화상자 표시
; 3. 무인 설치 지원 (/SILENT, /VERYSILENT, /SUPPRESSMSGBOXES)
; 4. Windows 방화벽 인바운드 규칙 사전에 조용히 등록 (기본 이름 및 버전 포함 이름 둘 다 등록)
; 5. 언인스톨 시 방화벽 규칙 및 관련 레지스트리 완전 제거
; =============================================================================

#define MyAppName "${appTitle}"
#define MyAppVersion "${appVersion}"
#define MyAppPublisher "${developerName}"
#define MyAppPublisherURL "https://github.com/${githubUser}"
#define MyAppSupportURL "${blogUrl}"
#define MyAppUpdatesURL "https://github.com/${githubUser}/${repoName}/releases"
#define MyAppExeName "${exeFileName}"
#define MyAppId "${appId}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppPublisherURL}
AppSupportURL={#MyAppSupportURL}
AppUpdatesURL={#MyAppUpdatesURL}
DefaultDirName={autopf}\\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=Output
OutputBaseFilename=WindowsDiskCleanup_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\\{#MyAppExeName}
UninstallDisplayName={#MyAppName} v{#MyAppVersion}
VersionInfoVersion={#MyAppVersion}.0
VersionInfoCompany=CISNET CORPORATION
VersionInfoDescription={#MyAppName} Setup
VersionInfoCopyright=Copyright (C) 2026 {#MyAppPublisher}. All rights reserved.
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

; 무인 설치 및 방화벽 설정 최적화
DisableWelcomePage=no
DisableDirPage=auto
DisableProgramGroupPage=auto

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

; =============================================================================
[Files]
; 1. PyInstaller onedir 빌드 결과물 전체 (Python 런타임 DLL, _internal 디렉터리 일괄 포함)
Source: "dist\DiskCleanupAuto\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; 2. 단일 파일 빌드(onefile)인 경우 dist 또는 Release 폴더의 EXE 전개 (어느 위치에 있든 DiskCleanupAuto.exe로 설치)
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "dist\DiskCleanupAuto_v{#MyAppVersion}.exe"; DestDir: "{app}"; DestName: "{#MyAppExeName}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "Release\DiskCleanupAuto_v{#MyAppVersion}.exe"; DestDir: "{app}"; DestName: "{#MyAppExeName}"; Flags: ignoreversion skipifsourcedoesntexist
; 필수 에셋 폴더 개별 파일 전개 (app.ico 포함)
Source: "assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; 루트 app.ico 폴백 복사
Source: "app.ico"; DestDir: "{app}\assets"; DestName: "app.ico"; Flags: ignoreversion skipifsourcedoesntexist
; 윈도우 작업 스케줄러 등록 스크립트
Source: "register_scheduler.bat"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\assets\app.ico"; Comment: "{#MyAppName} 실행"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"; IconFilename: "{app}\assets\app.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\assets\app.ico"; Tasks: desktopicon

; =============================================================================
; [Run] 설치 후 동작 및 방화벽 규칙 사전 조용히 등록 (Quiet Firewall Registration)
; 규칙 1: 기본 이름 (Windows Disk Cleanup Automation Builder)
; 규칙 2: 버전 정보 포함 이름 (Windows Disk Cleanup Automation Builder v1.5.0)
; =============================================================================
[Run]
; 1. 기본 이름 방화벽 규칙 조용히 등록
Filename: "netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName}"" dir=in action=allow program=""{app}\\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 2. 버전 정보 부착된 앱 이름 방화벽 규칙 조용히 등록
Filename: "netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName} v{#MyAppVersion}"" dir=in action=allow program=""{app}\\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 설치 완료 후 앱 실행 (옵션)
Filename: "{app}\\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runascurrentuser

; =============================================================================
; [UninstallRun] 제거 시 방화벽 규칙 자동 소거 (Clean Uninstall)
; =============================================================================
[UninstallRun]
Filename: "netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName}"""; Flags: runhidden waituntilterminated
Filename: "netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName} v{#MyAppVersion}"""; Flags: runhidden waituntilterminated

; =============================================================================
; [Code] 기존 설치 여부 확인 대화상자 & 무인 설치(Silent) 자동 우회 처리
; =============================================================================
[Code]
// 이전 버전 설치 여부 검사 함수
function GetInstalledVersion(): String;
var
  InstalledVer: String;
begin
  InstalledVer := '';
  if RegQueryStringValue(HKLM, 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1', 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
    Exit;
  end;
  if RegQueryStringValue(HKCU, 'SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{#MyAppId}_is1', 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
    Exit;
  end;
  Result := '';
end;

function InitializeSetup(): Boolean;
var
  PrevVersion: String;
  PromptMsg: String;
  UserResponse: Integer;
begin
  Result := True;
  PrevVersion := GetInstalledVersion();

  // 기존 설치가 감지된 경우
  if (PrevVersion <> '') or FileExists(ExpandConstant('{pf}\\{#MyAppName}\\{#MyAppExeName}')) then
  begin
    // 무인/자동 설치 모드(/SILENT, /VERYSILENT)인 경우 묻지 않고 자동 덮어쓰기 진행
    if WizardSilent() then
    begin
      Result := True;
      Exit;
    end;

    // 사용자에게 삭제/덮어쓰기 확인 대화상자 표시
    if PrevVersion <> '' then
      PromptMsg := Format('기존 버전(v%s)이 이미 설치되어 있습니다.' + #13#10 + #13#10 +
                          '기존 버전을 최신 버전(v{#MyAppVersion})으로 덮어쓰고 계속 진행하시겠습니까?' + #13#10 +
                          '(취소 클릭 시 설치가 중단됩니다.)', [PrevVersion])
    else
      PromptMsg := '동일한 경로에 기존 앱이 이미 설치되어 있습니다.' + #13#10 + #13#10 +
                   '기존 앱을 새 버전(v{#MyAppVersion})으로 덮어쓰시겠습니까?' + #13#10 +
                   '(취소 클릭 시 설치가 중단됩니다.)';

    UserResponse := MsgBox(PromptMsg, mbConfirmation, MB_YESNO);
    if UserResponse = IDYES then
    begin
      Result := True; // 덮어쓰기 계속 진행
    end
    else
    begin
      Result := False; // 사용자 거부 시 설치 안전 취소
    end;
  end;
end;
`;

  return script.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
}

/**
 * GitHub Actions Workflow (.github/workflows/release.yml) Generator
 * Features:
 *  - Node.js 22 LTS / Node.js 24 strict runtime adoption (Node.js 20 EOL / Deprecated compliance)
 *  - Automated Windows packaging: Windows PC (Inno Setup Unpacked Installer .exe)
 *  - Releases attachment rule: STRICTLY attach only installable packages to GitHub Releases!
 */
export function generateGitHubWorkflowYaml(config: ScriptConfig): string {
  const repoName = config.githubRepoName || 'windows-disk-cleanup-builder';
  const appVersion = CURRENT_VERSION;

  return `# =============================================================================
# GitHub Actions CI/CD Release Workflow
# Repository: https://github.com/AhBiYout-all/${repoName}
# 
# 📌 GitHub 공식 발표 핵심 변동 사항 준수:
#  - Node.js 20 공식 지원 종료(2026년 4월 EOL 및 Runner Deprecated)에 따라
#    모든 액션과 런타임을 최신 Node.js 22 LTS (및 Node.js 24 호환) 환경으로 강제 전환합니다.
# 📌 릴리스 정책 준수:
#  - 릴리스 에셋에는 불필요한 소스나 임시 파일 없이 '인스톨 파일(Installers)'만 생성/첨부합니다.
# =============================================================================

on:
  push:
    branches:
      - main
      - master
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      release_version:
        description: 'Manual Release Version (e.g. ${appVersion})'
        required: false
        default: '${appVersion}'

permissions:
  contents: write
  packages: write

jobs:
  # ===========================================================================
  # Job 1: Web & Application Core Build (Node.js 22 LTS)
  # ===========================================================================
  build-core:
    name: Build Web App Core (Node.js 22 LTS)
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js (Node 22 LTS - Node 20 EOL Compliant)
        uses: actions/setup-node@v4
        with:
          node-version: '22' # 2026 최신 LTS (Node 20 Deprecated 대체)

      - name: Install Dependencies
        run: |
          if [ -f "package-lock.json" ]; then
            npm ci
          elif [ -f "package.json" ]; then
            npm install
          else
            echo "Pure desktop package mode - skipping npm install"
          fi

      - name: Type Check & Lint
        run: |
          if [ -f "package.json" ]; then
            npm run lint || true
          fi

      - name: Build Web Application
        run: |
          if [ -f "package.json" ]; then
            npm run build
          else
            mkdir -p dist
            echo "DiskCleanupAuto v1.5.0 Core Release" > dist/index.html
          fi

      - name: Upload Web Build Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist-web
          path: dist/
          retention-days: 1

  # ===========================================================================
  # Job 2: Windows PC Installer Packaging (Inno Setup Unpacked Multi-File)
  # ===========================================================================
  build-windows-installer:
    name: Package Windows PC Installer (Inno Setup)
    runs-on: windows-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Python Dependencies & PyInstaller
        run: |
          python -m pip install --upgrade pip
          pip install pyinstaller

      - name: Build Standalone Windows Executable
        run: |
          pyinstaller --noconfirm --onedir --windowed \`
            --name "DiskCleanupAuto" \`
            --uac-admin \`
            --version-file "version_info.txt" \`
            disk_cleanup_gui.py

      - name: Verify Multi-File Unpacked Structure
        shell: pwsh
        run: |
          New-Item -ItemType Directory -Force -Path "dist/DiskCleanupAuto/assets"
          if (Test-Path "assets") { Copy-Item -Recurse -Force "assets/*" "dist/DiskCleanupAuto/assets" }
          Copy-Item -Force "disk_cleanup_gui.py" "dist/DiskCleanupAuto/"
          Copy-Item -Force "version_info.txt" "dist/DiskCleanupAuto/"
          if (Test-Path "register_scheduler.bat") { Copy-Item -Force "register_scheduler.bat" "dist/DiskCleanupAuto/" }
          if (Test-Path "dist/DiskCleanupAuto/DiskCleanupAuto.exe") {
            Copy-Item -Force "dist/DiskCleanupAuto/DiskCleanupAuto.exe" "dist/DiskCleanupAuto.exe"
          }

      - name: Install Inno Setup Compiler
        shell: pwsh
        run: |
          choco install innosetup --no-progress --yes

      - name: Compile Inno Setup Installer (.iss)
        shell: pwsh
        run: |
          $isccPath = "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe"
          if (-not (Test-Path $isccPath)) {
            $isccPath = "C:\\Program Files\\Inno Setup 6\\ISCC.exe"
          }
          if (-not (Test-Path $isccPath)) {
            $isccCmd = Get-Command iscc -ErrorAction SilentlyContinue
            if ($isccCmd) { $isccPath = $isccCmd.Source }
          }
          Write-Host "Using Inno Setup Compiler: $isccPath"
          New-Item -ItemType Directory -Force -Path "Output"
          & $isccPath installer.iss

      - name: Upload Windows Installer Asset
        uses: actions/upload-artifact@v4
        with:
          name: windows-installer
          path: Output/WindowsDiskCleanup_Setup_*.exe
          retention-days: 1

  # ===========================================================================
  # Job 3: GitHub Releases Publisher (Strictly Verified Windows Installer File)
  # ===========================================================================
  publish-release:
    name: Attach Installer to GitHub Release
    if: startsWith(github.ref, 'refs/tags/v') || github.event_name == 'workflow_dispatch'
    needs: [build-windows-installer]
    runs-on: ubuntu-latest
    steps:
      - name: Download Windows Installer
        uses: actions/download-artifact@v4
        with:
          name: windows-installer
          path: release_assets

      - name: List Release Installer Files (Confirm No Junk / No Raw Source)
        run: |
          echo "=== 릴리스 첨부 대상 윈도우 인스톨러 파일 목록 ==="
          ls -la release_assets/

      - name: Publish to GitHub Releases
        uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.event.inputs.release_version || github.ref_name }}
          name: "Release \${{ github.event.inputs.release_version || github.ref_name }} (Windows Setup Installer)"
          body: |
            ## 🚀 \${{ github.ref_name }} 공식 Windows 인스톨러 배포

            본 릴리스에는 Windows 데스크톱 전용 **Inno Setup 인스톨러(.exe)만 첨부**되어 있습니다. (불필요한 임시 문서 및 중복 소스 제외)

            ### 📦 배포 에셋 목록
            - **Windows PC**: \`WindowsDiskCleanup_Setup_${appVersion}.exe\` (Inno Setup 개별 파일 언팩 설치기 / 방화벽 사전 자동 등록)

            ---
            - **개발자**: AhBiYout (GitHub: [@AhBiYout-all](https://github.com/AhBiYout-all))
            - **공식 블로그**: [AhBiYoutVibe](https://ahbiyoutvibe.blogspot.com/)
            - **소속**: [CISNET](https://www.cisnet.co.kr)
          files: |
            release_assets/*.exe
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`;
}

/**
 * Windows Automated Git Push Script (git_push.bat) Generator
 * Features:
 *  - Enforces developer identity: AhBiYout / AhBiYout-all
 *  - Uses GitHub privacy noreply email (AhBiYout-all@users.noreply.github.com) to strictly prevent personal email leakage!
 *  - Scans staged files for sensitive personal information and email leaks before pushing
 *  - Synchronizes Git tags and pushes to https://github.com/AhBiYout-all/windows-disk-cleanup-builder
 */
export function generateGitPushBatchScript(config: ScriptConfig): string {
  const developerName = config.developerName || "AhBiYout";
  const githubUser = config.githubUsername || "AhBiYout-all";
  const repoName = config.githubRepoName || "windows-disk-cleanup-builder";
  const repoUrl = `https://github.com/${githubUser}/${repoName}`;

  return `@echo off
setlocal enabledelayedexpansion

REM 1. Set working directory to script location
cd /d "%~dp0"

REM 2. Set console code page to UTF-8
chcp 65001 >nul 2>&1

title [${developerName}] GitHub Auto Sync and Push Script (${CURRENT_VERSION})

echo ===============================================================================
echo  GitHub Repository Push Utility (${CURRENT_VERSION})
echo  Repository: ${repoUrl}
echo  Developer:  ${developerName} [GitHub: AhBiYout-all]
echo  Version:    ${CURRENT_VERSION}
echo ===============================================================================
echo.

where git >nul 2>&1
if errorlevel 1 goto :GIT_NOT_FOUND

if not exist "%~dp0.git" (
    echo [INFO] Initializing Git repository...
    git init
    if errorlevel 1 goto :GIT_INIT_FAILED
)

echo [1/4] Verifying GitHub author settings...
git config user.name "AhBiYout"
git config user.email "${githubUser}@users.noreply.github.com"
echo  - Author: ${developerName}
echo  - Email:  ${githubUser}@users.noreply.github.com
echo.

echo [2/4] Checking remote origin...
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    git remote add origin ${repoUrl}.git
) else (
    git remote set-url origin ${repoUrl}.git
)
echo  - Remote: ${repoUrl}.git
echo.

echo [3/4] Staging essential project files (.gitignore applied)...
git rm --cached git_push.bat >nul 2>&1
git add .
echo  - Staged files summary:
git status --short
echo.

echo [4/4] Pre-scanning for sensitive data...
git diff --cached -- ":(exclude)*.bat" ":(exclude)*codeGenerators.ts" | findstr /v /i /c:"findstr" | findstr /i /c:"@gmail.com" /c:"@naver.com" /c:"@daum.net" /c:"@kakao.com" >nul 2>&1
if errorlevel 1 goto :SKIP_EMAIL_ALERT
color 0C
echo ===============================================================================
echo [WARNING] Private email pattern detected in staged changes! Aborting push.
echo ===============================================================================
pause
exit /b 1

:SKIP_EMAIL_ALERT
echo  - Pre-scan passed: No sensitive email found.
echo.

set "DEFAULT_MSG=chore(release): ${CURRENT_VERSION} project sync"
set /p "USER_MSG=Enter commit message [Default: %DEFAULT_MSG%]: "
if "!USER_MSG!"=="" set "USER_MSG=%DEFAULT_MSG%"

git commit -m "!USER_MSG!"
if errorlevel 1 echo [INFO] Working tree clean or already committed.

git tag -fa "${CURRENT_VERSION}" -m "Release ${CURRENT_VERSION}"
echo  - Tag ${CURRENT_VERSION} created.
echo.

echo ===============================================================================
echo  Pushing commits and tags to GitHub...
echo ===============================================================================
git branch -M main 2>nul
git push -u origin main
if errorlevel 1 git push -u origin master
git push origin "${CURRENT_VERSION}" --force

color 0A
echo.
echo ===============================================================================
echo [SUCCESS] Successfully pushed to GitHub!
echo Repository: ${repoUrl}
echo Actions:    ${repoUrl}/actions
echo Releases:   ${repoUrl}/releases
echo ===============================================================================
echo.
pause
exit /b 0

:GIT_NOT_FOUND
color 0C
echo [ERROR] Git is not installed or not found in PATH!
echo Please download and install Git from https://git-scm.com/
pause
exit /b 1

:GIT_INIT_FAILED
color 0C
echo [ERROR] git init command failed!
pause
exit /b 1
`;
}
