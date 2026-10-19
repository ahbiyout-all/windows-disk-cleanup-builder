import React, { useState } from 'react';
import { ScriptMode } from '../types';
import {
  Copy,
  Check,
  Download,
  Terminal,
  Code2,
  Sparkles,
  FileCode2,
  Command,
  Cpu,
  Columns,
  Square,
  Package,
  FileText,
  ShieldCheck,
  Workflow,
  GitBranch,
  AlertCircle,
} from 'lucide-react';

interface CodeViewerProps {
  activeMode: ScriptMode;
  onSelectMode: (mode: ScriptMode) => void;
  codeMap: Record<ScriptMode, string>;
  onCopy: (text: string) => void;
  onDownload: (mode: ScriptMode, text: string) => void;
  copied: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  activeMode,
  onSelectMode,
  codeMap,
  onCopy,
  onDownload,
  copied,
}) => {
  const [viewLayout, setViewLayout] = useState<'single' | 'split'>('single');
  const [copiedBat, setCopiedBat] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);

  const currentCode = codeMap[activeMode] || '';
  const pythonCode = codeMap['python_gui'] || '';
  const batCode = codeMap['build_bat'] || '';

  const tabs: { id: ScriptMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'python_gui', label: 'Python (GUI Tkinter)', icon: <Code2 className="h-4 w-4" />, badge: '소스코드' },
    { id: 'build_bat', label: 'build_exe.bat (EXE 빌더)', icon: <Cpu className="h-4 w-4" />, badge: '순차/CRLF' },
    { id: 'inno_setup', label: 'Inno Setup (installer.iss)', icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />, badge: '언팩/방화벽/무인' },
    { id: 'github_workflow', label: 'GitHub CI/CD (release.yml)', icon: <Workflow className="h-4 w-4 text-sky-500" />, badge: 'Node 22 LTS' },
    { id: 'git_push_bat', label: 'git_push.bat (GitHub 자동 푸시)', icon: <GitBranch className="h-4 w-4 text-orange-500" />, badge: '개인정보 차단' },
    { id: 'version_info', label: '파일 속성 (version_info.txt)', icon: <FileText className="h-4 w-4" />, badge: 'PE 메타' },
    { id: 'python_cli', label: 'Python (CLI 콘솔)', icon: <Terminal className="h-4 w-4" /> },
    { id: 'python_silent', label: 'Python (무인 백그라운드)', icon: <Sparkles className="h-4 w-4" />, badge: '스케줄러용' },
    { id: 'python_deep', label: 'Python (초강력 딥클린)', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'powershell', label: 'PowerShell (.ps1)', icon: <FileCode2 className="h-4 w-4" /> },
    { id: 'batch', label: '디스크정리 (.bat)', icon: <Terminal className="h-4 w-4" /> },
    { id: 'task_scheduler', label: '작업 스케줄러 등록', icon: <Command className="h-4 w-4" /> },
  ];

  const handleCopySpecific = (text: string, isBat: boolean) => {
    const crlfText = text.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
    navigator.clipboard.writeText(crlfText);
    if (isBat) {
      setCopiedBat(true);
      setTimeout(() => setCopiedBat(false), 2000);
    } else {
      setCopiedPy(true);
      setTimeout(() => setCopiedPy(false), 2000);
    }
  };

  const handleDownloadBoth = () => {
    onDownload('python_gui', pythonCode);
    setTimeout(() => {
      onDownload('build_bat', batCode);
    }, 400);
  };

  const renderCodeBlock = (code: string, maxHeightClass = 'max-h-[560px]') => {
    const lines = code.split('\n');
    return (
      <div className={`relative flex-1 bg-slate-950 font-mono text-xs text-slate-100 overflow-auto ${maxHeightClass} p-4`}>
        <pre className="flex">
          {/* Line Numbers */}
          <div className="select-none pr-3 text-right text-slate-600 font-mono border-r border-slate-800 mr-3 text-[11px]">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code Content */}
          <code className="flex-1 text-slate-200 leading-relaxed font-mono whitespace-pre text-[11px]">
            {lines.map((line, idx) => {
              let lineClass = 'text-slate-200';
              if (line.trim().startsWith('#') || line.trim().startsWith('::') || line.trim().startsWith('"""')) {
                lineClass = 'text-slate-500 italic';
              } else if (line.includes('def ') || line.includes('set OPTS') || line.includes('set EXE_NAME')) {
                lineClass = 'text-amber-300';
              } else if (line.includes('import ') || line.includes('from ') || line.includes('@echo off')) {
                lineClass = 'text-purple-300 font-semibold';
              } else if (line.includes('cleanmgr.exe') || line.includes('pyinstaller') || line.includes('/sagerun')) {
                lineClass = 'text-emerald-300 font-semibold';
              } else if (line.includes('winreg.') || line.includes('ctypes.') || line.includes('PyInstaller')) {
                lineClass = 'text-sky-300';
              }

              return (
                <div key={idx} className={lineClass}>
                  {line || ' '}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col h-full">
      {/* Top Controls Header */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">자동화 스크립트 & 빌드 파이프라인</h2>
          </div>

          {/* Layout Switcher & Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg bg-slate-200/80 p-0.5 border border-slate-300">
              <button
                id="layout-single-btn"
                onClick={() => setViewLayout('single')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewLayout === 'single'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="단일 탭 보기"
              >
                <Square className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">단일 탭</span>
              </button>
              <button
                id="layout-split-btn"
                onClick={() => setViewLayout('split')}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewLayout === 'split'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="소스 + build_exe.bat 2분할 나란히 보기"
              >
                <Columns className="h-3.5 w-3.5" />
                <span>소스+build_exe 2분할</span>
              </button>
            </div>

            {/* Bundle Download */}
            <button
              id="download-bundle-btn"
              onClick={handleDownloadBoth}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              title="Python 소스(.py)와 build_exe.bat 파일을 한 번에 다운로드"
            >
              <Package className="h-3.5 w-3.5" />
              <span>세트 일괄 다운로드 (.py + .bat)</span>
            </button>
          </div>
        </div>

        {/* Tab selector when in single mode */}
        {viewLayout === 'single' && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
            {tabs.map((tab) => {
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => onSelectMode(tab.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg font-bold shadow-xs'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                        tab.id === 'build_bat'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100/80 text-blue-700'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Editor Body */}
      {viewLayout === 'single' ? (
        <div className="flex-1 flex flex-col">
          {/* Action Bar for Single View */}
          <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sky-400">
                {activeMode === 'build_bat'
                  ? 'build_exe.bat'
                  : activeMode === 'version_info'
                  ? 'version_info.txt'
                  : activeMode === 'inno_setup'
                  ? 'installer.iss'
                  : activeMode === 'github_workflow'
                  ? '.github/workflows/release.yml'
                  : activeMode === 'git_push_bat'
                  ? 'git_push.bat'
                  : activeMode === 'powershell'
                  ? 'disk_cleanup.ps1'
                  : activeMode === 'batch'
                  ? 'disk_cleanup.bat'
                  : activeMode === 'task_scheduler'
                  ? 'register_scheduler.bat'
                  : `${activeMode}.py`}
              </span>
              <span className="text-[11px] text-slate-500">
                {activeMode === 'build_bat'
                  ? '(PyInstaller 6단계 순차 빌더 · cd /d %~dp0 경로 고정 · Windows CRLF)'
                  : activeMode === 'version_info'
                  ? '(Windows 파일 속성 > 자세히 탭 메타데이터 리소스)'
                  : activeMode === 'inno_setup'
                  ? '(Inno Setup 개별파일 언팩 · 방화벽 사전 조용히 등록 · 기존설치 확인 · 무인 지원)'
                  : activeMode === 'github_workflow'
                  ? '(GitHub Actions CI/CD · Node.js 22 LTS/Node 24 호환 · 인스톨 파일만 릴리스 업로드)'
                  : activeMode === 'git_push_bat'
                  ? '(GitHub 자동 동기화 · 개인정보/개인 이메일 업로드 차단 프리-스캔 · 태그 동기화)'
                  : '(디스크정리 스크립트 소스)'}
              </span>
              {(activeMode === 'build_bat' || activeMode === 'batch' || activeMode === 'task_scheduler' || activeMode === 'git_push_bat') && (
                <span className="rounded bg-emerald-950/80 border border-emerald-600/50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                  CRLF \r\n
                </span>
              )}
              
              {activeMode === 'github_workflow' && (
                <span className="rounded bg-sky-950/80 border border-sky-600/50 px-1.5 py-0.5 text-[10px] font-mono text-sky-300">
                  Node 22 LTS
                </span>
              )}
              {activeMode === 'inno_setup' && (
                <span className="rounded bg-emerald-950/80 border border-emerald-600/50 px-1.5 py-0.5 text-[10px] font-mono text-emerald-300">
                  Inno Setup 6.x
                </span>
              )}
              {activeMode === 'version_info' && (
                <span className="rounded bg-purple-950/80 border border-purple-600/50 px-1.5 py-0.5 text-[10px] font-mono text-purple-300">
                  PE Version Resource
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="single-copy-btn"
                onClick={() => onCopy(currentCode)}
                className="inline-flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>

              <button
                id="single-download-btn"
                onClick={() => onDownload(activeMode, currentCode)}
                className="inline-flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs text-white hover:bg-blue-500 transition-colors font-semibold"
              >
                <Download className="h-3 w-3" />
                <span>다운로드</span>
              </button>
            </div>
          </div>

          

          {activeMode === 'github_workflow' && (
            <div className="bg-slate-900/90 border-b border-slate-800 p-3 text-xs text-slate-300 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Workflow className="h-3.5 w-3.5" />
                  3중 트리거 지원
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>• <b>일반 푸시</b>: main/master 브랜치 푸시 시 즉시 검증</p>
                  <p>• <b>태그 푸시</b>: v1.5.0 푸시 시 릴리스 자동 발행</p>
                  <p>• <b>수동 실행</b>: workflow_dispatch 지원</p>
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-amber-800/40">
                <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                  액션 미시작 시 권한 확인
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>• Settings → Actions → General 이동</p>
                  <p>• <b>Actions permissions</b>: Allow all actions 체크</p>
                  <p>• <b>Workflow permissions</b>: Read & write 체크</p>
                </div>
              </div>
              <div className="bg-slate-950/70 p-2.5 rounded-lg border border-sky-800/40">
                <div className="font-bold text-sky-400 mb-1 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" />
                  즉시 실행 / 강제 갱신
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>• <b>Actions 탭</b>: Run workflow 버튼 클릭</p>
                  <p>• <b>태그 갱신</b>: <code className="text-sky-300 font-mono">git tag -fa v1.5.0 -m "v1.5.0"</code></p>
                  <p>• <b>강제 푸시</b>: <code className="text-sky-300 font-mono">git push origin v1.5.0 --force</code></p>
                </div>
              </div>
            </div>
          )}

          {renderCodeBlock(currentCode, 'max-h-[580px]')}
        </div>
      ) : (
        /* Split Dual View: Python on top, build_exe.bat on bottom (or side-by-side) */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 bg-slate-950">
          {/* Pane 1: Python Source */}
          <div className="flex flex-col min-h-[300px]">
            <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-sky-300">
                <Code2 className="h-3.5 w-3.5" />
                <span>disk_cleanup_gui.py (파이썬 소스)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopySpecific(pythonCode, false)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  {copiedPy ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={() => onDownload('python_gui', pythonCode)}
                  className="rounded bg-blue-600 px-2 py-0.5 text-[11px] text-white hover:bg-blue-500 font-semibold"
                >
                  다운로드
                </button>
              </div>
            </div>
            {renderCodeBlock(pythonCode, 'max-h-[540px]')}
          </div>

          {/* Pane 2: build_exe.bat */}
          <div className="flex flex-col min-h-[300px]">
            <div className="bg-slate-900 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-purple-300">
                <Cpu className="h-3.5 w-3.5" />
                <span>build_exe.bat (EXE 원클릭 빌더)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopySpecific(batCode, true)}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700"
                >
                  {copiedBat ? '복사됨!' : '복사'}
                </button>
                <button
                  onClick={() => onDownload('build_bat', batCode)}
                  className="rounded bg-purple-600 px-2 py-0.5 text-[11px] text-white hover:bg-purple-500 font-semibold"
                >
                  다운로드
                </button>
              </div>
            </div>
            {renderCodeBlock(batCode, 'max-h-[540px]')}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {viewLayout === 'split'
              ? '💡 두 파일을 같은 폴더에 저장한 뒤 build_exe.bat을 실행하면 Release 폴더에 단일 .exe가 자동 생성됩니다.'
              : activeMode === 'build_bat'
              ? 'PyInstaller 패키지 확인 및 자동 설치, UAC 권한 삽입, 임시 파일 청소를 자동 처리하는 Windows 배치 파일'
              : 'Python 3.7+ 표준 라이브러리(winreg, ctypes, subprocess, tkinter) 100% 호환'}
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[11px]">
          {viewLayout === 'split' ? 'Dual View' : `${currentCode.split('\n').length} lines`}
        </span>
      </div>
    </div>
  );
};
