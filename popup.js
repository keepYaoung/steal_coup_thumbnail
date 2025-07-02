document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  const columnData = document.getElementById('columnData');
  const resultDiv = document.getElementById('result');

  downloadBtn.addEventListener('click', async function() {
    const rawText = columnData.value.trim();
    if (!rawText) {
      showResult('❌ 열 데이터를 붙여넣어 주세요.', 'error');
      return;
    }
    // 각 줄을 링크로 인식
    const links = rawText.split('\n').map(line => line.trim()).filter(line => line);
    if (links.length === 0) {
      showResult('❌ 유효한 링크가 없습니다.', 'error');
      return;
    }

    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳ 처리 중...';
    showResult('🔍 썸네일을 조회하고 있습니다...', 'info');

    try {
      // background.js에 메시지 전송 (action: 'downloadThumbnails')
      const response = await chrome.runtime.sendMessage({
        action: 'downloadThumbnails',
        links: links
      });
      if (response && response.success) {
        showResult('✅ 썸네일 다운로드가 완료되었습니다!', 'success');
      } else {
        showResult('❌ 오류: ' + (response && response.error ? response.error : '알 수 없는 오류'), 'error');
      }
    } catch (error) {
      showResult('❌ 오류: ' + error.message, 'error');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = '썸네일 다운로드';
    }
  });

  // 진행상황 메시지 수신 (옵션)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'progress') {
      showResult(message.message, 'info');
    }
  });

  function showResult(message, type = 'info') {
    resultDiv.textContent = message;
    resultDiv.style.color = (type === 'error') ? 'red' : (type === 'success' ? 'green' : '#333');
  }
}); 