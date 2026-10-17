# 📝 패치 노트 & 버전 변경 이력 (Patch Notes & Changelog)

모든 버전 변경 사항은 [Semantic Versioning(MAJOR.MINOR.PATCH)](./SEMVER_POLICY.md) 원칙에 따라 분류 및 기록됩니다.

---

## 🚀 [v1.5.0] - 2026-10-09 (MINOR Release)

### 🚀 Added & Architectural Breakthrough (Windows 11 24H2/26H1 Windows.old 강제 권한 탈취 및 완전 소거 루틴)
- **Windows 11 최신 업데이트 C:\Windows.old 미삭제 버그 완벽 해결**:
  - Windows 11 24H2 / 26H1 및 체크포인트 누적 업데이트(Checkpoint Cumulative Update) 환경에서 마이크로소프트의 cleanmgr.exe 공식 기능 중단(Deprecated)과 8.63GB 캐시 표시 버그, TrustedInstaller 및 SYSTEM 계정의 독점 핸들 락으로 인해 기존 cleanmgr 및 이전 설치 정리 기능으로 C:\Windows.old가 지워지지 않던 문제를 완벽 해결.
- **3단계 NTFS 권한 탈취 & 잠금 해제 강제 소거 파이프라인 탑재**:
  - **1단계: `takeown` 강제 소거권 획득**: `takeown /F "C:\Windows.old" /A /R /D Y` 명령으로 TrustedInstaller에 묶여 있던 디렉터리 및 하위 트리의 모든 NTFS 소유권을 로컬 관리자(Administrators) 그룹으로 강제 양도.
  - **2단계: `icacls` 완전 제어권 상속 주입**: `icacls "C:\Windows.old" /grant *S-1-5-32-544:F /T /C /Q` 명령을 통해 Administrators 그룹에 모든 파일/디렉터리에 대한 Full Control(F) 권한을 상속 주입하여 접근 거부(Access Denied) 및 WinError 5 원천 차단.
  - **3단계: 파일 속성 해제 및 완전 소거**: `attrib -r -a -s -h`로 읽기 전용/시스템 잠금을 해제하고 `rd /s /q` 및 파이썬 `shutil.rmtree`를 연쇄 호출하여 C:\Windows.old를 100% 영구 삭제 (15~40GB 이상의 대규모 C: 여유 공간 즉시 확보).
- **데이터 유실 방지: 사용자 개인 문서 안전 가드레일 (Safe-Guard)**:
  - 사용자가 업그레이드 전 바탕 화면, 다운로드, 내 문서 등에 미처 백업하지 못한 중요한 개인 파일이 `C:\Windows.old\Users` 경로에 남아있는지 사전 스캔(`scan_windows_old_safety`).
  - 개인 파일이 발견되면 사용자 동의 없는 일방적 삭제를 안전하게 건너뛰고 안내를 출력하는 안전 보호막 기능 기본 탑재 (설정 패널에서 켜기/끄기 지원).
- **VolumeCaches `Previous Installations` (이전 Windows 설치) 공식 항목 추가**:
  - `cleanupItems.ts` 및 프리셋 목록에 `Previous Installations` (이전 Windows 설치) 항목을 정식 등록하고 딥 클린(심층 정리) 프리셋에 자동 포함.
- **다중 스크립트 엔진 일괄 적용**:
  - `disk_cleanup_gui.py` (파이썬 GUI)
  - `python_cli` (콘솔 러너)
  - `python_deep` (시스템 심층 최적화 스크립트)
  - `powershell` (PowerShell 자동화 스크립트)
  - `batch` (순차 배치 파일 .bat)
  - 모든 스크립트 엔진에서 Windows.old 강제 정리 루틴 및 안전 가드레일이 완벽히 동작하도록 동기화.
- **DiskCleanupAuto v1.5.0 핵심 빌드 파일 전용 관리 체계 구축 (`Phase 13`)**:
  - **전용 코어 폴더 (`DiskCleanupAuto_v1.5.0_Core/`)**: 웹 프론트엔드 부산물(`node_modules/`, `dist/` 등)을 완전 격리하고 오직 실제 컴파일 및 Inno Setup 패키징에 필요한 파일만 스테이징.
  - **자동 내보내기 스크립트 (`export_core_files.bat` / `export_core_files.py`)**: 단 한 번의 실행으로 필수 코어 파일 복사, 개인정보/개인 이메일 누출 3중 스캔, SHA-256 무결성 검증 매니페스트(`CORE_MANIFEST.json`) 자동 생성을 완료하는 원클릭 배치 제공.
  - **웹 UI 실시간 내보내기 뷰어 연동**: 웹 애플리케이션 상에서 `export_core_files.bat` 스크립트 및 매니페스트 검증 상태를 직관적으로 확인하고 다운로드 가능.
