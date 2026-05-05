# TravelLanka AI Trip Planner - Viva and Run Guide

## 1. Short Viva Answer

If the panel asks, "What kind of AI system is this?", say:

> This is a hybrid database-grounded RAG trip planning system. We use a Python FastAPI AI service, OpenAI language models for requirement extraction and response generation, embeddings for semantic retrieval, and deterministic planner logic for itinerary creation.

If they ask, "Is this a RAG system?", say:

> Yes. It is a private-data RAG system. Instead of retrieving from the web, it retrieves from our own tourism database after cleaning the data into AI-ready documents and embeddings.

If they ask, "Did you train your own model?", say:

> Not in the current production version. We first built a strong RAG pipeline because our dataset is still limited and noisy for fine-tuning. Fine-tuning is future work after we collect enough labeled trip examples and evaluation benchmarks.

## 2. Is This Really a RAG System?

Yes, this is a **RAG system**, but not a generic web RAG chatbot.

It is a **database-grounded RAG system** because it follows the RAG pipeline:

1. **Data ingestion**
   - Raw tourism data is loaded from `db.sql`.
2. **Document creation**
   - Useful tourism rows are cleaned and converted into AI-ready text documents.
3. **Embedding**
   - Each cleaned document is converted into a vector embedding.
4. **Vector store**
   - Embeddings are stored in `ai_trip_embeddings`.
5. **Query understanding**
   - The user prompt is converted into structured trip requirements.
6. **Query embedding**
   - The trip request is embedded with the same embedding model.
7. **Retrieval**
   - The system finds the most semantically relevant tourism documents.
8. **Reranking**
   - Retrieved candidates are reranked with AI and planner logic.
9. **Generation**
   - The final itinerary response is generated from grounded retrieved data.

That is the correct RAG format.

## 2.1 Current RAG Retrieval Configuration

These are the exact retrieval settings in the current implementation.

### Chunk size

Current answer:

> We do not use paragraph chunking yet. One cleaned tourism row becomes one RAG document.

That means:

- one `tbl_lifestyle` row
- becomes one cleaned `ai_trip_documents` row
- and that full combined text is embedded as one document

So in the current system:

- **document chunk size = one cleaned tourism record**
- **embedding batch size = 20 documents per API batch**

Important:

Embedding batch size is **not** the same thing as chunk size.

### Top-K

Current answer:

> The retrieval stage returns top 30 candidates, and the LLM reranking stage receives the top 18 of those candidates.

### MMR

Current answer:

> Formal MMR is not implemented yet.

Instead, the system currently uses a custom diversity step:

- duplicate signature removal
- per-city cap
- quality penalties
- city-affinity boosts

So the correct answer is:

> We currently use custom diversity-aware ranking, not formal Max Marginal Relevance yet.

### Hit rate

Current answer:

> Hit rate is not formally measured yet.

Right now validation is functional and manual:

- scenario testing
- output inspection
- city relevance checking
- itinerary quality checking

If needed for the next phase, hit rate can be defined as:

> the percentage of test prompts where at least one relevant destination appears in the retrieved top-K results

### Retrieval summary

You can say this in viva:

> Our current RAG pipeline uses one cleaned tourism row as one retrieval document, embeds the full row text, retrieves top 30 candidates by semantic similarity plus custom scoring, sends the top 18 to the reranker, and applies diversity rules. Formal MMR and hit-rate benchmarking are planned as the next evaluation upgrade.

## 3. Why This Is Not Pure Rule-Based

This project is **not** a pure rule-based system.

Rules are used, but only for:

- follow-up control
- score adjustment
- duplicate reduction
- hotel matching
- itinerary assembly

The AI part is still real because:

- the model extracts trip requirements from natural language
- embeddings retrieve relevant attractions semantically
- the LLM reranks candidates
- the LLM generates the final grounded answer

So the correct description is:

> Hybrid RAG + LLM + planner rules.

## 4. AIML Features Used

These are the AIML features implemented in this project.

### 4.1 Natural-language requirement extraction

The user can type free-form prompts like:

`Plan a 3 day relaxing beach trip in Sri Lanka for 2 people`

The model extracts:

- days
- travelers
- mood tags
- preferred cities
- budget level
- hotel preference
- transport need
- extra notes

### 4.2 Conversational slot filling

If key details are missing, the chatbot asks follow-up questions instead of guessing.

Example:

- How many days?
- How many travelers?
- What kind of mood do you want?

### 4.3 Embedding-based semantic retrieval

The system does not rely only on exact keyword matching.

It uses embeddings so that similar meanings can match even if the user wording is different from the database wording.

### 4.4 RAG retrieval from private tourism data

The chatbot grounds the answer on:

- cleaned attraction/activity data
- cleaned city information
- hotel data

