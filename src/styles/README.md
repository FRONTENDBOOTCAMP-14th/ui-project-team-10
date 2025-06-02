여기에다가 스타일 관련 CSS 파일을 추가하시면 됩니다.

## 석정일

- 담당 CSS 파일: button.css, colors.css, font.css, sidebar.css, index-page.css
- 주요 스타일 구현:
  - 사이드바 레이아웃 - flex 활용한 세로 배치
  - 일관된 버튼 스타일 시스템 구축
  - 우리말 폰트 적용 (Pretendard Variable)
- 주요 클래스:
  - `.sidebar` - 사이드바 메인 컨테이너
  - `.btn` - 버튼 기본 스타일
  - `.rounded-btn` - 둥근배경 버튼
  - `.gray-outline-style` - 경계선이 있는 회색 버튼
- 주요 색상값:
  - 흰색 `#FFFFFF`(--spotify-white)
  - 검은색 `#000000`(--spotify-black)
  - 어두운 회색 `#121212`(--spotify-dark-gray)
  - 회색 `#B3B3B3`(--spotify-light-gray)
  - 초록색 `#1ED760`(--spotify-green)

## 김동규

- 담당 CSS 파일: header.css, header-com.css
- 주요 스타일 구현:
  - 헤더 및 상단 네비게이션 영역 레이아웃
  - 확장/축소 가능한 검색창 구현 (반응형)
  - 사용자 조작에 따라 호버/포커스 상태 관리
- 주요 클래스:
  - `.header-box` - 전체 헤더 박스
  - `.search-box` - 검색창 컨테이너
  - `.container` - 확장된 검색창
  - `.clossing-search-bar` - 축소된 검색창
  - `.link-more-group`, `.link-login-group` - 메뉴 그룹
- 주요 색상값:
  - `--button-bg-color`: #252525 (검색박스 배경)
  - `--button-hover-color`: #2a2a2a (호버시 배경)
  - `--font-color`: #b3b3b3 (기본 텍스트)
  - `--button-size`: 40px (버튼 크기 변수)

## 오경태

- 담당 CSS 파일: album.css, artist.css, main.css
- 주요 스타일 구현:
  - 스크롤 가능한 카드 형식 리스트 구현
  - 그리드/리스트 뷰 변환 기능
  - 앨범/아티스트 리스트 스타일링
  - 재생 버튼 호버 효과 구현
- 주요 클래스:
  - `.list-component` - 리스트 컴포넌트 컨테이너
  - `.list-card` - 카드 아이템
  - `.scroll-wrapper` - 스크롤 기능 컨테이너
  - `.album-list`, `.artist-list` - 앨범/아티스트 리스트
  - `.grid-mode` - 그리드 뷰 변환 시 적용
- 주요 색상값:
  - 흰색 `#FFFFFF` (텍스트)
  - 회색 `#B3B3B3` (보조 텍스트)
  - 호버 배경색 `#1f1f1f` (카드 호버)
  - 스크롤 버튼 `#2a2a2a` (좌우 스크롤 버튼)

## 고우현

- 담당 CSS 파일: footer.css
- 주요 스타일 구현:
  - 푸터 여러 칼럼 레이아웃
  - 소셜 미디어 아이콘 및 스타일
  - 반응형 레이아웃(1000px, 768px 기준)
  - CSS 변수를 활용한 일관성 있는 디자인
- 주요 클래스:
  - `.footer-container` - 푸터 컨테이너
  - `.footer-columns` - 칼럼 그룹 레이아웃
  - `.footer-column` - 개별 칼럼
  - `.footer-social` - 소셜 미디어 아이콘 영역
  - `.footer-bottom` - 커피라이트 영역
- 주요 색상값:
  - `--footer-bg`: #181818 (푸터 배경)
  - `--footer-fg`: #fff (푸터 메인 텍스트)
  - `--footer-fg-light`: #b3b3b3 (링크 텍스트)
  - `--footer-link-hover`: #6df843 (링크 호버 색상)
  - `--footer-social-bg`: #222 (소셜 버튼 배경)

## 공통으로 사용할 수 있는 원자 클래스

- 색상 관련:

  - `white-text`: 흰색 텍스트 (#FFFFFF)
  - `gray-text`: 회색 텍스트 (#B3B3B3)
  - `black-text`: 검은색 텍스트 (#000000)
  - `bg-black`: 검은색 배경 (#000000)
  - `bg-dark-gray`: 어두운 회색 배경 (#181818)
  - `bg-green`: 스포티파이 녹색 배경

- 레이아웃 관련:

  - `flex-row`: 가로 방향 플렉스 레이아웃
  - `flex-column`: 세로 방향 플렉스 레이아웃
  - `margin-bottom-2rem`: 아래쪽 여백 2rem

- 버튼/링크 관련:

  - `btn`: 기본 버튼 스타일
  - `rounded-btn`: 둥근 버튼 스타일
  - `gray-outline-style`: 회색 테두리 스타일

- 제거하면 좋을 중복 클래스:
  - sidebar-item-active와 같은 상태 클래스는 CSS 선택자로 대체 가능
  - icon-search 같은 아이콘 클래스는 공통 아이콘 시스템으로 통합 가능
  - 각 컴포넌트별 반복되는 색상 정의는 CSS 변수로 통합

# 컴포넌트 스타일

이 디렉토리는 애플리케이션의 컴포넌트별 스타일을 관리합니다.
전역 스타일 및 유틸리티는 `src/common/` 디렉토리에서 관리됩니다.
