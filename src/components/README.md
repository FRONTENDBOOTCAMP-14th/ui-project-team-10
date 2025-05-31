컴포넌트 모듈입니다.
컴포넌트 시안 페이지를 여기에다가 추가하시면 됩니다.

## 석정일

- 담당 컴포넌트: 사이드바 (sidebar.html)
- 주요 작업: 내비게이션, 플레이리스트 메뉴, 푸터 링크 구현
- 사용 클래스: sidebar, sidebar-menu, sidebar-item, sidebar-link, sidebar-icon, sidebar-text, sidebar-playlist, sidebar-footer
- 색상값:
  - 흰색: #FFFFFF (텍스트, 아이콘)
  - 회색: #B3B3B3 (푸터 링크)
  - 둥근 아이콘 배경: gray-outline-style

## 김동규

- 담당 컴포넌트: 헤더 (header.html, header-com.html)
- 주요 작업: 검색바, 로고, 홈버튼, 메뉴 구현
- 사용 클래스: header-box, header, search-box, container, icon-search, search-button, link-more-group, link-login-group
- 색상값:
  - 흰색: #FFFFFF (로고, 아이콘)
  - 회색: #B3B3B3 (검색 아이콘, 분리선)
  - 검은색: #000000 (배경)

## 오경태

- 담당 컴포넌트: 앨범, 아티스트 (album.html, artist.html)
- 주요 작업: 스크롤 가능한 리스트 컴포넌트 구현
- 사용 클래스: list-component, list-header, scroll-wrapper, scroll-btn, album-list, artist-list
- 색상값:
  - CSS에서 정의 (album.css, artist.css)
  - 기본 텍스트 색상: 흰색

## 고우현

- 담당 컴포넌트: 푸터 (footer.html, footer-component.html)
- 주요 작업: 회사 정보, 커뮤니티, 소셜 미디어 링크 구현
- 사용 클래스: footer-container, footer-columns, footer-column, footer-social, footer-bottom
- 색상값:
  - 흰색: #FFFFFF (제목)
  - 회색: #B3B3B3 (링크)
  - 배경색: #000000, #181818
  - 호버 색상: #8081b9 (링크 호버)

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
