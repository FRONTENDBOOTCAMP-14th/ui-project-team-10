/**
 * 플레이리스트 섹션 컴포넌트
 *
 * 플레이리스트 목록을 표시하는 섹션 컴포넌트입니다.
 * 새로운 상태 관리 시스템을 활용합니다.
 * @element playlist-section
 */

import { getToken, getPlaylists, playlistIds } from "../utils/spotify-api.js";
import "./playlist-card.js";
import { BaseSection } from "./base-section.js";
import { globalEventBus } from "../utils/state-manager.js";

class PlaylistSection extends BaseSection {
  constructor() {
    super();
    this.sectionName = "playlist";
    this.titleText = "플레이리스트";
    
    // 이벤트 구독 설정
    this.unsubscribeHandlers = [
      globalEventBus.subscribe('playlist:stateChanged', this.handleStateUpdate.bind(this)),
      globalEventBus.subscribe('playlist:renderComplete', this.handleRenderComplete.bind(this))
    ];
    
    this.render();
  }
  
  /**
   * 컴포넌트가 DOM에서 제거될 때 이벤트 구독을 취소합니다.
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    // 모든 이벤트 구독 취소
    this.unsubscribeHandlers.forEach(unsubscribe => unsubscribe());
  }
  
  /**
   * 상태 변경 시 호출되는 핸들러
   * @param {Object} data - 상태 변경 데이터
   */
  handleStateUpdate(data) {
    // 특정 상태 변경에 따른 처리 로직
    console.log(`플레이리스트 섹션 상태 변경: ${data.property}`);
  }
  
  /**
   * 렌더링 완료 시 호출되는 핸들러
   * @param {Object} data - 렌더링 완료 데이터
   */
  handleRenderComplete(data) {
    console.log(`플레이리스트 렌더링 완료: ${data.itemCount} 항목`);  
  }

  /**
   * 플레이리스트 데이터를 로드합니다.
   * BaseSection의 loadData 메서드를 구현합니다.
   * StateManager를 활용한 개선된 버전입니다.
   * @returns {Promise<Array>} 플레이리스트 배열
   */
  async loadData() {
    try {
      // 이벤트 발행: 데이터 로드 시작
      globalEventBus.publish('playlist:loadStart', { timestamp: new Date() });
      
      // 토큰 가져오기
      const token = await getToken();

      // spotify-api.js의 개선된 getPlaylists 함수 사용
      const playlists = await getPlaylists(token, playlistIds);
      
      // 이벤트 발행: 데이터 로드 완료
      globalEventBus.publish('playlist:loadComplete', { 
        count: playlists.length,
        timestamp: new Date() 
      });
      
      // 상태 객체에 저장되므로 더 이상 로컬 변수에 저장할 필요 없음
      return playlists;
    } catch (error) {
      console.error("플레이리스트 데이터 로드 오류:", error.message);
      
      // 이벤트 발행: 데이터 로드 실패
      globalEventBus.publish('playlist:loadError', { 
        error: error.message,
        timestamp: new Date() 
      });
      
      throw error;
    }
  }

  /**
   * 플레이리스트 카드 요소를 생성합니다.
   * BaseSection의 createCardElement 메서드를 구현합니다.
   * 이벤트 기반 통신을 추가하여 개선되었습니다.
   * @param {Object} playlist - 플레이리스트 데이터
   * @returns {HTMLElement} 생성된 플레이리스트 카드 요소
   */
  createCardElement(playlist) {
    // 이벤트 발행: 카드 생성 시작
    globalEventBus.publish('playlist:cardCreate', {
      id: playlist.id,
      name: playlist.name
    });
    
    // playlist-card 커스텀 요소 생성
    const playlistCard = document.createElement("playlist-card");
    playlistCard.setAttribute("playlist-title", playlist.name);
    playlistCard.setAttribute("playlist-owner", playlist.owner.display_name);
    playlistCard.setAttribute(
      "playlist-cover",
      playlist.images[0]?.url || "default.jpg"
    );
    // 데이터 속성 추가
    playlistCard.dataset.id = playlist.id;

    // 클릭 이벤트 처리 - Spotify로 연결
    playlistCard.addEventListener("playlist-click", (event) => {
      // 이벤트 발행: 카드 클릭
      globalEventBus.publish('playlist:cardClick', {
        id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls.spotify
      });
      
      window.open(playlist.external_urls.spotify, "_blank");
    });

    // 마우스 호버 이벤트 처리 추가
    playlistCard.addEventListener("mouseenter", () => {
      globalEventBus.publish('playlist:cardHover', { id: playlist.id });
    });

    return playlistCard;
  }
}

customElements.define("playlist-section", PlaylistSection);
