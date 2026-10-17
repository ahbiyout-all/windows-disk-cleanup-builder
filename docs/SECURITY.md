# 🛡️ 보안 및 개인정보 보호 정책 (Security & Privacy Policy)

본 문서는 **Windows Disk Cleanup Automation Builder** 프로젝트의 보안 설계, 민감 정보 보호 규정, 권한 모델 및 깃허브 배포 시의 정보 유출 방어책을 규정합니다.

---

## 1. 개인정보 및 민감 데이터 유출 원천 차단 (Privacy Protection)

### 1.1 깃허브 업로드 정책
- **개인 이메일 및 실명 노출 금지**:
  - 개인 개발자의 이메일 주소(예: 개인 Google/Naver 이메일)는 소스 코드, 커밋 기록, 패치 노트, 문서에 일절 기재하지 않습니다.
  - 모든 Git 커밋은 깃허브 공식 보호 계정(`AhBiYout-all@users.noreply.github.com`)과 공식 개발자명(`AhBiYout`)으로 서명됩니다.
- **사전 누출 검사기 (`git_push.bat`)**:
  - `git_push.bat` 실행 시 스테이징된 변경 사항에서 개인 이메일 정규식을 사전에 스캔(`diff --cached | findstr`)하여 누출 감지 시 푸시를 즉시 차단합니다.
- **`.gitignore` 보안 배제**:
  - 로컬 환경설정(`.env`), 빌드 산출물(`Release/`, `Output/`, `dist/`), 임시 로그 파일 등은 형상 관리에서 완전 배제됩니다.

---

## 2. 권한 및 실행 보안 모델 (Privilege & Execution Model)

### 2.1 최소 권한 원칙 및 투명한 UAC 승격
- Windows 디스크 정리는 시스템 전체의 `cleanmgr.exe` 설정(`HKLM\...\VolumeCaches`)을 조작하므로 로컬 관리자 권한(`Administrators`)이 필수적입니다.
- 앱 실행 시 임의의 백도어나 권한 우회 기법을 사용하지 않으며, 표준 Win32 API(`ctypes.windll.shell32.IsUserAnAdmin`)를 통해 사용자에게 Windows UAC 승격 대화상자(`ShellExecuteW "runas"`)를 투명하게 제시합니다.

### 2.2 사용자 데이터 보존 안전 가드레일 (Safe-Guard)
- Windows 11 대규모 업데이트 후 남는 `C:\Windows.old`를 강제 소거할 때, 사용자가 미처 백업하지 못한 중요한 개인 파일이 `C:\Windows.old\Users` 경로에 존재하는지 사전에 검사합니다.
- 사용자 문서가 발견될 경우 영구 삭제를 즉시 보류하고 경고 안내를 표시하여 데이터 유실 사고를 원천 차단합니다.

---

## 3. 네트워크 및 방화벽 보안

- **오프라인 로컬 동작**:
  - 디스크 정리 및 최적화 코어 엔진은 100% 로컬 시스템 내부에서만 동작하며 외부로 사용자 파일이나 사용 패턴을 전송하지 않습니다.
- **방화벽 규칙 최소 권한 등록**:
  - Inno Setup 설치 시 등록되는 방화벽 규칙은 해당 실행 파일(`DiskCleanupAuto.exe`)의 정식 경로에 한정되며, 프로그램 제거 시 완전히 삭제됩니다.
