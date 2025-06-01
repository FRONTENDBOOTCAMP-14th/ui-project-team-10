/**
 * 플레이리스트 섹션 모듈
 *
 * SectionManager를 확장하여 플레이리스트 섹션에 특화된 기능을 제공합니다.
 * 데이터 로딩, 렌더링, 이벤트 처리를 담당합니다.
 */

import { SectionManager } from "/src/scripts/section-manager.js";
import { getPlaylists, playlistIds } from "/src/scripts/utils/spotify-api.js";
import { renderPlaylists } from "/src/scripts/utils/renderer.js";

/**
 * 플레이리스트 섹션 클래스
 * SectionManager를 확장하여 플레이리스트 섹션에 특화된 기능 구현
 */
class PlaylistSection extends SectionManager {
  constructor() {
    super("playlist", {
      dataLoader: async (token) => {
        try {
          if (
            !playlistIds ||
            !Array.isArray(playlistIds) ||
            playlistIds.length === 0
          ) {
            console.error(
              "PlaylistSection: playlistIds is not properly defined"
            );
            throw new Error("플레이리스트 ID가 정의되지 않았습니다.");
          }
          return await getPlaylists(token, playlistIds);
        } catch (error) {
          console.error("PlaylistSection dataLoader error:", error);
          throw error;
        }
      },
      renderer: renderPlaylists,
    });
  }

  /**
   * 표준화된 플레이리스트 클릭 이벤트 핸들러
   * @param {Object} data 이벤트 데이터
   */
  handleStandardizedItemClick(data) {
    // 부모 클래스의 기본 로직 실행
    super.handleStandardizedItemClick(data);

    // 플레이리스트 특화 로직 추가
    const { name, description, cover, timestamp } = data;
    console.log(`Playlist ${name} clicked at ${timestamp}`);

    // 여기서 추가 작업 수행 (스포티파이 링크 열기, 상세 정보 표시 등)
  }

  /**
   * 기존 playlist-click 이벤트 핸들러
   * @param {CustomEvent} event 플레이리스트 클릭 이벤트
   */
  handleLegacyItemClick(event) {
    super.handleLegacyItemClick(event);
    console.log("Legacy playlist click event:", event.detail);
    // 스포티파이 링크나 추가 작업 처리
  }
}

// 플레이리스트 섹션 인스턴스 생성
export const playlistSection = new PlaylistSection();

// DOM이 로드되면 초기화
document.addEventListener("DOMContentLoaded", () => playlistSection.init());

// 참고: 이제 모든 이벤트 정리는 SectionManager에서 자동으로 처리됩니다.
