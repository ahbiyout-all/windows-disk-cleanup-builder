# 🔨 빌드, 패키징 및 CI/CD 가이드 (Build & Packaging Guide)

본 문서는 **Windows Disk Cleanup Automation Builder (v1.5.0)**의 로컬 빌드, 자동화 배치 파이프라인, Inno Setup 패키징 및 GitHub Actions 클라우드 릴리스 빌드 절차를 규정합니다.

---

## 1. 빌드 환경 사양 (Prerequisites)

- **운영체제**: Windows 10 / Windows 11 / Windows Server (CI 빌드 러너: `windows-latest`)
- **Python**: 3.10 ~ 3.13+ (권장: Python 3.12 64-bit)
- **PyInstaller**: 6.x+
- **Inno Setup**: Inno Setup 6.2+ (`ISCC.exe`)
- **Git**: 2.40+
- **Node.js** *(선택 사항 / 미리보기용)*: Node.js 22+ (`server.js` 경량 프리뷰 서버 구동 시)

---

## 2. 로컬 빌드 절차 (Local Build)

### 2.1 독립 실행형 Windows 바이너리 및 인스톨러 일괄 빌드 (`build_exe.bat` / `build_exe.py`)
프로젝트 루트의 `build_exe.bat` 또는 `python build_exe.py`를 실행합니다:
```cmd
:: PyInstaller 단일 EXE + Inno Setup 설치 파일 순차 자동 빌드
build_exe.bat
```
- **포터블 빌드 결과물**: `Release\DiskCleanupAuto_v1.5.0.exe`
- **인스톨러 빌드 결과물**: `Release\WindowsDiskCleanup_Setup_v1.5.0.exe` (시스템에 Inno Setup 6 설치 시 자동 생성)
- **적용 메타데이터**: `version_info.txt`에 명시된 버전(`1.5.0.0`), 제작자(`AhBiYout`), 저작권(`Copyright (c) 2026 AhBiYout. All rights reserved.`) 자동 임베드.

### 2.2 Inno Setup 설치 프로그램 단독 패키징
Inno Setup 컴파일러(`ISCC.exe`)를 통해 배포용 설치 파일을 단독으로 생성할 수 있습니다:
```cmd
iscc /Q "installer.iss"
```
- **출력 디렉터리**: `Output/`
- **생성 파일**: `Output/WindowsDiskCleanup_Setup_v1.5.0.exe`
- **특징**: 폴더 풀림(Unpacked Multi-File) 구조(`--onedir` 결과물 우선 패키징, 충돌 방지를 위해 `--onefile` EXE와 분리), 포터블 중복 제외, 방화벽 규칙 자동 등록.

---

## 3. GitHub Actions 클라우드 빌드 및 릴리스 (`release.yml`)

### 📌 Node.js 20 Runner Deprecation 대응 (`node24`)
GitHub Actions 러너의 Node.js 20 지원 종료에 대응하여, `.github/workflows/release.yml`은 전역 환경변수 `ACTIONS_RUNNER_FORCE_ACTIONS_NODE_VERSION: "node24"`를 적용해 `actions/checkout@v4`, `actions/setup-python@v5`, `actions/upload-artifact@v4`, `softprops/action-gh-release@v2`를 Node 24 런타임으로 실행합니다.

### 릴리스 파이프라인 아키텍처 (단일 통합 잡):
```text
[Push (main/master) | Tag (v*.*.*) | workflow_dispatch]
                        │
                        ▼
       [Single Unified Job: build-and-release]
       (Runner: windows-latest)
        ├─ 1. PyInstaller --onefile → release_artifacts/DiskCleanupAuto_v1.5.0.exe
        ├─ 2. PyInstaller --onedir  → dist/DiskCleanupAuto/ (assets/app.ico 포함)
        ├─ 3. ISCC installer.iss    → Output/WindowsDiskCleanup_Setup_v1.5.0.exe
        ├─ 4. GitHub Actions Artifact 업로드 (windows-binaries-v1.5.0)
        └─ 5. GitHub Releases 자동 발행 (Setup EXE + Portable EXE 동시 첨부)
```

> **주의 (패키징 충돌 방지)**: `installer.iss` 패키징 전에 `--onefile` 결과물(`dist/DiskCleanupAuto_v1.5.0.exe`)은 `release_artifacts/`로 즉시 이동시켜, `--onedir` 폴더(`dist/DiskCleanupAuto/*`)와 중복 패킹되지 않도록 격리합니다.

### 3.1 트리거 조건 및 액션 미실행(Not Triggered) 문제 해결 가이드
본 프로젝트의 GitHub Actions는 다음 3가지 방식으로 트리거됩니다:
1. **일반 코드 푸시 (`push.branches: [main, master]`)**: 커밋을 원격에 올리면 즉시 Windows EXE 컴파일 & Inno Setup 인스톨러 빌드가 수행됩니다.
2. **버전 태그 푸시 (`push.tags: ['v*.*.*']`)**: 공식 버전 태그(`v1.5.0`)가 푸시되면 빌드 후 GitHub Releases에 공식 에셋이 등록됩니다.
3. **수동 원클릭 실행 (`workflow_dispatch`)**: GitHub 웹 화면에서 버전 입력 후 버튼 클릭으로 즉시 실행할 수 있습니다.

#### ⚠️ 깃허브에 푸시했는데 Action이 시작되지 않는 원인 및 조치 방법
1. **[원인 1: 저장소 Actions 권한 비활성화]**
   - GitHub 저장소 웹 페이지 → **`Settings`** → 좌측 메뉴 **`Actions`** → **`General`** 이동
   - **Actions permissions**: `Allow all actions and reusable workflows` 선택 후 저장
   - **Workflow permissions**: `Read and write permissions` 선택 후 저장
2. **[원인 2: 태그 미포함 또는 태그 중복]**
   - 공식 릴리스 태그 갱신 시 `git tag -fa "v1.5.0" -m "Release v1.5.0"` 후 `git push origin "v1.5.0" --force`를 사용합니다.
3. **[원인 3: 수동 실행(Run workflow) 기능 활용]**
   - 저장소 상단 **`Actions`** 탭 → 좌측 **`Build & Package Windows Installer`** → 우측 **`Run workflow`** 클릭
4. **[원인 4: 워크플로 파일 경로 확인]**
   - 워크플로 파일은 반드시 저장소 최상위 루트의 **`.github/workflows/release.yml`** 에 위치해야 합니다.

### 릴리스 에셋 정책
- GitHub Releases에는 다음 두 가지 공식 Windows 바이너리가 자동 첨부됩니다:
  1. **`WindowsDiskCleanup_Setup_v1.5.0.exe`** (표준 Inno Setup 설치 프로그램)
  2. **`DiskCleanupAuto_v1.5.0.exe`** (무설치 단독 포터블 실행 파일)

---

## 4. 핵심 소스 관리 및 로컬 프리뷰 (`.gitignore` & `server.js`)

저장소 루트에는 실제 컴파일 및 패키징에 필요한 핵심 파일만 유지되며, 로컬 전용 스크립트(`git_push.bat`, `*.ps1`), 환경설정(`.env*`), 빌드 부산물(`node_modules/`, `dist/`, `build/`, `Release/`, `Output/`, `release_artifacts/`, `__pycache__/`, `*.spec`)은 `.gitignore`를 통해 원격 저장소에서 원천 배제됩니다.

로컬 개발 컨테이너에서 프로젝트 안내 페이지를 확인하려면 다음 명령어로 경량 Node.js 서버(포트 `3000`)를 실행할 수 있습니다:
```bash
npm run dev
```

