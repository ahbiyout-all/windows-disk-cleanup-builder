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
| **Phase 9** | Inno Setup 안전 설치 & 6단계 흐름 | ✅ 완료 | `v1.5.0` | 강제종료→삭제/덮어쓰기→라이선스→설치→바탕화면 체크→앱 실행, 방화벽 등록 |
| **Phase 10** | GitHub Actions CI/CD 최신화 | ✅ 완료 | `v1.5.0` | `node24` 러너 강제 적용 및 단일 통합 빌드 워크플로 구축 |
| **Phase 11** | `.gitignore` 기반 민감정보 배제 | ✅ 완료 | `v1.5.0` | 로컬 푸시 스크립트(`git_push.bat`), `.env*`, 빌드 임시 산출물 원천 제외 |
| **Phase 12** | GitHub Releases 실시간 업데이트 감지 | ✅ 완료 | `v1.5.0` | 클라이언트 자동 업데이트 감지 팝업 연동 |
| **Phase 13** | 순수 데스크톱 핵심 저장소 정리 | ✅ 완료 | `v1.5.0` | 불필요한 웹 프론트엔드/중복 스테이징 폴더 제거 및 MIT `LICENSE` 정비 |
| **Phase 14** | Actions 멀티 트리거 & 태그 갱신 | ✅ 완료 | `v1.5.0` | 브랜치 푸시(`main`/`master`), 태그, 수동 실행(`workflow_dispatch`) 완벽 지원 |
| **Phase 15** | Windows 인스톨러 + 포터블 3종 배포 | ✅ 완료 | `v1.5.0` | `Setup_v1.5.0.exe`, `DiskCleanupAuto_v1.5.0.exe`, `Portable_v1.5.0.zip` 동시 배포 |
| **Phase 16** | 고화질 멀티 해상도 아이콘 임베드 | ✅ 완료 | `v1.5.0` | `app.ico` PE 리소스, Tkinter `_MEIPASS` 런타임, 제어판/바로가기 일괄 적용 |
| **Phase 17** | AhBiYout 단독 저작권 & 안정성 정비 | ✅ 완료 | `v1.5.0` | `Copyright (c) 2026 AhBiYout`, Tkinter 스레드 안전성 및 Inno Setup `AppId` 버그 수정 |
| **Phase 18** | 시스템 로케일 자동 감지 & 한/영/일 다국어 지원 | ✅ 완료 | `v1.5.0` | Win32 `GetUserDefaultUILanguage`/`navigator.language` 자동 감지, GUI·인스톨러·문서(`README_EN`/`README_JA`) 한/영/일 완전 지원 |
| **Phase 19** | 포터블 ZIP 추가 & 심층 감사/오류 수정 | ✅ 완료 | `v1.5.0` | `Portable ZIP` 릴리스 아카이브, `build_exe.bat` 배치 확장 버그 및 `build_exe.py`·`installer.iss`·GUI Win32 초기화 레이스 수정 |

---

## 🔮 차기 릴리스 계획 (Future Work)

1. **Windows 11 신규 스토리지 API 연동**:
   - `Storage Sense`(저장 공간 센스) 네이티브 API 호출 지원
2. **오프라인 스크립트 내보내기 프리셋 확장**:
   - GUI 내 원클릭 `.bat` / `.ps1` 다국어 주석 스크립트 파일 저장 기능 추가
