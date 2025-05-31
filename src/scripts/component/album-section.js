/**
 * 앨범 섹션 컴포넌트
 *
 * 이벤트 관리 및 상태 관리를 표준화한 앨범 섹션 컴포넌트입니다.
 * @element album-section
 */

import { getToken, getAlbums } from "../utils/spotify-api.js";
import "./album-card.js";
import { BaseSection } from "./base-section.js";
import { EventTypes } from "../utils/event-utils.js";

class AlbumSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "album";
    this.titleText = "앨범";
    this.items = [];
    this.render();

    // 앨범 전용 이벤트 구독 설정
    this.setupAlbumEventSubscriptions();
  }

  /**
   * 앨범 관련 이벤트 구독을 설정합니다.
   */
  setupAlbumEventSubscriptions() {
    // 앨범 카드 클릭 이벤트 구독
    this.eventManager.subscribe(`${this.sectionName}:cardClick`, (data) => {
      if (data && data.item && data.item.external_urls) {
        this.eventManager.publish(`${this.sectionName}:albumSelected`, {
          id: data.item.id,
          name: data.item.name,
          artists: data.item.artists,
          url: data.item.external_urls.spotify,
          timestamp: new Date(),
        });

        // Spotify로 연결
        window.open(data.item.external_urls.spotify, "_blank");
      }
    });
  }

  /**
   * 앨범 데이터를 로드합니다.
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
      this.items = await getAlbums(token);

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
   * 앨범 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 처리를 개선하였습니다.
   * @param {Object} album - 앨범 데이터
   * @returns {HTMLElement} 생성된 앨범 카드 요소
   */
  createCardElement(album) {
    // 이벤트 발행: 카드 생성 시작
    this.eventManager.publish(`${this.sectionName}:cardCreateStart`, {
      albumId: album.id,
      timestamp: new Date(),
    });

    // album-card 커스텀 요소 생성
    const albumCard = document.createElement("album-card");
    albumCard.setAttribute("album-title", album.name);
    albumCard.setAttribute(
      "album-artist",
      album.artists.map((a) => a.name).join(", ")
    );
    albumCard.setAttribute(
      "album-cover",
      album.images[0]?.url || "default.jpg"
    );

    // 클릭 이벤트 처리 - 이벤트 관리자 사용
    this.eventManager.addListener(albumCard, "album-click", () => {
      this.eventManager.publish(`${this.sectionName}:albumCardClick`, {
        id: album.id,
        name: album.name,
        artists: album.artists,
        url: album.external_urls.spotify,
        timestamp: new Date(),
      });

      // 데이터 해석 및 UI 업데이트는 구독자에서 처리
    });

    // 호버 이벤트 처리 추가
    this.eventManager.addListener(albumCard, "mouseenter", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverStart`, {
        albumId: album.id,
        timestamp: new Date(),
      });
    });

    this.eventManager.addListener(albumCard, "mouseleave", () => {
      this.eventManager.publish(`${this.sectionName}:cardHoverEnd`, {
        albumId: album.id,
        timestamp: new Date(),
      });
    });

    // 이벤트 발행: 카드 생성 완료
    this.eventManager.publish(`${this.sectionName}:cardCreateComplete`, {
      albumId: album.id,
      timestamp: new Date(),
    });

    return albumCard;
  }
}

customElements.define("album-section", AlbumSection);
