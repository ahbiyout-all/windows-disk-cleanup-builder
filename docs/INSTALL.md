# 🚀 설치, 배포 및 무인 설치 가이드 (Installation Guide)

본 문서는 **Windows Disk Cleanup Automation Builder (v1.5.0)**의 Inno Setup 설치 프로그램 패키지 배포, 일반 대화형 설치, 자동 업그레이드/덮어쓰기 감지, 무인(Silent) 설치 옵션 및 Windows 방화벽 규칙 사전 등록 메커니즘을 상세히 설명합니다.

---

## 1. 배포 패키지 아키텍처 (Deployment Architecture)

- **설치 프로그램 빌더**: Inno Setup 6.x (`installer.iss`)
- **설치 형식**: **폴더 풀림(Unpacked Multi-File) 개별 파일 설치 구조**
  - 불필요한 개발용 임시 파일, 테스트 로그 및 포터블 중복 파일 제외
  - 코어 바이너리(`DiskCleanupAuto.exe`), 리소스 디렉터리(`assets/`), 런타임 DLL 개별 배치
- **설치 기본 디렉터리**: `{autopf}\Windows Disk Cleanup Automation Builder` (`C:\Program Files\...`)
- **실행 권한 요구사항**: 관리자 권한 (`PrivilegesRequired=admin`)
- **아키텍처 지원**: 64비트 최적화 (`x64compatible`) 및 32비트 호환

---

## 2. 기존 설치 감지 및 덮어쓰기/삭제 대화상자

Inno Setup `[Code]` 섹션의 `InitializeSetup` 이벤트 함수를 통해 기존 버전 설치 여부를 실시간 감지합니다.

1. **레지스트리 감지**:
   - `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{E1D4A760-936B-4D12-9F89-A2BB5B30DE8C}_is1` 경로를 검사합니다.
2. **사용자 확인 대화상자**:
   - 기존 설치가 발견되면 안내 창을 표시합니다:
     > *"기존 버전의 프로그램이 이미 설치되어 있습니다. 기존 설치를 덮어쓰고 최신 버전으로 업그레이드하시겠습니까?"*
   - **[예] 선택**: 기존 파일 덮어쓰기 및 업그레이드 정상 진행
   - **[아니오] 선택**: 설치 즉시 취소 및 안전 종료

---

## 3. 무인 설치 (Unattended / Silent Install) 옵션

학교 컴퓨터실, 회사 전산실, 관공서 또는 원격 PC 관리 솔루션(NetSupport, Active Directory GPO, SCCM 등)을 위한 무인 자동 설치 스위치를 지원합니다.

### 지원 명령줄 스위치

| 스위치 | 설명 | 동작 상세 |
| :--- | :--- | :--- |
| `/SILENT` | 백그라운드 설치 | 마법사 UI 창은 표시되나 사용자 입력 대기 없이 자동 진행 |
| `/VERYSILENT` | 완전 무인 설치 | UI 창 및 진행 화면을 일절 띄우지 않고 100% 백그라운드 설치 |
| `/SUPPRESSMSGBOXES` | 대화상자 억제 | 기존 설치 감지 및 완료 알림 등 모든 대화상자를 기본값(예)으로 자동 응답 |
| `/NORESTART` | 재부팅 억제 | 설치 후 시스템 재시작 요청을 억제 |
| `/DIR="C:\Path"` | 설치 경로 지정 | 기본 경로 대신 사용자 지정 디렉터리에 설치 |

### 무인 설치 실행 예시 (CMD / PowerShell)

```cmd
:: 완전 무인 자동 설치 (컴퓨터실 일괄 배포용)
WindowsDiskCleanup_Setup_v1.5.0.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART

:: 특정 폴더 지정 무인 설치
WindowsDiskCleanup_Setup_v1.5.0.exe /VERYSILENT /SUPPRESSMSGBOXES /DIR="C:\Tools\DiskCleanup"
```

### 무인 언인스톨 (Silent Uninstall)

```cmd
"C:\Program Files\Windows Disk Cleanup Automation Builder\unins000.exe" /VERYSILENT /SUPPRESSMSGBOXES
```

---

## 4. Windows 방화벽 규칙 사전 조용 등록 (Firewall Pre-Registration)

설치 단계(`CurStepChanged(ssPostInstall)`)에서 사용자의 추가 보안 경고창 없이 Windows Defender 방화벽 인바운드 규칙을 조용히 등록합니다.

### 이중 등록 정책 (기본 이름 + 버전 포함 이름)
운영체제 방화벽 제어판 및 관리 도구 식별성을 위해 두 가지 규칙을 모두 등록합니다:

1. **기본 이름 규칙**:
   ```cmd
   netsh advfirewall firewall add rule name="Windows Disk Cleanup Automation Builder" dir=in action=allow program="C:\Program Files\Windows Disk Cleanup Automation Builder\DiskCleanupAuto.exe" enable=yes
   ```
2. **버전 포함 이름 규칙**:
   ```cmd
   netsh advfirewall firewall add rule name="Windows Disk Cleanup Automation Builder v1.5.0" dir=in action=allow program="C:\Program Files\Windows Disk Cleanup Automation Builder\DiskCleanupAuto.exe" enable=yes
   ```

### 안전한 언인스톨 정리
프로그램을 제거할 때(`CurUninstallStepChanged(usPostUninstall)`), 위에서 등록한 방화벽 규칙 2개를 모두 자동으로 검색하여 깨끗하게 삭제합니다:
```cmd
netsh advfirewall firewall delete rule name="Windows Disk Cleanup Automation Builder"
netsh advfirewall firewall delete rule name="Windows Disk Cleanup Automation Builder v1.5.0"
```


---

## 🪟 프로그램 추가/제거 (설정 앱) 관리
- 본 설치 프로그램(`WindowsDiskCleanup_Setup_v1.5.0.exe`)으로 설치된 애플리케이션은 Windows **설정 → 앱 → 설치된 앱(또는 제어판 프로그램 추가/제거)**에 공식 아이콘과 함께 정식 등록됩니다.
- 언제든지 [제거]를 클릭하여 설치 폴더 및 등록된 방화벽 인바운드 규칙을 한 번에 깨끗하게 소거할 수 있습니다.
