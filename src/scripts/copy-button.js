/**
 * 지정된 HTML 요소의 텍스트 또는 HTML을 클립보드에 복사하는 기능을 버튼에 추가합니다.
 * Clipboard API를 사용하여 현대적이고 안전한 방식으로 텍스트를 복사합니다.
 *
 * @async
 * @function copyToClipboard
 * @param {string} elementId - 복사할 내용이 있는 HTML 요소의 ID
 * @param {string} buttonId - 클릭 시 복사 기능을 실행할 버튼 요소의 ID
 * @param {string} [copyType='text'] - 복사할 내용의 유형 ('text' 또는 'html').
 *                                     'text'인 경우: input, textarea의 value 속성 또는 다른 요소의 textContent 속성을 복사합니다.
 *                                     'html'인 경우: 요소의 innerHTML 속성을 복사합니다.
 *
 * @returns {Promise<void>} Promise 객체 (반환값 없음)
 *
 * @throws {Error} Clipboard API가 지원되지 않거나 복사에 실패한 경우
 *
 * @example
 * // HTML: <input id="myInput" value="복사할 텍스트">
 * //       <button id="myButton">복사</button>
 * // 입력 필드의 텍스트를 복사하는 기능 추가
 * copyToClipboard("myInput", "myButton"); // copyType defaults to 'text'
 *
 * @example
 * // HTML: <div id="myHtmlContent"><p>Hello</p></div>
 * //       <button id="copyHtmlBtn">HTML 복사</button>
 * // div의 HTML을 복사하는 기능 추가
 * copyToClipboard("myHtmlContent", "copyHtmlBtn", "html");
 *
 * @example
 * // 페이지 로드 후 여러 복사 기능 설정
 * document.addEventListener('DOMContentLoaded', function() {
 *     copyToClipboard("emailInput", "emailCopyBtn");
 *     copyToClipboard("codeArea", "codeCopyBtn", "text");
 *     copyToClipboard("articleBody", "copyArticleHtmlBtn", "html");
 * });
 *
 * @author 석정일
 *
 */
async function copyToClipboard(elementId, buttonId, copyType = "text") {
  const button = document.getElementById(buttonId);
  const textElement = document.getElementById(elementId);

  if (!button || !textElement) {
    console.error("Required elements not found");
    return;
  }

  button.addEventListener("click", async () => {
    let contentToCopy;
    if (copyType === "html") {
      contentToCopy = textElement.innerHTML;
    } else {
      // Default to 'text'
      contentToCopy = textElement.value || textElement.textContent;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);

      const originalButtonText = button.textContent;
      button.textContent = "복사 완료!";
      setTimeout(() => {
        button.textContent = originalButtonText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      const originalButtonText = button.textContent;
      button.textContent = "복사 실패";
      setTimeout(() => {
        button.textContent = originalButtonText;
      }, 2000);
    }
  });
}

export { copyToClipboard };
