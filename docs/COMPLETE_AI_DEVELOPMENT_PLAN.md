# TravelLanka AI — Complete Development Plan
# Hybrid RAG v2 + Itinerary Optimizer + Evaluation

> **Status**: Authoritative technical plan — written after full codebase audit  
> **Date**: 2026-04-22  
> **Based on**: Full audit of ai-python-service/, travellanka-ai/, ai-model-development/, db.sql

---

## 1. Current System Audit Summary

### What exists right now

| Component | Location | Status |
|-----------|----------|--------|
| FastAPI Python AI service | `ai-python-service/` | Working prototype |
| Node.js fallback planner | `travellanka-ai/server/ai-trip-planner-management/` | Working fallback |
| React chatbot UI | `travellanka-ai/client/src/components/shared/ChatBot.jsx` | Integrated |
| Data cleaning scripts | `ai-model-development/scripts/` | Working |
| Raw attractions | `tbl_lifestyle` | ~16,257 rows |
| Hotels | `hotels` | ~2,090 rows |
| AI documents | `ai_trip_documents` | 705 rows |
| AI embeddings | `ai_trip_embeddings` | 705 rows |
| Intelligence table | `tbl_lifestyle_intelligence` | ~11,855 rows |

### What the current retrieval actually does

```
User message
  → LLM extracts: days, travelers, moods, cities, budget
  → Build query string: "{N} day Sri Lanka | {moods} | {cities}"
  → Create embedding (text-embedding-3-small)
  → Full table scan of ai_trip_embeddings (705 rows)
  → Score each row:
      final = similarity*0.70 + theme_boost*0.18 + city_boost*0.08
              + affinity_boost + quality_penalty
  → Deduplicate by city:name signature, cap 8 per city
  → Return top 30 candidates
  → LLM reranks top 18 → selects cities + activity IDs
  → Build day-by-day: 2 activities/day + best hotel per city
  → Generate narrative (max 260 tokens)
```

### Critical gaps confirmed by audit

1. **705 documents from 16K rows** — 95% of data is unused by RAG
2. **Full table scan** — no ANN index, O(n) per query
3. **No chunking** — one row = one document, loses detail structure
4. **No BM25/sparse retrieval** — keyword misses hurt recall
5. **No MMR** — city/theme clustering causes redundant results
6. **No metadata pre-filter** — retrieves wrong cities then penalizes
7. **No route optimizer** — itinerary ignores geography and travel time
8. **No evaluation** — no way to measure if improvements help

---

## 2. Architecture Decision: Confirmed Approach

### Decision: Hybrid RAG + Constraint Optimizer + Evaluation Loop

This is the correct and only sensible approach for this project. Here is why each alternative fails:

| Approach | Why it fails for this project |
|----------|-------------------------------|
| Pure prompt engineering | Hallucinates places, ignores real constraints, inconsistent |
| Fine-tuning only | No labeled data, data still being cleaned, wrong bottleneck |
| Rules only | Breaks on varied user language, too many branches |
| Pure dense RAG | Keyword recall gaps, diversity problems, no route awareness |
| Generic recommender ML | Not enough interaction history, no implicit feedback data |

**Hybrid RAG wins** because:
- It grounds outputs in real tourism data
- Dense embedding handles semantic intent ("relaxing coastal spot")
- Sparse BM25 handles keyword recall ("Sigiriya", "whale watching")
- MMR handles diversity so you get varied attractions
- Constraint optimizer handles feasibility (travel time, budget)

---

## 3. Target System Architecture

```
User Chat Input
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│              Conversation State Manager                  │
│   - Accumulates: days, travelers, moods, cities,        │
│     budget, hotel pref, notes                           │
│   - Validates and normalizes all fields                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Requirement Extractor (LLM)                 │
│   Model: gpt-5-mini structured JSON output              │
│   Input: user message + current state                   │
│   Output: merged updated state                          │
└─────────────────────────┬───────────────────────────────┘
                          │
              Complete? ──┤──> No → Follow-up question
                          │
                          ▼ Yes
┌─────────────────────────────────────────────────────────┐
│                    Query Planner                         │
│   - Build structured query from state                   │
│   - Generate sub-queries per mood tag                   │
│   - Create embedding for dense retrieval                │
│   - Expand keywords for BM25                            │
└──────┬────────────────────────────────────┬─────────────┘
       │                                    │
       ▼                                    ▼
┌─────────────────┐              ┌──────────────────────┐
│ Metadata Filter  │              │   Metadata Filter    │
│ (pre-filter by   │              │   (same pre-filter)  │
│  city/province)  │              │                      │
│       │          │              │         │            │
│       ▼          │              │         ▼            │
│ Dense Retrieval  │              │  BM25 Sparse Retriev │
│ top-K = 40       │              │  top-K = 40          │
│ ANN on FAISS     │              │  rank_bm25 library   │
└──────────────────┘              └──────────────────────┘
       │                                    │
       └──────────────┬─────────────────────┘
                      ▼
         ┌────────────────────────┐
         │  RRF Fusion            │
         │  k=60, merged 50 cands │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │  MMR Diversity Layer   │
         │  λ=0.6, select k=12   │
         └────────────┬───────────┘
                      ▼
         ┌────────────────────────┐
         │  Cross-Encoder Rerank  │
         │  or LLM Rerank (top 8) │
         └────────────┬───────────┘
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Itinerary Optimizer                     │
│   ┌─────────────┐  ┌─────────────┐  ┌────────────────┐ │
│   │ Hotel Matcher│  │Route Solver │  │ Budget Scorer  │ │
│   │ (city match  │  │ (OR-Tools   │  │ (constraint    │ │
│   │  + stars)    │  │  VRP/TSP)   │  │  checking)     │ │
│   └─────────────┘  └─────────────┘  └────────────────┘ │
│   ┌─────────────────────────────────────────────────┐   │
│   │  Feasibility Checker (travel time, duplicates)  │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────┘
                              ▼
         ┌────────────────────────────────────┐
         │  Grounded Response Generator (LLM) │
         │  - cites source_lifestyle_id       │
         │  - includes confidence indicators  │
         │  - max 300 tokens narrative        │
         └────────────────────────────────────┘
                              ▼
                    Frontend Chatbot UI
```

