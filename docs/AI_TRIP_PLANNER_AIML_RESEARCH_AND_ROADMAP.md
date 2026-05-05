# TravelLanka AI Trip Planner - AIML Research and Roadmap

## 1. Purpose

This document is the **real AIML development plan** for the TravelLanka AI trip planner.

It is written after reviewing:

- the current codebase
- the current database-backed RAG implementation
- the current chatbot behavior
- external RAG best practices
- candidate external datasets and tourism data sources

The goal of this document is to answer:

1. What is the current system really doing?
2. How accurate or mature is it right now?
3. What is missing for a complete AI system?
4. What should we build next?
5. Which datasets should we use?
6. Should we use RAG, fine-tuning, or another method?
7. How should the 6 team members divide the work?

## 2. Current Situation Audit

## 2.1 What is already implemented

The current system already has a **working AI pipeline**, but it is still an early-stage version.

Implemented now:

1. Python FastAPI AI service
2. prompt-to-JSON requirement extraction
3. follow-up question flow
4. custom semantic retrieval using embeddings
5. cleaned AI document table
6. embedding table
7. LLM reranking of shortlisted candidates
8. hotel matching
9. day-by-day itinerary output
10. chatbot integration in the frontend

## 2.2 Current data and index status

Current verified data status:

- `tbl_lifestyle`: 16,257 rows
- `hotels`: 2,350 rows
- `ai_trip_documents`: 705 rows
- `ai_trip_embeddings`: 705 rows

This means the current AI layer is **not using the entire raw marketplace directly**. It first filters the raw tourism data into a smaller AI-ready RAG corpus.

## 2.3 What type of AI system it is right now

The current system is:

> a custom database-grounded RAG prototype with LLM extraction, embedding retrieval, heuristic reranking, and rule-based itinerary assembly.

That means:

- it **is RAG**
- it **is not full production-grade RAG yet**
- it **is not fine-tuned**
- it **is not pure machine learning recommendation yet**

## 2.4 Current strengths

The current system already has these strong points:

1. AI is separated into a Python service, which is good for future ML growth.
2. The system already avoids some noisy rows such as airport transfers and package wrappers.
3. The chatbot can ask follow-up questions instead of hallucinating everything.
4. The answer is partially grounded in database content.
5. The architecture can be expanded without rewriting the whole app.

## 2.5 Current weaknesses

The current system is still incomplete in important AIML areas.

### Retrieval weaknesses

1. one row becomes one document; there is no real chunking strategy
2. retrieval is brute-force cosine similarity over JSON-stored embeddings
3. there is no vector database or ANN index
4. there is no hybrid sparse + dense retrieval
5. there is no formal MMR
6. there is no metadata pre-filtering before semantic retrieval
7. there is no retrieval evaluation benchmark

### Data weaknesses

1. the raw dump originally mixed Sri Lanka and non-Sri Lanka rows
2. the cleaned set is still relatively small for broad itinerary coverage
3. there is no strong canonical place master table
4. there are no coordinates for route optimization
5. there are no opening hours, seasonality, or travel-time matrices
6. review signals are not yet integrated into planner ranking

### Planning weaknesses

1. no true route optimization engine is used yet
2. no travel-time-aware scheduling is used
3. no opening-hour constraints
4. no budget optimizer
5. no weather-aware or seasonal planner
6. no confidence scores or source citations returned to the UI

### Evaluation weaknesses

1. no labeled gold dataset
2. no Hit@K / Recall@K / MRR benchmark
3. no groundedness score
4. no route-feasibility score
5. no automated regression test set for planner quality

## 2.6 Current maturity verdict

The honest verdict is:

> The current system is a working prototype, not a complete AIML system yet.

It proves the architecture direction, but it still needs:

- better data
- better retrieval
- better optimization
- better evaluation
- stronger planner constraints

## 3. What the Complete AIML System Should Become

The target system should be:

> a production-grade hybrid AI trip planning platform with enriched tourism knowledge, hybrid retrieval, constraint-aware itinerary optimization, evaluation dashboards, and future fine-tuning support.

The final system should have five layers:

