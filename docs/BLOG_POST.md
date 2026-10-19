# [공식 배포] Windows 디스크 클린 오토 (DiskCleanupAuto v1.5.0)

---

### 1. 제목
[추천] Windows 11/10 무인 디스크 정리 도구 - AhBiYout Windows 디스크 클린 오토 (DiskCleanupAuto v1.5.0)

---

### 2. 본문
Windows PC를 장기간 사용하다 보면 C: 드라이브의 용량이 부족해지고 각종 업데이트 캐시와 임시 파일, 그리고 대규모 기능 업데이트 후 남겨진 `Windows.old` 폴더로 인해 수십 GB의 디스크 공간이 낭비되곤 합니다.

**AhBiYout Windows 디스크 클린 오토 (DiskCleanupAuto v1.5.0)**는 Windows 내장 정품 엔진인 `cleanmgr.exe`와 레지스트리 `VolumeCaches`를 안전하게 제어하여, 사용자의 복잡한 클릭 과정 없이 단 한 번의 실행으로 시스템 캐시, 임시 파일, 휴지통, Windows 업데이트 캐시(WinSxS)를 완벽하게 자동 정리해 주는 데스크톱 전용 시스템 정리 유틸리티입니다.

#### 💡 핵심 특징
- **Windows 정품 엔진 활용**: 서드파티 레지스트리 클리너와 달리 OS 공식 디스크 정리 엔진을 사용하여 시스템 손상 위험 0%.
- **대규모 용량 즉시 확보**: 일반 캐시뿐만 아니라 수십 GB에 달하는 Windows 업데이트 찌꺼기와 이전 윈도우 백업(`Windows.old`)을 안전하게 정리.
- **초경량 무인 자동화**: 직관적인 모니터링 UI 제공, 정리 완료 시 확보된 여유 공간을 실시간으로 표시하고 자동 종료.

---

### 3. 업데이트
- **Windows.old 강제 권한 탈취 & 영구 소거**: 대규모 버전 업데이트 후 잠긴 `C:\Windows.old`를 `takeown` 및 `icacls`로 Administrators 권한 획득 후 안전 소거 (15~40GB 즉시 확보).
- **사용자 개인 파일 보존 안전 가드레일**: `C:\Windows.old\Users` 내 백업되지 않은 개인 데이터 유무를 사전 스캔하여 안전 보호.
- **Inno Setup 개별 파일 언팩 인스톨러 배포**: 단일 포터블 실행 파일뿐 아니라, 깔끔한 언팩형 인스톨러(.exe) 지원 및 무인 설치 스위치(`/VERYSILENT`) 완벽 지원.
- **Windows 방화벽 인바운드 규칙 자동 조용히 등록**: 컴퓨터실/사내 네트워크 환경에서 방화벽 경고 팝업 없이 원활하게 구동되도록 인스톨러 내 자동 등록.
- **휴지통 비우기 직접 API (`SHEmptyRecycleBinW`) 연동**: 레지스트리 플래그 외에 Win32 API를 직접 호출하여 전 드라이브 휴지통 비우기 신뢰성 100% 보장.
- **브랜딩 및 등록 상표 통일**: 파일 속성 및 UI 명칭을 'AhBiYout Windows 디스크 클린 오토', 등록 상표를 'AhBiYout'으로 공식 지정.

---

### 4. 앱 그림
```text
+-----------------------------------------------------------------------+
|  AhBiYout Windows 디스크 클린 오토 (v1.5.0)                       [-] [X]  |
+-----------------------------------------------------------------------+
|  [● 작업 진행 중]                                                     |
|                                                                       |
|  상태: 3단계: Windows 디스크 정리 실행 중... (⏱️ 00:18 경과)             |
|  상세: cleanmgr 엔진이 등록 항목을 순서대로(직렬) 정리하고 있습니다.   |
|                                                                       |
|  [========================================] 75%                      |
|                                                                       |
|  💾 C: 드라이브 여유 공간: 142.35 GB (+8.42 GB 확보 중)               |
+-----------------------------------------------------------------------+
|  개발자: AhBiYout | CISNET CORPORATION | 공식 블로그: AhBiYoutVibe     |
+-----------------------------------------------------------------------+
```

---

### 5. 다운로드
최신 릴리스 패키지는 GitHub 공식 저장소의 Releases 페이지에서 안전하게 다운로드하실 수 있습니다.

