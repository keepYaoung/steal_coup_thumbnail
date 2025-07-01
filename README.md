<<<<<<< HEAD
# steal_coup_thumnail
for Signaling B2B
=======
# Coupang 썸네일 크롤러

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
- 쿠팡 단축 링크 입력 → 실제 상품 URL 추적 → 썸네일/대표 이미지 최대 3장 다운로드(`thumbnails/` 폴더)

## 주요 기능
- 쿠팡 단축 링크 → 실제 상품 URL 변환
- 썸네일/대표 이미지 최대 3장 크롤링 및 저장
- 예외 처리 및 진행상황 표시
>>>>>>> 57e98eb (feat: 쿠팡 썸네일 크롤러 프로젝트 최초 업로드)
