# 🔨 빌드, 패키징 및 CI/CD 가이드 (Build & Packaging Guide)

본 문서는 **Windows Disk Cleanup Automation Builder (v1.5.0)**의 로컬 빌드, 자동화 배치 파이프라인, Inno Setup 패키징 및 GitHub Actions 클라우드 릴리스 빌드 절차를 규정합니다.

---

## 1. 빌드 환경 사양 (Prerequisites)

- **운영체제**: Windows 10 / Windows 11 / Windows Server (빌드 러너: `windows-latest`)
- **Python**: 3.10 ~ 3.12+ (권장: Python 3.12 64-bit)
- **Node.js**: **Node.js 22 LTS** (또는 Node 24, Node 20 EOL 대응 완료)
- **PyInstaller**: 6.x+
- **Inno Setup**: Inno Setup 6.2+ (`ISCC.exe`)
- **Git**: 2.40+ (자동 푸시 스크립트 연동)

---

## 2. 로컬 빌드 절차 (Local Build)

### 2.1 웹 빌더 프론트엔드 빌드 (Node.js 22 LTS)
```bash
# 의존성 설치
npm install

# TypeScript 타입 검사 및 린트
npm run lint

# 프로덕션 빌드 (dist/ 생성)
npm run build
```

### 2.2 독립 실행형 Windows 바이너리 빌드 (`build_exe.bat`)
프로젝트 루트의 `build_exe.bat`을 관리자 권한으로 실행하거나 CMD에서 다음을 실행합니다:
```cmd
:: 6단계 순차 실행 파이프라인
build_exe.bat
```
- **빌드 결과물**: `Release\DiskCleanupAuto_v1.5.0.exe`
- **적용 메타데이터**: `version_info.txt`에 명시된 버전(`1.5.0.0`), 제작자(`AhBiYout`), 소속(`CISNET`) 자동 임베드.

### 2.3 Inno Setup 설치 프로그램 패키징
Inno Setup 컴파일러를 통해 배포용 설치 파일을 생성합니다:
```cmd
iscc /Q "installer.iss"
```
- **출력 디렉터리**: `Output/`
- **생성 파일**: `Output/WindowsDiskCleanup_Setup_v1.5.0.exe`
- **특징**: 폴더 풀림(Unpacked Multi-File) 구조로 설치, 포터블 파일 미포함, 방화벽 규칙 자동 등록.

---

## 3. GitHub Actions 클라우드 빌드 및 릴리스 (`release.yml`)

### 📌 Node.js 20 공식 지원 종료(EOL) 대응 사양
GitHub Actions 러너에서 Node.js 20 지원이 종료됨에 따라, 본 프로젝트의 모든 워크플로는 **`node-version: '22'` (Node 22 LTS)** 환경에서 구동됩니다.

### 릴리스 파이프라인 아키텍처:
```
[Git 태그 푸시: v*.*.*]
        │
        ├─────────────────────────────────────────────────┐
        ▼                                                 ▼
[Job 1: build-core]                             [Job 2: build-windows-installer]
(Node.js 22 LTS Web 빌드)                       (PyInstaller + Inno Setup 패키징)
        │                                                 │
        └────────────────────────┬────────────────────────┘
                                 ▼
                     [Job 3: create-release]
                     - 설치 파일(Installer)만 에셋 첨부
                     - v1.5.0 WindowsDiskCleanup_Setup_v1.5.0.exe
```

### 3.1 트리거 조건 및 액션 미실행(Not Triggered) 문제 해결 가이드
본 프로젝트의 GitHub Actions는 다음 3가지 방식으로 트리거됩니다:
1. **일반 코드 푸시 (`push.branches: [main, master]`)**: 커밋을 원격에 올리면 즉시 웹 빌드 검증, Windows EXE 컴파일 & Inno Setup 인스톨러 빌드 테스트 아티팩트가 생성됩니다.
2. **버전 태그 푸시 (`push.tags: ['v*.*.*']`)**: 공식 버전 태그(`v1.5.0`)가 푸시되면 빌드 후 GitHub Releases에 공식 인스톨러 에셋이 자동 등록됩니다.
3. **수동 원클릭 실행 (`workflow_dispatch`)**: GitHub 웹 화면에서 버튼 클릭으로 즉시 실행할 수 있습니다.

#### ⚠️ 깃허브에 푸시했는데 Action이 시작되지 않는 원인 및 조치 방법
1. **[원인 1: 저장소 Actions 권한 비활성화]**
   - GitHub 신규 생성 저장소는 기본적으로 Actions가 꺼져 있거나 쓰기 권한이 제한될 수 있습니다.
   - **해결책**:
     - GitHub 저장소 웹 페이지 -> **`Settings`** -> 좌측 메뉴 **`Actions`** -> **`General`** 이동
     - **Actions permissions**: `Allow all actions and reusable workflows` 선택 후 저장
     - **Workflow permissions**: `Read and write permissions` 선택 및 `Allow GitHub Actions to create and approve pull requests` 체크 후 저장