- **GitHub Actions 워크플로 트리거 개편 및 미시작 이슈 해결 (`Phase 14`)**:
  - **브랜치 푸시 듀얼 트리거 탑재**: 기존 `push.tags: ['v*.*.*']` 단독 트리거에서 `push.branches: [main, master]` 및 `workflow_dispatch`를 추가하여 일반 커밋 푸시 시에도 즉각 웹 빌드 검증과 Windows EXE/Inno Setup 인스톨러 아티팩트가 생성되도록 개편.
  - **릴리스 발행 조건 분기**: 태그 푸시(`v1.5.0`) 또는 수동 릴리스 실행 시에만 GitHub Releases에 설치 파일이 등록되도록 안전 조건(`if: startsWith(github.ref, 'refs/tags/v') || github.event_name == 'workflow_dispatch'`) 적용.
  - **`git_push.bat` 태그 강제 갱신 동기화**: 로컬 태그 중복 오류를 방지하기 위해 `git tag -fa "v1.5.0"` 및 `git push origin "v1.5.0" --force`로 태그를 확실히 갱신하여 GitHub Actions 릴리스 이벤트가 항상 누락 없이 발동되도록 보장.
  - **저장소 권한 안내 강화**: GitHub Actions가 비활성화되어 있거나 쓰기 권한이 없는 경우를 위한 가이드(Settings → Actions → General → Allow all actions & Read and write permissions)를 문서 및 스크립트에 탑재.
- **Windows 데스크톱 전용 설치 프로그램 규격화 및 모바일(APK/iOS) 가상 빌드 전면 제거 (`Phase 15`)**:
  - **가상 패키징 작업 원천 제거**: Windows 데스크톱 시스템 정리 전용 도구의 본질에 맞추어, 불필요한 Android(APK) 및 iOS 웹앱 아카이브 생성 작업을 워크플로 및 UI에서 전면 제거.
  - **Inno Setup 개별 파일 언팩 인스톨러 단일화**: GitHub Releases 배포 에셋을 `WindowsDiskCleanup_Setup_v1.5.0.exe` 단일 공식 인스톨러로 통합하여 설치 프로그램 무결성 및 신뢰도 극대화.
  - **`git_push.bat` 명령행 파싱 안정성 강화**: Windows `cmd.exe`에서 괄호 `( )` 중첩 시 발생하는 예기치 못한 구문 오류(`was unexpected at this time`)를 원천 방지하도록 스크립트 전면 정비.
  - **클라이언트 업데이트 모달 최적화**: 웹 UI 업데이트 알림 창을 Windows 데스크톱 인스톨러 전용 고화질 카드로 직관화.


- **고화질 앱/인스톨러/바로가기 전용 아이콘(app.ico) 시스템 전면 도입 (Phase 16)**:
  - **Windows 표준 멀티 해상도 아이콘 구축**: 1024x1024 마스터 그래픽 자산(icon.png)을 기반으로 고해상도 무손실 app.ico 및 assets/app.ico 자동 생성 및 번들링.
  - **PyInstaller 바이너리 임베드**: 단독 포터블 실행 파일(DiskCleanupAuto_v1.5.0.exe) 및 Onedir 패키지 자체의 PE 리소스 아이콘으로 공식 임베드.
  - **Tkinter GUI 및 트레이/작업표시줄 런타임 연동**: 앱 실행 시 화면 상단 윈도우 및 작업표시줄에 해당 아이콘이 선명하게 표시되도록 root.iconbitmap 동적 로더 탑재.
  - **Inno Setup 인스톨러 패키징 연동**: 설치 파일(SetupIconFile), 제어판 등록 아이콘(UninstallDisplayIcon), 시작 메뉴 및 바탕화면 바로가기(IconFilename)에 모두 고화질 아이콘 경로를 명시하여 윈도우 기본 아이콘으로 대체되는 현상 원천 해결.

