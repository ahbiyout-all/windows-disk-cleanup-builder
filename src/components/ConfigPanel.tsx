import React from 'react';
import { ScriptConfig } from '../types';
import { Settings, Shield, Sliders, Clock, Sparkles, Terminal, FileText, ShieldCheck, Workflow, GitBranch, ExternalLink } from 'lucide-react';
import { CURRENT_VERSION, DEVELOPER_NAME, GITHUB_USERNAME, GITHUB_REPO_NAME, GITHUB_REPO_URL, BLOG_URL, COMPANY_URL } from '../version';

interface ConfigPanelProps {
  config: ScriptConfig;
  onChangeConfig: (newConfig: Partial<ScriptConfig>) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChangeConfig }) => {
  // Parse version numbers e.g. "v1.5.0" -> "1.5.0.0"
  const verMatch = CURRENT_VERSION.match(/(\d+)\.(\d+)\.(\d+)/);
  const major = verMatch ? verMatch[1] : '1';
  const minor = verMatch ? verMatch[2] : '5';
  const patch = verMatch ? verMatch[3] : '0';
  const dynamicVerStr = `${major}.${minor}.${patch}.0`;

  const baseExeName = (config.exeName || 'DiskCleanupAuto').replace(/[^a-zA-Z0-9_\-]/g, '');
  const dynamicExeName = baseExeName.toLowerCase().includes(CURRENT_VERSION.toLowerCase())
    ? `${baseExeName}.exe`
    : `${baseExeName}_${CURRENT_VERSION}.exe`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Sliders className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-900">스크립트 세부 설정 (Config)</h2>
      </div>

      <div className="mt-4 space-y-4">
        {/* SageSet ID & Admin Elevation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="sageset-id-input" className="block text-xs font-semibold text-slate-700">
              StateFlags 번호 (SageSet ID)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="sageset-id-input"
                type="number"
                min="1"
                max="65535"
                value={config.sagesetId}
                onChange={(e) =>
                  onChangeConfig({ sagesetId: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-500">
                (레지스트리: <code className="font-mono text-blue-600">StateFlags{String(config.sagesetId).padStart(4, '0')}</code>)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              관리자 권한 (UAC) 자체 승격
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  id="auto-uac-toggle"
                  type="checkbox"
                  checked={config.autoUacElevation}
                  onChange={(e) => onChangeConfig({ autoUacElevation: e.target.checked })}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
                <span className="ml-2 text-xs font-medium text-slate-700">
                  {config.autoUacElevation ? 'UAC 팝업 자동 요청 (권장)' : '수동 관리자 실행'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Windows.old 강제 완전 정리 루틴 (v1.5.0 차세대 핵심 기능) */}
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-pulse"></span>
              Windows.old 강제 완전 정리 루틴 (Windows 11 24H2 / 26H1 특화)
            </span>
            <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
              권한 탈취 & 잠금 해제 파이프라인
            </span>
          </div>
          <p className="text-[11px] text-rose-700 leading-relaxed">
            Windows 11 업데이트 후 cleanmgr로도 삭제되지 않고 남는 <strong>C:\Windows.old</strong> 폴더의 NTFS 소유권을 
            <code>takeown</code> 및 <code>icacls</code>로 강제 탈취하고 잠긴 프로세스를 자동 해제하여 100% 완전 소거합니다. (평균 15~40GB 회수)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <label className="flex items-start gap-2 cursor-pointer text-slate-800 hover:text-rose-900 font-medium">
              <input
                id="clean-windows-old-force-check"
                type="checkbox"
                checked={config.cleanWindowsOldForce}
                onChange={(e) => onChangeConfig({ cleanWindowsOldForce: e.target.checked })}
                className="mt-0.5 rounded border-rose-300 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span>Windows.old 강제 권한 탈취 및 완전 삭제 활성화</span>
                <span className="block text-[10px] font-normal text-slate-500">
                  cleanmgr 실패 시에도 독자적 3단계 강제 소거 루틴 가동
                </span>
              </div>
            </label>

            <label className={`flex items-start gap-2 cursor-pointer font-medium ${!config.cleanWindowsOldForce ? 'opacity-50 pointer-events-none text-slate-400' : 'text-slate-800 hover:text-slate-900'}`}>
              <input
                id="safeguard-user-files-check"
                type="checkbox"
                disabled={!config.cleanWindowsOldForce}
                checked={config.safeguardUserFiles}
                onChange={(e) => onChangeConfig({ safeguardUserFiles: e.target.checked })}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span>개인 파일 안전 가드레일 (Safe-Guard)</span>
                <span className="block text-[10px] font-normal text-slate-500">
                  Windows.old\Users 개인 문서/바탕화면 잔여 유무 자동 사전 검사
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Extra Cleanup Capabilities */}
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-2.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            고급 확장 청소 옵션 (Python Deep 전용)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                id="clean-temp-dirs-check"
                type="checkbox"
                checked={config.cleanTempDirs}
                onChange={(e) => onChangeConfig({ cleanTempDirs: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>%TEMP% 및 WinTemp 잠금 해제 파일 직접 소거</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                id="clean-dism-check"
                type="checkbox"
                checked={config.cleanDism}
                onChange={(e) => onChangeConfig({ cleanDism: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>DISM WinSxS 컴포넌트 저장소 최적화</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                id="flush-dns-check"
                type="checkbox"
                checked={config.flushDns}
                onChange={(e) => onChangeConfig({ flushDns: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>DNS 캐시 플러시 (ipconfig /flushdns)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 hover:text-slate-900">
              <input
                id="log-to-file-check"
                type="checkbox"
                checked={config.logToFile}
                onChange={(e) => onChangeConfig({ logToFile: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>작업 로그 파일 저장 ({config.logFileName})</span>
            </label>
          </div>
        </div>

        {/* GUI Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="company-name-input" className="block text-xs font-semibold text-slate-700">
              회사/조직명 (GUI 상단)
            </label>
            <input
              id="company-name-input"
              type="text"
              value={config.companyName}
              onChange={(e) => onChangeConfig({ companyName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="CISNET CORPORATION"
            />
          </div>

          <div>
            <label htmlFor="developer-name-input" className="block text-xs font-semibold text-slate-700">
              개발자 명
            </label>
            <input
              id="developer-name-input"
              type="text"
              value={config.developerName || 'AhBiYout'}
              onChange={(e) => onChangeConfig({ developerName: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="AhBiYout"
            />
          </div>

          <div>
            <label htmlFor="ui-title-input" className="block text-xs font-semibold text-slate-700">
              프로그램 타이틀
            </label>
            <input
              id="ui-title-input"
              type="text"
              value={config.uiTitle}
              onChange={(e) => onChangeConfig({ uiTitle: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="DiskCleanupAuto (V1.0)"
            />
          </div>
        </div>

        {/* Links Customization */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="company-url-input" className="block text-xs font-semibold text-slate-700">
              회사 홈페이지 URL
            </label>
            <input
              id="company-url-input"
              type="text"
              value={config.companyUrl || 'http://www.cisnet.co.kr/'}
              onChange={(e) => onChangeConfig({ companyUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="http://www.cisnet.co.kr/"
            />
          </div>

          <div>
            <label htmlFor="blog-url-input" className="block text-xs font-semibold text-slate-700">
              공식 Google 블로그 URL
            </label>
            <input
              id="blog-url-input"
              type="text"
              value={config.blogUrl || 'https://ahbiyoutvibe.blogspot.com/'}
              onChange={(e) => onChangeConfig({ blogUrl: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://ahbiyoutvibe.blogspot.com/"
            />
          </div>
        </div>

        {/* PyInstaller EXE Build Configuration */}
        <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-purple-600" />
              포터블 EXE 자동 빌드 설정 (PyInstaller Build Config)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="exe-name-input" className="block text-[11px] font-semibold text-purple-900">
                출력 실행 파일명 (.exe)
              </label>
              <input
                id="exe-name-input"
                type="text"
                value={config.exeName}
                onChange={(e) => onChangeConfig({ exeName: e.target.value })}
                className="mt-1 w-full rounded-md border border-purple-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-purple-500 focus:outline-none"
                placeholder="DiskCleanupAuto"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                <input
                  id="exe-noconsole-check"
                  type="checkbox"
                  checked={config.exeNoConsole}
                  onChange={(e) => onChangeConfig({ exeNoConsole: e.target.checked })}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span>검은색 콘솔 창 숨기기 (--noconsole)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                <input
                  id="exe-uacadmin-check"
                  type="checkbox"
                  checked={config.exeUacAdmin}
                  onChange={(e) => onChangeConfig({ exeUacAdmin: e.target.checked })}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span>관리자 권한 매니페스트 내장 (--uac-admin)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900">
                <input
                  id="exe-clean-check"
                  type="checkbox"
                  checked={config.exeCleanArtifacts}
                  onChange={(e) => onChangeConfig({ exeCleanArtifacts: e.target.checked })}
                  className="rounded border-purple-300 text-purple-600 focus:ring-purple-500"
                />
                <span>빌드 후 임시 파일(build, spec) 자동 삭제</span>
              </label>
            </div>
          </div>

          {/* Windows File Properties (Details Tab) Preview Box */}
          <div className="mt-3 rounded-lg border border-purple-200/80 bg-white p-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-600" />
                Windows 파일 속성 [자세히] 탭 삽입 정보 (version_info.txt)
              </span>
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">
                PE Resource 반영
              </span>
            </div>
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">파일 설명:</span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{config.uiTitle || 'AhBiYout Windows 디스크 클린 오토'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">파일 / 제품 버전:</span>
                <span className="font-mono font-bold text-purple-700">{dynamicVerStr}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">제품 이름:</span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{config.uiTitle || 'AhBiYout Windows 디스크 클린 오토'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">저작권 (Copyright):</span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">Copyright (C) 2026 {config.developerName || 'AhBiYout'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">회사 (Company):</span>
                <span className="font-medium text-slate-900 text-right truncate max-w-[180px]">{config.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">원본 파일 이름:</span>
                <span className="font-mono text-slate-700">{dynamicExeName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">등록 상표:</span>
                <span className="font-medium text-slate-900">{config.developerName || 'AhBiYout'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">언어 (Language):</span>
                <span className="font-medium text-emerald-700">한국어 (대한민국) / Unicode</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">작성자 / 개발자:</span>
                <span className="font-medium text-slate-900">{config.developerName || 'AhBiYout'}</span>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
              💡 <span className="font-semibold text-slate-700">PyInstaller --version-file</span> 플래그를 통해 생성되는 실행 파일 내부 PE 리소스에 영구 삽입되어, 윈도우 탐색기에서 우클릭 → [속성] → [자세히]를 열었을 때 위 메타데이터가 그대로 표시됩니다.
            </p>
          </div>
        </div>

        {/* Task Scheduler Quick Settings */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              Windows 작업 스케줄러 자동 실행 설정
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label htmlFor="schedule-freq-select" className="block text-[11px] font-medium text-slate-600">반복 주기</label>
              <select
                id="schedule-freq-select"
                value={config.scheduleFrequency}
                onChange={(e) => onChangeConfig({ scheduleFrequency: e.target.value as any })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
              >
                <option value="DAILY">매일 (Daily)</option>
                <option value="WEEKLY">매주 (Weekly)</option>
                <option value="MONTHLY">매월 (Monthly)</option>
                <option value="ONLOGON">사용자 로그인 시 (On Logon)</option>
              </select>
            </div>

            <div>
              <label htmlFor="schedule-time-input" className="block text-[11px] font-medium text-slate-600">실행 시간</label>
              <input
                id="schedule-time-input"
                type="time"
                value={config.scheduleTime}
                onChange={(e) => onChangeConfig({ scheduleTime: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="schedule-taskname-input" className="block text-[11px] font-medium text-slate-600">작업 이름</label>
              <input
                id="schedule-taskname-input"
                type="text"
                value={config.scheduleTaskName}
                onChange={(e) => onChangeConfig({ scheduleTaskName: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                placeholder="WindowsAutoDiskCleanup"
              />
            </div>
          </div>
        </div>

        {/* Inno Setup & GitHub CI/CD Deployment Settings Card */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              배포 및 인스톨러 규격 (Inno Setup & GitHub CI/CD)
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
              {CURRENT_VERSION}
            </span>
          </div>

          <div className="text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between border-b border-emerald-100/60 pb-1">
              <span className="text-slate-500 font-medium">설치 방식:</span>
              <span className="font-semibold text-emerald-800">폴더 풀림 (Unpacked Multi-File) 개별파일</span>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100/60 pb-1">
              <span className="text-slate-500 font-medium">문서/포터블 제외:</span>
              <span className="font-semibold text-slate-700">불필요 문서 및 중복 포터블 파일 첨부 제외</span>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100/60 pb-1">
              <span className="text-slate-500 font-medium">방화벽 사전 등록:</span>
              <span className="font-mono text-emerald-700 text-[10px]">기본명 + {CURRENT_VERSION} 버전명 동시 등록</span>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100/60 pb-1">
              <span className="text-slate-500 font-medium">기존 설치 확인:</span>
              <span className="font-semibold text-slate-700">덮어쓰기/삭제 확인 팝업 (무인: 자동 덮어쓰기)</span>
            </div>
            <div className="flex items-center justify-between border-b border-emerald-100/60 pb-1">
              <span className="text-slate-500 font-medium">CI/CD 런타임:</span>
              <span className="font-bold text-sky-700">Node.js 22 LTS (Node 20 EOL 대응)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">릴리스 자산 첨부:</span>
              <span className="font-bold text-emerald-700">Windows 전용 인스톨러 (PC Setup .exe)</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-[11px]">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-medium"
            >
              <GitBranch className="h-3 w-3" />
              <span>{GITHUB_REPO_NAME}</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>
            <span className="text-slate-400 font-mono text-[10px]">@{GITHUB_USERNAME}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
