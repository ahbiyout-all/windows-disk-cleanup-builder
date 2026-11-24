# 🚀 설치, 배포 및 무인 설치 가이드 (Installation Guide)

본 문서는 **Windows Disk Cleanup Automation Builder (v1.6.0)**의 Inno Setup 설치 프로그램 패키지 배포, 일반 대화형 설치, 기존 버전 자동 제거 후 클린 재설치, 무인(Silent) 설치 옵션 및 Windows 방화벽 규칙 사전 등록 메커니즘을 상세히 설명합니다.

---

## 1. 배포 패키지 아키텍처 (Deployment Architecture)

- **설치 프로그램 빌더**: Inno Setup 6.x (`installer.iss`)
- **설치 형식**: **폴더 풀림(Unpacked Multi-File) 개별 파일 설치 구조**
  - 불필요한 개발용 임시 파일, 테스트 로그 및 포터블 중복 파일 제외
  - 코어 바이너리(`DiskCleanupAuto.exe`), 리소스 디렉터리(`assets/`), 런타임 DLL 개별 배치
- **설치 기본 디렉터리**: `{autopf}\Windows Disk Cleanup Automation Builder` (`C:\Program Files\...`)
- **실행 권한 요구사항**: 관리자 권한 (`PrivilegesRequired=admin`)
- **아키텍처 지원**: 64비트 최적화 (`x64compatible`) 및 32비트 호환
- **다국어 설치 지원**: 한국어(`Korean.isl`), 영어(`Default.isl`), 일본어(`Japanese.isl`) 및 언어별 기존 설치 제거 확인 대화상자 지원

---

## 2. 인스톨 진행 순서 및 기존 설치 처리

Inno Setup 마법사는 다음 순서로 안전하게 진행됩니다:

1. **실행 중인 기존 앱 강제 종료 (`ForceKillRunningApp`)**:
   - 설치 시작 직후(`InitializeSetup`) 및 파일 복사 직전(`PrepareToInstall`)에 `System32\taskkill.exe /F /T`를 실행해 구동 중인 `DiskCleanupAuto.exe` 및 `DiskCleanupAuto*.exe`(구버전·포터블 포함) 프로세스를 강제 종료하여 파일 잠금 충돌을 방지합니다.
2. **기존 설치 감지 및 완전 제거 후 새로 설치**:
   - `HKLM` / `HKLM32` / `HKCU` 레지스트리(구버전 `AppId` 포함, `UninstallString` 인자 정밀 파싱) 및 기존/기본 설치 경로 내 실행 파일·`unins000.exe` 존재 여부를 검사합니다.
   - 기존 설치가 감지되면 덮어쓰지 않고 **기존 버전 완전 제거 후 새로 설치 여부(`MB_YESNO`)**를 한/영/일로 안내합니다:
     - **[예]**: 기존 언인스톨러 무인 실행(`/VERYSILENT`) 후 임시 제거 프로세스 완료(`unins000.exe` 소멸)까지 대기한 뒤 검증된 사용자 지정 폴더를 포함한 잔여 폴더(`DelTree`)·고아 키 삭제를 거쳐 클린 설치 진행 (무인 모드 `/VERYSILENT`에서도 자동 제거 후 재설치)
     - **[아니오]**: 설치 즉시 중단 및 안전 종료
3. **라이선스 선언 및 동의 (`LicenseFile=LICENSE`)**:
   - 공식 MIT 라이선스 전문(`LICENSE`)을 표시하고 사용자 동의 후 다음 단계로 진행합니다.
4. **설치 진행 및 바탕화면 바로가기 기본 체크 (`[Tasks]` `desktopicon`)**:
   - 추가 아이콘 작업 단계에서 바탕화면 바로가기 생성 체크박스가 **기본 체크 상태**로 제공되며, 이어서 개별 파일 전개, 바로가기 생성 및 Windows Defender 방화벽 인바운드 규칙 사전 등록을 수행합니다.
5. **설치 완료 후 앱 실행 (`[Run]` `postinstall`)**:
   - 완료 화면에서 앱 실행 옵션이 기본 체크 상태로 표시되어 완료 버튼 클릭 시 `DiskCleanupAuto.exe`가 즉시 실행됩니다.

> 💡 **무설치 사용**: 별도 설치 없이 바로 사용하려면 GitHub Releases의 단일 실행 파일(`DiskCleanupAuto_v1.6.0.exe`) 또는 스케줄러·가이드가 포함된 포터블 패키지(`WindowsDiskCleanup_Portable_v1.6.0.zip`)를 사용할 수 있습니다.

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
WindowsDiskCleanup_Setup_v1.6.0.exe /VERYSILENT /SUPPRESSMSGBOXES /NORESTART

:: 특정 폴더 지정 무인 설치
WindowsDiskCleanup_Setup_v1.6.0.exe /VERYSILENT /SUPPRESSMSGBOXES /DIR="C:\Tools\DiskCleanup"
```

### 무인 언인스톨 (Silent Uninstall)

```cmd
"C:\Program Files\Windows Disk Cleanup Automation Builder\unins000.exe" /VERYSILENT /SUPPRESSMSGBOXES
```

---

## 4. Windows 방화벽 규칙 사전 조용 등록 (Firewall Pre-Registration)

설치 완료 직전 `[Run]` 섹션(`runhidden waituntilterminated`)을 통해 사용자의 추가 보안 경고창 없이 Windows Defender 방화벽 인바운드 규칙을 조용히 등록합니다.

### 이중 등록 정책 (기본 이름 + 버전 포함 이름)
운영체제 방화벽 제어판 및 관리 도구 식별성을 위해 두 가지 규칙을 모두 등록합니다:

1. **기본 이름 규칙**:
   ```cmd
   netsh advfirewall firewall add rule name="Windows Disk Cleanup Automation Builder" dir=in action=allow program="C:\Program Files\Windows Disk Cleanup Automation Builder\DiskCleanupAuto.exe" enable=yes profile=any
   ```
2. **버전 포함 이름 규칙**:
   ```cmd
   netsh advfirewall firewall add rule name="Windows Disk Cleanup Automation Builder v1.6.0" dir=in action=allow program="C:\Program Files\Windows Disk Cleanup Automation Builder\DiskCleanupAuto.exe" enable=yes profile=any
   ```

### 안전한 언인스톨 정리
프로그램을 제거할 때(`[UninstallRun]` 섹션), 위에서 등록한 방화벽 규칙 2개를 모두 자동으로 검색하여 깨끗하게 삭제합니다:
```cmd
netsh advfirewall firewall delete rule name="Windows Disk Cleanup Automation Builder"
netsh advfirewall firewall delete rule name="Windows Disk Cleanup Automation Builder v1.6.0"
```


---

## 🪟 프로그램 추가/제거 (설정 앱) 관리
- 본 설치 프로그램(`WindowsDiskCleanup_Setup_v1.6.0.exe`)으로 설치된 애플리케이션은 Windows **설정 → 앱 → 설치된 앱(또는 제어판 프로그램 추가/제거)**에 공식 아이콘과 함께 정식 등록됩니다.
- 언제든지 [제거]를 클릭하여 설치 폴더 및 등록된 방화벽 인바운드 규칙을 한 번에 깨끗하게 소거할 수 있습니다.
