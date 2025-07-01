import os
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from tqdm import tqdm
from bs4 import BeautifulSoup
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import glob

# 저장 폴더
SAVE_DIR = 'thumbnails'
os.makedirs(SAVE_DIR, exist_ok=True)

# 단축 링크 입력
short_url = input('쿠팡 단축 링크를 입력하세요: ').strip()

def get_real_url_selenium(short_url):
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    try:
        driver.get(short_url)
        real_url = driver.current_url
    except Exception as e:
        print(f'Selenium 리다이렉션 실패: {e}')
        real_url = None
    driver.quit()
    return real_url

def get_thumbnail_urls_bs4(product_url, max_imgs=3):
    options = Options()
    # options.add_argument('--headless')  # headless 모드 비활성화 (브라우저 창이 뜨도록)
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.get(product_url)
    try:
        # img 태그의 src 속성이 채워질 때까지 최대 10초 대기
        WebDriverWait(driver, 10).until(
            lambda d: d.execute_script('return Array.from(document.images).some(img => img.src && img.src.startsWith("http"))')
        )
    except Exception as e:
        print(f'이미지 로딩 대기 중 오류: {e}')
    html = driver.page_source
    # 받아온 HTML을 저장
    os.makedirs('crawl_img', exist_ok=True)
    with open('crawl_img/last_coupang.html', 'w', encoding='utf-8') as f:
        f.write(html)
    driver.quit()
    soup = BeautifulSoup(html, 'html.parser')
    urls = []
    main_img = soup.select_one('img.prod-image__detail')
    if main_img and main_img.get('src'):
        src = main_img.get('src')
        if isinstance(src, str) and src.startswith('//'):
            src = 'https:' + src
        urls.append(src)
    thumb_imgs = soup.select('ul.prod-thumb-image-list img')
    for img in thumb_imgs:
        src = img.get('src')
        if src and src not in urls:
            if isinstance(src, str) and src.startswith('//'):
                src = 'https:' + src
            urls.append(src)
        if len(urls) >= max_imgs:
            break
    new_thumb_imgs = soup.select('div.twc-relative.twc-flex-1.md\\:twc-mx-\\[16px\\] img')
    for img in new_thumb_imgs:
        src = img.get('src')
        if src and src not in urls:
            if isinstance(src, str) and src.startswith('//'):
                src = 'https:' + src
            urls.append(src)
        if len(urls) >= max_imgs:
            break
    return urls[:max_imgs]

# 썸네일 저장 폴더를 'crawl_img'로 변경
CRAWL_IMG_DIR = 'crawl_img'
os.makedirs(CRAWL_IMG_DIR, exist_ok=True)

def download_images(urls, save_dir=CRAWL_IMG_DIR):
    # 폴더 내 기존 파일 개수 파악 (crawl_img_*.jpg, crawl_img_*)
    existing_files = glob.glob(os.path.join(save_dir, 'crawl_img_*'))
    start_idx = len(existing_files) + 1
    for idx, url in enumerate(tqdm(urls, desc='이미지 다운로드')):
        try:
            resp = requests.get(url, stream=True, timeout=10)
            if resp.status_code == 200:
                fname = f'crawl_img_{start_idx + idx}.jpg'
                fpath = os.path.join(save_dir, fname)
                with open(fpath, 'wb') as f:
                    for chunk in resp.iter_content(1024):
                        f.write(chunk)
                print(f'저장 완료: {fpath}')
            else:
                print(f'다운로드 실패: {url}')
        except Exception as e:
            print(f'에러: {url} - {e}')

if __name__ == '__main__':
    real_url = get_real_url_selenium(short_url)
    if not real_url:
        print('실제 상품 URL을 찾을 수 없습니다.')
        exit(1)
    print(f'실제 상품 URL: {real_url}')
    thumb_urls = get_thumbnail_urls_bs4(real_url, max_imgs=3)
    if not thumb_urls:
        print('썸네일 이미지를 찾을 수 없습니다.')
        # empty_thumbnail 넘버링
        empty_files = glob.glob(os.path.join(CRAWL_IMG_DIR, 'empty_thumbnail_*.html'))
        empty_idx = len(empty_files) + 1
        empty_path = os.path.join(CRAWL_IMG_DIR, f'empty_thumbnail_{empty_idx}.html')
        # 마지막 HTML 저장본을 복사
        src_html = os.path.join(CRAWL_IMG_DIR, 'last_coupang.html')
        if os.path.exists(src_html):
            with open(src_html, 'r', encoding='utf-8') as src, open(empty_path, 'w', encoding='utf-8') as dst:
                dst.write(src.read())
            print(f'empty 썸네일 HTML 저장: {empty_path}')
        else:
            with open(empty_path, 'w', encoding='utf-8') as dst:
                dst.write('')
            print(f'empty 썸네일 HTML(빈 파일) 저장: {empty_path}')
        exit(1)
    print('썸네일 이미지 URL 리스트:')
    for u in thumb_urls:
        print('-', u)
    download_images(thumb_urls) 