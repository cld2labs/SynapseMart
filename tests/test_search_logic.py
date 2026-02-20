import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "apis"))

from app.services.nlp import nlp_parser
from app.services.search_engine import search_engine

def test_nlp():
    print("--- Testing NLP Parser ---")
    queries = [
        "laptops under $1000",
        "cheap wireless headphones",
        "best gaming monitor over 500",
        "iphone 15"
    ]
    
    for q in queries:
        res = nlp_parser.parse_query(q)
        print(f"Query: '{q}'\nResult: {res}\n")
        
def test_search_engine_import():
    print("--- Testing Search Engine Init ---")
    if search_engine:
        print("Search Engine imported successfully.")
    else:
        print("Search Engine failed to import.")

if __name__ == "__main__":
    test_nlp()
    test_search_engine_import()