### 4.5 LLM reranking

After retrieval, the LLM helps choose the most suitable destinations and experiences from the candidate set.

### 4.6 Deterministic itinerary planning

Planner logic is used to:

- choose cities
- distribute activities across days
- avoid repeated activities
- attach hotels
- produce a structured itinerary

### 4.7 Natural-language grounded answer generation

The final chatbot reply is generated from the structured plan, not directly hallucinated from the prompt alone.

## 5. Model Choice

### 5.1 Main reasoning model

**Model:** `gpt-5-mini`

Used for:

- trip requirement extraction
- follow-up flow
- reranking
- itinerary narration

Why we chose it:

- lower cost than larger models
- strong enough for well-defined planner tasks
- supports structured outputs and tool-like workflows

### 5.2 Embedding model

**Model:** `text-embedding-3-small`

Used for:

- document embeddings
- query embeddings
- semantic retrieval

Why we chose it:

- lower cost
- strong retrieval quality
- suitable for semantic search and recommendation-style matching

### 5.3 Why we did not fine-tune first

We did not use fine-tuning as the first method because:

- the project does not yet have a large labeled dataset of ideal trip outputs
- noisy tourism records would reduce fine-tuning quality
- RAG gives faster and more reliable improvement first

## 6. Dataset Usage

### 6.1 Raw data source

Source file:

`C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\db.sql`

### 6.2 Raw database tables used

- `tbl_lifestyle`
- `hotels`

### 6.3 New AI tables used

- `ai_trip_documents`
- `ai_trip_embeddings`

### 6.4 How the dataset is used

1. Import raw tables from `db.sql`
2. Remove old AI tables
3. Clean tourism rows
4. Keep only Sri Lanka-relevant and AI-useful records
5. Build combined AI text documents
6. Generate embeddings
7. Store them for retrieval

### 6.5 Current verified AI-ready dataset

At the current stage:

- `tbl_lifestyle` has 16,257 rows
- `hotels` has 2,350 rows
- `ai_trip_documents` has 705 cleaned rows
- `ai_trip_embeddings` has 705 embeddings

That means the AI does not use the whole raw marketplace directly. It uses a filtered RAG corpus.

## 7. Validation

Validation should be explained in four parts.

### 7.1 Data validation

We validate the RAG input by:

- filtering noisy tourism rows
- removing package wrappers
- removing transfer-like rows
- removing training/rental/service-only rows
- keeping canonical supported cities

### 7.2 API validation

FastAPI validates request bodies through typed schema models before the planner runs.

### 7.3 Functional validation

We validate the system by checking:

- follow-up questions appear when required fields are missing
- itinerary is generated when enough information is available
- selected city matches the trip type
- hotel match is returned
- activities are grounded in retrieved rows

### 7.4 Output validation

We inspect:

- whether the itinerary is relevant
- whether duplicate activities are removed
- whether the plan stays inside the chosen city or route
- whether the chatbot avoids generic package answers

## 8. System Impact

The system impact can be explained as:

### 8.1 User impact

- users can describe trips in natural language
- users get a personalized itinerary instead of browsing manually
- the chatbot can ask clarifying questions

### 8.2 Business impact

- tourism products become more discoverable
- hotels are connected to the trip planning flow
- the platform becomes more intelligent than a normal listing site

### 8.3 Technical impact

- AI service is now modular
- data import is reproducible
- RAG index can be rebuilt
- future training and evaluation are easier

## 9. Why This Is the Best Method for This Project

This is the best method because the project needs both **language understanding** and **database grounding**.

### If we use only rules

- system becomes rigid
- difficult to understand varied user prompts
- poor conversational experience

### If we use only an LLM

- risk of hallucinated routes and attractions
- weak grounding
- unreliable for real trip generation

### If we use only fine-tuning first

- current dataset is not yet strong enough
- expensive and risky before evaluation
- does not solve grounding by itself

### Why hybrid RAG is best

- retrieval grounds answers in real tourism data
- embeddings improve matching quality
- LLM improves natural-language understanding
- planner rules improve feasibility and consistency

That is why the chosen method is:

> RAG first, planning second, fine-tuning later if needed.

## 10. System Architecture

```text
React Chatbot
   |
   v
Node / Express Backend
   |
   v
Python FastAPI AI Service
   |
   +--> OpenAI Responses API
   +--> OpenAI Embeddings API
   |
   v
MySQL Database
   |
   +--> tbl_lifestyle
   +--> hotels
   +--> ai_trip_documents
   +--> ai_trip_embeddings
```

## 11. How to Run the Project

Use three terminals.

### Terminal 1 - Python AI service

