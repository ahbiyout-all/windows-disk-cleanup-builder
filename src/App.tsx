/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ItemSelector } from './components/ItemSelector';
import { ConfigPanel } from './components/ConfigPanel';
import { CodeViewer } from './components/CodeViewer';
import { SimulatorModal } from './components/SimulatorModal';
import { ArchitectureGuide } from './components/ArchitectureGuide';
import { QuickFaq } from './components/QuickFaq';
import {
  WINDOWS_CLEANUP_ITEMS,
  PRESET_SAFE_IDS,
  PRESET_RECOMMENDED_IDS,
  PRESET_DEEP_IDS,
} from './data/cleanupItems';
import {
  generatePythonGuiScript,
  generatePythonCliScript,
  generatePythonSilentScript,
  generatePythonDeepScript,
  generatePyInstallerBatchScript,
  generateWindowsVersionInfo,
  generateInnoSetupScript,
  generateGitHubWorkflowYaml,
  generateGitPushBatchScript,
  generatePowerShellScript,
  generateBatchScript,
  generateTaskSchedulerCommands,
} from './utils/codeGenerators';
import {
  CURRENT_VERSION,
  DEVELOPER_NAME,
  GITHUB_USERNAME,
  GITHUB_REPO_NAME,
  GITHUB_REPO_URL,
  GITHUB_RELEASES_URL,
  GITHUB_API_LATEST_RELEASE,
  BLOG_URL,
  COMPANY_URL,
  COMPANY_NAME,
} from './version';
import { UpdateModal, UpdateInfo } from './components/UpdateModal';
import { ScriptConfig, ScriptMode, PresetType } from './types';
import {
  HardDrive,
  Sparkles,
  ShieldCheck,
  Zap,
  Terminal,
  Download,
  Copy,
  Check,
  Play,
  Layers,
  Bell,
  ExternalLink,
  Workflow,
  GitBranch,
} from 'lucide-react';

