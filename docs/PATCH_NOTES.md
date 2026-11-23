# 📝 패치 노트 & 버전 변경 이력 (Patch Notes & Changelog)

모든 버전 변경 사항은 Semantic Versioning(MAJOR.MINOR.PATCH) 원칙에 따라 분류 및 기록됩니다.

---

## 🚀 [v1.5.0] - 2026-11-23 (MINOR Release)

### 🚀 Added & Architectural Breakthrough (Windows 11 24H2/26H1 Windows.old 강제 권한 탈취 및 완전 소거 루틴)
- **Windows 11 최신 업데이트 C:\Windows.old 미삭제 버그 완벽 해결**:
  - Windows 11 24H2 / 26H1 및 체크포인트 누적 업데이트(Checkpoint Cumulative Update) 환경에서 마이크로소프트의 cleanmgr.exe 공식 기능 중단(Deprecated)과 8.63GB 캐시 표시 버그, TrustedInstaller 및 SYSTEM 계정의 독점 핸들 락으로 인해 기존 cleanmgr 및 이전 설치 정리 기능으로 C:\Windows.old가 지워지지 않던 문제를 완벽 해결.
- **3단계 NTFS 권한 탈취 & 잠금 해제 강제 소거 파이프라인 탑재**:
  - **1단계: `takeown` 강제 소거권 획득**: `takeown /F "C:\Windows.old" /A /R /D Y` 명령으로 TrustedInstaller에 묶여 있던 디렉터리 및 하위 트리의 모든 NTFS 소유권을 로컬 관리자(Administrators) 그룹으로 강제 양도.
  - **2단계: `icacls` 완전 제어권 상속 주입**: `icacls "C:\Windows.old" /grant *S-1-5-32-544:F /T /C /Q` 명령을 통해 Administrators 그룹에 모든 파일/디렉터리에 대한 Full Control(F) 권한을 상속 주입하여 접근 거부(Access Denied) 및 WinError 5 원천 차단.
  - **3단계: 파일 속성 해제 및 완전 소거**: `attrib -r -a -s -h`로 읽기 전용/시스템 잠금을 해제하고 `rd /s /q` 및 파이썬 `shutil.rmtree`를 연쇄 호출하여 C:\Windows.old를 100% 영구 삭제 (15~40GB 이상의 대규모 C: 여유 공간 즉시 확보).
- **데이터 유실 방지: 사용자 개인 문서 안전 가드레일 (Safe-Guard)**:
  - 사용자가 업그레이드 전 바탕 화면, 다운로드, 내 문서 등에 미처 백업하지 못한 중요한 개인 파일이 `C:\Windows.old\Users` 경로에 남아있는지 사전 스캔(`scan_windows_old_safety`).
  - 개인 파일이 발견되면 사용자 동의 없는 일방적 삭제를 안전하게 건너뛰고 안내를 출력하는 안전 보호막 기능 기본 내장 (자동 스캔 가드레일).
- **VolumeCaches `Previous Installations` (이전 Windows 설치) 공식 항목 추가**:
  - `disk_cleanup_gui.py`의 `CLEANUP_ITEMS` 목록 최상단에 `Previous Installations` 항목을 정식 등록하여 자동 정리 대상에 포함.
- **순수 데스크톱 저장소 정비 및 핵심 파일 관리 체계 확립 (`Phase 13`)**:
  - **불필요한 프론트엔드 부산물 제거**: 웹 빌드 아티팩트(`node_modules/`, `dist/` 등) 및 중복 스테이징 폴더를 정리하고, 실제 컴파일 및 Inno Setup 패키징에 필요한 핵심 파일만 저장소 루트에서 직접 관리.
  - **`.gitignore` 기반 보안 배제**: 로컬 전용 스크립트(`git_push.bat`, `*.ps1`), `.env*`, 빌드 임시 산출물(`Release/`, `Output/`, `release_artifacts/`, `__pycache__/`)을 원격 추적에서 원천 제외.
