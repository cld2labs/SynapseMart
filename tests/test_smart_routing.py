import requests
import json

BASE_URL = "http://localhost:8000/api/search"

def test_query(query, expected_category=None):
    print(f"\nTesting Query: '{query}'")
    try:
        response = requests.get(BASE_URL, params={"q": query, "limit": 5})
        if response.status_code != 200:
            print(f"FAILED: Status {response.status_code}")
            return False
            
        data = response.json()
        filters = data.get("parsed_filters", {})
        results = data.get("results", [])
        
        print(f"Detected Filters: {filters}")
        print(f"Result Count: {len(results)}")
        
        # Verify detected category
        detected_cat = filters.get("category")
        if expected_category:
            if detected_cat != expected_category:
                print(f"FAILED: Expected category '{expected_category}', but got '{detected_cat}'")
                return False
            print(f"SUCCESS: Correctly detected category '{expected_category}'")
            
            # Verify results match category
            for item in results:
                if item.get("category") != expected_category:
                    print(f"FAILED: Result mismatch! Item '{item.get('name')}' has category '{item.get('category')}'")
                    return False
            print(f"SUCCESS: All {len(results)} results match category '{expected_category}'")
        else:
            if detected_cat:
                print(f"NOTE: Detected category '{detected_cat}' (None expected)")
                
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False

if __name__ == "__main__":
    # Test 1: "laptop" -> Should map to Electronics
    print("--- Test 1: Category Mapping ---")
    test_query("fresh gaming laptop", "Electronics")
    
    # Test 2: "shoes" -> Should map to Sports
    print("--- Test 2: Category Mapping ---")
    test_query("running shoes", "Sports")
    
    # Test 3: "chair" -> Should map to Furniture
    print("--- Test 3: Category Mapping ---")
    test_query("office chair", "Furniture")
    
    # Test 4: Generic query -> No category
    print("--- Test 4: Generic Query ---")
    test_query("something amazing")
