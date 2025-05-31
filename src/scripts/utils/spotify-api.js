/**
 * Spotify API 유틸리티
 *
 * Spotify API 관련 공통 함수들과 ID 목록을 모아둔 유틸리티 모듈
 *
 * 개선된 기능:
 * - API 호출 타임아웃 설정
 * - 재시도 메커니즘
 * - 캐싱 기능
 * - 세분화된 에러 처리
 */

/**
 * 아티스트 ID 목록 - Spotify API 호출에 사용됨
 * @type {string}
 */
export const artistIds = [
  "30b9WulBM8sFuBo17nNq9c",
  "5TnQc2N1iKlFjYD7CPGvFc",
  "6YVMFz59CuY7ngCxTxjpxE",
  "6zn0ihyAApAYV51zpXxdEp",
  "6mEQK9m2krja6X1cfsAjfl",
  "3eVa5w3URK5duf6eyVDbu9",
  "4gzpq5DPGxSnKTe4SA8HAU",
  "5wVJpXzuKV6Xj7Yhsf2uYx",
  "6lESE9VeLV05vQBw8TB4YA",
  "0dBTTLuseszs4BqgyXCrC8",
  "4XDi67ZENZcbfKnvMnTYsI",
  "6UbmqUEgjLA6jAcXwbM1Z9",
  "2QM5S4yO6xHgnNvF0nbZZq",
].join(",");

/**
 * 앨범 ID 목록 - Spotify API 호출에 사용됨
 * @type {string}
 */
export const albumIds = [
  "5NUuj9AlcNI1khPYJJAVtV",
  "6ZG5lRT77aJ3btmArcykra",
  "3j7aiYai9ezbvxVCgrd2mb",
  "2oCAY48bhZvQte0l7apmYC",
  "28GiIRNu9nEugqnUci3aIC",
  "3T4tUhGYeRNVUGevb0wThu",
  "7pH8F7IVHTp2ZYKG0xN1CE",
  "32n91KG3YeLMLJ9e64EfXy",
].join(",");

/**
 * 플레이리스트 ID 목록 - Spotify API 호출에 사용됨
 * @type {Array<string>}
 */
export const playlistIds = [
  "6IZ7kJDFvRoM3EP0JTVEMi",
  "4lqydlFFjybZbeShlvR5wp",
  "6wmGWoKWOjSBFjugPl6Fz8",
  "32xX8oN3MRsNwIiBaxRMaF",
  "2Q1ZRB9qy5uKFLirHGDgn6",
  "7JfeMWiAZ1MBktHRtD2Jy2",
  "6fuI3AxjJWgqJtZwkV7wIR",
];

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

// API 관련 설정
const API_CONFIG = {
  timeout: 10000, // 10초 타임아웃
  retries: 3, // 최대 재시도 횟수
  retryDelay: 1000, // 재시도 지연 시간(ms)
  cacheTime: 5 * 60 * 1000, // 캐싱 유효 시간 (5분)
};

// 캐싱 시스템
const cache = {
  data: new Map(),
  timestamps: new Map(),

  /**
   * 캐시에서 데이터 가져오기
   * @param {string} key 캐시 키
   * @returns {any|null} 캐시된 데이터 또는 null
   */
  get(key) {
    if (!this.has(key)) return null;

    // 캐시 유효성 확인
    const timestamp = this.timestamps.get(key);
    const now = Date.now();

    if (now - timestamp > API_CONFIG.cacheTime) {
      this.delete(key);
      return null;
    }

    return this.data.get(key);
  },

  /**
   * 캐시에 데이터 저장
   * @param {string} key 캐시 키
   * @param {any} data 저장할 데이터
   */
  set(key, data) {
    this.data.set(key, data);
    this.timestamps.set(key, Date.now());
  },

  /**
   * 캐시 키 존재 여부 확인
   * @param {string} key 캐시 키
   * @returns {boolean} 존재 여부
   */
  has(key) {
    return this.data.has(key) && this.timestamps.has(key);
  },

  /**
   * 캐시에서 데이터 삭제
   * @param {string} key 캐시 키
   */
  delete(key) {
    this.data.delete(key);
    this.timestamps.delete(key);
  },

  /**
   * 캐시 전체 삭제
   */
  clear() {
    this.data.clear();
    this.timestamps.clear();
  },
};