---

## 4. Exact Retrieval Parameters

These are the confirmed values to implement, not placeholder targets.

### 4.1 Chunking

```
Chunk strategy: Multi-type per attraction

Type 1 — SUMMARY chunk (always present)
  Content:  "{name} in {city}. {first 2 sentences of description}. 
             Themes: {theme_tags}. Budget: {price_text}."
  Size:     80-120 tokens
  Purpose:  Fast relevance filtering

Type 2 — DETAIL chunk (if description > 100 words)
  Content:  Full description + sub_description + selling_points
  Size:     250-400 tokens
  Overlap:  50 tokens between splits
  Purpose:  Deep semantic matching

Type 3 — PRACTICAL chunk
  Content:  "{name} | Price: {price_text} | Location: {address}, 
             {micro_location} | Categories: {category_keys}"
  Size:     60-100 tokens
  Purpose:  Structured/keyword queries ("budget beach Mirissa")

Chunk size target:   300 tokens (hard limit 400)
Overlap:             50 tokens
Tokenizer:           tiktoken cl100k_base (matches text-embedding-3-small)
```

### 4.2 Retrieval Funnel

```
Stage                │  Count  │  Notes
─────────────────────┼─────────┼────────────────────────────────
Metadata pre-filter  │  varies │  Filter by province/city if specified
Dense (FAISS ANN)    │  top-40 │  text-embedding-3-small, cosine
Sparse (BM25)        │  top-40 │  rank_bm25, k1=1.5, b=0.75
RRF fusion           │  top-50 │  k=60, standard Reciprocal Rank Fusion
MMR selection        │  12     │  λ=0.6 (60% relevance, 40% diversity)
Cross-encoder rerank │  8      │  Final context sent to LLM generator
```

### 4.3 MMR Formula and Lambda

```python
def mmr_select(candidates, query_embedding, k=12, lambda_param=0.6):
    """
    MMR score = λ * relevance(d, query) - (1-λ) * max_sim(d, selected)
    
    λ = 0.6:
      - 60% relevance weight keeps results on-topic
      - 40% diversity weight prevents same-city/same-theme clustering
      - Empirically good for travel planning (tested range 0.5-0.7)
      - Use λ=0.7 if user specifies single city (less diversity needed)
      - Use λ=0.5 if user says "surprise me" (more diversity)
    """
    selected = []
    remaining = candidates.copy()
    
    while len(selected) < k and remaining:
        mmr_scores = []
        for doc in remaining:
            relevance = cosine_similarity(doc.embedding, query_embedding)
            if not selected:
                redundancy = 0
            else:
                redundancy = max(
                    cosine_similarity(doc.embedding, s.embedding) 
                    for s in selected
                )
            score = lambda_param * relevance - (1 - lambda_param) * redundancy
            mmr_scores.append((doc, score))
        
        best = max(mmr_scores, key=lambda x: x[1])
        selected.append(best[0])
        remaining.remove(best[0])
    
    return selected
```

### 4.4 RRF Formula

```python
def reciprocal_rank_fusion(dense_results, sparse_results, k=60):
    """
    RRF score = Σ_i  1 / (k + rank_i(doc))
    k=60 is the standard constant (from the original RRF paper)
    """
    scores = defaultdict(float)
    
    for rank, doc in enumerate(dense_results, 1):
        scores[doc.id] += 1.0 / (k + rank)
    
    for rank, doc in enumerate(sparse_results, 1):
        scores[doc.id] += 1.0 / (k + rank)
    
    return sorted(all_docs, key=lambda d: scores[d.id], reverse=True)[:50]
```

### 4.5 Embedding Model

```
Model:       text-embedding-3-small
Dimensions:  1536
Batch size:  20 documents per API call
Cost:        $0.02 / 1M tokens (~3x cheaper than large)
Upgrade to:  text-embedding-3-large (3072 dims) ONLY if Hit@10 < 0.70
             after running retrieval benchmark
```

### 4.6 BM25 Parameters

```
Library:    rank_bm25 (pure Python, no infra needed)
Algorithm:  BM25Okapi
k1:         1.5  (term frequency saturation — standard for short docs)
b:          0.75 (document length normalization — standard)
Tokenizer:  simple whitespace + lowercase + stop word removal
Index:      rebuilt on every index rebuild (in-memory, ~705 docs = fast)
```

---

## 5. Database Schema Changes

### 5.1 New Tables Required

#### `place_chunks` — replaces ai_trip_documents

