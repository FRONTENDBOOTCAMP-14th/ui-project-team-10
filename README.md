# 🎵 Copytify - Spotify UI Clone Project

[![Netlify Status](https://api.netlify.com/api/v1/badges/5b81bd62-35ce-402c-80b8-651cec7b76d2/deploy-status)](https://frontend-lion-friends.netlify.app/)  
[Live Demo](https://frontend-lion-friends.netlify.app/)

멋쟁이 사자처럼 프론트엔드 부트캠프 14기 UI 프로젝트 10조 **프론트엔드 사자 친구**의 Spotify UI 클론 프로젝트입니다.

## 프로젝트 개요

이 프로젝트는 Spotify를 재구현한 팀 프로젝트입니다.

### 주요 목표

- Spotify UI의 핵심 컴포넌트 구현
- 반응형 웹 디자인 적용
- 웹 접근성(ARIA) 준수
- 컴포넌트 기반 개발 경험
- 팀 협업 및 코드 컨벤션 학습

## 주요 기능

### 메인 페이지

- **홈 화면**: 프로젝트 소개 및 팀 정보
- **회고록**: 각 팀원의 프로젝트 회고
- **스크럼 회의록**: 개발 과정 기록
- **컨벤션**: 팀 코딩 규칙 및 가이드라인

### UI 컴포넌트

- **사이드바**: 네비게이션 및 플레이리스트 메뉴
- **헤더**: 검색바, 로고, 사용자 메뉴
- **메인 콘텐츠**: 앨범/아티스트 카드, 플레이어
- **푸터**: 링크 및 저작권 정보
- **버튼 시스템**: 일관된 디자인의 재사용 가능한 버튼

### 추가 페이지

- **로그인 페이지**: 사용자 인증 UI
- **회원가입 페이지**: 계정 생성 인터페이스
- **앱 설치 페이지**: 모바일 앱 다운로드 안내

## 기술 스택

### Frontend

- **HTML5**: 시맨틱 마크업
- **CSS3**: Flexbox, Grid, CSS Variables
- **JavaScript (ES6+)**: 모듈 시스템, DOM 조작
- **Vite**: 개발 서버 및 빌드 도구

### 개발 도구

- **Git**: 버전 관리
- **Prettier**: 코드 포맷팅
- **Netlify**: 배포 및 호스팅

### 디자인 시스템

- **Pretendard Variable**: 한글 웹폰트
- **Spotify Color Palette**: 브랜드 컬러 적용
- **ARIA**: 웹 접근성 준수

## 시작하기

### 필수 요구사항

- Node.js (v16 이상)
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**

   ```bash
   git clone https://github.com/your-username/ui-project-team-10.git
   cd ui-project-team-10
   ```

2. **의존성 설치**

   ```bash
   npm install
   ```

3. **개발 서버 실행**

   ```bash
   npm run dev
   ```

   브라우저에서 `http://localhost:5173` 접속

4. **빌드**

   ```bash
   npm run build
   ```

5. **프리뷰**
   ```bash
   npm run preview
   ```

### 사용 가능한 스크립트

```bash
npm run dev      # 개발 서버 시작
npm run build    # 프로덕션 빌드
npm run preview  # 빌드된 파일 프리뷰
npm run clean    # dist 폴더 정리
npm run all      # 정리 → 빌드 → 프리뷰 순차 실행
```

## 프로젝트 구조

```
ui-project-team-10/
├── public/                 # 정적 파일
│   ├── font/              # 웹폰트 파일
│   ├── icons/             # 아이콘 파일
│   └── images/            # 이미지 파일
├── src/                   # 소스 코드
│   ├── common/            # 공통 스타일
│   ├── components/        # UI 컴포넌트
│   │   ├── sidebar.html      # 사이드바
│   │   ├── header.html       # 헤더
│   │   ├── footer.html       # 푸터
│   │   ├── main.html         # 메인 콘텐츠
│   │   └── button.html       # 버튼 컴포넌트
│   ├── pages/             # 페이지 파일
│   │   ├── home.html         # 홈 페이지
│   │   ├── login-page.html   # 로그인 페이지
│   │   └── sign-page.html    # 회원가입 페이지
│   ├── scripts/           # JavaScript 파일
│   ├── styles/            # CSS 파일
│   └── assets/            # 기타 자산
├── index.html             # 메인 페이지
├── package.json           # 프로젝트 설정
├── vite.config.js         # Vite 설정
└── README.md              # 프로젝트 문서
```

## 팀 구성원 및 담당 영역

| 이름       | 역할   | 담당 컴포넌트              | 주요 기여                                  |
| ---------- | ------ | -------------------------- | ------------------------------------------ |
| **석정일** | 팀장   | 사이드바, 버튼 시스템      | 프로젝트 구조 설계, 색상 시스템, 폰트 적용 |
| **김동규** | 개발자 | 헤더                       | 검색 기능, 네비게이션, 사용자 메뉴         |
| **오경태** | 개발자 | 메인 콘텐츠, 앨범/아티스트 | 카드 컴포넌트, 레이아웃 시스템             |
| **고우현** | 개발자 | 푸터                       | 링크 시스템, 저작권 정보, 반응형 디자인    |

### 상세 담당 영역

#### 석정일 (팀장)

- **컴포넌트**: `sidebar.html`, `button.html`
- **스타일**: `sidebar.css`, `button.css`
- **주요 기여**:
  - 재사용 가능한 버튼 컴포넌트 설계
  - 사이드바 네비게이션 구현

#### 김동규

- **컴포넌트**: `header.html`, `header-com.html`
- **스타일**: `header.css`
- **주요 기여**:
  - 검색바 및 검색 기능 구현
  - 로고 및 브랜딩 요소
  - 사용자 메뉴 인터페이스

#### 오경태

- **컴포넌트**: `main.html`, `album-card.html`, `artist.html`
- **스타일**: `main.css`, `album.css`
- **주요 기여**:
  - 메인 콘텐츠 레이아웃
  - 앨범/아티스트 카드 컴포넌트
  - 그리드 시스템 구현

#### 고우현

- **컴포넌트**: `footer.html`, `footer-component.html`
- **스타일**: `footer.css`
- **주요 기여**:
  - 푸터 링크 시스템
  - 저작권 및 법적 정보
  - 반응형 푸터 디자인

## 디자인 시스템

### 색상 팔레트

```css
:root {
  --spotify-white: #ffffff;
  --spotify-black: #000000;
  --spotify-dark-gray: #121212;
  --spotify-light-gray: #b3b3b3;
  --spotify-green: #1ed760;
}
```

### 컴포넌트 스타일

- **버튼**: 일관된 패딩, 보더, 호버 효과
- **카드**: 그림자, 둥근 모서리, 호버 애니메이션
- **레이아웃**: Flexbox 및 Grid 활용

## 웹 접근성 (Accessibility)

- **ARIA 속성**: 스크린 리더 지원
- **키보드 네비게이션**: 모든 인터랙티브 요소 접근 가능
- **시맨틱 HTML**: 의미있는 마크업 구조
- **색상 대비**: WCAG 가이드라인 준수

## 개발 컨벤션

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
style: 코드 스타일 변경
refactor: 코드 리팩토링
docs: 문서 수정
test: 테스트 코드
chore: 기타 변경사항
```

### 파일 네이밍

- **HTML**: kebab-case (예: `login-page.html`)
- **CSS**: kebab-case (예: `button-style.css`)
- **JavaScript**: camelCase (예: `indexBackground.js`)
- **클래스명**: BEM 방법론 적용

### 코드 스타일

- **들여쓰기**: 2 spaces
- **따옴표**: 작은따옴표 사용
- **세미콜론**: 필수
- **Prettier**: 자동 포맷팅 적용

## 프로젝트 히스토리

### 주요 마일스톤

- **5월 26일**: 프로젝트 킥오프, 역할 분담
- **6월 2일**: 컴포넌트 개발 완료
- **현재**: 접근성 개선 및 문서화 완료

### 학습 성과

- 컴포넌트 기반 개발 경험
- 팀 협업 및 Git 워크플로우
- 웹 접근성 및 시맨틱 HTML
- 현대적인 CSS 기법 활용

## 배포

이 프로젝트는 [Netlify](https://netlify.com)를 통해 자동 배포됩니다.

- **배포 URL**: https://frontend-lion-friends.netlify.app/
- **배포 상태**: 상단 배지 확인
- **자동 배포**: main 브랜치 푸시 시 자동 배포

## 라이선스

이 프로젝트는 교육용 목적으로 제작되었습니다.
