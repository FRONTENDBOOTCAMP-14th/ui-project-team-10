import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// ESM 환경에서 __dirname 안전하게 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// findAllHtmlFiles 함수 정의 (Vite 8/Node.js 최신 환경 최적화)
function findAllHtmlFiles(directory) {
  const htmlFiles = {};

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith(".html")) {
        // 상대 경로 계산 및 플랫폼별 슬래시(/) 통일
        const relativePath = path.relative(__dirname, filePath).replace(/\.html$/, "");
        const key = relativePath.replace(/\\/g, "/"); 
        htmlFiles[key] = filePath;
      }
    }
  }

  scanDirectory(directory);
  return htmlFiles;
}

export default defineConfig({
  build: {
    // 1. Vite 8 전용 Rolldown 옵션 적용
    rolldownOptions: {
      input: {
        index: path.resolve(__dirname, "index.html"),
        ...findAllHtmlFiles(path.resolve(__dirname, "src")),
      },
    },
    // 2. Vite 8의 기본 타겟은 'baseline-widely-available'입니다. 
    // 필요 시 oxc 설정을 통해 트랜스파일을 세부 제어할 수 있습니다.
  },
  // 3. Vite 8 최신 모듈 리졸버 지원 환경 설정
  resolve: {
    // 만약 tsconfig.json의 paths 설정을 사용 중이라면, 
    // 외부 플러그인 없이 아래 내장 옵션만 켜주면 동작합니다.
    // tsconfigPaths: true 
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.js", "netlify/**/*.test.{js,mjs}"],
  },
  appType: "mpa", // MPA(Multi-Page Application) 구조 유지
  server: {
    // open: 'src/pages/main/index.html',
  },
});