1. **Data layer**
2. **Retrieval layer**
3. **Reranking layer**
4. **Planning and optimization layer**
5. **Evaluation and improvement layer**

## 4. Recommended Final AIML Method

The best method for this project is:

> Hybrid RAG + reranking + itinerary optimization + evaluation-driven improvement.

### 4.1 Why this is the best choice

Because the project has two different needs:

1. understand natural user requests
2. produce grounded and feasible travel plans

No single method solves both well.

### 4.2 Why not only prompt engineering

Only prompting will:

- hallucinate places
- ignore real constraints
- produce inconsistent itineraries

### 4.3 Why not only rules

Only rules will:

- fail on varied user language
- feel rigid
- require too many manual case branches

### 4.4 Why not fine-tune first

Fine-tuning first is not ideal because:

1. the current project does not have enough labeled ground-truth itineraries
2. the current data is still being cleaned
3. retrieval and planning are bigger bottlenecks than model behavior right now

### 4.5 Why hybrid RAG is right

Hybrid RAG lets us:

1. ground the answer in real tourism data
2. retrieve relevant attractions even when keywords differ
3. combine semantic matching with structured constraints
4. improve gradually with better datasets and evaluation

## 5. Target System Architecture

```text
User Chat
   |
   v
Conversation State Manager
   |
   v
Requirement Extraction Model
   |
   v
Query Planner
   |
   +--> Metadata Filter
   +--> Hybrid Retrieval (dense + sparse)
   +--> MMR / Diversity Layer
   +--> Reranker
   |
   v
Itinerary Optimizer
   |
   +--> Hotel Matcher
   +--> Budget Scorer
   +--> Route / Travel Time Solver
   +--> Opening Hours / Season / Weather Checks
   |
   v
Grounded Response Generator
   |
   v
Frontend Chatbot with source-aware itinerary cards
```

## 6. Target Data Architecture

The current two-table AI design is not enough for a full planner.

We should expand the data layer into these logical tables.

## 6.1 `place_master`

One canonical record per real destination/place/activity.

Suggested fields:

- `place_id`
- `source_lifestyle_id`
- `name`
- `canonical_city`
- `province`
- `lat`
- `lng`
- `place_type`
- `themes`
- `avg_duration_hours`
- `best_time_of_day`
- `best_months`
- `budget_level`
- `family_score`
- `romance_score`
- `adventure_score`
- `culture_score`
- `nature_score`
- `is_active`

## 6.2 `place_chunks`

Text chunks for retrieval.

Suggested chunk types:

- summary chunk
- detailed description chunk
- practical info chunk
- review summary chunk
- itinerary snippet chunk

## 6.3 `place_embeddings`

Vector embeddings for each chunk.

## 6.4 `hotel_master`

Canonical hotel data with AI-friendly fields.

Suggested fields:

- `hotel_id`
- `name`
- `city`
- `lat`
- `lng`
- `stars`
- `price_band`
- `family_score`
- `luxury_score`
- `review_sentiment_score`
- `review_summary`

## 6.5 `travel_edges`

Travel-time matrix between key cities/attractions.

Suggested fields:

- `from_place_id`
- `to_place_id`
- `travel_minutes_car`
- `travel_minutes_train`
- `travel_minutes_bus`
- `distance_km`

## 6.6 `evaluation_cases`

Labeled prompts and expected good outputs for benchmarking.

## 7. Dataset Strategy

Not all external datasets should be treated the same.

We should split them into:

1. **Production truth sources**
2. **Enrichment sources**
3. **Research-only or synthetic sources**

## 7.1 Production truth sources

These sources should be treated as higher-trust data.

### A. Existing `db.sql`

This remains the main raw operational tourism source.

### B. Sri Lanka Tourism official website

Use for:

- official attraction lists
- destination categories
- suggested itineraries
- official place descriptions
- theme labels such as beach, heritage, eco tourism, wellness, adventure

### C. OpenStreetMap tourism data

Use for:

- coordinates
- tourism tags
- place types
- opening/access fields where available

## 7.2 Enrichment sources

These should not replace production truth, but can improve the planner.

### A. TripAdvisor hotel review datasets