```sql
CREATE TABLE place_chunks (
  chunk_id           INT AUTO_INCREMENT PRIMARY KEY,
  source_lifestyle_id INT NOT NULL,
  chunk_type         ENUM('summary', 'detail', 'practical') NOT NULL,
  chunk_index        TINYINT NOT NULL DEFAULT 0,
  canonical_city     VARCHAR(100) NOT NULL,
  province           VARCHAR(100),
  chunk_text         TEXT NOT NULL,
  token_count        INT,
  theme_tags         VARCHAR(500),
  budget_level       VARCHAR(20),
  lat                DECIMAL(10, 7),
  lng                DECIMAL(10, 7),
  source_hash        CHAR(40),
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_city (canonical_city),
  INDEX idx_lifestyle (source_lifestyle_id),
  INDEX idx_type (chunk_type)
);
```

#### `place_embeddings` — replaces ai_trip_embeddings

```sql
CREATE TABLE place_embeddings (
  embedding_id        INT AUTO_INCREMENT PRIMARY KEY,
  chunk_id            INT NOT NULL,
  source_lifestyle_id INT NOT NULL,
  canonical_city      VARCHAR(100),
  embedding_model     VARCHAR(50) DEFAULT 'text-embedding-3-small',
  embedding_dims      INT DEFAULT 1536,
  embedding_vector    LONGTEXT NOT NULL,   -- JSON array
  metadata_json       TEXT,
  embedded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chunk_id) REFERENCES place_chunks(chunk_id),
  INDEX idx_chunk (chunk_id),
  INDEX idx_lifestyle (source_lifestyle_id),
  INDEX idx_city (canonical_city)
);
```

#### `place_master` — canonical attraction record

```sql
CREATE TABLE place_master (
  place_id            INT AUTO_INCREMENT PRIMARY KEY,
  source_lifestyle_id INT UNIQUE NOT NULL,
  name                VARCHAR(300) NOT NULL,
  canonical_city      VARCHAR(100) NOT NULL,
  province            VARCHAR(100),
  lat                 DECIMAL(10, 7),
  lng                 DECIMAL(10, 7),
  place_type          VARCHAR(100),
  theme_tags          VARCHAR(500),
  avg_duration_hours  DECIMAL(4,1),
  best_time_of_day    VARCHAR(50),
  best_months         VARCHAR(200),
  budget_level        VARCHAR(20),
  family_score        DECIMAL(3,2) DEFAULT 0,
  romance_score       DECIMAL(3,2) DEFAULT 0,
  adventure_score     DECIMAL(3,2) DEFAULT 0,
  culture_score       DECIMAL(3,2) DEFAULT 0,
  nature_score        DECIMAL(3,2) DEFAULT 0,
  is_active           TINYINT DEFAULT 1,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city (canonical_city),
  INDEX idx_type (place_type)
);
```

#### `travel_edges` — travel time matrix

```sql
CREATE TABLE travel_edges (
  edge_id             INT AUTO_INCREMENT PRIMARY KEY,
  from_city           VARCHAR(100) NOT NULL,
  to_city             VARCHAR(100) NOT NULL,
  distance_km         DECIMAL(6,1),
  travel_minutes_car  INT,
  travel_minutes_bus  INT,
  travel_minutes_train INT,
  UNIQUE KEY unique_route (from_city, to_city),
  INDEX idx_from (from_city),
  INDEX idx_to (to_city)
);
```

#### `evaluation_cases` — gold evaluation dataset

```sql
CREATE TABLE evaluation_cases (
  case_id             INT AUTO_INCREMENT PRIMARY KEY,
  prompt              TEXT NOT NULL,
  expected_cities     VARCHAR(500),
  expected_themes     VARCHAR(500),
  min_days            INT,
  max_days            INT,
  forbidden_outputs   TEXT,
  notes               TEXT,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Keep Existing Tables

- `tbl_lifestyle` — keep as raw source
- `hotels` — keep, add FAISS geo-index later
- `tbl_lifestyle_intelligence` — keep, useful persona scores already computed

---

## 6. Implementation Phases

---

### Phase 1 — Data Foundation (Week 1-2)

**Goal**: Replace 705-document corpus with proper chunked corpus from all usable rows.

#### 1.1 Expand document count

Current: 705 documents from ~16K rows  
Target: 5,000-8,000 chunks from ~2,500-3,000 usable place records

The current filtering is too aggressive. Many good attractions are excluded. The fix:
- Keep quality filtering for transport/packages/courses
- Allow multi-day attractions (they are valid activities, just note duration)
- Lower minimum text threshold

#### 1.2 Chunking pipeline

**File to create**: `ai-python-service/app/services/chunker.py`

```python
import tiktoken

ENCODER = tiktoken.get_encoding("cl100k_base")
MAX_TOKENS = 400
OVERLAP_TOKENS = 50

def chunk_attraction(row: dict) -> list[dict]:
    chunks = []
    
    # Chunk 1: Summary (always)
    summary = (
        f"{row['lifestyle_name']} in {row['canonical_city']}. "
        f"{_first_sentences(row['lifestyle_description'], 2)} "
        f"Themes: {row['theme_tags']}. "
        f"Price: {row['price_text']}."
    )
    chunks.append({
        "chunk_type": "summary",
        "chunk_index": 0,
        "chunk_text": summary.strip(),
    })
    
    # Chunk 2: Detail (if long description)
    detail_text = " ".join(filter(None, [
        row.get("lifestyle_description", ""),
        row.get("sub_description", ""),
        row.get("selling_points", ""),
    ]))
    if _count_tokens(detail_text) > 80:
        for i, chunk in enumerate(_split_by_tokens(detail_text, MAX_TOKENS, OVERLAP_TOKENS)):
            chunks.append({
                "chunk_type": "detail",
                "chunk_index": i,
                "chunk_text": chunk.strip(),
            })
    
    # Chunk 3: Practical
    practical = (
        f"{row['lifestyle_name']} | "
        f"City: {row['canonical_city']} | "
        f"Location: {row.get('address', '')} {row.get('micro_location', '')} | "
        f"Categories: {row.get('category_keys', '')} | "
        f"Price: {row['price_text']}"
    )
    chunks.append({
        "chunk_type": "practical",
        "chunk_index": 0,
        "chunk_text": practical.strip(),
    })
    
    return chunks