export default function App() {
  // Preset & Selection state
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('recommended');
  const [selectedIds, setSelectedIds] = useState<string[]>(PRESET_RECOMMENDED_IDS);

  // Configuration state
  const [config, setConfig] = useState<ScriptConfig>({
    sagesetId: 1,
    autoUacElevation: true,
    cleanWindowsOldForce: true,
    safeguardUserFiles: true,
    cleanTempDirs: true,
    cleanDism: true,
    flushDns: false,
    emptyRecycleBinDirect: true,
    logToFile: true,
    logFileName: 'disk_cleanup_audit.log',
    autoCloseTimeoutSec: 3,
    uiTitle: `DiskCleanupAuto (${CURRENT_VERSION})`,
    companyName: 'CISNET CORPORATION',
    developerName: 'AhBiYout',
    companyUrl: 'http://www.cisnet.co.kr/',
    blogUrl: 'https://ahbiyoutvibe.blogspot.com/',
    exeName: 'DiskCleanupAuto',
    exeNoConsole: true,
    exeUacAdmin: true,
    exeCleanArtifacts: true,
    scheduleFrequency: 'WEEKLY',
    scheduleTime: '03:00',
    scheduleDayOfWeek: 'SUN',
    scheduleTaskName: 'WindowsAutoDiskCleanup',
  });

  // Active code viewing tab
  const [activeMode, setActiveMode] = useState<ScriptMode>('python_gui');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // GitHub Releases 실시간 자동 업데이트 알림 상태
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [hasUpdateBadge, setHasUpdateBadge] = useState<boolean>(false);

  // GitHub Releases API 실시간 버전 확인 함수
  const checkForUpdates = async (autoPopupOnUpdate: boolean = false) => {
    setIsCheckingUpdate(true);
    try {
      const resp = await fetch(GITHUB_API_LATEST_RELEASE, {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });
      if (resp.ok) {
        const data = await resp.json();
        const latestTag = (data.tag_name || '').trim();
        const hasNewer = Boolean(latestTag && latestTag !== CURRENT_VERSION);
        const info: UpdateInfo = {
          hasUpdate: hasNewer,
          latestVersion: latestTag || CURRENT_VERSION,
          releaseTitle: data.name || `${latestTag || CURRENT_VERSION} 최신 릴리스`,
          releaseNotes: data.body || 'Windows 11 디스크 정리 엔진 최적화 및 빌더 업데이트',
          publishedAt: data.published_at ? new Date(data.published_at).toLocaleDateString() : '최신 릴리스',
          releaseUrl: data.html_url || GITHUB_RELEASES_URL,
          assets: data.assets?.map((a: any) => ({
            name: a.name,
            size: (a.size / 1024 / 1024).toFixed(1) + ' MB',
            type: a.name.endsWith('.exe') ? 'windows' : 'other',
            url: a.browser_download_url,
          })) || [],
        };
        setUpdateInfo(info);
        if (hasNewer) {
          setHasUpdateBadge(true);
          if (autoPopupOnUpdate) {
            setIsUpdateModalOpen(true);
          }
        }
      } else {
        // 기본 릴리스 메타데이터 설정
        setUpdateInfo({
          hasUpdate: false,
          latestVersion: CURRENT_VERSION,
          releaseTitle: `${CURRENT_VERSION} 안정화 버전`,
          releaseNotes: 'Node.js 22 LTS 전환 및 Inno Setup 개별파일 언팩 설치기 지원',
          publishedAt: '2026-10-10',
          releaseUrl: GITHUB_RELEASES_URL,
          assets: [
            { name: `WindowsDiskCleanup_Setup_${CURRENT_VERSION}.exe`, type: 'windows', url: GITHUB_RELEASES_URL },
          ],
        });
      }
    } catch {
      setUpdateInfo({
        hasUpdate: false,
        latestVersion: CURRENT_VERSION,
        releaseTitle: `${CURRENT_VERSION} 로컬 버전`,
        releaseNotes: 'GitHub Releases 네트워크 연결 대기 중',
        publishedAt: '2026-10-10',
        releaseUrl: GITHUB_RELEASES_URL,
        assets: [],
      });
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  // 컴포넌트 마운트 시 실시간 업데이트 체크 실행 (업데이트 감지 시 팝업창 자동 실행)
  React.useEffect(() => {
    checkForUpdates(true);
  }, []);

  // 업데이트 알림 팝업창 테스트 시뮬레이션 핸들러
  const triggerSimulatedUpdate = () => {
    setUpdateInfo({
      hasUpdate: true,
      latestVersion: 'v1.5.1',
      releaseTitle: 'v1.5.1 패치 릴리스 (Windows 데스크톱 최적화 및 인스톨러 배포)',
      releaseNotes: 'Node.js 22 LTS 워크플로 및 Inno Setup 방화벽 자동 등록 규칙이 업데이트되었습니다.',
      publishedAt: new Date().toLocaleDateString(),
      releaseUrl: GITHUB_RELEASES_URL,
      assets: [
        { name: 'WindowsDiskCleanup_Setup_v1.5.1.exe', type: 'windows', url: GITHUB_RELEASES_URL },
      ],
    });
    setHasUpdateBadge(true);
    setIsUpdateModalOpen(true);
  };

  // Preset switch handler
  const handleSelectPreset = (preset: PresetType) => {
    setSelectedPreset(preset);
    if (preset === 'safe') {
      setSelectedIds(PRESET_SAFE_IDS);
    } else if (preset === 'recommended') {
      setSelectedIds(PRESET_RECOMMENDED_IDS);
    } else if (preset === 'deep') {
      setSelectedIds(PRESET_DEEP_IDS);
    }
  };

  // Item toggle handler
  const handleToggleItem = (id: string) => {
    setSelectedPreset('custom');
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedPreset('deep');
    setSelectedIds(WINDOWS_CLEANUP_ITEMS.map((i) => i.id));
  };

  const handleDeselectAll = () => {
    setSelectedPreset('custom');
    setSelectedIds([]);
  };

  const handleChangeConfig = (newCfg: Partial<ScriptConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  // Generated code map
  const codeMap = useMemo(() => {
    const taskCmds = generateTaskSchedulerCommands(config);
    const taskSchedulerCode = `# =============================================================================
# Windows 작업 스케줄러 (Task Scheduler) 등록 가이드
# =============================================================================

# [방법 1] 관리자 권한 명령 프롬프트(CMD)에서 원클릭 등록 명령어:
${taskCmds.cmdCommand}

# [방법 2] 관리자 권한 PowerShell에서 원클릭 등록 명령어:
${taskCmds.psCommand}

# 설명:
# ${taskCmds.explanation}
# 등록 확인: taskschd.msc 를 실행하여 '${config.scheduleTaskName}' 작업 확인 가능.
`;

    return {
      python_gui: generatePythonGuiScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      build_bat: generatePyInstallerBatchScript(config),
      inno_setup: generateInnoSetupScript(config),
      github_workflow: generateGitHubWorkflowYaml(config),
      git_push_bat: generateGitPushBatchScript(config),
      version_info: generateWindowsVersionInfo(config),
      python_cli: generatePythonCliScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      python_silent: generatePythonSilentScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      python_deep: generatePythonDeepScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      powershell: generatePowerShellScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      batch: generateBatchScript(WINDOWS_CLEANUP_ITEMS, selectedIds, config),
      task_scheduler: taskSchedulerCode,
    };
  }, [selectedIds, config]);

  // Copy handler with Windows CRLF support
  const handleCopy = (text: string) => {
    const crlfText = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    navigator.clipboard.writeText(crlfText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Download file handler
  const handleDownload = (mode: ScriptMode, text: string) => {
    let filename = 'disk_cleanup_gui.py';
    let mimeType = 'text/plain;charset=utf-8';

    if (mode === 'python_gui') filename = 'disk_cleanup_gui.py';
    else if (mode === 'build_bat') filename = 'build_exe.bat';
    else if (mode === 'inno_setup') filename = 'installer.iss';
    else if (mode === 'github_workflow') filename = 'release.yml';
    else if (mode === 'git_push_bat') filename = 'git_push.bat';
    else if (mode === 'version_info') filename = 'version_info.txt';
    else if (mode === 'python_cli') filename = 'disk_cleanup_cli.py';
    else if (mode === 'python_silent') filename = 'disk_cleanup_silent.py';
    else if (mode === 'python_deep') filename = 'disk_cleanup_deep.py';
    else if (mode === 'powershell') filename = 'disk_cleanup.ps1';
    else if (mode === 'batch') filename = 'disk_cleanup.bat';
    else if (mode === 'task_scheduler') filename = 'register_scheduler.bat';

    // Windows Batch and PowerShell scripts REQUIRE Windows CRLF (\r\n) line endings!
    let fileContent = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');

    // PowerShell benefits from UTF-8 BOM, but Windows .bat files MUST NOT have BOM
    if (filename.endsWith('.ps1')) {
      fileContent = '\uFEFF' + fileContent;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onToggleGuide={() => setShowGuide(!showGuide)}
        showGuide={showGuide}
        selectedCount={selectedIds.length}
        totalCount={WINDOWS_CLEANUP_ITEMS.length}
        onCopyCurrentCode={() => handleCopy(codeMap[activeMode])}
        copied={copied}
        onDownloadCurrentCode={() => handleDownload(activeMode, codeMap[activeMode])}
        onOpenUpdateModal={() => setIsUpdateModalOpen(true)}
        hasUpdateBadge={hasUpdateBadge}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Hero Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> UAC 관리자 권한 자동 승격 지원
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  <Zap className="h-3.5 w-3.5" /> cleanmgr /sagerun:{config.sagesetId}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-700/10">
                  <Workflow className="h-3.5 w-3.5" /> Node 22 LTS CI/CD
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 ring-1 ring-inset ring-sky-700/10">
                  <ShieldCheck className="h-3.5 w-3.5" /> Inno Setup 방화벽 등록
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Windows 디스크 정리 자동화 파이썬 스크립트
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Windows 레지스트리의 <code className="font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded">VolumeCaches</code>를 
                자동 활성화하고 <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">cleanmgr.exe</code>를 
                무인 실행하는 완성형 파이썬 스크립트입니다. <strong>Tkinter GUI</strong>, <strong>Inno Setup 언팩 설치기</strong>, <strong>GitHub Actions CI/CD (Node 22 LTS)</strong>, <strong>git_push.bat (개인정보 차단)</strong>를 지원합니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="hero-check-update-btn"
                onClick={() => setIsUpdateModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="GitHub Releases 실시간 자동 업데이트 알림 팝업 열기"
              >
                <Bell className="h-4 w-4 text-amber-600" />
                <span>업데이트 알림 팝업</span>
              </button>

              <button
                id="hero-run-sim-btn"
                onClick={() => setIsSimulatorOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="h-4 w-4 fill-current text-emerald-400" />
                <span>가상 실행 시뮬레이터</span>
              </button>

              <button
                id="hero-download-py-btn"
                onClick={() => handleDownload('python_gui', codeMap['python_gui'])}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>.py 소스 다운로드</span>
              </button>

              <button
                id="hero-download-bat-btn"
                onClick={() => handleDownload('build_bat', codeMap['build_bat'])}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                <span>build_exe.bat</span>
              </button>

              <button
                id="hero-download-inno-btn"
                onClick={() => handleDownload('inno_setup', codeMap['inno_setup'])}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="Inno Setup 6.x 언팩 개별 설치 스크립트 (.iss)"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>installer.iss</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Items & Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <ItemSelector
              items={WINDOWS_CLEANUP_ITEMS}
              selectedIds={selectedIds}
              onToggleItem={handleToggleItem}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            <ConfigPanel config={config} onChangeConfig={handleChangeConfig} />
          </div>

          {/* Right Column: Code Viewer */}
          <div className="lg:col-span-7 flex flex-col min-h-[640px]">
            <CodeViewer
              activeMode={activeMode}
              onSelectMode={setActiveMode}
              codeMap={codeMap}
              onCopy={handleCopy}
              onDownload={handleDownload}
              copied={copied}
            />
          </div>
        </div>

        {/* Deep Guide Section (Accordion / Collapsible or Toggleable) */}
        {showGuide && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <ArchitectureGuide />
          </div>
        )}

        {/* Always visible FAQ & Architecture summary */}
        {!showGuide && <ArchitectureGuide />}

        <QuickFaq />
      </main>

      {/* Simulator Modal */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        items={WINDOWS_CLEANUP_ITEMS}
        selectedIds={selectedIds}
        config={config}
      />

      {/* Real-time GitHub Releases Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
        isChecking={isCheckingUpdate}
        onCheckAgain={() => checkForUpdates(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="font-semibold text-slate-700">Windows cleanmgr & winreg 자동화 스크립트 빌더</span>
            <span className="text-slate-300">|</span>
            <span>개발자: <strong className="text-slate-900 font-bold">{DEVELOPER_NAME}</strong> (<a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@{GITHUB_USERNAME}</a>)</span>
            <span className="text-slate-300">|</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 hover:underline font-medium inline-flex items-center gap-1"
            >
              🐙 GitHub 저장소
            </a>
            <span className="text-slate-300">|</span>
            <a
              href={BLOG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline font-medium inline-flex items-center gap-1"
            >
              📝 공식 구글 블로그 (AhBiYoutVibe)
            </a>
            <span className="text-slate-300">|</span>
            <a
              href={COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
            >
              🏢 {COMPANY_NAME}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="text-amber-700 hover:underline font-bold inline-flex items-center gap-1"
            >
              <Bell className="h-3.5 w-3.5 text-amber-600" />
              <span>업데이트 확인</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="text-blue-600 hover:underline font-medium"
            >
              동작 시뮬레이터 열기
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              {showGuide ? '가이드 접기' : '동작 원리 가이드'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
