# 🚀 DiskCleanupAuto v1.5.0 - Core Build & Release Package

> **공식 GitHub 저장소**: [AhBiYout-all/windows-disk-cleanup-builder](https://github.com/AhBiYout-all/windows-disk-cleanup-builder)  
> **개발자**: AhBiYout  
> **공식 블로그**: [AhBiYoutVibe](https://ahbiyoutvibe.blogspot.com/)  
> **소속**: [CISNET CORPORATION](http://www.cisnet.co.kr/)

---

## 📌 개요
본 디렉터리는 **DiskCleanupAuto v1.5.0**의 실제 컴파일, 패키징 및 GitHub Release에 필요한 **핵심 파일(Core Files)만 엄선하여 관리**하는 전용 패키지입니다.  
웹 프런트엔드 빌드 아티팩트(`node_modules/`, `dist/` 등)나 불필요한 임시 파일이 완전히 제거되어 있어 가볍고 안전하게 단독 배포 및 빌드가 가능합니다.

---

## 📂 핵심 파일 구성 (Core Manifest)

| 파일 경로 | 카테고리 | 설명 |
| :--- | :--- | :--- |
| `disk_cleanup_gui.py` | 소스 코드 | Tkinter GUI 및 커널 레벨 7단계 디스크 정리 엔진 |
| `build_exe.py` | 빌더 | PyInstaller 연동 파이썬 네이티브 컴파일 스크립트 |
| `build_exe.bat` | 빌더 | Windows 1-클릭 단일 포터블 EXE 자동 빌드 배치 |
| `version_info.txt` | 메타데이터 | Windows 탐색기 속성 '자세히' 탭 PE 리소스 정의 (v1.5.0) |
| `installer.iss` | 인스톨러 | Inno Setup 6.x 언팩 개별 설치 및 방화벽 자동 등록 스크립트 |
| `.github/workflows/release.yml` | CI/CD | GitHub Actions Node 22 LTS 릴리스 자동화 워크플로 |
| `git_push.bat` | 배포도구 | 개인정보 보호 및 릴리스 태그 동기화 푸시 스크립트 |
| `docs/` | 가이드 | 설치(`INSTALL.md`), 빌드(`BUILD.md`), 보안(`SECURITY.md`) 가이드 |

---

## 🔨 빌드 방법

### 1. 단일 실행 파일 (Portable EXE) 빌드
```cmd
build_exe.bat
```
또는 Python 직접 실행:
```cmd
python build_exe.py
```
- 결과물: `Release\DiskCleanupAuto_v1.5.0.exe`

### 2. Inno Setup 설치 프로그램 패키징
Inno Setup 컴파일러(ISCC.exe)로 `installer.iss`를 컴파일합니다:
```cmd
iscc installer.iss
```
- 결과물: `Output\WindowsDiskCleanup_Setup_v1.5.0.exe`
- 지원 옵션: 대화형 설치, 덮어쓰기 확인, 무인 설치(`/VERYSILENT /SUPPRESSMSGBOXES`)

---

## 🛡️ 개인정보 보호 & 보안
- 모든 커밋은 개발자 공식 No-Reply 이메일(`AhBiYout-all@users.noreply.github.com`)을 사용합니다.
- 개인 이메일 및 로컬 계정 정보가 포함되지 않도록 사전 스캔을 통과한 파일만 포함되어 있습니다.