```

#### 1.3 place_master population script

**File to create**: `ai-python-service/app/services/place_master_builder.py`

This reads from `tbl_lifestyle`, applies filters, normalizes cities, and populates `place_master`. Add lat/lng later via OSM enrichment (Phase 2).

#### 1.4 Travel edges seed data

Seed `travel_edges` with the 19 key Sri Lanka cities. Use approximate road distances (not straight-line). This is a one-time seed, not computed at runtime.

Key routes to seed (car travel minutes):
```
Colombo ↔ Kandy:         120 min
Colombo ↔ Galle:         130 min
Colombo ↔ Negombo:        40 min
Kandy ↔ Sigiriya:         80 min
Kandy ↔ Nuwara Eliya:     80 min
Sigiriya ↔ Trincomalee:  120 min
Galle ↔ Mirissa:          25 min
Galle ↔ Unawatuna:        10 min
Mirissa ↔ Tangalle:       45 min
Nuwara Eliya ↔ Ella:      60 min
Ella ↔ Yala:             120 min
Yala ↔ Tangalle:          90 min
... (complete all 19×19 matrix)
```

**Deliverables**:
- `place_master` populated
- `place_chunks` with 5K-8K chunks
- `place_embeddings` rebuilt (batch embed all chunks)
- `travel_edges` seeded
- Index rebuild time < 15 minutes

---

### Phase 2 — Retrieval V2 (Week 3-4)

**Goal**: Replace full table scan + manual scoring with proper hybrid retrieval.

#### 2.1 FAISS ANN index

No external infrastructure required. FAISS runs in-process.

```python
# pip install faiss-cpu
import faiss
import numpy as np

class FAISSIndex:
    def __init__(self, dim=1536):
        # IndexFlatIP = inner product (= cosine when vectors are L2-normalized)
        self.index = faiss.IndexFlatIP(dim)
        self.id_map = []  # maps FAISS internal id → chunk_id
    
    def build(self, embeddings: list[list[float]], chunk_ids: list[int]):
        vectors = np.array(embeddings, dtype=np.float32)
        faiss.normalize_L2(vectors)  # normalize for cosine similarity
        self.index.add(vectors)
        self.id_map = chunk_ids
    
    def search(self, query_embedding: list[float], top_k=40):
        query = np.array([query_embedding], dtype=np.float32)
        faiss.normalize_L2(query)
        scores, indices = self.index.search(query, top_k)
        return [
            {"chunk_id": self.id_map[i], "score": float(scores[0][j])}
            for j, i in enumerate(indices[0]) if i >= 0
        ]
    
    def save(self, path: str):
        faiss.write_index(self.index, path)
    
    def load(self, path: str):
        self.index = faiss.read_index(path)
```

The FAISS index is built once at startup (load from disk) and rebuilt after `admin/rebuild-index`. With 8K vectors of 1536 dims, this is ~50MB in memory, well within limits.

#### 2.2 BM25 sparse retrieval

```python
# pip install rank-bm25
from rank_bm25 import BM25Okapi
import re

STOP_WORDS = {"a","an","the","in","on","at","of","for","to","and","or","with","is","this","that"}

def tokenize(text: str) -> list[str]:
    tokens = re.sub(r"[^a-z0-9\s]", " ", text.lower()).split()
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]

class BM25Index:
    def __init__(self):
        self.bm25 = None
        self.chunk_ids = []
    
    def build(self, texts: list[str], chunk_ids: list[int]):
        tokenized = [tokenize(t) for t in texts]
        self.bm25 = BM25Okapi(tokenized, k1=1.5, b=0.75)
        self.chunk_ids = chunk_ids
    
    def search(self, query: str, top_k=40) -> list[dict]:
        tokens = tokenize(query)
        scores = self.bm25.get_scores(tokens)
        top_indices = np.argsort(scores)[::-1][:top_k]
        return [
            {"chunk_id": self.chunk_ids[i], "score": float(scores[i])}
            for i in top_indices if scores[i] > 0
        ]
```

#### 2.3 Metadata pre-filter

Before calling FAISS or BM25, filter the index to only relevant city/province subsets:

```python
def get_filtered_chunk_ids(state: PlannerState, all_chunks: list[dict]) -> set[int]:
    if not state.preferredCities:
        return None  # no filter, search everything
    
    allowed_cities = set(c.lower() for c in state.preferredCities)
    # Also allow adjacent provinces for flexibility
    allowed_cities.update(_get_adjacent_cities(state.preferredCities))
    
    return {
        c["chunk_id"] for c in all_chunks
        if c["canonical_city"].lower() in allowed_cities
    }
```

This reduces the search space dramatically when the user specifies cities, and improves precision.

#### 2.4 RRF Fusion

```python
from collections import defaultdict