Use for:

- hotel sentiment summaries
- aspect extraction
- hotel quality priors

### B. Large public hotel review datasets

Use for:

- training aspect extractors
- building review summarizers
- learning hotel preference signals

## 7.3 Research-only or synthetic sources

These are useful for experiments, but should **not** be used as factual truth for Sri Lanka attractions.

Examples:

- generic tourism Kaggle datasets
- synthetic travel recommendation datasets
- non-Sri Lanka destination datasets

Use them only for:

- pipeline prototyping
- feature engineering experiments
- recommender simulation
- evaluation harness testing

## 8. What We Should Implement Next

## Phase 1 - Data Foundation Upgrade

This is the most important phase.

### Goals

1. create canonical place records
2. enrich with coordinates and structured tags
3. separate chunking from raw rows
4. prepare data for proper retrieval and planning

### Deliverables

1. `place_master`
2. `place_chunks`
3. `place_embeddings`
4. `hotel_master`
5. importers for official tourism and OSM enrichment
6. place deduplication pipeline

### Exact work

1. map raw lifestyle rows to canonical place entities
2. detect duplicates and provider duplicates
3. attach lat/lng
4. label attractions by theme, duration, family fit, adventure fit, etc.
5. generate chunked text instead of one-row-one-doc

## Phase 2 - Retrieval V2

### Goals

1. replace current simple retrieval with full hybrid retrieval
2. improve relevance and diversity
3. make retrieval measurable

### Recommended retrieval design

1. metadata filter first
2. dense retrieval second
3. sparse/BM25 retrieval in parallel
4. reciprocal rank fusion or weighted fusion
5. MMR diversity selection
6. rerank top candidates

### Recommended settings for V2

These are planning targets, not current values:

- chunk size: **250 to 500 tokens**
- overlap: **40 to 80 tokens**
- initial dense top-K: **40**
- initial sparse top-K: **40**
- fused candidate pool: **50 to 60**
- MMR selected set: **12**
- final reranked context for generation: **6 to 10**

### Deliverables

1. real chunking
2. hybrid retrieval
3. MMR
4. metadata filtering
5. retrieval diagnostics
6. source attribution

## Phase 3 - Reranking and Grounded Generation V2

### Goals

1. improve candidate quality
2. reduce weak attractions and generic tours
3. make final responses cite retrieved sources

### Recommended design

1. use a stronger reranking stage
2. compare LLM reranking vs lightweight reranker model
3. return source ids with itinerary decisions
4. explain why each place was selected

### Deliverables

1. reranker abstraction layer
2. grounded response schema
3. explanation fields for city and activity choice

## Phase 4 - Itinerary Optimizer V2

This is the biggest missing piece in the current system.

### Goals

1. move from heuristic itinerary assembly to actual optimization
2. use travel-time and time-budget constraints
3. reduce unrealistic city hopping

### Recommended method

Use a constraint/route optimizer such as:

- OR-Tools routing / VRP / time-window solver

### Optimization constraints to include

1. day length in hours
2. travel time between stops
3. opening hours
4. hotel check-in/check-out
5. preferred budget
6. route style single-city vs multi-city
7. avoid repeated themes
8. optional transport mode

### Deliverables

1. city-level route optimizer
2. attraction scheduling solver
3. budget-aware hotel and activity scorer
4. feasibility checker

## Phase 5 - Evaluation System

This phase is mandatory before calling the system complete.

### Retrieval metrics

1. Hit@K
2. Recall@K
3. MRR
4. nDCG

### Planner metrics

1. city relevance
2. itinerary feasibility
3. duplicate activity rate
4. budget violation rate
5. travel-time violation rate
6. hotel-city mismatch rate

### Response metrics

1. groundedness
2. completeness
3. helpfulness
4. hallucination rate

### Recommended eval dataset

Build a labeled set of:

- 150 to 300 trip prompts
- expected cities
- expected themes
- forbidden outputs if relevant
- acceptable itinerary patterns

## Phase 6 - Fine-Tuning Decision

Fine-tuning should happen only after Phase 5.

### Good candidates for fine-tuning later