- **원클릭 인스톨러 자동 컴파일 및 제어판 정식 등록 체계 고도화 (Phase 17)**:
  - **build_exe.bat 원클릭 인스톨러 생성기 통합**: 로컬 환경에 설치된 Inno Setup 6 컴파일러(ISCC.exe)를 자동 감지하여, 단독 실행 파일 빌드 직후 WindowsDiskCleanup_Setup_v1.5.0.exe 인스톨러까지 Release 폴더에 일괄 자동 생성.
  - **인스톨러 소스 코드 누출 방지 슬림화**: 설치 대상 PC의 Program Files 폴더에 불필요한 개발용 파이썬 원본 소스(disk_cleanup_gui.py) 및 버전 텍스트(version_info.txt)를 배포 목록에서 영구 제외하여 보안 및 무결성 강화.
  - **Inno Setup 구문 안정성 및 등록 정보 정규화**: [Files] 섹션 선언 누락 버그 및 역슬래시 에스케이프 결함 해결, Windows 프로그램 추가/제거 및 설치된 앱에 정식 제품명과 고화질 아이콘으로 정상 등록되도록 구성 완비.
  - **PE 메타데이터 등록 상표(LegalTrademarks) 표준화**: 파일 속성 자세히 탭의 등록 상표 항목을 AhBiYout으로 통일 적용.

---

## 🚀 [v1.4.0] - 2026-09-07 (MINOR Release)

### 🚀 Added & Architectural Overhaul (정밀 Wait-For-Completion 모니터링 엔진 & 무인 컴퓨터실 자동화 파이프라인)
- **Win32 커널 동기화 기반 `cleanmgr.exe` 정밀 감시 엔진 (`WaitForSingleObject`)**:
  - 기존 0.2~0.3초 단순 폴링(`proc.poll()`) 방식을 전면 개편하여, `kernel32.OpenProcess(SYNCHRONIZE)`로 프로세스 핸들을 획득하고 `WaitForSingleObject`를 통한 커널 이벤트 동기화 체계 구축.
  - CPU 점유율 0%를 유지하면서 cleanmgr 프로세스가 종료되는 순간 나노초 단위로 즉각 반응.
- **cleanmgr 소유 창 핸들(HWND) 라이프사이클 실시간 후킹 (`EnumWindows`)**:
  - `user32.EnumWindows` 콜백을 통해 cleanmgr 프로세스에 속한 윈도우 창 핸들(HWND) 목록을 실시간 열거 및 감시.
  - `user32.IsWindowVisible(hwnd)`를 후킹하여 정리 다이얼로그가 화면에 떠 있다가 작업 완료로 닫히는(Window Destroyed / Invisible) 순간을 정밀하게 포착.
- **작업 완료 후 백그라운드 지연 잔류(Hang) 방어 및 즉각적 자원 해제**:
  - 창이 닫혔음에도 Windows COM/OLE 언로드 대기 등으로 프로세스가 2.5초 이상 지연 잔류할 때, 유휴 창에 `WM_CLOSE(0x0010)`를 전송하고 프로세스를 즉각 정상 해제(`proc.terminate()`).
  - `kernel32.CloseHandle(h_process)`로 OS 레벨의 커널 핸들을 안전하게 반환하여 핸들 누수 원천 차단.
- **컴퓨터실 및 대량 무인 실행(Unattended Multi-PC) 최적화 파이프라인**:
  - **주기적 쉘 새로고침 워커 (`start_periodic_shell_refresher`)**: 사용자가 마우스를 움직이지 못하는 컴퓨터실 원격 일괄 배포 환경에서도 2초 주기로 백그라운드 데몬 스레드가 Windows Shell과 데스크톱을 자동 갱신.
  - **가상 트레이 스위프 (`sweep_tray_ghost_icons`)**: Windows 작업 표시줄 알림 영역(`ToolbarWindow32`) 및 보조 트레이의 모든 툴바 좌표에 가상 마우스 이동(`WM_MOUSEMOVE`) 신호를 전송하여, 마우스 접촉 없이도 Explorer가 스스로 죽은 트레이 아이콘과 고스트 창을 폐기하도록 유도.
  - **집중 3연속 스위프 & 100% 무인 자동 종료**: 작업 종료 즉시 0.3초 간격으로 3회 연속 쉘/트레이 스위프를 발사하여 잔상을 완전 소멸시키고, 5초 카운트다운 후 마우스 조작이 없어도 `os._exit(0)`로 안전하게 자동 종료.