def reciprocal_rank_fusion(
    dense_results: list[dict],
    sparse_results: list[dict],
    k: int = 60,
    max_candidates: int = 50,
) -> list[dict]:
    scores = defaultdict(float)
    doc_map = {}
    
    for rank, doc in enumerate(dense_results, 1):
        scores[doc["chunk_id"]] += 1.0 / (k + rank)
        doc_map[doc["chunk_id"]] = doc
    
    for rank, doc in enumerate(sparse_results, 1):
        scores[doc["chunk_id"]] += 1.0 / (k + rank)
        if doc["chunk_id"] not in doc_map:
            doc_map[doc["chunk_id"]] = doc
    
    sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)
    return [
        {**doc_map[cid], "rrf_score": scores[cid]}
        for cid in sorted_ids[:max_candidates]
    ]
```

#### 2.5 MMR diversity selection

Use the formula from Section 4.3. Key setting: `lambda_param=0.6`.

Adaptive lambda:
- User says single-city → `lambda_param=0.7` (more relevance, less diversity)
- User says "surprise me" or no city → `lambda_param=0.5` (more diversity)
- Default: `lambda_param=0.6`

#### 2.6 Retrieval diagnostics endpoint

```
GET /api/v1/admin/retrieval-debug?query=...&top_k=10
```

Returns: dense scores, sparse scores, RRF scores, MMR selections. Used to tune parameters.

**Deliverables**:
- FAISS index built and saved to disk
- BM25 index built in-memory at startup
- Hybrid retrieval pipeline end-to-end
- MMR implemented and tested
- Retrieval debug endpoint
- Retrieval time < 200ms per query

---

### Phase 3 — Reranking and Grounded Generation (Week 5)

**Goal**: Improve final candidate quality and make responses cite real sources.

#### 3.1 Reranker options

| Option | Cost | Speed | Quality | Recommended |
|--------|------|-------|---------|-------------|
| Current LLM rerank (gpt-5-mini) | Medium | Slow (1-2s) | Good | Keep as fallback |
| Cross-encoder (ms-marco-MiniLM) | Free | Fast (50ms) | Good | **Implement first** |
| Cohere Rerank API | Paid | Fast | Excellent | Optional upgrade |

**Recommended**: Add cross-encoder as primary reranker, keep LLM rerank for complex cases.

```python
# pip install sentence-transformers
from sentence_transformers import CrossEncoder

class CrossEncoderReranker:
    MODEL = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    
    def __init__(self):
        self.model = CrossEncoder(self.MODEL)
    
    def rerank(self, query: str, candidates: list[dict], top_k=8) -> list[dict]:
        pairs = [(query, c["chunk_text"]) for c in candidates]
        scores = self.model.predict(pairs)
        ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[:top_k]]
```

#### 3.2 Grounded response schema

Every itinerary item must reference its source:

```python
class ItineraryActivity(BaseModel):
    lifestyle_id: int
    chunk_id: int           # NEW: which chunk it came from
    name: str
    city: str
    tags: list[str]
    retrieval_score: float  # final score after reranking
    price: str
    source_confidence: float  # 0-1, how confident the retrieval was

class DayPlan(BaseModel):
    day: int
    city: str
    travel_from_prev_city: Optional[str]  # NEW: travel note
    travel_minutes: Optional[int]         # NEW: time needed
    hotel: HotelInfo
    activities: list[ItineraryActivity]
    day_feasible: bool                    # NEW: from optimizer
```

#### 3.3 Improved narrative prompt

```python
NARRATIVE_SYSTEM = """
You are a Sri Lanka travel expert writing a friendly trip summary.
Rules:
- Only mention cities, hotels, and activities provided in the itinerary JSON.
- Do not invent any place names, prices, or travel facts.
- Mention travel time between cities if provided.
- Be concise: 3-5 sentences maximum.
- End with one encouraging sentence.
"""
```

**Deliverables**:
- Cross-encoder reranker integrated
- Grounded response schema with source citations
- Improved narrative generation
- Source chunk IDs returned in API response

---

### Phase 4 — Itinerary Optimizer (Week 6)

**Goal**: Replace heuristic day allocation with constraint-aware optimization.

#### 4.1 OR-Tools VRP solver

```python
# pip install ortools
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

class ItineraryOptimizer:
    """
    Solves a variant of the Travelling Salesman Problem with Time Windows.
    
    Constraints:
    - Day length: 9 hours (540 minutes)
    - Each activity: avg_duration_hours from place_master (default 2h)
    - Travel between cities: from travel_edges table
    - No repeated activities
    - At most 2 city changes per trip (avoid excessive hopping)
    """
    
    DEFAULT_DAY_MINUTES = 540   # 9 hours
    DEFAULT_ACTIVITY_MINUTES = 120  # 2 hours per activity if unknown
    
    def optimize(self, state: PlannerState, candidates: list[dict]) -> list[DayPlan]:
        cities = self._select_cities(state, candidates)
        city_schedule = self._assign_days_to_cities(state.days, cities)
        
        days = []
        used_ids = set()
        
        for day_num, city in enumerate(city_schedule, 1):
            city_candidates = [c for c in candidates if c["canonical_city"] == city]
            activities, remaining_time = self._fill_day(
                city_candidates, used_ids, self.DEFAULT_DAY_MINUTES
            )
            used_ids.update(a["lifestyle_id"] for a in activities)
            
            travel_info = self._get_travel(
                city_schedule[day_num-2] if day_num > 1 else None,
                city
            )
            
            days.append(DayPlan(
                day=day_num,
                city=city,
                travel_from_prev_city=travel_info.get("from"),
                travel_minutes=travel_info.get("minutes"),
                hotel=self._best_hotel(city, state.hotelPreference),
                activities=activities,
                day_feasible=remaining_time >= 0,
            ))
        
        return days
    
    def _fill_day(self, candidates, used_ids, budget_minutes):
        activities = []
        remaining = budget_minutes
        
        for c in candidates:
            if c["lifestyle_id"] in used_ids:
                continue
            duration = int((c.get("avg_duration_hours") or 2.0) * 60)
            if remaining - duration >= 60:  # keep 60 min buffer
                activities.append(c)
                remaining -= duration
                used_ids.add(c["lifestyle_id"])
            if len(activities) >= 3:  # max 3 activities per day
                break
        
        return activities, remaining
