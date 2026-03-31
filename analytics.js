// GA4 Measurement Protocol v2 Helper
// 측정 ID: G-6CPKDQN6BD
// API Secret: GA4 관리 > 데이터 스트림 > Measurement Protocol API 시크릿에서 발급 후 아래에 입력

const GA4_CONFIG = {
  measurementId: 'G-3GP3PVLKY5',
  apiSecret: '7odeI6RARe6RCniYqmt-bQ'
};

const GA4_ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_CONFIG.measurementId}&api_secret=${GA4_CONFIG.apiSecret}`;

// client_id 생성 및 저장 (사용자 세션 식별용)
async function getClientId() {
  return new Promise((resolve) => {
    chrome.storage.local.get('ga4_client_id', (result) => {
      if (result.ga4_client_id) {
        resolve(result.ga4_client_id);
      } else {
        const clientId = crypto.randomUUID();
        chrome.storage.local.set({ ga4_client_id: clientId });
        resolve(clientId);
      }
    });
  });
}

// GA4 이벤트 전송
async function sendGA4Event(eventName, params = {}) {
  try {
    const clientId = await getClientId();
    const payload = {
      client_id: clientId,
      events: [{
        name: eventName,
        params: {
          engagement_time_msec: '100',
          ...params
        }
      }]
    };

    await fetch(GA4_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.warn('[GA4] 이벤트 전송 실패:', error);
  }
}