- **인터랙티브 UX & 디스크 공간 실시간 분석 탑재**:
  - **C: 드라이브 여유 공간 실시간 계산 및 확보량 안내**: 정리 전/후 `kernel32.GetDiskFreeSpaceExW` API로 여유 용량을 정밀 측정하여 `💾 여유 공간 +X.XX GB 확보` 메시지 표시.
  - **마우스 호버 즉시 닫기 제스처**: 정리 완료 후 마우스 커서를 창 위로 슥 올리거나 클릭 시 X 버튼 조준 없이 즉시 창 닫기 및 프로세스 완전 정리.
  - **시스템 완료 알림음**: `winsound.MessageBeep`을 통한 정리 완료 알림.
- **Windows PE 파일 속성 [자세히] 메타데이터 리소스(`version_info.txt`) 버전 연동 자동 업데이트 엔진**:
  - `VS_VERSIONINFO` 구조체(`filevers`, `prodvers`, `FileVersion`, `ProductVersion`, `OriginalFilename`)를 `CURRENT_VERSION`에 연동하여 단일 소스 기반으로 자동 계산.
  - `build_exe.py` 및 빌드 스크립트 실행 시 기존 `version_info.txt`가 없거나 버전이 일치하지 않을 경우 최신 버전(`v1.4.0` / `1.4.0.0`)으로 자동 갱신(Auto-Sync)하도록 구현.
  - 웹 UI 설정 패널(ConfigPanel) 및 파일 속성 미리보기 박스에서도 버전 및 원본 파일 이름이 반응형으로 자동 동기화되도록 연계.

---

## 🛠️ [v1.3.4] - 2026-08-29 (PATCH Release)

### 🚀 Added & Improved (.bat 자동 빌드 스크립트 순차 파이프라인 및 Windows CRLF 포맷 완벽 지원)
- **Windows (CRLF) 개행 형식 강제 보장**:
  - 배치 파일(`.bat`) 및 스크립트 다운로드/복사 시 Unix LF(`\n`)로 인한 `cmd.exe` 구문 파싱 충돌을 방지하도록 Windows 표준 CRLF(`\r\n`) 변환을 적용.
- **순차 실행 방식(Sequential Pipeline) 기반 경로 고정 (경로 꼬임 방지)**:
  - 배치 파일 시작 즉시 `setlocal EnableExtensions EnableDelayedExpansion` 및 `cd /d "%~dp0"`를 실행하여 UAC 관리자 권한 상승이나 외부 디렉토리 호출 시 작업 디렉토리가 `C:\Windows\System32` 등으로 변경되는 현상 원천 차단.
  - `%SCRIPT_DIR%`, `%RELEASE_DIR%`, `%DIST_DIR%`, `%BUILD_DIR%` 등 모든 작업 경로를 스크립트 절대 위치 기반으로 격리.
  - `[1/6]` Python 환경 탐색 → `[2/6]` PyInstaller 준비 → `[3/6]` 소스 파일 탐색 → `[4/6]` EXE 컴파일 → `[5/6]` Release 폴더 안전 배치 → `[6/6]` 캐시 정리 및 완료 보고의 6단계 순차 실행 체계 구축.
  - 각 단계별 실패 시 즉시 에러 보고 및 안전 종료(`pause && exit /b 1`) 처리.
- **프로젝트 루트 `build_exe.bat` 파일 기본 탑재**:
  - 저장소를 로컬로 받거나 ZIP 압축 해제 시 더블 클릭만으로 즉시 순차 빌드가 가능한 `build_exe.bat`을 CRLF 형식으로 생성.

### 🐛 Fixed (화면 해상도별 윈도우 작업창 겹침 방지 및 앱 창 상단 배치 개선)
- **앱 실행 창 위치 상단 최적화 (Top 22% Golden Ratio)**:
  - 기존 기하학적 정중앙(`(ScreenHeight - Height) // 2`) 배치로 인해 저해상도 모니터나 노트북, 작업 중인 다른 윈도우 창 및 하단 작업표시줄에 앱 화면이 가려지던 현상 해결.
  - 모니터 해상도에 맞춰 화면 수평 중앙(`X`), 상단 약 22% 지점(`Y = max(40, (screen_h - win_h) * 0.22)`)으로 실행 위치를 상향 조정하여 작업창 간섭을 완벽 차단.
- **실행 즉시 전면 활성화 (Topmost & Lift)**:
  - 앱 구동 시 다른 작업창 뒤로 숨겨지지 않도록 `root.lift()` 및 초기 포커스 강제 활성화 적용.

---

## 🛠️ [v1.3.3] - 2026-08-29 (PATCH Release)

