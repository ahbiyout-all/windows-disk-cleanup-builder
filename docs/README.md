# 📚 Windows 디스크 정리 자동화 빌더 문서 (Documentation)

본 프로젝트는 Windows 10, Windows 11 및 Windows Server 환경에서 `cleanmgr.exe`와 `winreg` 레지스트리 조작을 통한 고성능 디스크 공간 자동화 정리 스크립트 및 포터블 EXE 실행 파일을 생성하는 도구입니다.

---

## 📂 문서목록 (Documentation Index)

1. **[설치, 배포 및 무인 설치 가이드 (Installation Guide)](./INSTALL.md)**
   - Inno Setup 개별 파일 설치 구조, 덮어쓰기 감지 대화상자, 무인 설치 스위치, 방화벽 사전 등록 및 삭제 정책
2. **[빌드, 패키징 및 CI/CD 가이드 (Build & Packaging Guide)](./BUILD.md)**
   - 로컬 배치 순차 빌드, PyInstaller + Inno Setup 패키징, GitHub Actions 단일 통합 릴리스 워크플로 규격
3. **[패치 노트 및 변경 이력 (Patch Notes & Changelog)](./PATCH_NOTES.md)**
   - 버전에 따른 주요 기능 추가, 버그 수정, Windows.old 강제 소거, 성능 개선 및 변경 사항 기록
4. **[보안 및 개인정보 보호 정책 (Security & Privacy Policy)](./SECURITY.md)**
   - 커밋 작성자 고정, `.gitignore` 보안 배제, 관리자 권한(UAC) 및 개인 데이터 보존 안전 가드레일
5. **[개발 로드맵 및 구현 현황 (Roadmap & Status)](./ROADMAP.md)**
   - Phase 1~17 구현 완료 내역 및 향후 개발 계획
6. **[Google 블로그 소개 포스팅 템플릿 (Blog Post)](./BLOG_POST.md)**
   - Google Blogger 및 기술 블로그 게시용 마크다운 원고 템플릿 (`v1.5.0`)
7. **[공식 MIT 라이선스 (MIT License)](../LICENSE)**
   - `Copyright (c) 2026 AhBiYout` 전문

---

## 🛠️ 주요 프로젝트 메타데이터

- **프로그램명**: Windows Disk Cleanup Automation Builder
- **현재 버전**: `v1.5.0` (Semantic Versioning)
- **개발자**: `AhBiYout` (GitHub: `AhBiYout-all`)
- **저작권**: `Copyright (c) 2026 AhBiYout. All rights reserved.`
- **라이선스**: MIT License ([`LICENSE`](../LICENSE))
- **저장소**: `https://github.com/AhBiYout-all/windows-disk-cleanup-builder`
- **공식 블로그**: https://ahbiyoutvibe.blogspot.com/
- **권장 파이썬 버전**: Python 3.10 ~ 3.13+ (빌드 시 권장: Python 3.12)
- **권장 PyInstaller 버전**: PyInstaller 6.x+
- **배포 인스톨러**: Inno Setup 6.x (개별 파일 풀림 설치 & 포터블 EXE 병행 배포)
