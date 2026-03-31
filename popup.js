document.addEventListener('DOMContentLoaded', function() {
  const downloadBtn = document.getElementById('downloadBtn');
  const columnData = document.getElementById('columnData');
  const resultDiv = document.getElementById('result');

  // GA4: 팝업 열림 이벤트
  sendGA4Event('popup_open');

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

    // GA4: 다운로드 클릭 이벤트
    sendGA4Event('download_click', {
      link_count: String(links.length),
      file_type: fileType
    });

    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳ 처리 중...';
    showResult('', 'info');

    try {
      // background.js에 메시지 전송 (action: 'downloadThumbnails')
      const response = await chrome.runtime.sendMessage({
        action: 'downloadThumbnails',
        links: links,
        fileType: fileType
      });
      if (response && response.success) {
        showResult('✅ 썸네일 다운로드가 완료되었습니다!', 'success');
        // GA4: 다운로드 완료 이벤트
        sendGA4Event('download_complete', {
          link_count: String(links.length),
          success_count: String(response.results ? response.results.filter(r => !r.thumbnailUrl.startsWith('ERROR')).length : 0)
        });
      } else {
        showResult('❌ 오류: ' + (response && response.error ? response.error : '알 수 없는 오류'), 'error');
        // GA4: 다운로드 에러 이벤트
        sendGA4Event('download_error', {
          error_message: response && response.error ? response.error : 'unknown'
        });
      }
    } catch (error) {
      showResult('❌ 오류: ' + error.message, 'error');
      // GA4: 다운로드 에러 이벤트
      sendGA4Event('download_error', {
        error_message: error.message
      });
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.textContent = '썸네일 다운로드';
    }
  });

  function showResult(message, type = 'info') {
    resultDiv.textContent = message;
    resultDiv.style.color = (type === 'error') ? 'red' : (type === 'success' ? 'green' : '#333');
  }

  // 커스텀 라디오 버튼 로직
  let fileType = 'origin';
  const originOption = document.getElementById('originOption');
  const cropOption = document.getElementById('cropOption');
  const originRadio = document.getElementById('originRadio');
  const cropRadio = document.getElementById('cropRadio');

  originOption.addEventListener('click', function() {
    fileType = 'origin';
    originRadio.classList.add('selected');
    cropRadio.classList.remove('selected');
    // GA4: 라디오 선택 이벤트
    sendGA4Event('radio_select', { file_type: 'origin' });
  });
  cropOption.addEventListener('click', function() {
    alert('크롭 파일로 받기 기능은 현재 일시 중지되었습니다.');
    // fileType은 origin만 유지
    cropRadio.classList.remove('selected');
    originRadio.classList.add('selected');
    fileType = 'origin';
    // GA4: 라디오 선택 이벤트 (크롭 시도)
    sendGA4Event('radio_select', { file_type: 'crop' });
  });

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