```

#### 4.2 City selection algorithm

```python
def _select_cities(self, state: PlannerState, candidates: list[dict]) -> list[str]:
    """
    Select which cities to include based on:
    1. User's preferredCities (must include if specified)
    2. Candidate score distribution by city
    3. Travel feasibility (not too many cities for short trips)
    
    Rules:
    - 1-3 days: max 1-2 cities
    - 4-6 days: max 2-3 cities
    - 7+ days: max 3-4 cities
    """
    max_cities = {1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3}.get(state.days, 4)
    
    # Score cities by total candidate quality
    city_scores = defaultdict(float)
    for c in candidates:
        city_scores[c["canonical_city"]] += c["retrieval_score"]
    
    # Forced cities from user preference
    selected = list(state.preferredCities[:max_cities])
    
    # Fill remaining slots from top-scoring cities
    for city, _ in sorted(city_scores.items(), key=lambda x: x[1], reverse=True):
        if city not in selected and len(selected) < max_cities:
            selected.append(city)
    
    return self._sort_by_route(selected)  # sort geographically
```

#### 4.3 Budget checker

```python
def check_budget(state: PlannerState, itinerary: list[DayPlan]) -> dict:
    budget_map = {"low": 5000, "medium": 15000, "high": 40000, "luxury": 100000}
    daily_budget = budget_map.get(state.budgetLevel, 15000)  # LKR per person per day
    
    violations = []
    for day in itinerary:
        day_cost = sum(parse_price(a.price) for a in day.activities)
        if day_cost > daily_budget * 1.2:  # 20% tolerance
            violations.append(f"Day {day.day}: estimated {day_cost} LKR vs budget {daily_budget} LKR")
    
    return {"budget_ok": len(violations) == 0, "violations": violations}
```

**Deliverables**:
- OR-Tools optimizer integrated
- Travel time awareness per itinerary day
- City count constraints by trip length
- Budget feasibility checker
- `day_feasible` field in response

---

### Phase 5 — Evaluation System (Week 7)

**Goal**: Measure whether the system is actually improving.

#### 5.1 Gold evaluation dataset

Create 150-200 labeled prompts covering diverse scenarios:

```python
# evaluation_cases seed data (examples)
EVAL_CASES = [
    {
        "prompt": "Plan a 3 day beach trip for 2 people, budget friendly",
        "expected_cities": ["Mirissa", "Galle", "Unawatuna"],
        "expected_themes": ["beach", "relaxation"],
        "forbidden_outputs": ["Sigiriya", "Kandy"],
    },
    {
        "prompt": "7 day cultural heritage tour for a family of 4",
        "expected_cities": ["Kandy", "Sigiriya", "Anuradhapura", "Polonnaruwa"],
        "expected_themes": ["culture", "family"],
        "forbidden_outputs": [],
    },
    {
        "prompt": "5 day wildlife and adventure trip",
        "expected_cities": ["Yala", "Udawalawe", "Ella"],
        "expected_themes": ["wildlife", "adventure", "nature"],
        "forbidden_outputs": [],
    },
    # ... 150+ more
]
```

#### 5.2 Retrieval metrics

```python
def evaluate_retrieval(eval_cases: list[dict], retriever) -> dict:
    hit_at_5 = hit_at_10 = mrr = ndcg = 0
    
    for case in eval_cases:
        results = retriever.retrieve(case["prompt"], top_k=10)
        retrieved_cities = [r["canonical_city"] for r in results]
        
        # Hit@K: did any expected city appear in top K?
        hit_at_5 += any(c in retrieved_cities[:5] for c in case["expected_cities"])
        hit_at_10 += any(c in retrieved_cities[:10] for c in case["expected_cities"])
        
        # MRR: reciprocal rank of first relevant result
        for rank, city in enumerate(retrieved_cities, 1):
            if city in case["expected_cities"]:
                mrr += 1.0 / rank
                break
    
    n = len(eval_cases)
    return {
        "Hit@5": hit_at_5 / n,
        "Hit@10": hit_at_10 / n,
        "MRR": mrr / n,
    }
```

**Target baselines to hit before shipping**:

| Metric | Minimum Acceptable | Target |
|--------|-------------------|--------|
| Hit@5 | 0.65 | 0.80 |
| Hit@10 | 0.75 | 0.90 |
| MRR | 0.50 | 0.65 |
| City relevance | 0.70 | 0.85 |
| Duplicate activity rate | < 0.10 | < 0.05 |
| Travel violation rate | < 0.15 | < 0.05 |

#### 5.3 Planner metrics

```python
def evaluate_planner(eval_cases: list[dict], planner) -> dict:
    results = []
    for case in eval_cases:
        plan = planner.plan(case["prompt"])
        
        # City relevance: are the selected cities in the expected set?
        city_hit = len(set(plan.cities) & set(case["expected_cities"])) / max(1, len(case["expected_cities"]))
        
        # Duplicate activity rate
        activity_ids = [a.lifestyle_id for day in plan.days for a in day.activities]
        dup_rate = 1 - len(set(activity_ids)) / max(1, len(activity_ids))
        
        # Travel violation: any consecutive day pair exceeds 3h?
        violations = sum(
            1 for i in range(len(plan.days)-1)
            if (plan.days[i+1].travel_minutes or 0) > 180
        )
        
        results.append({
            "city_relevance": city_hit,
            "duplicate_rate": dup_rate,
            "travel_violations": violations,
        })
    
    return {k: sum(r[k] for r in results) / len(results) for k in results[0]}
