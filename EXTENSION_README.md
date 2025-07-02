# 쿠팡 썸네일 추출기 - Chrome Extension

구글 시트의 쿠팡 링크에서 썸네일을 자동으로 추출하여 시트에 기록하는 크롬 익스텐션입니다.

## 🚀 주요 기능

- 구글 시트의 특정 열에서 쿠팡 링크 자동 읽기
- 각 링크에서 썸네일 이미지 URL 자동 추출
- 추출된 썸네일 URL을 지정된 열에 자동 기록
- 실시간 진행상황 표시
- 설정 자동 저장

## 📋 설치 방법

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Google Sheets API 활성화
4. OAuth 2.0 클라이언트 ID 생성:
   - "애플리케이션 유형" → "Chrome 앱"
   - "애플리케이션 ID" → 크롬 익스텐션의 ID 입력
5. 생성된 클라이언트 ID를 `manifest.json`의 `client_id`에 입력

### 2. Chrome Extension 설치

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단의 "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 이 프로젝트 폴더 선택

### 3. manifest.json 수정

```json
{
  "oauth2": {
    "client_id": "YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/spreadsheets"
    ]
  }
}
```

## 🎯 사용 방법

### 1. 구글 시트 준비

- 쿠팡 링크가 있는 열 (예: B열)
- 썸네일 URL을 저장할 열 (예: C열)
- 첫 번째 행은 헤더로 사용

### 2. 익스텐션 실행

1. Chrome 브라우저 우측 상단의 익스텐션 아이콘 클릭
2. "쿠팡 썸네일 추출기" 선택
3. 팝업에서 다음 정보 입력:
   - **스프레드시트 ID/URL**: 구글 시트 URL 또는 ID
   - **시트 이름**: 하단 탭에 표시되는 시트 이름
   - **링크 열**: 쿠팡 링크가 있는 열 (예: B)
   - **결과 열**: 썸네일 URL을 저장할 열 (예: C)
4. "썸네일 추출 실행" 버튼 클릭

### 3. 인증 및 처리

1. Google 계정 인증 팝업에서 권한 허용
2. 진행상황을 실시간으로 확인
3. 완료되면 결과 확인

## 📁 파일 구조

```
steal_coup_thumnail/
├── manifest.json          # 익스텐션 설정 파일
├── popup.html            # 팝업 UI
├── popup.js              # 팝업 로직
├── background.js         # 백그라운드 스크립트
├── content.js            # 콘텐츠 스크립트
└── EXTENSION_README.md   # 이 파일
```

## 🔧 기술 스택

- **Chrome Extension API**: Manifest V3
- **Google Sheets API**: 스프레드시트 읽기/쓰기
- **OAuth 2.0**: Google 인증
- **Content Scripts**: 쿠팡 페이지 썸네일 추출
- **Background Scripts**: 백그라운드 처리

## 🛠️ 개발 및 디버깅

### 로그 확인

1. Chrome 개발자 도구 열기 (F12)
2. Console 탭에서 로그 확인
3. Background script 로그는 `chrome://extensions/` → "서비스 워커 검사"에서 확인

### 일반적인 문제 해결

1. **인증 오류**: Google Cloud Console에서 OAuth 설정 확인
2. **권한 오류**: manifest.json의 permissions 확인
3. **썸네일 추출 실패**: 쿠팡 페이지 구조 변경 가능성

## 📝 주의사항

- 쿠팡의 페이지 구조가 변경되면 썸네일 추출이 실패할 수 있습니다
- Google Sheets API 할당량을 초과하지 않도록 주의하세요
- 대량의 링크 처리 시 시간이 오래 걸릴 수 있습니다

## 🔄 업데이트

쿠팡 페이지 구조 변경 시 `content.js`의 썸네일 추출 로직을 업데이트해야 할 수 있습니다.

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. Chrome 개발자 도구의 Console 로그
2. Google Cloud Console의 API 사용량
3. 구글 시트의 권한 설정 