import React from 'react';
import {
  X,
  ExternalLink,
  Download,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Layers,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  CURRENT_VERSION,
  DEVELOPER_NAME,
  GITHUB_USERNAME,
  GITHUB_REPO_NAME,
  GITHUB_REPO_URL,
  GITHUB_RELEASES_URL,
  BLOG_URL,
  COMPANY_URL,
  COMPANY_NAME,
} from '../version';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  releaseTitle: string;
  releaseNotes: string;
  publishedAt: string;
  releaseUrl: string;
  assets: {
    name: string;
    size?: string;
    type: 'windows' | 'other';
    url: string;
  }[];
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateInfo: UpdateInfo | null;
  isChecking: boolean;
  onCheckAgain: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  onClose,
  updateInfo,
  isChecking,
  onCheckAgain,
}) => {
  if (!isOpen) return null;

  const latestTag = updateInfo?.latestVersion || CURRENT_VERSION;
  const isNewer = updateInfo?.hasUpdate ?? false;
  const releaseUrl = updateInfo?.releaseUrl || GITHUB_RELEASES_URL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-6 py-5 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isNewer
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                }`}>
                  {isNewer ? (
                    <>
                      <Flame className="h-3.5 w-3.5 fill-current" />
                      새로운 버전 업데이트 발견!
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      현재 최신 버전을 사용 중입니다
                    </>
                  )}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  GitHub Releases 실시간 연동
                </span>
              </div>

              <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>GitHub Releases 자동 업데이트 알림</span>
              </h2>
              <p className="text-xs text-slate-300">
                저장소: <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-300 font-mono">{GITHUB_USERNAME}/{GITHUB_REPO_NAME}</a>
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-slate-700 text-sm">
          {/* Version Comparison Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-500 block mb-1">현재 실행 중인 버전</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold text-slate-800">{CURRENT_VERSION}</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">현재 버전</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                빌드: Windows Disk Cleanup Automation Builder
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${
              isNewer
                ? 'border-blue-300 bg-blue-50/70 ring-2 ring-blue-500/20'
                : 'border-emerald-200 bg-emerald-50/50'
            }`}>
              <span className="text-xs font-semibold text-slate-500 block mb-1">GitHub 최신 릴리스 버전</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xl font-bold ${isNewer ? 'text-blue-700' : 'text-emerald-700'}`}>
                  {latestTag}
                </span>
                {isNewer ? (
                  <span className="rounded bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                    업데이트 필요
                  </span>
                ) : (
                  <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                    최신 유지됨
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                배포일: {updateInfo?.publishedAt || '최신 실시간 태그'}
              </p>
            </div>
          </div>

          {/* Release Assets Info (Installer only rule compliance) */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                <span>릴리스 공식 배포 인스톨러 (크로스 플랫폼)</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ 인스톨 파일 전용 배포 규격 준수
              </span>
            </div>
            <p className="text-xs text-slate-600">
              GitHub 릴리스에는 불필요한 임시 파일이나 소스 문서 없이 오직 검증된 <strong>인스톨러 파일만 생성되어 첨부</strong>됩니다:
            </p>

            <div className="pt-1">
              {/* Windows PC Dedicated Installer */}
              <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-blue-400 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <Monitor className="h-4 w-4" />
                    <span>Windows 데스크톱 전용 설치 프로그램</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">권장</span>
                  </div>
                  <div className="font-mono text-xs text-slate-800 font-bold" title={`WindowsDiskCleanup_Setup_${latestTag}.exe`}>
                    WindowsDiskCleanup_Setup_{latestTag}.exe
                  </div>
                  <p className="text-xs text-slate-600 leading-normal">
                    Inno Setup 개별파일 언팩(Multi-File) 구조 · Windows 방화벽 자동 조용히 등록 · 기존 버전 감지 및 덮어쓰기 지원
                  </p>
                </div>
                <a
                  href={releaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 transition-all shrink-0"
                >
                  <Download className="h-4 w-4" />
                  <span>설치 프로그램 다운로드 (.exe)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Release Notes */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              📝 {latestTag} 주요 변경 내역 및 배포 사항:
            </h4>
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed font-sans">
              <div className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>GitHub 공식 권고 준수:</strong> Node.js 20 EOL(공식 지원 종료)에 따라 CI/CD 워크플로 런타임을 <strong>Node.js 22 LTS (및 Node 24)</strong>로 완전 전환.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">2.</span>
                <span><strong>Inno Setup 6.x 언팩 설치기:</strong> 폴더 풀림(Unpacked Multi-File) 개별파일 설치 구현 및 불필요한 문서/포터블 중복 파일 제외.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">3.</span>
                <span><strong>기존 설치 덮어쓰기 확인:</strong> 이전 버전 감지 시 삭제/덮어쓰기 대화상자 출력 및 <code>/SILENT</code> 무인 설치 완벽 지원.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">4.</span>
                <span><strong>방화벽 규칙 사전 조용히 등록:</strong> 기본 이름과 버전 명시 이름(<code>Windows Disk Cleanup Automation Builder v1.5.0</code>)을 netsh로 사전 인바운드 등록 및 언인스톨 시 자동 소거.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold">5.</span>
                <span><strong>개인정보 및 개인 이메일 업로드 원천 차단:</strong> <code>git_push.bat</code>에서 사전 누출 검사 및 GitHub 공식 No-Reply 이메일 적용.</span>
              </div>
            </div>
          </div>

          {/* Official Channel Links */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800">공식 채널 안내:</span>
              <a
                href={BLOG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-orange-600 hover:underline font-medium"
              >
                📝 공식 구글 블로그 (AhBiYoutVibe)
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href={COMPANY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
              >
                🏢 소속: {COMPANY_NAME}
                <ExternalLink className="h-3 w-3" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-800 hover:underline font-medium"
              >
                🐙 저장소
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <button
              onClick={onCheckAgain}
              disabled={isChecking}
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
            >
              <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? '확인 중...' : '다시 확인'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            개발자: <strong>{DEVELOPER_NAME}</strong> (@{GITHUB_USERNAME})
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              닫기
            </button>

            <a
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>GitHub Releases 바로가기</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