1. requirement extraction
2. trip-style response writing
3. ranking preference prediction

### Not good candidates for immediate fine-tuning

1. factual attraction grounding
2. route optimization
3. hotel-location matching

Those are primarily data/retrieval/planning problems, not first-model fine-tuning problems.

## 9. Recommended Model Stack

## 9.1 Short-term production stack

### Extraction and conversation

- `gpt-5-mini`

### Hard-case reranking / planner reasoning

- `gpt-5.2` only for difficult multi-constraint requests or evaluation comparisons

### Embeddings

- `text-embedding-3-small` to start
- evaluate `text-embedding-3-large` only if retrieval metrics justify the extra cost

## 9.2 Possible future local / open-source additions

These are optional, not mandatory:

1. lightweight open-source reranker for low-cost rerank stage
2. sentiment or aspect model for hotel review summarization
3. clustering model for destination/theme grouping

## 10. What We Should Not Do

1. do not claim the current system is already a complete production RAG system
2. do not fine-tune before building evaluation sets
3. do not use generic synthetic tourism Kaggle datasets as production truth
4. do not continue using one raw row as the only unit of retrieval forever
5. do not treat itinerary optimization as only a prompt engineering problem

## 11. 6-Member Team Split for the Full AIML Roadmap

## Member 1 - Data Engineering Lead

Responsibility:

- raw DB ingestion
- canonical schema design
- deduplication
- data cleaning pipelines

Deliverables:

- `place_master`
- raw import scripts
- quality reports

## Member 2 - External Data and Enrichment Lead

Responsibility:

- official tourism data enrichment
- OSM enrichment
- coordinate and metadata collection
- review-source integration plan

Deliverables:

- enrichment importers
- metadata join pipelines
- structured tourism taxonomy

## Member 3 - Retrieval and Indexing Lead

Responsibility:

- chunking pipeline
- embedding generation
- hybrid retrieval
- MMR
- vector index or vector storage abstraction

Deliverables:

- `place_chunks`
- `place_embeddings`
- retrieval diagnostics
- retrieval benchmarking

## Member 4 - Ranking and Generation Lead

Responsibility:

- query understanding
- reranking
- source-aware response generation
- explanation layer

Deliverables:

- reranker module
- grounded generation schema
- structured response contracts

## Member 5 - Optimization and Planning Lead

Responsibility:

- route optimization
- budget constraints
- hotel selection
- feasibility checking

Deliverables:

- OR-Tools planner module
- day planner
- route validator

## Member 6 - Evaluation and Product Integration Lead

Responsibility:

- eval datasets
- metrics dashboard
- regression testing
- frontend and backend integration checks
- final documentation

Deliverables:

- labeled eval cases
- metric reports
- demo scenarios
- final AIML report

## 12. Suggested 8-Week Delivery Plan

## Week 1

- freeze current prototype
- define target schema
- create eval prompt list

## Week 2

- canonical place table
- enrichment source mapping
- deduplication rules

## Week 3

- chunking pipeline
- embedding regeneration
- metadata fields

## Week 4

- hybrid retrieval
- MMR
- retrieval benchmark scripts

## Week 5

- reranker experiments
- source-aware generation

## Week 6

- OR-Tools itinerary optimizer
- hotel and budget scoring

## Week 7

- multi-scenario evaluation
- planner regression testing
- failure analysis

## Week 8

- UI integration cleanup
- report writing
- viva preparation
- final demo dataset freeze

## 13. Recommended Immediate Next Steps

These are the exact next steps the team should take now.

1. create a new **AIML v2 backlog**
2. define the canonical place schema
3. add coordinates and metadata enrichment
4. implement chunking instead of one-row documents
5. build hybrid retrieval with MMR
6. create a gold evaluation dataset
7. implement OR-Tools itinerary optimization

## 14. Final Verdict

The current AI planner is a **good prototype foundation**, but not the final AIML system.

The correct next move is **not** to keep polishing the prototype only.

The correct next move is to build:

> RAG v2 + data enrichment + planner optimization + evaluation.

That is the path that will make the project academically strong, technically honest, and much closer to a real travel AI product.