### 🐛 Fixed (대용량 윈도우 업데이트 정리 조기 종료 및 작업 취소 버그 수정)
- **Windows 업데이트 정리(`Update Cleanup`) 조기 프로세스 종료 결함 해결**:
  - 기존 25초 인위적 컷오프 타임아웃을 제거하고, `cleanmgr.exe`와 Windows 서비스 스택(`DismHost.exe`, `TiWorker.exe`)이 대용량 컴포넌트 저장소(WinSxS) 패키지 압축 및 삭제 작업을 완전히 끝낼 때까지(`proc.poll()`) 안전하게 대기하도록 전면 개선.
  - 디스크 정리 도중 프로세스가 조기 강제 종료되어 후속 볼륨 캐시 항목(임시 파일, 휴지통 등)이 연쇄 취소되던 문제를 완벽 차단.
- **실시간 사실 기반 진행 안내 및 분/초 단위 타이머 포맷 지원**:
  - 임의의 시간 추측성 문구를 배제하고, 실제 선택된 항목 개수와 Windows cleanmgr.exe 백그라운드 엔진의 실제 동작 상태를 사실 그대로 안내하도록 개선.
  - 소요 시간 표시 시 60초 이상일 경우 `X분 X.X초` 형태로 가독성 있게 자동 변환.
- **안전 최대 상한선 1800초(30분) 설정**:
  - Windows 시스템 서비스 데드락 등 극단적인 예외 상황을 방어하기 위한 안전 타임아웃 상한선을 30분으로 현실화.

---

## 🛠️ [v1.3.2] - 2026-08-19 (PATCH Release)

### 🐛 Fixed (오류 수정 및 안정성 개선)
- **Python 3.12/3.13 `SyntaxWarning: invalid escape sequence` 오류 패치**:
  - 생성되는 모든 파이썬 스크립트내 레지스트리 경로 문자열을 raw string (`r"..."`, `r"""..."""`) 처리하여 최신 파이썬 3.12+ 컴파일 시 가스 및 이스케이프 경고 방지.
- **PyInstaller 자동 빌드 스크립트 `액세스가 거부되었습니다` (Access Denied) 예외 처리**:
  - `Release\` 폴더로 파일 이동 시 이전 EXE 프로세스가 실행 중이거나 파일이 잠겨 있을 때 발생하는 `move` 명령 오류를 예방하도록 잔류 프로세스 종료(`taskkill`), 파일 속성 해제(`attrib -r`), 복사(`copy /y`) 및 폴백 메커니즘 구축.

---

## 🛠️ [v1.3.1] - 2026-08-19 (PATCH Release)

### 🚀 Added & Improved (자동 빌드 스크립트 결과물 버저닝 추가)
- **PyInstaller 자동 빌드 스크립트(`build_exe.bat`) EXE 출력 파일명 버저닝 연동**:
  - `build_exe.bat` 실행 시 생성되는 최종 포터블 EXE 파일명 끝에 현재 패치 노트 버전이 자동으로 접미사로 결합되도록 개선 (`DiskCleanupAuto_v1.3.1.exe`).
  - `src/version.ts` 단일 모듈을 통한 전역 시맨틱 버저닝 동기화 체계 구축.

---

## 🚀 [v1.3.0] - 2026-08-19 (MINOR Release)

### ⚡ Performance & Fixed (성능 개선 및 완료 시점 감지 감도 향상)
- **`cleanmgr.exe` 완료 시점 초고속 감지 알고리즘 (0.2초 반응속도)**:
  - 기존 180초 대기 방식에서 `0.2초` 간격의 비동기 상태 폴링(`proc.poll()`) 루프로 개편하여 `cleanmgr.exe` 종료 즉시 0.2초 이내에 완료 단계로 진입.
  - 디스크 정리 작업이 실제로 끝난 후 유휴 RPC/COM 상태로 방치되는 문제를 해결하기 위해 25초 유휴 타임아웃 컷오프 세이프가드 적용.

### 🚀 Added (새로운 기능)
- **작업 진행 시간 및 총 소요 시간 실시간 표시**:
  - Tkinter GUI 화면에서 작업 2단계 진행 시 `⏱️ XX.X초 경과`를 실시간(초 단위)으로 동적 표시.
  - 작업 완료 시 전체 소요 시간(`총 소요 시간: XX.X초`)을 집계하여 안내 메세지 및 로그에 명시.
  - CLI, Silent, Deep 스크립트 모드에서도 진행 시간 로그 실시간 출력 기능 추가.

---

## 🚀 [v1.2.0] - 2026-08-19 (MINOR Release)

### 🚀 Added (새로운 기능)
- **개발자 및 회사 정보 브랜딩 지원**:
  - 개발자명(`AhBiYout`), 회사 홈페이지(`http://www.cisnet.co.kr/`), 공식 Google 블로그(`https://ahbiyoutvibe.blogspot.com/`) 정보 추가.
  - Tkinter GUI 상단 서명 배지 및 하단 클릭 가능한 웹 브라우저 바로가기 버튼 탑재.
  - 웹 UI 설정 패널(`ConfigPanel.tsx`) 및 웹 애플리케이션 푸터에 개발자 정보 및 블로그/홈페이지 링크 연동.