2. **[원인 2: 태그 미포함 또는 태그 중복]**
   - 이전 버전에서는 오직 태그 푸시(`v*.*.*`)로만 작동하도록 되어 있어 단순 `git push origin main` 실행 시 액션이 시작되지 않았습니다.
   - **해결책**:
     - 최신 `release.yml`은 브랜치 푸시(`main`, `master`) 시에도 즉시 액션이 실행되도록 업데이트되었습니다.
     - 공식 릴리스 배포를 위해 태그를 푸시할 때는 `git tag -fa "v1.5.0" -m "Release v1.5.0"` 후 `git push origin "v1.5.0" --force`로 태그를 확실히 갱신 푸시합니다.
3. **[원인 3: 수동 실행(Run workflow) 기능 활용]**
   - 태그나 브랜치 푸시 없이 지금 즉시 빌드를 시작하려면:
     - 저장소 상단 **`Actions`** 탭 클릭
     - 좌측 목록에서 **`CI/CD Release Workflow`** 또는 **`Build Web App Core`** 클릭
     - 우측 상단 **`Run workflow`** 드롭다운 버튼 클릭 -> 녹색 **`Run workflow`** 버튼 클릭
4. **[원인 4: 워크플로 파일 경로 확인]**
   - 워크플로 파일은 반드시 저장소 최상위 루트의 **`.github/workflows/release.yml`** (앞에 마침표 포함)에 위치해야 GitHub이 자동 인식합니다.

### 릴리스 에셋 정책
- 깃허브 릴리스에는 소스 코드 압축본 외에 **오직 공식 인스톨러(`WindowsDiskCleanup_Setup_v1.5.0.exe`)만 첨부**합니다.
- 불필요한 개발용 임시 파일이나 중복 포터블 파일은 첨부되지 않습니다.

---

## 4. DiskCleanupAuto v1.5.0 핵심 빌드 파일 전용 관리 및 내보내기 (`export_core_files.bat`)

깃허브 업로드 및 단독 배포 시 웹 프론트엔드 빌드 아티팩트(`node_modules/`, `dist/` 등)나 불필요한 파일이 함께 올라가는 것을 원천 방지하고, **실제 DiskCleanupAuto v1.5.0 빌드에 필요한 핵심 파일만 엄선하여 관리**하기 위해 전용 폴더 및 자동화 파이프라인을 운영합니다.

### 4.1 전용 폴더 구조 (`DiskCleanupAuto_v1.5.0_Core/`)
```
DiskCleanupAuto_v1.5.0_Core/
├── disk_cleanup_gui.py         # Tkinter GUI 및 7단계 디스크 정리 엔진 소스
├── build_exe.py               # PyInstaller 컴파일러 & 빌드 엔진
├── build_exe.bat              # Windows 1-클릭 단일 EXE 빌드 스크립트 (CRLF)
├── version_info.txt           # Windows PE 파일 속성 자세히 탭 리소스 정의 (v1.5.0)
├── installer.iss              # Inno Setup 6.x 언팩 개별 설치 및 방화벽 스크립트
├── .github/workflows/
│   └── release.yml            # GitHub Actions Node 22 LTS 릴리스 워크플로
├── git_push.bat               # 개인정보 보호 및 버전 태그 동기화 푸시 유틸리티
├── docs/                      # 핵심 배포 문서 (INSTALL, BUILD, SECURITY, PATCH_NOTES)
├── CORE_MANIFEST.json         # SHA-256 해시 및 검증 상태가 기록된 파일 매니페스트
├── README.md                  # 독립 빌드 및 배포 안내 문서
└── .gitignore                 # 빌드 캐시 및 바이너리 제외 규칙
```

### 4.2 자동 내보내기 스크립트 실행
- **Windows (배치 스크립트)**:
  ```cmd
  export_core_files.bat
  ```
- **크로스 플랫폼 (Python 엔진)**:
  ```bash
  python export_core_files.py
  ```

### 4.3 3중 무결성 및 개인정보 보호 보장
1. **불필요 파일 완전 배제**: `node_modules`, `dist`, `.vite`, 임시 로그 파일 등 웹 빌드 부산물 차단.
2. **개인정보/개인 이메일 원천 스캔**: 개인 이메일, 개인 비밀번호, 비인가 토큰 포함 시 작업 즉시 차단.
3. **SHA-256 매니페스트 생성**: 모든 파일의 무결성 해시를 `CORE_MANIFEST.json`에 기록하여 변조 방지.

