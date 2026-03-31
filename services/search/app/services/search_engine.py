import logging
import re
import faiss
import yake
import numpy as np
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

logger = logging.getLogger("search-service.engine")

class HybridSearchEngine:
    """
    Core search engine implementing a hybrid retrieval strategy.
    """
    def __init__(self):
        try:
            logger.info("Initializing Hybrid Search Engine components...")
            self.yake_extractor = yake.KeywordExtractor(
                lan="en", n=3, dedupLim=0.9, top=10, features=None
            )
            
            logger.info("Loading SentenceTransformer model ('all-MiniLM-L6-v2')...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            self.embedding_dim = 384
            
            self.faiss_index = None
            self.products_by_id = {}
            self.product_ids = []
            self.bm25 = None
            self.tokenized_corpus = []
            self.products = []
            
            logger.info("Hybrid Search Engine initialized successfully.")
        except Exception as e:
            logger.error(f"Search Engine initialization failed: {e}")
            raise e

    def _preprocess(self, text: str) -> str:
        if not text: return ""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        return ' '.join(text.split())

    def _tokenize(self, text: str) -> List[str]:
        text = self._preprocess(text)
        return [t for t in text.split() if len(t) > 2]

    def _product_to_embedding_text(self, product: Dict) -> str:
        name = product.get('name', '') or ''
        desc = product.get('description', '') or ''
        short_desc = product.get('short_description', '') or ''
        search_text = product.get('search_text', '') or ''
        cat = product.get('category', '') or ''
        seller = product.get('seller_name', '') or ''
        return search_text or f"{name}. {short_desc}. {desc}. Category: {cat}. Seller: {seller}".strip()

    def _product_to_bm25_text(self, product: Dict) -> str:
        name = product.get('name', '') or ''
        cat = product.get('category', '') or ''
        seller = product.get('seller_name', '') or ''
        base_text = self._product_to_embedding_text(product)
        return f"{name} {name} {cat} {seller} {base_text}".strip()

    def _refresh_product_views(self):
        self.product_ids = sorted(self.products_by_id.keys())
        self.products = [self.products_by_id[pid] for pid in self.product_ids]

    def _rebuild_bm25(self):
        texts_bm25 = [self._product_to_bm25_text(product) for product in self.products]
        self.tokenized_corpus = [self._tokenize(text) for text in texts_bm25]
        self.bm25 = BM25Okapi(self.tokenized_corpus) if self.tokenized_corpus else None

    def _empty_faiss_index(self):
        return faiss.IndexIDMap2(faiss.IndexFlatIP(self.embedding_dim))

    def build_index(self, products: List[Dict]):
        logger.info(f"Building search indices for {len(products)} products.")
        self.products_by_id = {int(product['id']): product for product in products}
        self._refresh_product_views()

        texts_emb = [self._product_to_embedding_text(product) for product in self.products]
        if texts_emb:
            embeddings = self.embedding_model.encode(texts_emb, show_progress_bar=False, convert_to_numpy=True)
            embeddings = np.array(embeddings).astype('float32')
            faiss.normalize_L2(embeddings)
            product_ids = np.array(self.product_ids, dtype=np.int64)
            self.faiss_index = self._empty_faiss_index()
            self.faiss_index.add_with_ids(embeddings, product_ids)
        else:
            self.faiss_index = self._empty_faiss_index()

        self._rebuild_bm25()
            
        logger.info("Search indices successfully built.")

    def upsert_products(self, products: List[Dict]):
        logger.info(f"Upserting {len(products)} products into search indices.")
        if not products:
            return

        if self.faiss_index is None:
            self.build_index(products)
            return

        upsert_ids = []
        upsert_texts = []
        for product in products:
            product_id = int(product['id'])
            self.products_by_id[product_id] = product
            upsert_ids.append(product_id)
            upsert_texts.append(self._product_to_embedding_text(product))

        self._refresh_product_views()

        if upsert_ids:
            self.faiss_index.remove_ids(np.array(upsert_ids, dtype=np.int64))
            embeddings = self.embedding_model.encode(upsert_texts, show_progress_bar=False, convert_to_numpy=True)
            embeddings = np.array(embeddings).astype('float32')
            faiss.normalize_L2(embeddings)
            self.faiss_index.add_with_ids(embeddings, np.array(upsert_ids, dtype=np.int64))

        self._rebuild_bm25()
        logger.info("Partial search index upsert completed.")

    def search(self, query: str, category_hint: Optional[str] = None, top_k: int = 20) -> List[Dict]:
        if not self.faiss_index or not self.bm25:
            logger.warning("Search attempted before index was built.")
            return []
            
        # Semantic Retrieval
        q_emb = self.embedding_model.encode([query], convert_to_numpy=True)
        q_emb = np.array(q_emb).astype('float32')
        faiss.normalize_L2(q_emb)
        candidate_count = min(top_k * 5, len(self.products))
        D, I = self.faiss_index.search(q_emb, candidate_count)
        
        semantic_res = {}
        for product_id, score in zip(I[0], D[0]):
            if product_id != -1 and score >= 0.2:
                semantic_res[int(product_id)] = float(score)
                
        # Keyword Retrieval
        q_tokens = self._tokenize(query)
        bm25_res = {}
        if q_tokens:
            scores = self.bm25.get_scores(q_tokens)
            for idx, score in enumerate(scores):
                if score > 0.1:
                    bm25_res[self.product_ids[idx]] = float(score)

        # Dynamic Weight Routing
        token_count = len(query.split())
        max_bm25_score = max(bm25_res.values()) if bm25_res else 0
        
        SEMANTIC_WEIGHT = 0.6
        BM25_WEIGHT = 1.0
        
        if token_count > 4:
            SEMANTIC_WEIGHT = 1.2
            BM25_WEIGHT = 0.8
        elif max_bm25_score > 10:
            SEMANTIC_WEIGHT = 0.4
            BM25_WEIGHT = 2.0

        # RRF Fusion
        RRF_K = 60
        rrf_scores = {}
        all_ids = set(semantic_res.keys()) | set(bm25_res.keys())
        sem_sorted_ids = sorted(semantic_res.keys(), key=lambda x: semantic_res[x], reverse=True)
        bm25_sorted_ids = sorted(bm25_res.keys(), key=lambda x: bm25_res[x], reverse=True)
        
        for pid in all_ids:
            score = 0
            if pid in semantic_res:
                rank = sem_sorted_ids.index(pid)
                score += SEMANTIC_WEIGHT / (RRF_K + rank + 1)
            if pid in bm25_res:
                rank = bm25_sorted_ids.index(pid)
                score += BM25_WEIGHT / (RRF_K + rank + 1)
            rrf_scores[pid] = score
            
        final_results = []
        product_map = self.products_by_id
        
        for pid, rrf_score in rrf_scores.items():
            if pid not in product_map: continue
            product = product_map[pid]
            cat = (product.get('category', '') or '').lower()
            name = (product.get('name', '') or '').lower()
            desc = (product.get('description', '') or '').lower()
            
            category_boost = 1.0
            if category_hint:
                hint_lower = category_hint.lower()
                if hint_lower in cat:
                    category_boost = 2.5
                elif any(t for t in set(re.findall(r'\w+', hint_lower)) if t in cat):
                    category_boost = 1.5
            
            matched_terms = sum(1 for term in q_tokens if term in name or term in desc or term in cat)
            relevance_boost = 1.0 + (matched_terms * 0.2)
            
            item = product.copy()
            item['score'] = rrf_score * category_boost * relevance_boost
            final_results.append(item)
            
        final_results.sort(key=lambda x: x['score'], reverse=True)
        return final_results[:top_k]

search_engine = HybridSearchEngine()