/**
 * 타임아웃이 있는 fetch 함수
 * @param {string} url 요청 URL
 * @param {Object} options fetch 옵션
 * @param {number} timeout 타임아웃 시간(ms)
 * @returns {Promise<Response>} fetch 결과
 */
async function fetchWithTimeout(
  url,
  options = {},
  timeout = API_CONFIG.timeout
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error(`요청 시간 초과: ${url}`);
    }
    throw error;
  }
}

/**
 * 재시도 로직이 포함된 fetch 함수
 * @param {string} url 요청 URL
 * @param {Object} options fetch 옵션
 * @param {number} retries 최대 재시도 횟수
 * @param {number} retryDelay 재시도 지연 시간(ms)
 * @returns {Promise<Response>} fetch 결과
 */
async function fetchWithRetry(
  url,
  options = {},
  retries = API_CONFIG.retries,
  retryDelay = API_CONFIG.retryDelay
) {
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      lastError = error;

      // 마지막 시도에서 실패하면 예외 발생
      if (i === retries) break;

      // 재시도 전 대기
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // 다음 재시도에는 대기 시간 증가 (백오프)
      retryDelay = retryDelay * 1.5;
    }
  }

  throw lastError;
}

/**
 * API 요청 에러 처리 및 응답 검증
 * @param {Response} response fetch 응답 객체
 * @param {string} errorMessage 에러 메시지
 * @returns {Promise<any>} 응답 데이터
 */
async function handleApiResponse(response, errorMessage) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const status = response.status;
    let message = errorMessage;

    // HTTP 상태 코드에 따른 더 자세한 에러 처리
    switch (status) {
      case 401:
        message = "인증이 만료되었습니다. 다시 로그인해주세요.";
        // 인증 오류의 경우 토큰 캐시 삭제
        cache.delete("spotify_token");
        break;
      case 404:
        message = "요청한 리소스를 찾을 수 없습니다.";
        break;
      case 429:
        message = "요청 제한을 초과하였습니다. 잠시 후 다시 시도해주세요.";
        break;
      case 500:
      case 502:
      case 503:
        message = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        break;
    }

    const error = new Error(message);
    error.status = status;
    error.data = errorData;
    throw error;
  }

  return await response.json();
}

/**
 * Spotify API 인증 토큰을 가져옵니다.
 * @returns {Promise<string>} API 토큰
 */
export async function getToken() {
  // 캐싱된 토큰이 있는지 확인
  const cachedToken = cache.get("spotify_token");
  if (cachedToken) {
    return cachedToken;
  }

  try {
    const res = await fetchWithRetry("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
      },
      body: "grant_type=client_credentials",
    });

    const data = await handleApiResponse(
      res,
      "토큰을 가져오는 데 실패했습니다."
    );

    // 토큰 캐싱 (1시간 동안 유효)
    cache.set("spotify_token", data.access_token);

    return data.access_token;
  } catch (error) {
    console.error("토큰 가져오기 오류:", error.message);
    throw error;
  }
}

/**
 * 여러 앨범 정보를 가져옵니다.
 * @param {string} token Spotify API 토큰
 * @param {string} [ids=albumIds] 콤마로 구분된 앨범 ID 목록, 생략시 기본 목록 사용
 * @returns {Promise<Array>} 앨범 목록
 */
export async function getAlbums(token, ids = albumIds) {
  // 캐싱 키 생성
  const cacheKey = `albums_${ids}`;

  // 캐싱된 데이터 확인
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const res = await fetchWithRetry(
      `https://api.spotify.com/v1/albums?ids=${ids}&market=KR`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await handleApiResponse(
      res,
      "앨범 데이터를 불러오지 못했습니다."
    );

    // 성공적으로 가져온 데이터 캐싱
    cache.set(cacheKey, data.albums);

    return data.albums;
  } catch (error) {
    console.error("앨범 데이터 가져오기 오류:", error.message);

    // 401 인증 오류의 경우 토큰 만료로 간주하고 새 토큰 발급 시도
    if (error.status === 401) {
      try {
        const newToken = await getToken();
        return getAlbums(newToken, ids);
      } catch (tokenError) {
        console.error("토큰 재발급 실패:", tokenError.message);
      }
    }

    throw error;
  }
}

