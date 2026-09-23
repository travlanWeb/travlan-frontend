# 트래블랜 (Travlan)

Travel + Plan. 예산 기반 국내 여행 플래너 서비스입니다. 지도에서 여행지를 필터링해 **여행가방**에 담고, **타임라인**으로 세부 일정을 구성할 수 있습니다.

현대오토에버 모빌리티 SW스쿨 2차 팀 프로젝트로 제작되었습니다.

## 주요 기능

- 홈 / 지도 / 타임라인 / 커뮤니티 / 마이페이지 / 로그인 / 회원가입
- 지도 기반 장소 탐색 및 카테고리 필터링, 지도 뷰포트 기반 목록 필터링
- 여행 생성: 여행 정보(이름/기간/예산) 입력 → 장소 담기(여행가방) → 타임라인에서 일정(day/비용/순서/시간) 구성 → 저장
- 일반 로그인 / 구글 로그인(Google Identity Services)
- 커뮤니티에서 다른 사용자의 여행 둘러보기

## 기술 스택

- **Frontend**: React 19, TypeScript, Vite 7, Tailwind CSS v4
- **상태관리**: Zustand(여행가방 등 기존 기능) + Redux Toolkit(인증, 타임라인 등 신규 기능) 혼용
- **라우팅**: react-router-dom v6.4+ (`createBrowserRouter`)
- **HTTP**: axios (요청 인터셉터로 accessToken 자동 첨부, 401 시 자동 재발급/재시도)
- **지도**: react-kakao-maps-sdk (카카오맵)
- **아키텍처**: FSD(Feature-Sliced Design) 기반 `app → pages → widgets → features → entities → shared`
- **백엔드**: Spring Boot, DB는 Supabase(Postgres)
- **배포**: Vercel(프론트), AWS EC2(백엔드)

## 시작하기

```bash
npm install
npm run dev       # 개발 서버 실행 (http://localhost:5173)
```

### 환경 변수

`.env` 파일은 git에 포함되지 않으므로 로컬에 직접 생성해야 합니다.

```
VITE_API_BASE_URL=<백엔드 API 주소>
```

로컬 백엔드(`localhost:8080`) 또는 배포된 EC2 서버 주소 중 사용할 환경에 맞게 설정하세요.

### 주요 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (Vite, HMR). 타입 체크는 하지 않음 |
| `npm run build` | `tsc -b && vite build`. 타입 체크를 엄격하게 수행하므로 배포 전 로컬에서 한 번 실행해볼 것 |
| `npm run lint` | oxlint 실행 |
| `npm run preview` | 빌드 결과물 로컬 미리보기 |

## 폴더 구조

FSD(Feature-Sliced Design)를 느슨하게 적용하고 있습니다. 레이어 간 의존 방향(`app → pages → widgets → features → entities → shared`)만 지키고, 세부 구조는 유동적으로 운영합니다.

```
src/
├── app/            # 라우터, 스토어, 전역 스타일/디자인 토큰
├── pages/          # 홈, 지도, 타임라인, 커뮤니티, 마이페이지, 로그인, 회원가입
├── widgets/        # navbar, kakao-map, bag-panel, travel-detail-modal 등
├── entities/       # place, bag, travel, auth 등 도메인 모델/훅/스토어
└── shared/         # axios 인스턴스 등 공통 유틸
```

## 참고 사항

- 카카오맵 사용을 위해서는 카카오 개발자 콘솔에서 JavaScript 키를 발급받고, 사용하는 도메인(localhost:5173, 배포 도메인)을 등록해야 합니다.
- 구글 로그인을 사용하려면 Google Cloud Console에 승인된 JavaScript 원본을 등록해야 합니다.
- 테스트 러너는 아직 설정되어 있지 않습니다.
