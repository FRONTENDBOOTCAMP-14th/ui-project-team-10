const header = document.querySelector("header");
function isMaximizedWindow() {
  return window.innerWidth >= 1650;
}

function updateBackgroundZoom() {
  if (!isMaximizedWindow()) {
    header.style.backgroundSize = "cover";
    return;
  }

  const scrollY = window.scrollY;
  const zoom = 100 + scrollY * 0.05;
  const limitedZoom = Math.min(zoom, 200);
  header.style.backgroundSize = `${limitedZoom}%`;
}

window.addEventListener("scroll", updateBackgroundZoom);
window.addEventListener("resize", updateBackgroundZoom);
window.addEventListener("DOMContentLoaded", updateBackgroundZoom);
