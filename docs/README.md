# 📚 Windows 디스크 정리 자동화 빌더 문서 (Documentation)

본 프로젝트는 Windows 10, Windows 11 및 Windows Server 환경에서 `cleanmgr.exe`와 `winreg` 레지스트리 조작을 통한 고성능 디스크 공간 자동화 정리 스크립트 및 포터블 EXE 실행 파일을 생성하는 도구입니다.

---

## 📂 문서목록 (Documentation Index)

1. **[버전 관리 정책 (Semantic Versioning Policy)](./SEMVER_POLICY.md)**
   - Semantic Versioning (`MAJOR.MINOR.PATCH`) 3단계 원칙 및 버저닝 규칙
2. **[현재 버전 상태표 (Version State)](./VERSION.md)**
   - 현재 소프트웨어 버전 상태 및 전체 버전별 상세 요약표
3. **[패치 노트 및 변경 이력 (Patch Notes & Changelog)](./PATCH_NOTES.md)**
   - 버전에 따른 주요 기능 추가, 버그 수정, Windows.old 강제 소거, 성능 개선 및 변경 사항 기록
4. **[아키텍처 및 원리 가이드 (Architecture Guide)](./ARCHITECTURE.md)**
   - `VolumeCaches` 레지스트리 스키마, `StateFlags0001` 주입, 커널 이벤트 동기화, 트레이 스위프, Windows.old 강제 권한 탈취 및 실행 순서 파이프라인
5. **[설치, 배포 및 무인 설치 가이드 (Installation Guide)](./INSTALL.md)**
   - Inno Setup 개별 파일 설치 구조, 덮어쓰기 감지 대화상자, 무인 설치 스위치, 방화벽 사전 등록 및 삭제 정책
6. **[빌드, 패키징 및 CI/CD 가이드 (Build & Packaging Guide)](./BUILD.md)**
   - 로컬 배치 순차 빌드, Node.js 22 LTS 전환, GitHub Actions 릴리스 워크플로 및 인스톨러 전용 첨부 규격
7. **[보안 및 개인정보 보호 정책 (Security & Privacy Policy)](./SECURITY.md)**
   - 커밋 작성자 고정, 개인 이메일 사전 검사(`git_push.bat`), 관리자 권한 및 개인 데이터 보존 안전 가드레일
8. **[개발 로드맵 및 구현 현황 (Roadmap & Status)](./ROADMAP.md)**
   - Phase 1~15 구현 완료 내역 및 향후 개발 계획
9. **[독립 모듈 및 DLL 가이드 (Modules Guide)](./MODULES.md)**
   - 독립 실행형 모듈 구성 및 Win32 API (`kernel32`, `user32`, `shell32`, `advapi32`) 호출 사양
10. **[Google 블로그 소개 포스팅 템플릿 (Blog Post)](./BLOG_POST.md)**
    - Google Blogger 및 기술 블로그 게시용 마크다운 원고 템플릿 (v1.5.0)
11. **[한국어 라이선스 안내 (License KO)](./LICENSE.ko.md)** / **[영문 라이선스 (License EN)](./LICENSE.en.md)**
    - MIT 라이선스 및 공식 채널 정보

---

## 🛠️ 주요 프로젝트 메타데이터

- **프로그램명**: Windows Disk Cleanup Automation Builder
- **현재 버전**: `v1.5.0` (Semantic Versioning)
- **개발자**: `AhBiYout` (GitHub: `AhBiYout-all`)
- **저장소**: `https://github.com/AhBiYout-all/windows-disk-cleanup-builder`
- **회사/조직**: `CISNET CORPORATION` (http://www.cisnet.co.kr/)
- **공식 블로그**: https://ahbiyoutvibe.blogspot.com/
- **권장 Node.js**: Node.js 22 LTS (Node.js 20 EOL 대응 완료)
- **권장 파이썬 버전**: Python 3.8 ~ 3.14+
- **권장 PyInstaller 버전**: PyInstaller 6.x+
- **배포 인스톨러**: Inno Setup 6.x (개별 파일 풀림 설치)
