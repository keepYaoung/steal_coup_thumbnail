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
  });
  cropOption.addEventListener('click', function() {
    alert('크롭 파일로 받기 기능은 현재 일시 중지되었습니다.');
    // fileType은 origin만 유지
    cropRadio.classList.remove('selected');
    originRadio.classList.add('selected');
    fileType = 'origin';
  });

  // 닫기 버튼 이벤트
  const closeBtn = document.getElementById('closeBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      window.close();
    });
  }
}); 