- **GitHub Actions 워크플로 트리거 개편 및 단일 통합 릴리스 (`Phase 14` & `Phase 15`)**:
  - **멀티 트리거 탑재**: `push.branches: [main, master]`, `push.tags: ['v*.*.*']`, `workflow_dispatch`를 모두 지원하여 일반 커밋 푸시, 태그 푸시, 수동 실행 시 즉시 빌드 검증.
  - **단일 통합 Windows 파이프라인 (`build-and-release`)**: `windows-latest` 러너에서 PyInstaller(`--onefile` & `--onedir`) 및 Inno Setup(`ISCC.exe`)을 순차 실행하고 `--onefile` 결과물을 사전에 분리하여 패키징 충돌을 방지.
  - **표준 인스톨러 + 포터블 EXE + 포터블 ZIP 동시 배포**: GitHub Releases에 `WindowsDiskCleanup_Setup_v1.5.0.exe`, `DiskCleanupAuto_v1.5.0.exe`, `WindowsDiskCleanup_Portable_v1.5.0.zip`(스케줄러/라이선스/다국어 문서 동봉)을 함께 첨부.
  - **MIT 라이선스 및 단독 저작권 표준화**: 루트 `LICENSE` 파일(MIT License) 생성 및 모든 소스/리소스/문서의 저작권을 `Copyright (c) 2026 AhBiYout. All rights reserved.`로 통일.


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

- **다국어 자동 감지(한국어, English, 日本語) 및 자아성찰/심층 오류 수정 (Phase 18)**:
  - **OS/브라우저 기본 언어 자동 감지**: 데스크톱 GUI(`disk_cleanup_gui.py`)에서 Win32 `GetUserDefaultUILanguage()` 및 POSIX `locale.getlocale()`(Python 3.11+ `DeprecationWarning` 제거)을 통해 사용자 기본 언어를 자동 판별하며, 웹 프리뷰(`server.js`)는 `navigator.language`를 자동 감지해 초기 언어 및 동적 생성 스크립트(`.bat`/`.ps1`) 주석을 자동 변환합니다.
  - **전체 런타임 메시지 및 다이얼로그 다국어 통합**: 초기 타이틀·드롭다운·푸터뿐 아니라 1~5단계 정리 진행 로그, `Windows.old` 가드레일/3단계 소거 로그, 소요 시간 포맷, 완료 카운트다운, GitHub 업데이트 팝업까지 100% 다국어(`ko`/`en`/`ja`) 실시간 전환을 지원합니다.
  - **심층 감사(Self-Reflection & Deep Audit) 주요 버그 수정**:
    - `disk_cleanup_gui.py` 실행 시 `TRANSLATIONS[current_lang]` 리스트 인덱싱으로 발생하던 `TypeError` 기동 크래시 수정 (`current_lang[0]` 및 `tr()` 헬퍼 도입).
    - `build_exe.py`의 `DEFAULT_GUI_SOURCE` 폴백 소스를 최신 v1.5.0 다국어·`Windows.old` 사양으로 동기화하고 비-Windows 환경 `taskkill`/`EOFError` 예외 방어 추가.
    - `server.js` 템플릿 리터럴 내 `\\` 이스케이프 손실로 브라우저 경로 백슬래시가 누락되던 버그 수정, 6개 핵심 카드 전체 i18n 적용 및 동적 스크립트 주석 미리보기 탑재.
    - `installer.iss`에 일본어(`Japanese.isl`) 및 `InitializeSetup()` 일본어 덮어쓰기 안내 대화상자 추가 (`UTF-8 BOM + CRLF` 유지).
  - **다국어 공식 문서 및 소속회사 표기 완비**: 영어 가이드(`docs/README_EN.md`), 일본어 가이드(`docs/README_JA.md`, 오탈자 수정 포함) 신설 및 전체 UI·문서·릴리스 노트에 소속회사 `(주)청운정보시스템 ( cisnet.co.kr )` 표기 반영.

