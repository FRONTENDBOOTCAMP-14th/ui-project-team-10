/**
 * Main Entry Point
 *
 * 모든 컴포넌트와 스크립트를 가져오는 중앙 진입점
 */

// 기본 스타일
import "/src/style.css";

// 컴포넌트 임포트
import "/src/scripts/component/link-component.js";
import "/src/scripts/component/button-component.js";
import "/src/scripts/component/base-card.js";
import "/src/scripts/component/album-card.js";
import "/src/scripts/component/artist-card.js";
import "/src/scripts/component/playlist-card.js";
import "/src/scripts/component/base-section.js";
import "/src/scripts/component/album-section.js";
import "/src/scripts/component/artist-section.js";
import "/src/scripts/component/playlist-section.js";

// 유틸리티 임포트
import "/src/scripts/utils/event-utils.js";
import "/src/scripts/utils/renderer.js";
import "/src/scripts/utils/state-manager.js";
import "/src/scripts/utils/spotify-api.js";

// 페이지 기능 임포트
import "/src/scripts/album.js";
import "/src/scripts/artist.js";
import "/src/scripts/page-main.js";
