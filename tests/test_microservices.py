import requests
import time
import os

# Configuration
GATEWAY_URL = "http://127.0.0.1:8000"

def test_health():
    print("[TEST] Checking Gateway Health...")
    try:
        resp = requests.get(f"{GATEWAY_URL}/health")
        if resp.status_code == 200:
            print("[PASS] Gateway is healthy")
            return True
        else:
            print(f"[FAIL] Gateway returned {resp.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] Gateway not accessible: {e}")
        return False

def test_upload_search():
    print("\n[TEST] Testing Upload -> Search Flow...")
    
    # 1. Clear products
    print("1. Clearing existing products...")
    try:
        requests.delete(f"{GATEWAY_URL}/api/products/clear", timeout=5)
    except Exception as e:
        print(f"[WARN] Clear failed: {e}")
    
    # 2. Upload CSV
    print("2. Uploading sample_products.csv...")
    csv_path = "data/sample_products.csv"
    
    # Create dummy if needed
    if not os.path.exists(csv_path):
        os.makedirs("data", exist_ok=True)
        with open(csv_path, "w") as f:
            f.write("name,description,category,price,currency,stock_quantity,seller_name,image_url\n")
            f.write("Test Phone,A great smartphone,Electronics,500,USD,10,SellerA,\n")
            
    files = {'file': open(csv_path, 'rb')}
    try:
        resp = requests.post(f"{GATEWAY_URL}/api/upload", files=files, timeout=10)
        print(f"Upload Response: {resp.status_code} {resp.text}")
    except Exception as e:
        print(f"[FAIL] Upload request failed: {e}")
        return
        
    # Wait for async indexing
    print("Waiting for indexing (2s)...")
    time.sleep(2)
    
    # 3. Search
    query = "smartphone"
    print(f"3. Searching for '{query}'...")
    try:
        resp = requests.get(f"{GATEWAY_URL}/api/search", params={"q": query}, timeout=5)
        results = resp.json().get("results", [])
        print(f"Results found: {len(results)}")
        
        found = any("Phone" in r.get("name", "") for r in results)
        if found:
            print("[PASS] Search returned expected product")
        else:
            print("[FAIL] Search did NOT return expected product")
            print(results)
    except Exception as e:
         print(f"[FAIL] Search request failed: {e}")

if __name__ == "__main__":
    if test_health():
        test_upload_search()