- **Inno Setup 6단계 안전 설치 흐름, 포터블 ZIP 추가 배포 및 심층 감사 수정 (Phase 19)**:
  - **Inno Setup 6단계 안전 설치 흐름 고도화 (`installer.iss`)**: 설치 시작/직전 `System32\taskkill.exe` 강제 종료 → 기존 설치 감지(구버전 `AppId`·32/64비트 레지스트리·`InstallLocation`·폴더 `unins000.exe` 통합 탐색) 시 덮어쓰지 않고 **기존 버전 무인 제거(`/VERYSILENT`) + 잔여 폴더(`SafeRemoveAppDir`)·고아 레지스트리(`CleanupOrphanUninstallKeys`) 정리 후 클린 설치**(`MB_YESNO`) → MIT 라이선스 동의(`LicenseFile=LICENSE`) → 설치 및 바탕화면 바로가기 기본 체크 → 설치 완료 후 자동 실행(`WorkingDir: "{app}"`) 순으로 정비(`UTF-8 BOM + CRLF` 유지).
  - **포터블 ZIP 아카이브 추가 (`WindowsDiskCleanup_Portable_v1.5.0.zip`)**: `release.yml`, `build_exe.py`, `build_exe.bat`에서 단독 EXE와 스케줄러(`register_scheduler.bat`), `LICENSE`, `README.md`, 전체 `docs/*.md`, `assets/app.ico`를 포함한 포터블 ZIP 패키지를 함께 생성하여 GitHub Releases 3종 배포 체계를 구축.
  - **심층 감사(Deep Audit) 핵심 버그 수정**:
    - `build_exe.bat`: `EnableDelayedExpansion` 미사용 상태에서 `if (...)` 괄호 블록 내부에 `set "PORTABLE_STAGE=..."`를 할당·확장하던 Windows 배치 파싱 결함을 순차 라벨 분기(`goto :SKIP_PORTABLE_ZIP`)로 수정.
    - `disk_cleanup_gui.py` & `build_exe.py`: `perform_cleanup()` 진입 시 `_init_win32_types()` 선행 호출로 64비트 ctypes `SHEmptyRecycleBinW`/`GetDiskFreeSpaceExW` 초기화 경합(Race Condition) 제거, `detect_system_lang()` 환경변수 탐색 조기 반환 개선, `build_exe.py` `DEFAULT_GUI_SOURCE`에 실시간 GitHub 업데이트 알림(`check_github_update_realtime`) 동기화 및 비대화형 실행 시 `EOFError` 방어(`safe_pause()`) 추가.
    - `server.js`: 샌드박스/비-HTTPS 환경을 위한 `document.execCommand("copy")` 클립보드 폴백 추가.