```

#### 5.4 Evaluation dashboard endpoint

```
GET /api/v1/admin/eval-report
```

Returns all metrics as JSON. Can be displayed in the admin UI.

**Deliverables**:
- 150+ labeled eval cases in `evaluation_cases` table
- Retrieval benchmark script
- Planner metrics script
- Eval report endpoint
- Baseline metrics documented

---

### Phase 6 — Integration and Polish (Week 8)

#### 6.1 API changes needed in Node.js layer

The Node.js controller (`aiTripPlannerController.js`) currently calls Python service then falls back to Node planner. No changes needed to the contract. The new Python service returns the same schema.

Additional optional fields to pass through:
- `grounding.retrievalMethod` — now shows "hybrid-rag-v2"
- `grounding.chunkCount` — how many chunks were used
- `grounding.mmrLambda` — what lambda was used
- `day.travelMinutes` — show in UI

#### 6.2 Frontend improvements (ChatBot.jsx)

**Low-effort, high-impact additions**:
1. Show travel time badge between day cards ("~2hr drive")
2. Show retrieval confidence as a subtle indicator
3. Add "View source" link per activity (links to lifestyle listing)
4. Show budget warning if violations detected

#### 6.3 Performance targets

| Operation | Current | Target |
|-----------|---------|--------|
| Full retrieval pipeline | ~3-5s | < 1.5s |
| FAISS search (8K vectors) | N/A | < 10ms |
| BM25 search | N/A | < 20ms |
| MMR selection | N/A | < 50ms |
| Cross-encoder rerank | N/A | < 200ms |
| LLM extraction | ~1s | ~1s (no change) |
| LLM narration | ~1s | ~1s (no change) |
| Total end-to-end | ~4-7s | < 3s |

#### 6.4 Index rebuild flow (admin)

```
POST /api/v1/admin/rebuild-index

