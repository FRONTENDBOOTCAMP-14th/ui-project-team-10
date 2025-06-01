import { SectionManager } from "/src/scripts/section-manager.js";
import { getArtists } from "/src/scripts/utils/spotify-api.js";
import { renderArtists } from "/src/scripts/utils/renderer.js";

/**
 * 아티스트 섹션 클래스
 * SectionManager를 확장하여 아티스트 섹션에 특화된 기능 구현
 */
class ArtistSection extends SectionManager {
  constructor() {
    super("artist", {
      dataLoader: getArtists,
      renderer: renderArtists,
    });
  }

  /**
   * 표준화된 아티스트 클릭 이벤트 핸들러
   * @param {Object} data 이벤트 데이터
   */
  handleStandardizedItemClick(data) {
    // 부모 클래스의 기본 로직 실행
    super.handleStandardizedItemClick(data);

    // 아티스트 특화 로직 추가
    const { name, type, image, timestamp } = data;
    console.log(`Artist ${name} clicked at ${timestamp}`);

    // 여기서 추가 작업 수행 (스포티파이 링크 열기, 상세 정보 표시 등)
  }

  /**
   * 기존 artist-click 이벤트 핸들러
   * @param {CustomEvent} event 아티스트 클릭 이벤트
   */
  handleLegacyItemClick(event) {
    super.handleLegacyItemClick(event);
    console.log("Legacy artist click event:", event.detail);
    // 스포티파이 링크나 추가 작업 처리
  }
}

// 아티스트 섹션 인스턴스 생성
export const artistSection = new ArtistSection();

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", () => artistSection.init());

// 참고: 이제 모든 이벤트 정리는 SectionManager에서 자동으로 처리됩니다.
