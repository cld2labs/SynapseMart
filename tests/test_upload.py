import requests
from pathlib import Path

def test_upload():
    url = "http://localhost:8000/api/upload"
    file_path = Path("data/sample_products.csv")
    
    # Create sample csv if not exists
    if not file_path.exists():
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "w") as f:
            f.write("name,description,category,price,currency,stock_quantity,seller_name,image_url\n")
            f.write("Test Product,A test product,Electronics,99.99,USD,10,Test Seller,https://example.com/img.jpg\n")
            
    print(f"Uploading {file_path} to {url}...")
    
    with open(file_path, "rb") as f:
        files = {"file": ("sample_products.csv", f, "text/csv")}
        try:
            response = requests.post(url, files=files)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    test_upload()
