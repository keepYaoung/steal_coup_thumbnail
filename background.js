// Google Sheets API 관련 변수
// let accessToken = null;
// let currentTab = null;

// 메시지 리스너 등록
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractThumbnails') {
    handleExtractThumbnails(request.data, sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }
  // downloadThumbnails 액션 추가
  if (request.action === 'downloadThumbnails') {
    handleDownloadThumbnails(request.links, request.fileType, sendResponse);
    return true;
  }
});

// 썸네일 추출 메인 함수 (테스트 버전)
async function handleExtractThumbnails(data, sendResponse) {
  try {
    sendProgress('🚀 테스트 모드로 시작합니다', 10);
    
    // 테스트용 링크 (실제로는 사용자가 입력)
    const testLinks = [
      'https://www.coupang.com/vp/products/123456789',
      'https://www.coupang.com/vp/products/987654321'
    ];
    
    // 사용자가 입력한 링크가 있으면 사용
    if (data.testLinks && data.testLinks.length > 0) {
      testLinks.length = 0;
      testLinks.push(...data.testLinks);
    }
    
    sendProgress(`📊 ${testLinks.length}개의 테스트 링크를 사용합니다`, 20);
    
    // 각 링크에 대해 썸네일 추출
    const results = [];
    for (let i = 0; i < testLinks.length; i++) {
      const link = testLinks[i];
      
      sendProgress(`🖼️ ${i + 1}/${testLinks.length} 썸네일 추출 중...`, 20 + (i / testLinks.length) * 60);
      
      try {
        const thumbnailUrl = await extractThumbnailFromUrl(link);
        results.push({
          row: i + 2,
          thumbnailUrl: thumbnailUrl
        });
      } catch (error) {
        console.error(`링크 ${link} 처리 중 오류:`, error);
        results.push({
          row: i + 2,
          thumbnailUrl: 'ERROR: ' + error.message
        });
      }
    }
    
    sendProgress('✅ 테스트 완료!', 100);
    sendResponse({ 
      success: true, 
      message: `${results.length}개의 썸네일을 테스트했습니다.`,
      results: results
    });
    
  } catch (error) {
    console.error('썸네일 추출 중 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Google OAuth2 인증 (나중에 구현)
async function authenticateGoogle() {
  return new Promise((resolve) => {
    console.log('Google 인증은 나중에 구현됩니다.');
    resolve('TEST_TOKEN');
  });
}

// 스프레드시트에서 링크 읽기 (나중에 구현)
async function readSpreadsheetLinks(spreadsheetId, sheetName, linkColumn) {
  console.log('Google Sheets API는 나중에 구현됩니다.');
  return [];
}

// 썸네일 추출 함수
async function extractThumbnailFromUrl(url) {
  return new Promise((resolve, reject) => {
    chrome.tabs.create({ url: url, active: false }, (createdTab) => {
      const timeoutId = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        chrome.tabs.remove(createdTab.id, () => {});
        reject(new Error('페이지 로딩 시간 초과'));
      }, 30000);

      // 페이지 로딩 완료 대기
      function listener(tabId, changeInfo) {
        if (tabId === createdTab.id && changeInfo.status === 'complete') {
          clearTimeout(timeoutId);
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.sendMessage(createdTab.id, { action: 'extractThumbnail' }, (response) => {
            if (chrome.runtime.lastError) {
              chrome.tabs.remove(createdTab.id);
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            const thumbnailUrl = response ? response.thumbnailUrl : null;
            chrome.tabs.remove(createdTab.id);
            if (thumbnailUrl) {
              resolve(thumbnailUrl);
            } else {
              reject(new Error('썸네일을 찾을 수 없습니다.'));
            }
          });
        }
      }
      chrome.tabs.onUpdated.addListener(listener);
    });
  });
}

// 결과를 스프레드시트에 기록 (나중에 구현)
async function writeThumbnailResults(spreadsheetId, sheetName, resultColumn, results) {
  console.log('Google Sheets API 쓰기는 나중에 구현됩니다.');
  console.log('결과:', results);
}

// 진행상황 전송 함수
function sendProgress(message, percent) {
  chrome.runtime.sendMessage({
    type: 'progress',
    message: message,
    percent: percent
  });
}

// 200x200px 중앙 크롭 함수
async function cropImageToSquare200(imageUrl) {
  const blob = await fetch(imageUrl).then(r => r.blob());
  const img = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(200, 200);
  const ctx = canvas.getContext('2d');
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (img.width > img.height) {
    sx = (img.width - img.height) / 2;
    sw = img.height;
  } else if (img.height > img.width) {
    sy = (img.height - img.width) / 2;
    sh = img.width;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 200);
  const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
  return URL.createObjectURL(croppedBlob);
}

// downloadThumbnails 핸들러
async function handleDownloadThumbnails(links, fileType, sendResponse) {
  try {
    let fileIndex = 1;
    const results = [];
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      try {
        const thumbnailUrl = await extractThumbnailFromUrl(link);
        results.push({
          index: i,
          link: link,
          thumbnailUrl: thumbnailUrl
        });
        if (thumbnailUrl && !thumbnailUrl.startsWith('ERROR')) {
          let filename = '';
          if (fileType === 'crop') {
            filename = `000 Extract Coupang thumnail/crawl_img_${fileIndex}_crop.jpg`;
            fileIndex++;
            const croppedUrl = await cropImageToSquare200(thumbnailUrl);
            chrome.downloads.download({
              url: croppedUrl,
              filename: filename,
              saveAs: false
            }, () => {
              URL.revokeObjectURL(croppedUrl);
              if (chrome.runtime.lastError) {
                results.push({ index: i, link: link, error: chrome.runtime.lastError.message });
              }
            });
          } else {
            filename = `000 Extract Coupang thumnail/crawl_img_${fileIndex}.jpg`;
            fileIndex++;
            chrome.downloads.download({
              url: thumbnailUrl,
              filename: filename,
              saveAs: false
            }, () => {
              if (chrome.runtime.lastError) {
                results.push({ index: i, link: link, error: chrome.runtime.lastError.message });
              }
            });
          }
        }
      } catch (error) {
        results.push({
          index: i,
          link: link,
          thumbnailUrl: 'ERROR: ' + error.message
        });
      }
    }
    sendResponse({
      success: true,
      message: `${results.length}개의 썸네일을 다운로드했습니다.`,
      results: results
    });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
} 