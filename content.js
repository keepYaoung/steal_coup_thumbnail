// 쿠팡 페이지에서 썸네일 이미지 URL을 추출하는 함수
function extractThumbnailUrl() {
  // 페이지 로딩 완료 대기
  return new Promise((resolve) => {
    // 이미 페이지가 로드된 경우
    if (document.readyState === 'complete') {
      resolve(findThumbnailUrl());
    } else {
      // 페이지 로딩 완료 대기
      window.addEventListener('load', () => {
        // 이미지 로딩을 위한 추가 대기
        setTimeout(() => {
          resolve(findThumbnailUrl());
        }, 2000);
      });
    }
  });
}

// 썸네일 URL 찾기 함수
function findThumbnailUrl() {
  let thumbnailUrl = null;
  
  // 방법 1: 메인 상품 이미지 (가장 우선순위)
  const mainImg = document.querySelector('img.prod-image__detail');
  if (mainImg && mainImg.src) {
    thumbnailUrl = mainImg.src;
    console.log('메인 이미지에서 썸네일 찾음:', thumbnailUrl);
    return normalizeUrl(thumbnailUrl);
  }
  
  // 방법 2: 썸네일 이미지 리스트
  const thumbImgs = document.querySelectorAll('ul.prod-thumb-image-list img');
  for (const img of thumbImgs) {
    if (img.src) {
      thumbnailUrl = img.src;
      console.log('썸네일 리스트에서 이미지 찾음:', thumbnailUrl);
      return normalizeUrl(thumbnailUrl);
    }
  }
  
  // 방법 3: 새로운 레이아웃의 이미지
  const newImgs = document.querySelectorAll('div.twc-relative.twc-flex-1.md\\:twc-mx-\\[16px\\] img');
  for (const img of newImgs) {
    if (img.src) {
      thumbnailUrl = img.src;
      console.log('새 레이아웃에서 이미지 찾음:', thumbnailUrl);
      return normalizeUrl(thumbnailUrl);
    }
  }
  
  // 방법 4: 상품 이미지 컨테이너
  const productContainers = document.querySelectorAll('.prod-image, .product-image, [class*="image"]');
  for (const container of productContainers) {
    const img = container.querySelector('img');
    if (img && img.src && img.src.includes('coupang')) {
      thumbnailUrl = img.src;
      console.log('상품 컨테이너에서 이미지 찾음:', thumbnailUrl);
      return normalizeUrl(thumbnailUrl);
    }
  }
  
  // 방법 5: 모든 이미지 중 쿠팡 이미지 찾기
  const allImgs = document.querySelectorAll('img');
  for (const img of allImgs) {
    if (img.src && 
        (img.src.includes('image.coupangcdn.com') || 
         img.src.includes('coupang.com') ||
         img.src.includes('thumbnail'))) {
      thumbnailUrl = img.src;
      console.log('일반 이미지에서 쿠팡 이미지 찾음:', thumbnailUrl);
      return normalizeUrl(thumbnailUrl);
    }
  }
  
  // 방법 6: data-src 속성 확인 (lazy loading)
  const lazyImgs = document.querySelectorAll('img[data-src]');
  for (const img of lazyImgs) {
    if (img.dataset.src && img.dataset.src.includes('coupang')) {
      thumbnailUrl = img.dataset.src;
      console.log('Lazy loading 이미지에서 찾음:', thumbnailUrl);
      return normalizeUrl(thumbnailUrl);
    }
  }
  
  console.log('썸네일을 찾을 수 없습니다.');
  return null;
}

// URL 정규화 함수
function normalizeUrl(url) {
  if (!url) return null;
  
  // 상대 URL을 절대 URL로 변환
  if (url.startsWith('//')) {
    url = 'https:' + url;
  } else if (url.startsWith('/')) {
    url = window.location.origin + url;
  }
  
  // URL에서 불필요한 파라미터 제거 (선택사항)
  try {
    const urlObj = new URL(url);
    // 특정 파라미터만 유지하고 나머지는 제거
    const cleanUrl = new URL(urlObj.origin + urlObj.pathname);
    return cleanUrl.toString();
  } catch (e) {
    return url;
  }
}

// 메시지 리스너 등록 (background script에서 호출할 때 사용)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractThumbnail') {
    extractThumbnailUrl().then(thumbnailUrl => {
      sendResponse({ thumbnailUrl: thumbnailUrl });
    });
    return true; // 비동기 응답을 위해 true 반환
  }
});

// 페이지 로드 시 자동으로 썸네일 추출 (디버깅용)
if (window.location.hostname.includes('coupang.com')) {
  console.log('쿠팡 썸네일 추출기 로드됨');
  let isDev = true;
  if (chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    if (manifest.update_url) {
      // 개발 모드가 아닌 경우 자동 실행하지 않음
      isDev = false;
    }
  }
  if (isDev) {
    // 개발 모드에서 자동으로 썸네일 추출 테스트
    setTimeout(() => {
      extractThumbnailUrl().then(url => {
        if (url) {
          console.log('자동 추출된 썸네일 URL:', url);
        }
      });
    }, 1000);
  }
} 