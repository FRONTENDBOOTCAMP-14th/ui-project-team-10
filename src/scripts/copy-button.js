/**
 * 지정된 HTML 요소의 텍스트를 클립보드에 복사하는 기능을 버튼에 추가합니다.
 * Clipboard API를 사용하여 현대적이고 안전한 방식으로 텍스트를 복사합니다.
 *
 * @async
 * @function copyToClipboard
 * @param {string} elementId - 복사할 텍스트가 있는 HTML 요소의 ID
 *                            (input, textarea의 경우 value 속성, 다른 요소의 경우 textContent 속성을 복사)
 * @param {string} buttonId - 클릭 시 복사 기능을 실행할 버튼 요소의 ID
 *
 * @returns {Promise<void>} Promise 객체 (반환값 없음)
 *
 * @throws {Error} Clipboard API가 지원되지 않거나 복사에 실패한 경우
 *
 * @example
 * // HTML: <input id="myInput" value="복사할 텍스트">
 * //       <button id="myButton">복사</button>
 *
 * // 입력 필드의 텍스트를 복사하는 기능 추가
 * copyToClipboard("myInput", "myButton");
 *
 * @example
 * // HTML: <p id="myText">일반 텍스트</p>
 * //       <button id="copyBtn">복사</button>
 *
 * // 문단의 텍스트를 복사하는 기능 추가
 * copyToClipboard("myText", "copyBtn");
 *
 * @example
 * // 페이지 로드 후 여러 복사 기능 설정
 * document.addEventListener('DOMContentLoaded', function() {
 *     copyToClipboard("emailInput", "emailCopyBtn");
 *     copyToClipboard("codeArea", "codeCopyBtn");
 * });
 *
 * @author 석정일
 *
 */
async function copyToClipboard(elementId, buttonId) {
  const button = document.getElementById(buttonId);
  const textElement = document.getElementById(elementId);

  if (!button || !textElement) {
    console.error("Required elements not found");
    return;
  }

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(
        textElement.value || textElement.textContent
      );

      // 시각적 피드백 (alert 대신)
      button.textContent = "!";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      button.textContent = "Copy failed";
      setTimeout(() => {
        button.textContent = "Copy";
      }, 2000);
    }
  });
}
