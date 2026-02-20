import logging
import re
import os
import spacy
from typing import Dict, Any, List

logger = logging.getLogger("search-service.nlp")

class NLQueryParser:
    """
    Parser for natural language search queries.
    """
    def __init__(self):
        try:
            logger.info("Loading spaCy model ('en_core_web_sm')...")
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully.")
        except OSError:
            logger.info("spaCy model not found. Downloading...")
            os.system("python -m spacy download en_core_web_sm")
            self.nlp = spacy.load("en_core_web_sm")
            
        self.categories = []

    def parse_query(self, query: str) -> Dict[str, Any]:
        result = {
            "query": query,
            "min_price": None,
            "max_price": None,
            "category": None,
            "sort": None,
            "intent": "search",
            "search_type": "hybrid"
        }
        
        if not self.nlp:
            return result

        text_lower = query.lower()
        
        # Price extraction
        under_match = re.search(r'(?:under|less than|below|max|up to)\s?\$?\s?(\d+)', text_lower)
        if not under_match:
             under_match = re.search(r'\$?\s?(\d+)\s?(?:max|or less)', text_lower)
        if under_match:
            try: result["max_price"] = float(under_match.group(under_match.lastindex))
            except: pass
            
        over_match = re.search(r'(?:over|more than|above|min|starting at)\s?\$?\s?(\d+)', text_lower)
        if not over_match:
            over_match = re.search(r'\$?\s?(\d+)\s?(?:min|or more)', text_lower)
        if over_match:
            try: result["min_price"] = float(over_match.group(over_match.lastindex))
            except: pass
            
        # Sorting
        if "cheap" in text_lower or "lowest price" in text_lower:
            result["sort"] = "price_asc"
        elif "expensive" in text_lower or "premium" in text_lower or "best" in text_lower:
            if "price" in text_lower:
                result["sort"] = "price_desc"
        
        # Category detection
        if self.categories:
            for cat in self.categories:
                if cat.lower() in text_lower:
                    result["category"] = cat
                    break
                cat_tokens = set(re.findall(r'\w+', cat.lower()))
                query_tokens = set(re.findall(r'\w+', text_lower))
                significant_matches = {t for t in (cat_tokens & query_tokens) 
                                      if t not in ['and', 'products', 'the', 'for']}
                if significant_matches:
                    result["category"] = cat
                    break

        # Cleaning
        noise_patterns = [
            r'(?:under|less than|below|max|up to|over|more than|above|min|starting at)\s?\$?\s?\d+\s?(?:\$|usd)?',
            r'\$?\s?\d+\s?(?:max|or less|min|or more)',
            r'\b(cheap|expensive|best|premium)\b',
            r'\b(products for|show me|find|search for|list of)\b'
        ]
        
        clean_text = query
        for pattern in noise_patterns:
            clean_text = re.sub(pattern, '', clean_text, flags=re.IGNORECASE)
            
        core_text = re.sub(r'[^\w\s]', ' ', clean_text).strip()
        clean_doc = self.nlp(core_text)
        tokens = [token.text for token in clean_doc if not token.is_stop and len(token.text) > 1]
        
        result["query"] = " ".join(tokens).strip() or core_text
        return result

    def set_categories(self, categories: List[str]):
        self.categories = sorted(categories, key=len, reverse=True)
        logger.info(f"NLP Parser updated with {len(categories)} categories.")

nlp_parser = NLQueryParser()
