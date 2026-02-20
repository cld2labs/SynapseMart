import requests
import argparse
import os

def upload(file_path, host="http://localhost:8000"):
    """
    Utility script to upload products to the SynapseMart stack.
    Targets the Gateway by default.
    """
    url = f"{host}/api/upload"
    
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    print(f"Uploading '{file_path}' to {url}...")
    
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            resp = requests.post(url, files=files)
            
            if resp.status_code == 200:
                data = resp.json()
                print("Success!")
                print(f"Message: {data.get('message')}")
                if 'count' in data:
                    print(f"New Products Added: {data['count']}")
            else:
                print(f"Upload failed (Status {resp.status_code}): {resp.text}")
                
    except Exception as e:
        print(f"Error connecting to Gateway: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload CSV products to SynapseMart.")
    parser.add_argument("file", help="Path to the CSV file")
    parser.add_argument("--host", default="http://localhost:8000", help="Gateway host URL")
    
    args = parser.parse_args()
    upload(args.file, args.host)