/**
 * 여러 아티스트 정보를 가져옵니다.
 * @param {string} token Spotify API 토큰
 * @param {string} [ids=artistIds] 콤마로 구분된 아티스트 ID 목록, 생략시 기본 목록 사용
 * @returns {Promise<Array>} 아티스트 목록
 */
export async function getArtists(token, ids = artistIds) {
  // 캐싱 키 생성
  const cacheKey = `artists_${ids}`;

  // 캐싱된 데이터 확인
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    const res = await fetchWithRetry(
      `https://api.spotify.com/v1/artists?ids=${ids}&market=KR`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await handleApiResponse(
      res,
      "아티스트 데이터를 불러오지 못했습니다."
    );

    // 성공적으로 가져온 데이터 캐싱
    cache.set(cacheKey, data.artists);

    return data.artists;
  } catch (error) {
    console.error("아티스트 데이터 가져오기 오류:", error.message);

    // 401 인증 오류의 경우 토큰 만료로 간주하고 새 토큰 발급 시도
    if (error.status === 401) {
      try {
        const newToken = await getToken();
        return getArtists(newToken, ids);
      } catch (tokenError) {
        console.error("토큰 재발급 실패:", tokenError.message);
      }
    }

    throw error;
  }
}

/**
 * 플레이리스트 정보를 가져옵니다.
 * @param {string} token Spotify API 토큰
 * @param {string|Array<string>} ids 플레이리스트 ID 또는 ID 배열
 * @returns {Promise<Array>} 플레이리스트 데이터 배열
 */
export async function getPlaylists(token, ids) {
  // ids가 배열이 아닌 경우 배열로 변환
  const idArray = Array.isArray(ids) ? ids : [ids];

  // 캐싱 키 생성
  const cacheKey = `playlists_${idArray.join("_")}`;

  // 캐싱된 데이터 확인
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // 모든 플레이리스트 요청을 병렬로 처리
    const playlistPromises = idArray.map((id) =>
      fetchWithRetry(`https://api.spotify.com/v1/playlists/${id}?market=KR`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );

    // 모든 요청이 완료될 때까지 기다림
    const responses = await Promise.all(playlistPromises);

    // 각 응답 처리 및 JSON 변환
    const dataPromises = responses.map((res) =>
      handleApiResponse(res, "플레이리스트 데이터를 불러오지 못했습니다.")
    );

    const playlists = await Promise.all(dataPromises);

    // 성공적으로 가져온 데이터 캐싱
    cache.set(cacheKey, playlists);

    return playlists;
  } catch (error) {
    console.error("플레이리스트 데이터 가져오기 오류:", error.message);

    // 401 인증 오류의 경우 토큰 만료로 간주하고 새 토큰 발급 시도
    if (error.status === 401) {
      try {
        const newToken = await getToken();
        return getPlaylists(newToken, ids);
      } catch (tokenError) {
        console.error("토큰 재발급 실패:", tokenError.message);
      }
    }

    throw error;
  }
}

/**
 * 모든 섹션 데이터를 병렬로 가져옵니다.
 * @returns {Promise<Object>} 각 섹션의 데이터를 포함한 객체
 */
export async function getAllSectionData() {
  try {
    // 토큰 가져오기
    const token = await getToken();

    // 병렬로 모든 데이터 가져오기
    const [artists, albums, playlists] = await Promise.all([
      getArtists(token),
      getAlbums(token),
      getPlaylists(token, playlistIds),
    ]);

    return {
      artists,
      albums,
      playlists,
    };
  } catch (error) {
    console.error("섹션 데이터 로딩 오류:", error.message);
    throw error;
  }
}

/**
 * 스크롤 버튼 토글 유틸리티 함수
 * @param {string} type 타입 (앨범, 아티스트, 플레이리스트 등)
 * @param {boolean} show 보여줄지 여부
 */
export function toggleScrollButtons(type, show) {
  const selectors = {
    artist: [".artist-scroll-btn-left", ".artist-scroll-btn-right"],
    album: [".album-scroll-btn-left", ".album-scroll-btn-right"],
    playlist: [".playlist-scroll-btn-left", ".playlist-scroll-btn-right"],
  };

  selectors[type]?.forEach((selector) => {
    const btn = document.querySelector(selector);
    if (btn) btn.style.display = show ? "block" : "none";
  });
}