#### First-time setup or after refreshing `db.sql`

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\ai-python-service"
python -m pip install -r requirements.txt
python -c "from app.services.dump_importer import import_tables_from_dump; print(import_tables_from_dump())"
python -c "from app.services.index_builder import rebuild_full_index; print(rebuild_full_index())"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8100 --reload
```

#### Normal daily run

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\ai-python-service"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8100 --reload
```

What this does:

- installs Python AI dependencies
- imports tourism data from `db.sql`
- rebuilds the RAG index
- starts FastAPI on port `8100`

Important:

- the import step is **not needed every startup**
- run the import only for first-time setup or when you want to refresh from `db.sql`
- if an import is interrupted and `tbl_lifestyle` becomes empty, run:

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\ai-python-service"
python scripts\restore_lifestyle_only.py
python -c "from app.services.index_builder import rebuild_full_index; print(rebuild_full_index())"
```

### Terminal 2 - Node backend

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai\server"
npm install
npm run dev
```

What this does:

- starts the main backend on port `5003`
- exposes the project APIs
- proxies AI requests to the Python service

### Terminal 3 - React frontend

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai\client"
npm install
npm run dev
```

What this does:

- starts the UI on `http://localhost:3000`
- proxies `/api` requests to the Node backend

## 12. Quick Health Check

### Check FastAPI

Open:

`http://127.0.0.1:8100/health`

### Check planner health

Open:

`http://127.0.0.1:8100/api/v1/planner/health`

### Test the Node planner path

Run:

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai\server"
npm run test:ai-planner
```

### Run multi-case Python validation

Run:

```powershell
cd "C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\ai-python-service"
python scripts\evaluate_trip_cases.py
```

## 13. Member Duties

### Member 1 - Database reset and import

Worked on:

- import from `db.sql`
- dropping outdated AI tables
- restoring `tbl_lifestyle` and `hotels`

Key files:

- `ai-python-service/app/services/dump_importer.py`
- `ai-python-service/app/core/config.py`
- `ai-python-service/app/core/db.py`

### Member 2 - RAG data engineering

Worked on:

- cleaning raw tourism rows
- canonical city normalization
- RAG document creation
- embedding storage

Key files:

- `ai-python-service/app/services/index_builder.py`

### Member 3 - Planner logic

Worked on:

- prompt understanding
- follow-up logic
- retrieval scoring
- reranking
- hotel matching
- itinerary generation

Key files:

- `ai-python-service/app/services/planner_service.py`

### Member 4 - FastAPI AI service

Worked on:

- FastAPI app
- planner routes
- admin routes
- request schema layer

Key files:

- `ai-python-service/app/main.py`
- `ai-python-service/app/routers/planner.py`
- `ai-python-service/app/routers/admin.py`
- `ai-python-service/app/schemas/planner.py`

### Member 5 - Platform integration

Worked on:

- Node to Python AI bridge
- React chatbot integration
- client API layer

Key files:

- `travellanka-ai/server/ai-trip-planner-management/controllers/aiTripPlannerController.js`
- `travellanka-ai/client/src/components/shared/ChatBot.jsx`
- `travellanka-ai/client/src/services/api.js`

### Member 6 - Testing and documentation

Worked on:

- test scripts
- README / run guide
- architecture documentation
- viva preparation content

Key files:

- `ai-python-service/scripts/test_planner.py`
- `ai-python-service/scripts/evaluate_trip_cases.py`
- `ai-python-service/scripts/run_import_and_index.py`
- `ai-python-service/README.md`
- `travellanka-ai/docs/AI_TRIP_PLANNER_COMPLETE_IMPLEMENTED_DOCUMENTATION.md`
- `travellanka-ai/docs/AI_TRIP_PLANNER_VIVA_RUN_GUIDE.md`

## 14. Remaining Improvements

These are the remaining development improvements, not blockers.

1. Add automatic evaluation scripts for multiple trip scenarios
2. Improve destination diversity in itinerary generation
3. Add transport grounding from the transport module
4. Add budget-aware scoring
5. Collect labeled user interactions for future fine-tuning experiments

## 15. Final Best Answer for Viva

Use this answer if they ask for everything together:

> Our system is a hybrid AI trip planning system built as a private-data RAG pipeline. We import tourism data from `db.sql`, clean it into AI-ready documents, generate embeddings, and retrieve relevant destinations semantically. Then we use `gpt-5-mini` to extract trip requirements, ask follow-up questions, rerank candidates, and generate a grounded itinerary response. We use `text-embedding-3-small` for semantic retrieval because it is cost-effective and suitable for search-style tasks. We selected RAG instead of immediate fine-tuning because our current dataset is still noisy and does not yet contain enough labeled examples for reliable model training. FastAPI is used for the AI microservice because it provides request validation and clean API separation, and the React + Node app connects to that AI service through the existing platform architecture.
