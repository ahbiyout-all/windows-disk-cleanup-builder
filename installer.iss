; =============================================================================
; Inno Setup 6.x Deployment Script
; Project: Windows Disk Cleanup Automation Builder (v1.5.0)
; Developer: AhBiYout (GitHub: AhBiYout-all)
; Official Blog: https://ahbiyoutvibe.blogspot.com/
; Affiliation: https://www.cisnet.co.kr
;
; [배포/설치 규격]
; 1. 폴더 풀림(Unpacked Multi-File) 개별파일 설치 구성 (불필요 문서 및 포터블 파일 제외)
; 2. 기존 설치 감지 시 덮어쓰기/삭제 확인 대화상자 표시
; 3. 무인 설치 지원 (/SILENT, /VERYSILENT, /SUPPRESSMSGBOXES)
; 4. Windows 방화벽 인바운드 규칙 사전에 조용히 등록 (기본 이름 및 버전 포함 이름 둘 다 등록)
; 5. 언인스톨 시 방화벽 규칙 및 관련 레지스트리 완전 제거
; =============================================================================

#define MyAppName "Windows Disk Cleanup Automation Builder"
#define MyAppVersion "1.5.0"
#define MyAppPublisher "AhBiYout"
#define MyAppPublisherURL "https://github.com/AhBiYout-all"
#define MyAppSupportURL "https://ahbiyoutvibe.blogspot.com/"
#define MyAppUpdatesURL "https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases"
#define MyAppExeName "DiskCleanupAuto.exe"
#define MyAppId "{{E1D4A760-936B-4D12-9F89-A2BB5B30DE8C}}"

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppPublisherURL}
AppSupportURL={#MyAppSupportURL}
AppUpdatesURL={#MyAppUpdatesURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=Output
OutputBaseFilename=WindowsDiskCleanup_Setup_v{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesInstallIn64BitMode=x64compatible
UninstallDisplayIcon={app}\assets\app.ico
SetupIconFile=assets\app.ico
UninstallDisplayName={#MyAppName} v{#MyAppVersion}
VersionInfoVersion={#MyAppVersion}.0
VersionInfoCompany=AhBiYout
VersionInfoDescription={#MyAppName} Setup
VersionInfoCopyright=Copyright (C) 2026 {#MyAppPublisher}. All rights reserved.
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

; 무인 설치 및 인터페이스 설정
DisableWelcomePage=no
DisableDirPage=auto
DisableProgramGroupPage=auto

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
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
Filename: "netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName}"" dir=in action=allow program=""{app}\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 2. 버전 정보 부착된 앱 이름 방화벽 규칙 조용히 등록
Filename: "netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName} v{#MyAppVersion}"" dir=in action=allow program=""{app}\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 설치 완료 후 앱 실행 (옵션)
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent runascurrentuser

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
  if RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppId}_is1', 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
    Exit;
  end;
  if RegQueryStringValue(HKCU, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppId}_is1', 'DisplayVersion', InstalledVer) then
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
  if (PrevVersion <> '') or FileExists(ExpandConstant('{pf}\{#MyAppName}\{#MyAppExeName}')) then
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