- **백그라운드 프로세스 완벽 강제 종료 메커니즘**:
  - `kill_lingering_cleanmgr()` 함수 구현 (`taskkill /F /IM cleanmgr.exe /T` 내장).
  - 작업 완료 및 카운트다운 후 파이썬 프로세스를 즉시 탈출시키는 `os._exit(0)` 추가.
  - Tkinter 창 닫기(`WM_DELETE_WINDOW`) 프로토콜 이벤트에 강제 프로세스 정리 연동.

### 🐛 Fixed (버그 수정)
- **`cleanmgr.exe` 잔류 및 앱 자동종료 불가능 현상 해결**:
  - Windows 디스크 공간 정리 관리자가 작업을 마친 후에도 유휴 RPC/COM 상태로 백그라운드에 남아 앱이 자동 종료되지 않던 현상을 완벽 수정.
  - `subprocess.run` 블로킹 방식에서 `subprocess.Popen` + `proc.wait(timeout=180)` 비동기 타임아웃 모니터링 방식으로 개편.

---

## 🛠️ [v1.1.1] - 2026-08-19 (PATCH Release)

### 🐛 Fixed (버그 수정)
- **`build_exe.bat` 실행 시 1, 2단계 창 즉시 닫힘 현상 수정**:
  - Windows Batch 문법에서 `if (...)` 블록 내부 괄호 중첩 및 `pip`, `pyinstaller` 직접 호출 시 배치 스크립트 프로세스가 중단되는 문제 수정.
  - 외부 명령어 호출 시 `call` 키워드 필수 적용 및 `GOTO` 라벨 기반 제어 흐름으로 배치 파일 구조 재작성.
- **PyInstaller 패키지명 대소문자 모듈 로딩 수정**:
  - `python -m PyInstaller` 호출 시 일부 환경에서 발생하던 `No module named PyInstaller` 오류를 수습하기 위해 `pyinstaller` CLI 및 `python -m pyinstaller` 폴백 로직 내장.
- **배치 파일 인코딩 및 UTF-8 BOM 호환성 개선**:
  - Windows CMD 환경에서 한글 깨짐 및 실행 오류 방지를 위해 `chcp 65001` 적용 및 구문 정제.

---

## 🌟 [v1.1.0] - 2026-08-19 (MINOR Release)

### 🚀 Added (새로운 기능)
- **PyInstaller 자동 포터블 단일 EXE 빌더 (`build_exe.bat`) 추가**:
  - 파이썬 환경 검사, PyInstaller 자동 설치, ICON 자동 연결, UPX 압축 및 단일 독립 실행 파일(`DiskCleanupAuto.exe`) 생성 파이프라인 탑재.
- **Tkinter 기반 GUI 스크립트 모드 (`python_gui`) 추가**:
  - 프로그레스바, 단계별 상태 메시지, 자동 카운트다운 및 예외 처리 GUI 구현.
- **실행 모드 다변화**:
  - GUI 모드, CLI 모드, Silent 스케줄러 모드, Deep Clean 모드, PowerShell 모드, Batch 모드 생성 기능 추가.

---

## 🎉 [v1.0.0] - 2026-08-19 (MAJOR Initial Release)

### 🚀 Added (초기 릴리스)
- **Windows `cleanmgr` & `winreg` 자동화 코어 엔진**:
  - `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\VolumeCaches` 레지스트리 키 제어.
  - `StateFlags0001` (SAGESET/SAGERUN) 자동 등록 로직 구현.
  - UAC 관리자 권한 자동 승격 (`IsUserAnAdmin`, `ShellExecuteW("runas")`) 내장.
  - 웹 기반 스크립트 빌더 UI, 미리보기 및 동작 시뮬레이터(Simulator Modal) 탑재.
