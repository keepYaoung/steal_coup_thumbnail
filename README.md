# Coupang 썸네일 크롤러

## 소개
쿠팡 단축 링크 또는 상품 URL로부터 실제 상품 URL을 추적하고,
대표/썸네일 이미지를 최대 3장까지 자동으로 다운로드하는 크롤러입니다.

## 환경 세팅
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 사용법
```bash
python coupang_thumb_crawler.py
```
- 쿠팡 단축 링크 또는 상품 URL 입력
- 썸네일/대표 이미지가 `crawl_img/` 폴더에 순차적으로 저장됨

## 주요 기능
- 쿠팡 단축 링크 → 실제 상품 URL 변환 (셀레니움 사용)
- 썸네일/대표 이미지 최대 3장 크롤링 및 저장
- 이미지 저장 실패 시 HTML 스냅샷 자동 저장
- 예외 처리 및 진행상황 표시

## 참고
- Python 3.8+
- Selenium, BeautifulSoup, gspread 등 사용
