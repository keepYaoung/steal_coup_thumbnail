// i18n 적용
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18n);
    if (msg) el.textContent = msg;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18nHtml);
    if (msg) el.innerHTML = msg.replace(/\n/g, '<br>');
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const msg = chrome.i18n.getMessage(el.dataset.i18nPlaceholder);
    if (msg) el.placeholder = msg;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  applyI18n();

  const downloadBtn = document.getElementById('downloadBtn');
  const columnData = document.getElementById('columnData');
  const resultDiv = document.getElementById('result');
  const toast = document.getElementById('toast');

  // GA4: 팝업 열림 이벤트
  sendGA4Event('popup_open');

  // 토스트 표시
  let toastTimer = null;
  function showToast(html, duration = 4000) {
    toast.innerHTML = html;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // AI 기능 버튼
  const aiFeatureBtn = document.getElementById('aiFeatureBtn');
  aiFeatureBtn.addEventListener('click', function() {
    sendGA4Event('ai_feature_click', { feature: 'five_angle_image' });
    showToast(chrome.i18n.getMessage('toast_ai'));
  });

  downloadBtn.addEventListener('click', async function() {
    const rawText = columnData.value.trim();
    if (!rawText) {
      showResult(chrome.i18n.getMessage('error_no_data'), 'error');
      return;
    }
    // 각 줄을 링크로 인식
    const links = rawText.split('\n').map(line => line.trim()).filter(line => line);
    if (links.length === 0) {
      showResult(chrome.i18n.getMessage('error_no_links'), 'error');
      return;
    }

    // GA4: 다운로드 클릭 이벤트
    sendGA4Event('download_click', {
      link_count: String(links.length)
    });

    downloadBtn.disabled = true;
    downloadBtn.textContent = chrome.i18n.getMessage('processing');
    showResult('', 'info');

    try {
      // background.js에 메시지 전송 (action: 'downloadThumbnails')
      const response = await chrome.runtime.sendMessage({
        action: 'downloadThumbnails',
        links: links
      });
      if (response && response.success) {
        showResult(chrome.i18n.getMessage('success_download'), 'success');
        // GA4: 다운로드 완료 이벤트
        sendGA4Event('download_complete', {
          link_count: String(links.length),
          success_count: String(response.results ? response.results.filter(r => !r.thumbnailUrl.startsWith('ERROR')).length : 0)
        });
      } else {
        showResult(chrome.i18n.getMessage('error_prefix') + (response && response.error ? response.error : chrome.i18n.getMessage('error_unknown')), 'error');
        // GA4: 다운로드 에러 이벤트
        sendGA4Event('download_error', {
          error_message: response && response.error ? response.error : 'unknown'
        });
      }
    } catch (error) {
      showResult(chrome.i18n.getMessage('error_prefix') + error.message, 'error');
      // GA4: 다운로드 에러 이벤트
      sendGA4Event('download_error', {
        error_message: error.message
      });
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = chrome.i18n.getMessage('download_btn');
    }
  });

  function showResult(message, type = 'info') {
    resultDiv.textContent = message;
    resultDiv.style.color = (type === 'error') ? 'red' : (type === 'success' ? 'green' : '#333');
  }


  // 닫기 버튼 이벤트
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      // GA4: 닫기 버튼 이벤트
      sendGA4Event('close_click');
      window.close();
    });
  }
});
