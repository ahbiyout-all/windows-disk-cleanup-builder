; =============================================================================
; Inno Setup 6.x Deployment Script
; Project: Windows Disk Cleanup Automation Builder (v1.5.0)
; Developer: AhBiYout (GitHub: AhBiYout-all)
; Official Blog: https://ahbiyoutvibe.blogspot.com/
; Copyright (c) 2026 AhBiYout. All rights reserved.
;
; [배포/설치 규격 및 진행 순서]
; 1. 기존 실행 중인 앱 프로세스 강제 종료 (Force Kill Running App)
; 2. 기존 설치 감지 시 삭제 후 설치 / 덮어쓰기 확인 대화상자 표시
; 3. MIT 라이선스 선언 및 동의 (LicenseFile=LICENSE)
; 4. 폴더 풀림(Unpacked Multi-File) 개별파일 설치 및 방화벽 규칙 자동 등록
; 5. 바탕화면 바로가기 기본 체크 ([Tasks] desktopicon)
; 6. 설치 완료 후 앱 자동 실행 ([Run] postinstall)
; 7. 무인 설치 지원 (/SILENT, /VERYSILENT, /SUPPRESSMSGBOXES) & 언인스톨 시 방화벽/레지스트리 정리
; =============================================================================

#define MyAppName "Windows Disk Cleanup Automation Builder"
#define MyAppVersion "1.5.0"
#define MyAppPublisher "AhBiYout"
#define MyAppPublisherURL "https://github.com/AhBiYout-all"
#define MyAppSupportURL "https://ahbiyoutvibe.blogspot.com/"
#define MyAppUpdatesURL "https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases"
#define MyAppExeName "DiskCleanupAuto.exe"
#define MyAppRawId "{E1D4A760-936B-4D12-9F89-A2BB5B30DE8C}"
#define MyAppId "{{E1D4A760-936B-4D12-9F89-A2BB5B30DE8C}"

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
VersionInfoCopyright=Copyright (c) 2026 {#MyAppPublisher}. All rights reserved.
VersionInfoProductName={#MyAppName}
VersionInfoProductVersion={#MyAppVersion}

; 라이선스 선언 및 무인 설치/인터페이스 설정
LicenseFile=LICENSE
DisableWelcomePage=no
DisableDirPage=auto
DisableProgramGroupPage=auto

[Languages]
Name: "korean"; MessagesFile: "compiler:Languages\Korean.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "japanese"; MessagesFile: "compiler:Languages\Japanese.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 6.1; Check: not IsAdminInstallMode

; =============================================================================
[Files]
; 1. PyInstaller onedir 빌드 결과물 전체 (Python 런타임 DLL, _internal 디렉터리 일괄 포함)
Source: "dist\DiskCleanupAuto\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs skipifsourcedoesntexist
; 2. 단일 파일 빌드(onefile)인 경우 dist 또는 Release 폴더의 EXE 전개 (어느 위치에 있든 DiskCleanupAuto.exe로 설치)
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "dist\DiskCleanupAuto_v{#MyAppVersion}.exe"; DestDir: "{app}"; DestName: "{#MyAppExeName}"; Flags: ignoreversion skipifsourcedoesntexist
Source: "Release\DiskCleanupAuto_v{#MyAppVersion}.exe"; DestDir: "{app}"; DestName: "{#MyAppExeName}"; Flags: ignoreversion skipifsourcedoesntexist
; 필수 아이콘 에셋 전개 (.aistudio 등 불필요 파일 제외)
Source: "assets\app.ico"; DestDir: "{app}\assets"; Flags: ignoreversion skipifsourcedoesntexist
; 루트 app.ico 폴백 복사
Source: "app.ico"; DestDir: "{app}\assets"; DestName: "app.ico"; Flags: ignoreversion skipifsourcedoesntexist
; 윈도우 작업 스케줄러 등록 스크립트
Source: "register_scheduler.bat"; DestDir: "{app}"; Flags: ignoreversion skipifsourcedoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\assets\app.ico"; Comment: "{#MyAppName}"
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
; 설치 완료 후 앱 실행 (기본 체크)
Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent shellexec

; =============================================================================
; [UninstallRun] 제거 시 방화벽 규칙 자동 소거 (Clean Uninstall)
; =============================================================================
[UninstallRun]
Filename: "netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName}"""; Flags: runhidden waituntilterminated
Filename: "netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName} v{#MyAppVersion}"""; Flags: runhidden waituntilterminated

; =============================================================================
; [Code] 1) 실행 중인 기존 앱 강제 종료 -> 2) 기존 설치 삭제/덮어쓰기 확인
; =============================================================================
[Code]
// 실행 중인 기존 앱 프로세스 강제 종료
procedure ForceKillRunningApp();
var
  ResultCode: Integer;
begin
  Exec('taskkill.exe', '/F /IM {#MyAppExeName} /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec('taskkill.exe', '/F /IM DiskCleanupAuto_v{#MyAppVersion}.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function GetUninstallKeyPath(): String;
begin
  Result := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppRawId}_is1';
end;

// 이전 버전 설치 여부 검사 함수
function GetInstalledVersion(): String;
var
  InstalledVer: String;
  KeyPath: String;
begin
  InstalledVer := '';
  KeyPath := GetUninstallKeyPath();
  if RegQueryStringValue(HKLM, KeyPath, 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
    Exit;
  end;
  if RegQueryStringValue(HKCU, KeyPath, 'DisplayVersion', InstalledVer) then
  begin
    Result := InstalledVer;
    Exit;
  end;
  Result := '';
end;

// 기존 언인스톨러 실행 경로 조회
function GetUninstallString(): String;
var
  UninstStr: String;
  KeyPath: String;
begin
  UninstStr := '';
  KeyPath := GetUninstallKeyPath();
  if RegQueryStringValue(HKLM, KeyPath, 'UninstallString', UninstStr) then
  begin
    Result := UninstStr;
    Exit;
  end;
  if RegQueryStringValue(HKCU, KeyPath, 'UninstallString', UninstStr) then
  begin
    Result := UninstStr;
    Exit;
  end;
  Result := '';
end;

// 기존 설치 무인 제거(삭제) 실행
function RunExistingUninstaller(): Boolean;
var
  UninstExe: String;
  ResultCode: Integer;
begin
  Result := True;
  UninstExe := RemoveQuotes(GetUninstallString());
  if (UninstExe <> '') and FileExists(UninstExe) then
  begin
    if not Exec(UninstExe, '/VERYSILENT /SUPPRESSMSGBOXES /NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
      Result := False;
  end;
end;

function InitializeSetup(): Boolean;
var
  PrevVersion: String;
  HasUninstaller: Boolean;
  PromptMsg: String;
  UserResponse: Integer;
begin
  Result := True;

  // [1단계] 기존 앱 실행 중일 경우 즉시 강제 종료
  ForceKillRunningApp();

  PrevVersion := GetInstalledVersion();
  HasUninstaller := (GetUninstallString() <> '');

  // [2단계] 기존 설치가 감지된 경우 삭제/덮어쓰기 사용자 확인
  if (PrevVersion <> '') or FileExists(ExpandConstant('{autopf}\{#MyAppName}\{#MyAppExeName}')) then
  begin
    // 무인/자동 설치 모드(/SILENT, /VERYSILENT)인 경우 묻지 않고 자동 덮어쓰기 진행
    if WizardSilent() then
    begin
      Result := True;
      Exit;
    end;

    if HasUninstaller then
    begin
      if ActiveLanguage() = 'english' then
        PromptMsg := Format('An existing version (v%s) is already installed.' + #13#10 + #13#10 +
                            '• [Yes]: Uninstall existing version and install v{#MyAppVersion}' + #13#10 +
                            '• [No]: Overwrite existing installation directly' + #13#10 +
                            '• [Cancel]: Abort setup', [PrevVersion])
      else if ActiveLanguage() = 'japanese' then
        PromptMsg := Format('旧バージョン (v%s) がすでにインストールされています。' + #13#10 + #13#10 +
                            '• [はい]: 旧バージョンを削除してから新規インストール (v{#MyAppVersion})' + #13#10 +
                            '• [いいえ]: 既存のインストールを上書きして続行' + #13#10 +
                            '• [キャンセル]: インストールを中止', [PrevVersion])
      else
        PromptMsg := Format('기존 버전(v%s)이 이미 설치되어 있습니다.' + #13#10 + #13#10 +
                            '• [예]: 기존 앱을 삭제(제거)한 후 v{#MyAppVersion} 새로 설치' + #13#10 +
                            '• [아니오]: 기존 설치 위에 바로 덮어쓰기 진행' + #13#10 +
                            '• [취소]: 설치 중단', [PrevVersion]);

      UserResponse := MsgBox(PromptMsg, mbConfirmation, MB_YESNOCANCEL);
      if UserResponse = IDYES then
      begin
        ForceKillRunningApp();
        RunExistingUninstaller();
        Result := True;
      end
      else if UserResponse = IDNO then
      begin
        Result := True;
      end
      else
      begin
        Result := False;
      end;
    end
    else
    begin
      if ActiveLanguage() = 'english' then
        PromptMsg := 'An existing installation was detected in the target folder.' + #13#10 + #13#10 +
                     'Do you want to overwrite it with v{#MyAppVersion}?' + #13#10 +
                     '(Click No to cancel installation.)'
      else if ActiveLanguage() = 'japanese' then
        PromptMsg := '同じフォルダに既存のインストールが検出されました。' + #13#10 + #13#10 +
                     '新バージョン (v{#MyAppVersion}) で上書きインストールしますか？' + #13#10 +
                     '(「いいえ」をクリックするとインストールを中止します。)'
      else
        PromptMsg := '동일한 경로에 기존 앱이 이미 설치되어 있습니다.' + #13#10 + #13#10 +
                     '기존 앱을 새 버전(v{#MyAppVersion})으로 덮어쓰시겠습니까?' + #13#10 +
                     '(아니오 클릭 시 설치가 중단됩니다.)';

      UserResponse := MsgBox(PromptMsg, mbConfirmation, MB_YESNO);
      Result := (UserResponse = IDYES);
    end;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  // 설치 직전 실행 중인 앱이 다시 열렸을 경우를 대비해 한 번 더 강제 종료
  ForceKillRunningApp();
  Result := '';
end;
