import requests
import json
import os
import time
import glob

# 1. 저장할 디렉토리 생성
BASE_DIR = "meis_data"
if not os.path.exists(BASE_DIR):
  os.makedirs(BASE_DIR)

# 2. 헤더 설정 (User-Agent, Referer 등 필수 정보 포함)
# 쿠키(JSESSIONID 등)는 세션에 따라 만료될 수 있으므로, 작동하지 않으면 브라우저에서 새로 갱신해줘야 합니다.
common_headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
    'Referer': 'https://www.meis.go.kr/mes/mudFlat/ovrChg.do',
    'Origin': 'https://www.meis.go.kr',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Dest': 'empty',
    'Accept-Language': 'en-US,en;q=0.9',
    # 필요시 브라우저 개발자 도구에서 최신 쿠키 값을 복사해 넣으세요.
    # 'Cookie': 'clientid=...; JSESSIONID=...;'
}

# JSON 요청용 헤더 (AJAX 관련 헤더 추가)
json_headers = common_headers.copy()
json_headers.update({
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': '*/*',
    'X-Requested-With': 'XMLHttpRequest',
    'AJAX': 'true'
})

# 파일 다운로드용 헤더
file_headers = common_headers.copy()
file_headers.update({
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br'
})


def download_data(start_sn, end_sn):
  print(f"--- 수집 시작: ovrSn {start_sn} ~ {end_sn} ---")

  for sn in range(start_sn, end_sn + 1):
    try:
      # ---------------------------------------------------------
      # Step 1: 기존 JSON 검사 (존재하면 POST 요청을 건너뜀)
      # ---------------------------------------------------------
      existing_jsons = glob.glob(os.path.join(BASE_DIR, f"{sn}_*.json"))
      item_info = None
      json_exists = False

      if existing_jsons:
        json_save_path = existing_jsons[0]
        try:
          with open(json_save_path, 'r', encoding='utf-8') as f:
            item_info = json.load(f)
          korean_name = item_info.get('ovrLvbNm', 'unknown')
          glb_filename = item_info.get('ovrGlbFileNm')
          print(
            f"[Found] SN {sn}: {korean_name} (from existing JSON {os.path.basename(json_save_path)})")
          json_exists = True
        except Exception as e:
          print(f"    └─ [Warn] 기존 JSON 읽기 실패: {e} — 새로 요청합니다")

      if not item_info:
        json_url = 'https://www.meis.go.kr/mes/ovr3DLvbJson.do'
        payload = {'ovrSn': sn}

        res = requests.post(json_url, headers=json_headers, data=payload)

        if res.status_code != 200:
          print(f"[Skip] SN {sn}: HTTP Status {res.status_code}")
          continue

        try:
          data = res.json()
        except json.JSONDecodeError:
          print(f"[Error] SN {sn}: JSON Decode 실패")
          continue

        # 데이터 유효성 검사 (리스트가 비어있으면 해당 번호에 데이터 없음)
        if not data.get('list') or len(data['list']) == 0:
          print(f"[Skip] SN {sn}: 데이터 없음 (Empty list)")
          continue

        # 실제 아이템 정보 추출
        item_info = data['list'][0]
        korean_name = item_info.get('ovrLvbNm', 'unknown')
        glb_filename = item_info.get('ovrGlbFileNm')

        print(f"[Found] SN {sn}: {korean_name} (GLB: {glb_filename})")

        # JSON 파일 저장 (이름 안전화 및 기존 파일 존재 시 건너뛰기)
        safe_name = korean_name.replace('/', '_').replace('\\', '_')
        json_save_path = os.path.join(BASE_DIR, f"{sn}_{safe_name}.json")
        if os.path.exists(json_save_path):
          print(f"    └─ [Skip] JSON 존재: {json_save_path}")
          json_exists = True
        else:
          with open(json_save_path, 'w', encoding='utf-8') as f:
            json.dump(item_info, f, ensure_ascii=False, indent=4)
          json_exists = False

      # ---------------------------------------------------------
      # Step 2: GLB 파일 다운로드
      # ---------------------------------------------------------
      if glb_filename:
        glb_url = f"https://www.meis.go.kr/gltf/model/{glb_filename}"
        glb_save_path = os.path.join(BASE_DIR, glb_filename)

        # 이미 파일이 있으면 다운로드 건너뛰기
        if os.path.exists(glb_save_path):
          print(f"    └─ [Skip] GLB 존재: {glb_filename}")
        else:
          file_res = requests.get(glb_url, headers=file_headers, stream=True)

          if file_res.status_code == 200:
            with open(glb_save_path, 'wb') as f:
              for chunk in file_res.iter_content(chunk_size=8192):
                f.write(chunk)
            print(f"    └─ [Download] {glb_filename} 완료")
          else:
            print(f"    └─ [Fail] GLB 다운로드 실패 (HTTP {file_res.status_code})")

      # 서버 부하 방지를 위한 대기
      # time.sleep(1)

    except Exception as e:
      print(f"[Error] SN {sn} 처리 중 예외 발생: {e}")

  print("--- 수집 종료 ---")


if __name__ == "__main__":
  download_data(1, 89)
