; =============================================================================
; Inno Setup 6.x Deployment Script
; Project: Windows Disk Cleanup Automation Builder (v1.5.0)
; Developer: AhBiYout (GitHub: AhBiYout-all)
; Official Blog: https://ahbiyoutvibe.blogspot.com/
; Copyright (c) 2026 AhBiYout. All rights reserved.
;
; [배포/설치 규격 및 진행 순서]
; 1. 기존 실행 중인 앱 프로세스 강제 종료 (Force Kill Running App)
; 2. 기존 설치 감지 시 기존 버전 완전 제거 후 새로 설치 확인 대화상자 표시
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
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName}"" dir=in action=allow program=""{app}\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 2. 버전 정보 부착된 앱 이름 방화벽 규칙 조용히 등록
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall add rule name=""{#MyAppName} v{#MyAppVersion}"" dir=in action=allow program=""{app}\{#MyAppExeName}"" enable=yes profile=any"; Flags: runhidden waituntilterminated
; 설치 완료 후 앱 실행 (기본 체크)
Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent shellexec

; =============================================================================
; [UninstallRun] 제거 시 방화벽 규칙 자동 소거 (Clean Uninstall)
; =============================================================================
[UninstallRun]
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName}"""; RunOnceId: "DelFwBase"; Flags: runhidden waituntilterminated
Filename: "{sys}\netsh.exe"; Parameters: "advfirewall firewall delete rule name=""{#MyAppName} v{#MyAppVersion}"""; RunOnceId: "DelFwVer"; Flags: runhidden waituntilterminated

; =============================================================================
; [Code] 1) 실행 중인 기존 앱 강제 종료 -> 2) 기존 설치 완전 제거 후 새로 설치
; =============================================================================
[Code]
// 실행 중인 기존 앱 프로세스 강제 종료 (모든 버전 및 포터블 바이너리 포함)
procedure ForceKillRunningApp();
var
  ResultCode: Integer;
  TaskkillExe: String;