- **공식 릴리스 다운로드 페이지**:  
  👉 [https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases](https://github.com/AhBiYout-all/windows-disk-cleanup-builder/releases)
- **제공 파일 형식**:
  - `WindowsDiskCleanup_Setup_v1.5.0.exe` (표준 Windows 설치형 프로그램)
  - `DiskCleanupAuto_v1.5.0.exe` (무설치 단독 포터블 실행 파일)

---

### 6. 버전정보
- **소프트웨어 버전**: `v1.5.0` (빌드 번호: `1.5.0.0`)
- **릴리스 상태**: Stable Production
- **파일 설명 (FileDescription)**: AhBiYout Windows 디스크 클린 오토
- **제품 이름 (ProductName)**: AhBiYout Windows 디스크 클린 오토 (DiskCleanupAuto)
- **등록 상표 (LegalTrademarks)**: AhBiYout
- **저작권 (Copyright)**: Copyright (C) 2026 AhBiYout. All rights reserved.

---

### 7. 시스템 요구 사항
- **운영체제**: Microsoft Windows 11 / Windows 10 (32-bit & 64-bit 모든 에디션)
- **권한 요구사항**: 관리자 권한 (UAC 승인 필요 - 디스크 정리 엔진 실행용)
- **런타임 의존성**: **추가 설치 필요 없음** (Python 또는 추가 프레임워크 불필요, 자체 독립 실행)
- **디스크 공간**: 약 30MB 이상의 여유 공간

---

### 8. 제작자 및 공식 채널 안내
- **제작자 (개발자)**: AhBiYout
- **공식 깃허브 저장소**: [https://github.com/AhBiYout-all/windows-disk-cleanup-builder](https://github.com/AhBiYout-all/windows-disk-cleanup-builder)
- **공식 구글 블로그**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/) (AhBiYoutVibe)
- **소속 / 파트너**: [CISNET CORPORATION (시스넷)](http://www.cisnet.co.kr/)

---

### 9. 전체 업데이트(이전 기록 모두)

| 버전 | 일자 | 구분 | 주요 변경 내역 요약 |
| :---: | :---: | :---: | :--- |
| **`v1.5.0`** | 2026-10-11 | **MAJOR** | • Windows 11 Windows.old 권한 탈취 및 100% 완전 삭제 (`takeown` + `icacls`)<br>• C:\Windows.old\Users 개인 문서 보존 안전 가드레일 탑재<br>• Inno Setup 언팩 설치기 및 방화벽 인바운드 규칙 자동 조용히 등록<br>• Node.js 22 LTS 전환 및 인스톨러 배포 일원화<br>• 스마트 깃허브 푸시 유틸리티(`git_push.bat`) 및 개인정보 3중 스캔<br>• 휴지통 직접 비우기 API(`SHEmptyRecycleBinW`) 연동 및 로컬라이즈 키 자동 호환<br>• 파일 속성 등록 상표를 'AhBiYout'으로 표준화 |
| **`v1.4.0`** | 2026-09-07 | **MINOR** | • Win32 커널 동기화(`WaitForSingleObject`) 및 HWND 창 라이프사이클 실시간 후킹 (CPU 0%)<br>• 컴퓨터실/전산실 무인 대량 배포용 2초 주기 쉘 새로고침 및 트레이 가상 스위프<br>• C: 드라이브 여유 공간 실시간 계산 및 확보 용량 안내 (`GetDiskFreeSpaceExW`)<br>• 마우스 호버 즉시 닫기 제스처 & 5초 자동 카운트다운 종료 |
| **`v1.3.4`** | 2026-08-29 | **PATCH** | • 화면 상단(Top 22% Golden Ratio) 최적 배치로 작업표시줄 겹침 방지<br>• 실행 즉시 전면 윈도우 활성화 (`lift` & `wm_attributes`) |
| **`v1.3.3`** | 2026-08-29 | **PATCH** | • 대용량 Windows 업데이트 정리(WinSxS) 25초 타임아웃 제거 후 100% 완주 보장<br>• 실제 백그라운드 엔진 단계와 일치하는 상태 안내 및 실시간 타이머 |
| **`v1.3.2`** | 2026-08-19 | **PATCH** | • Python 3.12+ `SyntaxWarning` 예방 및 Release 폴더 파일 잠금 방어 |
| **`v1.3.1`** | 2026-08-19 | **PATCH** | • PyInstaller 빌드 결과물 EXE 파일명에 버전 자동 접미사 부여 |
| **`v1.3.0`** | 2026-08-19 | **MINOR** | • 0.2초 초고속 완료 감지 루프 및 진행 시간/소요 시간 실시간 타이머 |
| **`v1.2.0`** | 2026-08-19 | **MINOR** | • `cleanmgr.exe` 잔류 세션 및 OLE/COM 고착 강제 해제 (`taskkill` + `os._exit(0)`)<br>• 개발자(AhBiYout) 및 소속사(CISNET) 브랜딩 연동 |
| **`v1.1.0`** | 2026-08-19 | **MINOR** | • Tkinter GUI 모드 및 다중 실행 모드 탑재, 단일 포터블 EXE 빌더 지원 |
| **`v1.0.0`** | 2026-08-19 | **MAJOR** | • Windows `VolumeCaches` 레지스트리 기반 자동화 코어 엔진 최초 릴리즈 |

---

### 10. 추천 태그
> **구글 블로그(Blogger) 우측 라벨 입력란용 (15개 / 153자, 한글+영어 포함)**

```text
디스크정리, cleanmgr, Windows11, Windows10, C드라이브용량확보, 디스크클린오토, DiskCleanupAuto, 컴퓨터최적화, WindowsUpdate, WindowsOld, 무인정리, InnoSetup, AhBiYout, CISNET, 트레이잔상제거
```
