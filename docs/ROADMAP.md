# 📋 개발 로드맵 및 구현 현황 (Roadmap & Status)

본 문서는 **Windows Disk Cleanup Automation Builder**의 기능별 개발 로드맵, 구현 상태 및 향후 계획을 추적합니다.

---

## 🎯 전체 개발 로드맵 진행 현황

| 단계 | 항목 | 상태 | 완료 버전 | 설명 |
| :--- | :--- | :---: | :---: | :--- |
| **Phase 1** | Windows cleanmgr 코어 엔진 | ✅ 완료 | `v1.0.0` | SAGESET/SAGERUN 레지스트리 조작 및 기본 자동화 |
| **Phase 2** | 멀티 스크립트 & GUI 빌더 | ✅ 완료 | `v1.1.0` | Tkinter GUI, CLI, Silent, PowerShell, Batch 지원 |
| **Phase 3** | 프로세스 잔류 방어 및 브랜딩 | ✅ 완료 | `v1.2.0` | taskkill + os._exit(0), 공식 브랜딩 연동 |
| **Phase 4** | 초고속 완료 감지 & 타이머 | ✅ 완료 | `v1.3.0` | 0.2초 반응 루프, 분/초 실시간 타이머 |
| **Phase 5** | 자동 빌드 스크립트 버저닝 연동 | ✅ 완료 | `v1.3.1` | `build_exe.bat` 결과물 파일명 버전 접미사 결합 |
| **Phase 6** | 경로 격리 및 화면 상단 배치 | ✅ 완료 | `v1.3.4` | Top 22% 골든 레이시오 배치, CRLF 개행 강제 |
| **Phase 7** | Win32 커널 동기화 & 트레이 스위프 | ✅ 완료 | `v1.4.0` | WaitForSingleObject, HWND 후킹, 무인 트레이 스위프 |
| **Phase 8** | Windows 11 Windows.old 강제 소거 | ✅ 완료 | `v1.5.0` | takeown + icacls + rmtree, Users 가드레일 |
| **Phase 9** | Inno Setup 개별 파일 설치 구성 | ✅ 완료 | `v1.5.0` | 덮어쓰기 감지, 무인 설치 스위치, 방화벽 사전 등록 |
| **Phase 10** | GitHub Actions CI/CD 최신화 | ✅ 완료 | `v1.5.0` | Node.js 22 LTS 전환, 릴리스 인스톨러 전용 에셋 |
| **Phase 11** | GitHub 자동 푸시 스크립트 | ✅ 완료 | `v1.5.0` | `git_push.bat`, 개인정보/이메일 누출 방지 프리-스캔 |
| **Phase 12** | GitHub Releases 실시간 업데이트 감지 | ✅ 완료 | `v1.5.0` | 클라이언트 자동 업데이트 감지 팝업 연동 |
| **Phase 13** | 빌드 핵심 파일 전용 격리 관리 | ✅ 완료 | `v1.5.0` | `DiskCleanupAuto_v1.5.0_Core/`, `export_core_files.bat`, 매니페스트 |
| **Phase 14** | Actions 듀얼 트리거 & 태그 갱신 | ✅ 완료 | `v1.5.0` | 브랜치 푸시 CI 빌드 및 강제 태그 동기화로 릴리스 미실행 이슈 해결 |
| **Phase 15** | Windows 전용 인스톨러 단일화 | ✅ 완료 | `v1.5.0` | 데스크톱 전용 인스톨러 배포 강화, Inno Setup `.exe` 인스톨러 배포 단일화, git_push 배치 파싱 안정화 |

---

## 🔮 차기 릴리스 계획 (Future Work)

1. **Windows 11 신규 스토리지 API 연동**:
   - `Storage Sense`(저장 공간 센스) 네이티브 API 호출 지원
2. **다국어(영어/일본어) 인터페이스 다변화**:
   - GUI 및 웹 빌더의 전역 i18n 확장
