/**
 * 아티스트 섹션 컴포넌트
 *
 * 이벤트 관리 및 상태 관리를 표준화한 아티스트 섹션 컴포넌트입니다.
 * @element artist-section
 */

import { getToken, getArtists } from "../utils/spotify-api.js";
import "./artist-card.js";
import { BaseSection } from "./base-section.js";
import { EventTypes } from "../utils/event-utils.js";

class ArtistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "artist";
    this.titleText = "아티스트";
    this.items = [];
    this.render();

    // 아티스트 전용 이벤트 구독 설정
    this.setupArtistEventSubscriptions();
  }

  /**
   * 아티스트 관련 이벤트 구독을 설정합니다.
   */
  setupArtistEventSubscriptions() {
    // 아티스트 카드 클릭 이벤트 구독
    this.eventManager.subscribe(`${this.sectionName}:cardClick`, (data) => {
      if (data && data.item && data.item.external_urls) {
        this.eventManager.publish(`${this.sectionName}:artistSelected`, {
          id: data.item.id,
          name: data.item.name,
          url: data.item.external_urls.spotify,
          timestamp: new Date(),
        });

        // Spotify로 연결
        window.open(data.item.external_urls.spotify, "_blank");
      }
    });
  }

  /**
   * 아티스트 데이터를 로드합니다.
   * BaseSection의 loadData 메서드를 구현합니다.
   * 이벤트 발행 기능을 추가하였습니다.
   */
  async loadData() {
    try {
      // 이벤트 발행: 로드 시작
      this.eventManager.publish(`${this.sectionName}:loadStart`, {
        timestamp: new Date(),
      });

      const token = await getToken();
      this.items = await getArtists(token);

      // 이벤트 발행: 로드 성공
      this.eventManager.publish(`${this.sectionName}:loadSuccess`, {
        itemCount: this.items.length,
        timestamp: new Date(),
      });

      return this.items;
    } catch (error) {
      // 이벤트 발행: 로드 오류
      this.eventManager.publish(`${this.sectionName}:loadError`, {
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * 아티스트 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 처리를 개선하였습니다.
   * @param {Object} artist - 아티스트 데이터
   * @returns {HTMLElement} 생성된 아티스트 카드 요소
   */
  createCardElement(artist) {
    // 이벤트 발행: 카드 생성 시작
    this.eventManager.publish(`${this.sectionName}:cardCreateStart`, {
      artistId: artist.id,
      timestamp: new Date(),
    });

    // artist-card 커스텀 요소 생성
    const artistCard = document.createElement("artist-card");
    artistCard.setAttribute("artist-name", artist.name);
    artistCard.setAttribute("artist-type", "Artist");
    artistCard.setAttribute("artist-image", artist.images[0]?.url || "");

    // 클릭 이벤트 처리 - 이벤트 관리자 사용
    this.eventManager.addListener(artistCard, "artist-click", () => {
      this.eventManager.publish(`${this.sectionName}:artistCardClick`, {
        id: artist.id,
        name: artist.name,
        url: artist.external_urls.spotify,
        timestamp: new Date(),
      });

      // 데이터 해석 및 UI 업데이트는 구독자에서 처리
    });

    // 호버 이벤트 처리 추가
    this.eventManager.addListener(artistCard, "mouseenter", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverStart`, {
        artistId: artist.id,
        timestamp: new Date(),
      });
    });

    this.eventManager.addListener(artistCard, "mouseleave", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverEnd`, {
        artistId: artist.id,
        timestamp: new Date(),
      });
    });

    // 이벤트 발행: 카드 생성 완료
    this.eventManager.publish(`${this.sectionName}:cardCreateComplete`, {
      artistId: artist.id,
      timestamp: new Date(),
    });

    return artistCard;
  }
}

customElements.define("artist-section", ArtistSection);
