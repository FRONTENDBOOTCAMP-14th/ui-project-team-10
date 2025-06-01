import { SectionManager } from "/src/scripts/section-manager.js";
import { getAlbums } from "/src/scripts/utils/spotify-api.js";
import { renderAlbums } from "/src/scripts/utils/renderer.js";

/**
 * 앨범 섹션 클래스
 * SectionManager를 확장하여 앨범 섹션에 특화된 기능 구현
 */
class AlbumSection extends SectionManager {
  constructor() {
    super("album", {
      dataLoader: getAlbums,
      renderer: renderAlbums,
    });
  }

  /**
   * 표준화된 앨범 클릭 이벤트 핸들러
   * @param {Object} data 이벤트 데이터
   */
  handleStandardizedItemClick(data) {
    // 부모 클래스의 기본 로직 실행
    super.handleStandardizedItemClick(data);

    // 앨범 특화 로직 추가
    const { title, artist, cover, timestamp } = data;
    console.log(`Album ${title} by ${artist} clicked at ${timestamp}`);

    // 여기서 추가 작업 수행 (스포티파이 링크 열기, 상세 정보 표시 등)
  }

  /**
   * 기존 album-click 이벤트 핸들러
   * @param {CustomEvent} event 앨범 클릭 이벤트
   */
  handleLegacyItemClick(event) {
    super.handleLegacyItemClick(event);
    console.log("Legacy album click event:", event.detail);
    // 스포티파이 링크나 추가 작업 처리
  }
}

// 앨범 섹션 인스턴스 생성
export const albumSection = new AlbumSection();

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", () => albumSection.init());

// 참고: 이제 모든 이벤트 정리는 SectionManager에서 자동으로 처리됩니다.
