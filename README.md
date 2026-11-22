# 🚀 DiskCleanupAuto v1.5.0 - Core Build & Release Package

> **공식 GitHub 저장소**: [AhBiYout-all/windows-disk-cleanup-builder](https://github.com/AhBiYout-all/windows-disk-cleanup-builder)  
> **개발자**: AhBiYout  
> **공식 블로그**: [AhBiYoutVibe](https://ahbiyoutvibe.blogspot.com/)  


---

## 📌 개요
본 디렉터리는 **DiskCleanupAuto v1.5.0**의 실제 컴파일, 패키징 및 GitHub Release에 필요한 **핵심 파일(Core Files)만 엄선하여 관리**하는 전용 패키지입니다.  
웹 프런트엔드 빌드 아티팩트(`node_modules/`, `dist/` 등)나 불필요한 임시 파일이 완전히 제거되어 있어 가볍고 안전하게 단독 배포 및 빌드가 가능합니다.

---

## 📂 핵심 파일 구성 (Core Manifest)

| 파일 경로 | 카테고리 | 설명 |
| :--- | :--- | :--- |
| `disk_cleanup_gui.py` | 소스 코드 | Tkinter GUI(한/영/일 자동 감지) 및 Win32 커널 연동 Windows 디스크 정리 엔진 |
| `build_exe.py` | 빌더 | PyInstaller & Inno Setup 연동 파이썬 네이티브 컴파일 스크립트 |
| `build_exe.bat` | 빌더 | Windows 1-클릭 단일 포터블 EXE 및 인스톨러 자동 빌드 배치 |
| `version_info.txt` | 메타데이터 | Windows 탐색기 속성 '자세히' 탭 PE 리소스 정의 (`v1.5.0`) |
| `installer.iss` | 인스톨러 | Inno Setup 6.x 언팩 개별 설치(한/영/일 지원) 및 방화벽 규칙 자동 등록 스크립트 |
| `register_scheduler.bat` | 스케줄러 | Windows 작업 스케줄러 주간 자동 정리 등록 스크립트 |
| `app.ico` / `assets/app.ico` | 리소스 | 멀티 해상도 Windows 앱/인스톨러/바로가기 아이콘 |
| `LICENSE` | 라이선스 | MIT License (`Copyright (c) 2026 AhBiYout`) |
| `.github/workflows/release.yml` | CI/CD | GitHub Actions Windows 단독 EXE + 인스톨러 통합 자동 배포 워크플로 |
| `docs/` | 가이드 | 다국어 문서(`README.md`, `README_EN.md`, `README_JA.md`), 설치/빌드/보안/패치노트 |
| `server.js` / `package.json` | 프리뷰 | `navigator.language` 자동 감지 및 동적 스크립트 주석 미리보기 경량 Node.js 서버 (포트 3000) |

---

## 🔨 빌드 방법

### 1. 단일 실행 파일 (Portable EXE) 및 설치 파일 일괄 빌드
```cmd
build_exe.bat
```
또는 Python 직접 실행:
```cmd
python build_exe.py
```
- 결과물:
  - `Release\DiskCleanupAuto_v1.5.0.exe` (무설치 단독 포터블 실행 파일)
  - `Release\WindowsDiskCleanup_Setup_v1.5.0.exe` (Inno Setup 설치 프로그램, ISCC 설치 시 자동 생성)

### 2. Inno Setup 설치 프로그램 단독 패키징
Inno Setup 컴파일러(`ISCC.exe`)로 `installer.iss`를 직접 컴파일합니다:
```cmd
iscc installer.iss
```
- 결과물: `Output\WindowsDiskCleanup_Setup_v1.5.0.exe`
- 지원 옵션: 대화형 설치, 덮어쓰기 확인, 무인 설치(`/VERYSILENT /SUPPRESSMSGBOXES`)

---

## 🛡️ 라이선스 & 보안 정책
- **라이선스**: MIT License (`Copyright (c) 2026 AhBiYout. All rights reserved.`) — 자세한 내용은 [`LICENSE`](./LICENSE)를 참고하세요.
- **개인정보 보호**: 모든 커밋은 공식 No-Reply 이메일(`AhBiYout-all@users.noreply.github.com`)을 사용하며, `.gitignore`를 통해 로컬 유틸리티(`git_push.bat`), `.env*`, 빌드 임시 산출물(`dist/`, `build/`, `Release/`, `Output/`)을 저장소에서 자동 배제합니다.
- **소속회사**: [(주)청운정보시스템](http://cisnet.co.kr) ( `cisnet.co.kr` )