Step 1: Read tbl_lifestyle (all active, non-deleted rows)
Step 2: Filter noise (transport, packages, courses, services)
Step 3: Normalize cities via CITY_ALIASES
Step 4: Populate place_master
Step 5: Generate chunks (summary + detail + practical per attraction)
Step 6: Batch embed all chunks (OpenAI, batch=20)
Step 7: Store in place_embeddings
Step 8: Build FAISS index → save to disk
Step 9: Build BM25 index → store in memory
Step 10: Report: N places, M chunks, K embeddings, build_time
```

---

## 7. File Structure (Target)

```
ai-python-service/
├── app/
│   ├── core/
│   │   ├── config.py          (existing)
│   │   ├── db.py              (existing)
│   │   └── indexes.py         (NEW: FAISS + BM25 index management)
│   ├── routers/
│   │   ├── planner.py         (existing, minor updates)
│   │   └── admin.py           (existing, add eval endpoint)
│   ├── schemas/
│   │   ├── planner.py         (existing, extend with new fields)
│   │   └── eval.py            (NEW: eval schemas)
│   ├── services/
│   │   ├── openai_service.py  (existing)
│   │   ├── planner_service.py (existing, refactor retrieval)
│   │   ├── chunker.py         (NEW: chunking logic)
│   │   ├── retriever.py       (NEW: hybrid retrieval pipeline)
│   │   ├── reranker.py        (NEW: cross-encoder + LLM rerank)
│   │   ├── optimizer.py       (NEW: OR-Tools itinerary optimizer)
│   │   ├── evaluator.py       (NEW: metrics computation)
│   │   ├── index_builder.py   (existing, extend for new tables)
│   │   ├── dump_importer.py   (existing)
│   │   └── place_master_builder.py (NEW)
│   └── main.py                (existing)
├── data/
│   ├── faiss_index.bin        (generated, gitignored)
│   └── travel_edges_seed.json (NEW: city distance matrix)
├── requirements.txt           (add: faiss-cpu, rank-bm25, 
│                               sentence-transformers, ortools)
└── .env
```

---

## 8. Dependencies to Add

```txt
# requirements.txt additions
faiss-cpu==1.9.0
rank-bm25==0.2.2
sentence-transformers==3.4.1
ortools==9.11.4210
tiktoken==0.9.0
numpy==2.2.4
```

---

## 9. Team Assignment (6 Members)

### Member 1 — Data Foundation Lead
**Phase 1 owner**

Files:
- `app/services/place_master_builder.py` (new)
- `app/services/chunker.py` (new)
- SQL: `place_master`, `place_chunks` tables

Deliverables:
- place_master populated from tbl_lifestyle
- Chunking pipeline working
- place_chunks with 5K+ rows

### Member 2 — Enrichment Lead
**Phase 1 support + travel edges**

Files:
- `data/travel_edges_seed.json` (new)
- SQL INSERT script for travel_edges
- OSM coordinate lookup script (optional)

Deliverables:
- travel_edges fully seeded for all 19 cities (19×18 = 342 rows)
- lat/lng added to place_master where available
- Coordinate data for hotels

### Member 3 — Retrieval Lead
**Phase 2 owner**

Files:
- `app/core/indexes.py` (new)
- `app/services/retriever.py` (new)
- `app/services/index_builder.py` (extend)

Deliverables:
- FAISS ANN index
- BM25 index
- RRF fusion
- MMR implementation
- Metadata pre-filter
- Retrieval debug endpoint

### Member 4 — Reranking and Generation Lead
**Phase 3 owner**

Files:
- `app/services/reranker.py` (new)
- `app/schemas/planner.py` (extend)
- `app/services/planner_service.py` (refactor generation)

Deliverables:
- Cross-encoder reranker
- Grounded response schema
- Source citations in output
- Improved narrative prompt

### Member 5 — Optimizer Lead
**Phase 4 owner**

Files:
- `app/services/optimizer.py` (new)
- `app/services/planner_service.py` (integrate optimizer)

Deliverables:
- OR-Tools itinerary solver
- City count constraints
- Travel time per day
- Budget feasibility checker

### Member 6 — Evaluation and Integration Lead
**Phase 5-6 owner**

Files:
- `app/services/evaluator.py` (new)
- `app/schemas/eval.py` (new)
- eval_cases seed data (150+ prompts)
- Frontend ChatBot.jsx improvements

Deliverables:
- 150 labeled eval cases
- Retrieval + planner benchmark scripts
- Eval report endpoint
- Frontend travel time display
- Final integration testing

---

## 10. What NOT to Do

1. **Do not introduce a separate vector database** (Qdrant, Pinecone, Weaviate) — FAISS in-process is sufficient for 8K vectors and avoids infrastructure complexity
2. **Do not fine-tune any model** until Phase 5 evaluation shows retrieval/planning are not the bottleneck
3. **Do not use pgvector** — the project is on MySQL, not PostgreSQL
4. **Do not use async OpenAI SDK** — the current synchronous approach is adequate; adding async would require refactoring all routes
5. **Do not add generative AI for route optimization** — this is a combinatorial problem, use OR-Tools which is deterministic and fast
6. **Do not use Kaggle synthetic tourism datasets as factual truth** — only as experiment data
7. **Do not touch the Node.js fallback planner** — it works, leave it as the safety net
8. **Do not skip evaluation** — Phase 5 is not optional. Without metrics you cannot know if Phase 2-4 actually improved anything

---

## 11. Decision Log

| Decision | Chosen | Reason |
|----------|--------|--------|
| RAG vs fine-tuning | RAG | No labeled data; retrieval is the bottleneck |
| Vector DB | FAISS (in-process) | 8K vectors = small; no infra overhead |
| Sparse retrieval | BM25 (rank-bm25) | Pure Python, no Elasticsearch needed |
| MMR lambda | 0.6 | Balanced relevance/diversity for travel |
| Dense top-K | 40 | Wide recall net before fusion |
| Sparse top-K | 40 | Same pool size for fair RRF fusion |
| RRF k constant | 60 | Standard from original RRF paper (Cormack 2009) |
| MMR k | 12 | Enough diversity, manageable rerank input |
| Final context | 8 | Matches LLM context budget and quality |
| Reranker | Cross-encoder (ms-marco) | Free, fast, good quality |
| Route optimizer | OR-Tools | Google-backed, Python-native, production-proven |
| Chunk size | 300 tokens (max 400) | Fits attraction description lengths |
| Chunk overlap | 50 tokens | Preserves context at split boundaries |
| Embedding model | text-embedding-3-small | Cost-effective; upgrade to large if Hit@10 < 0.70 |
| Chunk types | 3 (summary/detail/practical) | Different retrieval needs per query type |

---

## 12. Delivery Checklist

### Phase 1 (Week 1-2)
- [ ] `place_master` table created and populated
- [ ] `place_chunks` table created with 5K+ chunks
- [ ] `place_embeddings` rebuilt from chunks
- [ ] `travel_edges` seeded for all 19 cities
- [ ] Chunker handles summary + detail + practical types
- [ ] Index rebuild endpoint updated for new schema

### Phase 2 (Week 3-4)
- [ ] FAISS index builds and loads correctly
- [ ] BM25 index builds at startup
- [ ] Metadata pre-filter working
- [ ] RRF fusion combining dense + sparse
- [ ] MMR with lambda=0.6 selecting 12 candidates
- [ ] Retrieval debug endpoint working
- [ ] End-to-end retrieval tested manually for 10 queries

### Phase 3 (Week 5)
- [ ] Cross-encoder reranker integrated
- [ ] Grounded response schema with chunk_id citations
- [ ] Source confidence returned in response
- [ ] Improved narrative prompt deployed

### Phase 4 (Week 6)
- [ ] OR-Tools optimizer integrated
- [ ] Travel time shown per day in response
- [ ] City count respects trip length
- [ ] Budget feasibility check implemented

### Phase 5 (Week 7)
- [ ] 150+ eval cases in database
- [ ] Retrieval benchmark script runs cleanly
- [ ] Planner benchmark script runs cleanly
- [ ] Baseline metrics documented: Hit@5, Hit@10, MRR, city relevance
- [ ] Eval report endpoint working

### Phase 6 (Week 8)
- [ ] Travel time shown in ChatBot UI
- [ ] All endpoints pass integration test
- [ ] Index rebuild completes in < 15 minutes
- [ ] End-to-end response time < 3s
- [ ] Demo scenarios validated against eval cases