- **기능 심층 감사(Self-Reflection & Deep Audit) 및 런타임 버그 수정 (Phase 20)**:
  - **`cleanmgr.exe` 다이얼로그 전환 간 조기 강제 종료 버그 수정 (`monitor_and_wait_cleanmgr`)**: `cleanmgr`가 단계 전환 중 일시적으로 창이 사라졌다가 새 진행 창을 띄울 때 `window_closed_detected` 플래그가 초기화되지 않아 정리 도중 `proc.terminate()`로 조기 종료되던 결함을 수정 (`has_visible` 재감지 시 타이머·플래그 즉시 리셋 및 유예 임계치 4.0초 상향).
  - **GitHub 업데이트 알림 팝업 표시 중 5초 자동 종료 차단 (`_update_dialog_open`)**: 업데이트 알림 모달(`show_update_dialog`)이 열린 상태에서 5초 카운트다운 종료(`os._exit(0)`) 또는 메인 창 마우스 호버(`on_mouse_action`)로 인해 팝업이 강제 종료되던 문제를 차단하여 사용자가 릴리스 내용을 확인·다운로드할 때까지 안전하게 대기하도록 개선.
  - **완료 카운트다운 중 푸터 링크/언어 전환 클릭 보호 (`interactive_widgets`)**: 완료 후 5초 대기 상태에서 릴리스·블로그·GitHub·소속회사 링크 및 다국어 콤보박스 조작 시 루트 `<Enter>`/`<Button-1>` 바인딩이 먼저 발동해 브라우저 열기나 언어 변경 직전 앱이 종료되던 UX 결함 수정.
  - **동적 `SystemDrive` 인식 및 `\\?\` 확장 경로 기반 `Windows.old` 260자 제한 돌파**: `C:\` 하드코딩을 `os.environ.get("SystemDrive", "C:")` 기반으로 전환하여 비-C 드라이브 Windows 설치 환경까지 완벽 지원하고, `force_purge_windows_old()` 폴백 단계에 Windows `\\?\` UNC 확장 경로 및 읽기 전용 해제 핸들러를 결합해 `WinSxS` 260자(`MAX_PATH`) 경로 제한으로 인한 삭제 누락 방지 (`disk_cleanup_gui.py` · `build_exe.py` 동시 반영).
  - **웹 프리뷰(`server.js`) 클립보드 권한 거부 폴백 및 동적 드라이브 스크립트 개선**: 샌드박스 iframe에서 `navigator.clipboard.writeText()`가 거부될 때 `execCommand("copy")` 폴백으로 자동 전환되도록 수정하고, 생성 스크립트(`.bat`/`.ps1`)의 `Windows.old` 경로를 `%SystemDrive%` / `$env:SystemDrive` 동적 변수로 개선.

- **종합 코드·인스톨러·배치 빌더 2차 심층 감사 및 race/batch 오류 수정 (Phase 21)**:
  - **Inno Setup 언인스톨러 임시 자식 프로세스 경합 해소 (`installer.iss`)**: 기존 `unins000.exe /VERYSILENT` 실행 시 Inno Setup이 `%TEMP%\iu*.tmp` 자식 프로세스를 스폰하고 즉시 반환하는 특성 때문에 `SafeRemoveAppDir`·`CleanupOrphanUninstallKeys` 및 파일 복사와 경합이 발생할 수 있던 문제를, `unins000.exe`가 완전히 소멸될 때까지 최대 10초(`Sleep(200) * 50`) 폴링 대기하도록 수정하여 클린 제거 후 재설치 신뢰성을 100% 확보.
  - **`build_exe.bat` `[6/7]` ISCC 종료 코드(`%errorlevel%`) 평가 오류 수정**: `EnableDelayedExpansion` 없이 `if defined ISCC_EXE (...)` 괄호 블록 내부에서 `%errorlevel%`를 검사해 `ISCC.exe` 실패 시에도 성공 메시지를 출력하던 배치 파싱 결함을 순차 라벨(`:NO_ISCC`, `:AFTER_ISCC`) 분기로 평탄화하고, 덮어쓸 대상 파일의 읽기 전용 속성(`attrib -r`) 해제 추가.
  - **`build_exe.py` 100% 소스 동기화 및 읽기 전용 덮어쓰기 방어**: `DEFAULT_GUI_SOURCE`에 `locale.getdefaultlocale()` 폴백·전체 `60`개 다국어 키(`winold_ok_ret`, `winold_partial_ret`, `comment_prefix`, `step5_wait_update`)를 완전 동기화하고, `shutil.move`/`shutil.copy2` 전 대상 파일 쓰기 권한(`os.chmod(0o666)`) 확보 추가.
  - **완료/업데이트 대기 중 실시간 다국어 UI 즉시 갱신 (`step5_info`, `step5_wait_update`)**: 5초 카운트다운 종료 후 업데이트 모달 닫힘을 기다리는 동안(`waiting_update`) 전용 안내 메시지를 표시하고, 완료 상태에서 언어 콤보박스를 변경해도 `status_label`·`detail_label`이 새 언어로 즉시 재렌더링되도록 개선 (`server.js` `hero_desc` 동적 드라이브 문구 현행화 포함).

- **기능 심층 감사(Self-Reflection & Deep Audit) 및 UI·서브프로세스 안정성 3차 수정 (Phase 22)**:
  - **GitHub 업데이트 알림 팝업 레이아웃 클리핑 및 위치 수정 (`show_update_dialog`)**: 고정 크기(`resizable=False`) 다이얼로그에서 `pack(side="bottom")` 버튼 프레임이 본문 라벨 뒤에 배치되어 긴 릴리스 노트/URL 출력 시 다운로드/닫기 버튼이 화면 밖으로 밀리던 결함을 수정(`btn_frame` 우선 하단 고정, 릴리스 요약 140자 클램핑, 메인 창 중앙 정렬, `<Escape>` 단축키 닫기 지원).
  - **`cleanmgr` HWND 열거 콜백 캐싱 및 `WM_CLOSE` 정상 종료 유예 (`get_cleanmgr_hwnds`, `monitor_and_wait_cleanmgr`)**: 250ms 루프마다 `ctypes.WINFUNCTYPE`를 반복 재생성하던 오버헤드를 모듈 캐시(`_WNDENUMPROC`)로 제거하고, 창 닫힘 4.0초 경과 후 `WM_CLOSE` 발송 시 `proc.wait(timeout=0.5)` 유예 대기를 추가해 `proc.terminate()` 직전 정상 종료 기회를 부여.
  - **서브프로세스 인자 이스케이프·타임아웃·셸 비활성화 보강 (`elevate_admin`, `kill_lingering_cleanmgr`, `force_purge_windows_old`)**: UAC 승격 인자 조합을 `subprocess.list2cmdline`으로 교체해 공백/특수문자 경로 안전성을 확보하고, 종료 시 `taskkill`에 `timeout=5` 제한을 추가했으며, `Windows.old` 소거 시 `shell=True` 대신 `["cmd.exe", "/c", "rd", "/s", "/q", target_dir]` (`shell=False`) 직접 호출로 전환.
  - **정리 진행 중(1~4단계) 실시간 다국어 즉시 재렌더링 (`active_ui_state`, `update_ui_keyed`)**: 작업 대기/완료 상태뿐 아니라 1~4단계(`VolumeCaches` 등록·`cleanmgr` 감시·`Windows.old` `takeown`/`icacls` 장시간 소거) 중에도 언어 드롭다운 전환 시 진행/상세 라벨이 즉시 새 언어로 재렌더링되도록 개선 (`disk_cleanup_gui.py` · `build_exe.py` 100% 동기화, `server.js` 복사 버튼 타이머 디바운스·다국어 복원 및 `nosniff` 헤더 보강 포함).

- **기능·인스톨러·배치 심층 감사(Self-Reflection & Deep Audit) 4차 수정 (Phase 23)**:
  - **인스톨러 구버전 강제 종료·`UninstallString` 파싱·커스텀 경로 잔여 정리 보강 (`installer.iss`)**:
    - `ForceKillRunningApp()`에 `DiskCleanupAuto*.exe` 와일드카드 종료를 추가하여 구버전(`v1.3.x`, `v1.4.0` 등)이나 이름 변경된 포터블 프로세스까지 빠짐없이 종료.
    - 레지스트리 `UninstallString`에 실행 인자(`/SILENT` 등)가 포함된 경우 기존 `RemoveQuotes` 전체 비교가 실패하던 결함을 `ExtractUninstExePath()` 정밀 파서로 해결.
    - 사용자 지정 경로(`/DIR=...`)에 설치된 기존 앱 제거 시 `unins000.exe`가 자기 자신을 지운 뒤 남은 빈 폴더/에셋(`_internal`, `assets`)이 보존되던 문제를 사전 추출한 `UninstDir` 검증 플래그(`ForceVerifiedDir`)로 완전히 제거하도록 개선.
  - **한/영/일 `Windows.old` 사용자 데이터 안전 가드레일 확장 (`scan_windows_old_safety`)**:
    - 기존 바탕 화면·문서·다운로드·사진에 더해 `Videos`/`Music`/`OneDrive`/`Favorites` 및 한국어(`동영상`, `음악`)·일본어(`デスクトップ`, `ドキュメント`, `ダウンロード`, `ピクチャ`, `ビデオ`, `ミュージック`) 프로필 폴더까지 확장 보호.
  - **GitHub API `null` 필드 방어 및 완료 카운트다운 오클릭 보호 (`check_github_update_realtime`, `interactive_widgets`)**:
    - GitHub API JSON 응답의 `tag_name`/`name`/`html_url`이 `null`일 때 `.strip()` 호출로 발생할 수 있던 `AttributeError`를 차단하고, 종료 시퀀스 진입 후 지연 팝업 스케줄링을 건너뛰도록 개선.
    - 완료 후 5초 대기 중 헤더/푸터 프레임 및 링크 구분선(`|`) 여백을 잘못 클릭해도 즉시 닫히지 않도록 `interactive_widgets` 보호 범위를 확장하고, 미사용 전역 변수(`UI_TITLE`) 제거.
  - **빌더 `taskkill` 행 방어 및 배치 ZIP 경로 따옴표 결함 해결 (`build_exe.py`, `build_exe.bat`)**:
    - `build_exe.py`의 `taskkill`에 `creationflags=0x08000000` 및 `timeout=5` 적용, `build_exe.bat`의 PowerShell `Compress-Archive`를 `$env:PORTABLE_STAGE`/`$env:RELEASE_DIR` 환경 변수 직접 참조로 전환해 작은따옴표(`'`)·공백·특수문자 포함 경로에서도 실패하지 않도록 수정.