begin
  TaskkillExe := ExpandConstant('{sys}\taskkill.exe');
  Exec(TaskkillExe, '/F /IM {#MyAppExeName} /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  Exec(TaskkillExe, '/F /IM DiskCleanupAuto*.exe /T', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
end;

function QueryUninstallValue(const SubKey, ValueName: String; var OutVal: String): Boolean;
begin
  Result := False;
  OutVal := '';
  if RegQueryStringValue(HKLM, SubKey, ValueName, OutVal) and (OutVal <> '') then
  begin
    Result := True;
    Exit;
  end;
  if IsWin64 then
  begin
    if RegQueryStringValue(HKLM32, SubKey, ValueName, OutVal) and (OutVal <> '') then
    begin
      Result := True;
      Exit;
    end;
  end;
  if RegQueryStringValue(HKCU, SubKey, ValueName, OutVal) and (OutVal <> '') then
  begin
    Result := True;
    Exit;
  end;
end;

function FindRegUninstallInfo(const ValueName: String): String;
var
  KeyCandidates: array[0..2] of String;
  I: Integer;
  Val: String;
begin
  KeyCandidates[0] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppRawId}_is1';
  KeyCandidates[1] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{{#MyAppRawId}_is1';
  KeyCandidates[2] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppName}_is1';

  for I := 0 to 2 do
  begin
    if QueryUninstallValue(KeyCandidates[I], ValueName, Val) then
    begin
      Result := Val;
      Exit;
    end;
  end;
  Result := '';
end;

// 이전 버전 설치 버전 문자열 조회
function GetInstalledVersion(): String;
begin
  Result := FindRegUninstallInfo('DisplayVersion');
end;

// UninstallString에서 실행 파일 경로만 정밀 추출 (따옴표·인자 포함 대응)
function ExtractUninstExePath(const RawCmd: String): String;
var
  S: String;
  EndQuotePos: Integer;
  ExePos: Integer;
begin
  Result := '';
  S := Trim(RawCmd);
  if S = '' then
    Exit;

  if S[1] = '"' then
  begin
    Delete(S, 1, 1);
    EndQuotePos := Pos('"', S);
    if EndQuotePos > 1 then
      Result := Trim(Copy(S, 1, EndQuotePos - 1))
    else
      Result := Trim(S);
    Exit;
  end;

  ExePos := Pos('.exe', Lowercase(S));
  if ExePos > 0 then
    Result := Trim(Copy(S, 1, ExePos + 3))
  else
    Result := RemoveQuotes(S);
end;

// 기존 언인스톨러 실행 경로 조회 (레지스트리 UninstallString -> InstallLocation -> 기본 폴더 unins000.exe)
function GetExistingUninstallerExe(): String;
var
  UninstStr: String;
  RegInstallDir: String;
  CandidateExe: String;
begin
  UninstStr := Trim(FindRegUninstallInfo('UninstallString'));
  if UninstStr <> '' then
  begin
    CandidateExe := ExtractUninstExePath(UninstStr);
    if (CandidateExe <> '') and FileExists(CandidateExe) then
    begin
      Result := CandidateExe;
      Exit;
    end;
  end;

  RegInstallDir := RemoveBackslashUnlessRoot(RemoveQuotes(Trim(FindRegUninstallInfo('InstallLocation'))));
  if RegInstallDir <> '' then
  begin
    CandidateExe := RegInstallDir + '\unins000.exe';
    if FileExists(CandidateExe) then
    begin
      Result := CandidateExe;
      Exit;
    end;
  end;

  CandidateExe := ExpandConstant('{autopf}\{#MyAppName}\unins000.exe');
  if FileExists(CandidateExe) then
  begin
    Result := CandidateExe;
    Exit;
  end;

  Result := '';
end;

// 안전하게 기존 설치 폴더 비우기 (드라이브 루트 및 시스템 경로 제외, 앱 식별 검증)
procedure SafeRemoveAppDir(const TargetDir: String; ForceVerifiedDir: Boolean);
var
  CleanDir: String;
  IsAppFolder: Boolean;
begin
  CleanDir := RemoveBackslashUnlessRoot(Trim(TargetDir));
  if (Length(CleanDir) <= 3) or (not DirExists(CleanDir)) then
    Exit;
  if Lowercase(CleanDir) = Lowercase(RemoveBackslashUnlessRoot(ExpandConstant('{autopf}'))) then
    Exit;

  IsAppFolder := ForceVerifiedDir or
                 (Pos(Lowercase('{#MyAppName}'), Lowercase(CleanDir)) > 0) or
                 FileExists(CleanDir + '\{#MyAppExeName}') or
                 FileExists(CleanDir + '\DiskCleanupAuto_v{#MyAppVersion}.exe') or
                 FileExists(CleanDir + '\register_scheduler.bat') or
                 FileExists(CleanDir + '\unins000.exe');
  if IsAppFolder then
  begin
    DelTree(CleanDir, True, True, True);
  end;
end;

// 고아 언인스톨 레지스트리 키 정리 (언인스톨러 실행 파일이 없던 경우 대비)
procedure CleanupOrphanUninstallKeys();
var
  KeyCandidates: array[0..2] of String;
  I: Integer;
begin
  KeyCandidates[0] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppRawId}_is1';
  KeyCandidates[1] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{{#MyAppRawId}_is1';
  KeyCandidates[2] := 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{#MyAppName}_is1';

  for I := 0 to 2 do
  begin
    if RegKeyExists(HKLM, KeyCandidates[I]) then
      RegDeleteKeyIncludingSubkeys(HKLM, KeyCandidates[I]);
    if IsWin64 and RegKeyExists(HKLM32, KeyCandidates[I]) then
      RegDeleteKeyIncludingSubkeys(HKLM32, KeyCandidates[I]);
    if RegKeyExists(HKCU, KeyCandidates[I]) then
      RegDeleteKeyIncludingSubkeys(HKCU, KeyCandidates[I]);
  end;
end;

// 기존 설치 완전 제거 (프로세스 종료 -> 언인스톨러 무인 실행 -> 잔여 폴더/레지스트리 정리)
procedure RemoveExistingInstallation();
var
  UninstExe: String;
  UninstDir: String;
  RegInstallDir: String;
  DefaultAppDir: String;
  ResultCode: Integer;
  WaitCount: Integer;
begin
  ForceKillRunningApp();

  RegInstallDir := RemoveQuotes(Trim(FindRegUninstallInfo('InstallLocation')));
  DefaultAppDir := ExpandConstant('{autopf}\{#MyAppName}');
  UninstExe := GetExistingUninstallerExe();
  UninstDir := '';
  if UninstExe <> '' then
    UninstDir := ExtractFileDir(UninstExe);

  if (UninstExe <> '') and FileExists(UninstExe) then
  begin
    Exec(UninstExe, '/VERYSILENT /SUPPRESSMSGBOXES /NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    // Inno Setup unins000.exe spawns a temp child process to delete itself; wait until it finishes
    WaitCount := 0;
    while FileExists(UninstExe) and (WaitCount < 50) do
    begin
      Sleep(200);
      WaitCount := WaitCount + 1;
    end;
  end;

  ForceKillRunningApp();
  if UninstDir <> '' then
    SafeRemoveAppDir(UninstDir, True);
  SafeRemoveAppDir(RegInstallDir, RegInstallDir <> '');
  SafeRemoveAppDir(DefaultAppDir, False);
  CleanupOrphanUninstallKeys();
end;

function InitializeSetup(): Boolean;
var
  PrevVersion: String;
  UninstExe: String;
  RegInstallDir: String;
  DefaultAppDir: String;
  HasExistingApp: Boolean;
  PromptMsg: String;
  UserResponse: Integer;
begin
  Result := True;

  // [1단계] 기존 앱 실행 중일 경우 즉시 강제 종료
  ForceKillRunningApp();

  PrevVersion := GetInstalledVersion();
  UninstExe := GetExistingUninstallerExe();
  RegInstallDir := RemoveBackslashUnlessRoot(RemoveQuotes(Trim(FindRegUninstallInfo('InstallLocation'))));
  DefaultAppDir := ExpandConstant('{autopf}\{#MyAppName}');
  HasExistingApp := (PrevVersion <> '') or (UninstExe <> '') or
                    ((RegInstallDir <> '') and FileExists(RegInstallDir + '\{#MyAppExeName}')) or
                    FileExists(DefaultAppDir + '\{#MyAppExeName}') or
                    FileExists(DefaultAppDir + '\DiskCleanupAuto_v{#MyAppVersion}.exe');

  // [2단계] 기존 설치가 감지된 경우 덮어쓰지 않고 기존 버전을 완전히 제거 후 새로 설치
  if HasExistingApp then
  begin
    // 무인/자동 설치 모드(/SILENT, /VERYSILENT)에서도 기존 버전을 먼저 깨끗이 제거 후 재설치
    if WizardSilent() then
    begin
      RemoveExistingInstallation();
      Result := True;
      Exit;
    end;

    if ActiveLanguage() = 'english' then
    begin
      if PrevVersion <> '' then
        PromptMsg := Format('An existing version (v%s) is already installed.', [PrevVersion])
      else
        PromptMsg := 'An existing installation was detected on this PC.';
      PromptMsg := PromptMsg + #13#10 + #13#10 +
                   'Do you want to remove the existing version and perform a clean install of v{#MyAppVersion}?' + #13#10 +
                   '(Click No to cancel installation.)';
    end
    else if ActiveLanguage() = 'japanese' then
    begin
      if PrevVersion <> '' then
        PromptMsg := Format('旧バージョン (v%s) がすでにインストールされています。', [PrevVersion])
      else
        PromptMsg := '既存のインストールが検出されました。';
      PromptMsg := PromptMsg + #13#10 + #13#10 +
                   '旧バージョンを完全に削除してから新バージョン (v{#MyAppVersion}) をクリーンインストールしますか？' + #13#10 +
                   '(「いいえ」をクリックするとインストールを中止します。)';
    end
    else
    begin
      if PrevVersion <> '' then
        PromptMsg := Format('기존 버전(v%s)이 이미 설치되어 있습니다.', [PrevVersion])
      else
        PromptMsg := '동일한 경로에 기존 앱이 이미 설치되어 있습니다.';
      PromptMsg := PromptMsg + #13#10 + #13#10 +
                   '기존 앱을 완전히 제거(삭제)한 후 새 버전(v{#MyAppVersion})을 새로 설치하시겠습니까?' + #13#10 +
                   '(아니오 클릭 시 설치가 중단됩니다.)';
    end;

    UserResponse := MsgBox(PromptMsg, mbConfirmation, MB_YESNO);
    if UserResponse = IDYES then
    begin
      RemoveExistingInstallation();
      Result := True;
    end
    else
    begin
      Result := False;
    end;
  end;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  // 설치 직전 실행 중인 앱이 다시 열렸을 경우를 대비해 한 번 더 강제 종료
  ForceKillRunningApp();
  Result := '';
end;