- **기능·보안·UX 심층 감사(Self-Reflection & Deep Audit) 5차 수정 (Phase 24)**:
  - **System32 정식 실행 경로 고정으로 CWD 바이너리 하이재킹 원천 차단 (`_sys32_exe`, `installer.iss`)**:
    - GUI(`disk_cleanup_gui.py`, `build_exe.py`)에서 호출하는 `cleanmgr.exe`, `taskkill.exe`, `takeown.exe`, `icacls.exe`, `attrib.exe`, `cmd.exe`를 `%SystemRoot%\System32` 절대 경로로 우선 해석하도록 개선해 작업 디렉터리 변조/PATH 손상 환경에서의 실행 오류와 하이재킹을 방지.
    - `installer.iss`의 방화벽 등록(`[Run]`) 및 제거(`[UninstallRun]`) 명령도 `{sys}\netsh.exe` 절대 경로로 변경하고 `[UninstallRun]`에 `RunOnceId`(`DelFwBase`, `DelFwVer`)를 부여해 Inno Setup 컴파일 경고를 제거했으며, 레지스트리 `InstallLocation` 따옴표 제거(`RemoveQuotes`)를 보강.
  - **최소화·화면 외곽 상태에서 업데이트 모달 화면 이탈 방지 (`show_update_dialog`)**:
    - 메인 창이 최소화(`iconic`, Windows `-32000` 좌표)되었거나 모니터 경계에 걸쳐 있을 때 `grab_set()` 모달 팝업이 화면 밖에 생성되어 앱이 응답 불가처럼 보이던 결함을 화면 해상도 클램핑 및 중앙 폴백 배치로 해결.
  - **언어 변경 드롭다운 팝다운·클릭 직후 오작동 즉시 종료 방지 (`on_mouse_action`, `_last_ui_interaction`)**:
    - 5초 완료 카운트다운 중 `lang_combo` 드롭다운 선택(`popdown`) 직후나 푸터 링크 클릭 직후 발생하는 연쇄 `<Enter>` 이벤트로 창이 의도치 않게 즉시 닫히지 않도록 1.2초 상호작용 유예 시간 및 `popdown` 위젯 보호를 추가.
  - **빌드 ZIP 경로 슬래시 정규화 및 웹 프리뷰 클립보드 성공 검증 (`build_exe.py`, `server.js`, `BLOG_POST.md`)**:
    - `build_exe.py`의 포터블 ZIP 내부 경로를 POSIX 슬래시(`docs/...`, `assets/app.ico`)로 표준화하고, `server.js` 폴백 복사 시 `execCommand("copy")` 반환값이 참일 때만 복사 완료 배지를 표시하도록 수정하며 `BLOG_POST.md` PE 메타데이터 설명을 `version_info.txt`와 일치시켰습니다.

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
- **개발자 공식 브랜딩 지원**:
  - 개발자명(`AhBiYout`), 공식 Google 블로그(`https://ahbiyoutvibe.blogspot.com/`), GitHub 저장소(`https://github.com/AhBiYout-all/windows-disk-cleanup-builder`) 정보 추가.
  - Tkinter GUI 상단 서명 배지 및 하단 클릭 가능한 웹 브라우저 바로가기 버튼 탑재.
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
