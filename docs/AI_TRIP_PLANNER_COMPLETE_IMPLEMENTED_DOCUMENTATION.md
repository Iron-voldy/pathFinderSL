# TravelLanka AI Trip Planner - Final Implemented Documentation

## 1. Executive Summary

The AI module is now redesigned as a **Python-first AI service** instead of a JavaScript-only planner.

The current production direction is:

- **Frontend chatbot** stays in the existing React client.
- **Main project backend** stays in the existing Node/Express server.
- **AI runtime** is moved into a dedicated **Python FastAPI microservice**.
- **Knowledge grounding** is done with **database-grounded RAG**.
- **Trip generation** is done with **hybrid AI + planning logic**, not with a pure prompt-only chatbot.

This is the correct real-world architecture for this project because the system needs:

- structured AI request parsing
- clean dataset ingestion from `db.sql`
- semantic retrieval from tourism data
- explainable trip planning logic
- a clean path for future ML experiments

## 2. Final Technical Classification

This system should be presented as:

> A hybrid database-grounded RAG trip planning system built with Python FastAPI, OpenAI models, semantic embeddings, and deterministic itinerary planning logic.

It is:

- **RAG-based**
- **LLM-assisted**
- **planner-guided**
- **database-grounded**
- **not fine-tuned in the current production version**

It is **not**:

- a pure rule-based bot
- a pure prompt-only chatbot
- a pure fine-tuned recommender
- a traditional ML model trained from scratch

## 3. Why We Switched the AI Runtime to Python

Python is the better long-term choice for this AI module because:

1. AI data processing, evaluation, and experimentation are easier in Python.
2. Future RAG improvements, embedding pipelines, reranking, and model experiments are easier to maintain in Python.
3. FastAPI gives a clean AI service boundary, strong request validation, and automatic API docs.
4. If we later add supervised fine-tuning, offline evaluation, or model training experiments, Python is the natural place to do it.

The system still keeps the existing Node backend because the current project already depends on it for the wider platform.

So the final architecture is:

- **React UI** -> **Node/Express main backend** -> **Python FastAPI AI service** -> **MySQL + OpenAI API**

## 4. Final AI Method Decision

### 4.1 Current deployed method

The correct deployed method is:

1. **Conversational requirement extraction**
2. **Database-grounded RAG retrieval**
3. **Embedding similarity search**
4. **LLM-based reranking**
5. **Deterministic itinerary planning**
6. **Natural-language trip narration**

### 4.2 Why this is the best method for this project

This project needs both **reasoning** and **grounding**.

If we use only rules:

- the bot becomes too rigid
- it cannot understand flexible user prompts well
- it will feel less intelligent

If we use only an LLM:

- it can hallucinate attractions, hotels, and routes
- it may ignore real database constraints

If we use only vector search:

- retrieval alone cannot assemble a complete travel plan

So the correct production design is:

> RAG for retrieval + LLM for interpretation + planner logic for final trip assembly.

### 4.3 Why we are not using fine-tuning first

Fine-tuning is **not the right first step** for this dataset because the project currently does not have:

- a large clean set of labeled trip requests
- a strong ground-truth set of approved itineraries
- enough user feedback history
- a validated benchmark dataset for comparing models

So the correct sequence is:

1. clean the tourism data
2. build the RAG system
3. evaluate the planner
4. collect real interaction logs and approved outputs
5. only then consider fine-tuning

## 5. Models Used

### 5.1 Conversation and reasoning model

**Model:** `gpt-5-mini`

Used for:

- extracting trip requirements from user prompts
- deciding what follow-up question is needed
- reranking candidate destinations and activities
- generating the final itinerary explanation

### 5.2 Embedding model

**Model:** `text-embedding-3-small`

Used for:

- converting cleaned tourism documents into vectors
- converting user trip queries into vectors
- semantic retrieval of relevant attractions and experiences

### 5.3 Training model

**Current status:** no fine-tuned model is deployed

Future optional training can target:

- slot extraction
- itinerary style consistency
- reranking quality

But that is **future work**, not the current production design.

## 6. Database Reset and Rebuild

## 6.1 Source of truth

The raw source data for the AI rebuild is:

`C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\db.sql`

This dump is now used as the data source for rebuilding the tourism tables.

## 6.2 What was removed

During the Python rebuild flow, these tables were removed before import/re-index:

- `ai_trip_embeddings`
- `ai_trip_documents`
- `ai_lifestyle_clean`
- `tbl_lifestyle_intelligence`
- `hotels`
- `tbl_lifestyle`

## 6.3 What was re-imported

From `db.sql`, the Python importer rebuilds:

- `tbl_lifestyle`
- `hotels`

## 6.4 Why `tbl_lifestyle_intelligence` was removed

The old `tbl_lifestyle_intelligence` table was not kept as the main AI table because it was tied to an older embedding strategy and older data assumptions.

Instead of continuing that table, the new Python AI service now creates a cleaner and more explicit RAG storage design:

- `ai_trip_documents`
- `ai_trip_embeddings`

This gives us:

- a cleaner document layer
- a clean embedding layer
- easier rebuilds
- easier experimentation
- better long-term maintainability

## 7. Current Database Snapshot

After the latest rebuild, the current AI health snapshot is:

- `tbl_lifestyle`: **16,257** rows
- `hotels`: **2,350** rows
- `ai_trip_documents`: **705** rows
- `ai_trip_embeddings`: **705** rows

Interpretation:

- the raw tourism table is still large and noisy
- the AI indexing stage now filters that down to a focused Sri Lanka trip-planning corpus
- the new RAG store is intentionally smaller than the raw marketplace dataset

## 8. Final Database Design for the AI Module

### 8.1 Raw operational tables

#### `tbl_lifestyle`

Purpose:

- raw activity / attraction / tourism product dataset

Used for:

- titles
- descriptions
- city labels
- categories
- prices
- source content for AI indexing

#### `hotels`

Purpose:

- hotel grounding table

Used for:

- city-level hotel matching
- suggested accommodation in itineraries

### 8.2 New AI tables

#### `ai_trip_documents`

Purpose:

- cleaned retrieval documents for RAG

Important fields:

- `source_lifestyle_id`
- `canonical_city`
- `lifestyle_name`
- `lifestyle_description`
- `theme_tags`
- `category_keys`
- `price_text`
- `location_text`
- `combined_text_content`
- `source_hash`

#### `ai_trip_embeddings`

Purpose:

- vector store for the cleaned RAG documents

Important fields:

- `document_id`
- `embedding_model`
- `embedding_dimensions`
- `text_embedding`
- `metadata_json`
- `embedding_generated_at`

## 9. Data Cleaning and RAG Preparation

The most important design improvement was moving the cleanup into the Python indexing layer.

The raw tourism dump contains many noisy records such as:

- airport transfers
- taxi services
- package wrappers
- multi-day generic journey products
- training / certification rows
- equipment rental rows
- product-like menu items
- service-like photography or arcade rows

### 9.1 What the new indexer does

The indexer now:

1. keeps only supported Sri Lanka destinations
2. normalizes city names into canonical cities
3. drops transport-like rows
4. drops package-like rows
5. drops training / certification rows
6. drops low-value service listings
7. extracts theme tags
8. builds a clean combined retrieval text
9. stores only cleaned documents in `ai_trip_documents`
10. generates embeddings only for those cleaned documents

### 9.2 Why this matters

This is important because in RAG systems:

- bad retrieval causes bad answers
- noisy documents poison the candidate set
- planning quality depends on document quality

So the correct place to improve quality is the **index**, not only the chatbot prompt.

## 10. End-to-End System Flow

### Step 1

The user opens the React chatbot and types a travel prompt.

Example:

`Plan a 3 day relaxing beach trip in Sri Lanka for 2 people`

### Step 2

The React chatbot sends the request to the Node backend:

- `POST /api/ai-trip-planner/message`

### Step 3

The Node controller first tries the Python AI service.

If Python is unavailable, Node can still fall back to the old JS planner path.

### Step 4

The Python FastAPI service receives the request.

### Step 5

The LLM extracts structured fields such as:

- days
- travelers
- mood tags
- preferred cities
- budget
- hotel preference
- transport need

### Step 6

If important values are missing, the AI asks a follow-up question instead of hallucinating the rest.

### Step 7

When enough information is available, the service builds a semantic search query and retrieves the best RAG candidates from:

- `ai_trip_documents`
- `ai_trip_embeddings`

### Step 8

The planner applies:

- semantic similarity
- theme match scoring
- city affinity boosts
- quality penalties
- duplicate reduction

### Step 9

The LLM reranks the shortlisted candidates.

### Step 10

The planner matches hotels from the `hotels` table and builds a structured itinerary.

### Step 11

The AI returns a human-friendly answer plus a structured itinerary payload.

### Step 12

The React chatbot renders:

- assistant message
- selected cities
- daily itinerary cards
- hotel suggestion per day

## 11. Final Architecture

```text
React Chatbot
    |
    v
Node / Express API
    |
    v
Python FastAPI AI Service
    |            |
    |            +--> OpenAI Responses API
    |            +--> OpenAI Embeddings API
    |
    v
MySQL
    |
    +--> tbl_lifestyle
    +--> hotels
    +--> ai_trip_documents
    +--> ai_trip_embeddings
```

## 12. Main Implemented Code Files

## 12.1 Python AI service

Core:

- `ai-python-service/app/main.py`
- `ai-python-service/app/core/config.py`
- `ai-python-service/app/core/db.py`

Schemas:

- `ai-python-service/app/schemas/planner.py`

Service layer:

- `ai-python-service/app/services/openai_service.py`
- `ai-python-service/app/services/dump_importer.py`
- `ai-python-service/app/services/index_builder.py`
- `ai-python-service/app/services/planner_service.py`

Routers:

- `ai-python-service/app/routers/planner.py`
- `ai-python-service/app/routers/admin.py`

Scripts:

- `ai-python-service/scripts/run_import_and_index.py`
- `ai-python-service/scripts/test_planner.py`

## 12.2 Existing project integration

Node backend:

- `travellanka-ai/server/ai-trip-planner-management/controllers/aiTripPlannerController.js`

React client:

- `travellanka-ai/client/src/components/shared/ChatBot.jsx`
- `travellanka-ai/client/src/components/shared/ChatBot.css`
- `travellanka-ai/client/src/services/api.js`

## 13. Key Code Responsibilities

## 13.1 `dump_importer.py`

Purpose:

- rebuild the tourism source tables from `db.sql`

Main responsibilities:

- stream SQL statements from the dump
- target only required tables
- drop old AI and tourism tables
- recreate `tbl_lifestyle` and `hotels`

This file is the reason the AI pipeline now starts from a reproducible dataset instead of ad-hoc database state.

## 13.2 `index_builder.py`

Purpose:

- convert raw tourism data into a clean RAG corpus

Main responsibilities:

- canonical city normalization
- raw row filtering
- theme extraction
- combined retrieval text creation
- `ai_trip_documents` table generation
- embedding generation into `ai_trip_embeddings`

This is the most important file for RAG quality.

## 13.3 `planner_service.py`

Purpose:

- run the full planner pipeline

Main responsibilities:

- normalize planner state
- extract trip requirements from the prompt
- ask follow-up questions when data is incomplete
- embed the query
- fetch ranked candidates
- apply heuristic quality penalties and city boosts
- rerank with the LLM
- match hotels
- build itinerary
- generate final assistant response

This is the core brain of the AI planner.

## 13.4 `openai_service.py`

Purpose:

- isolate all OpenAI API communication

Main responsibilities:

- call Responses API for structured JSON extraction
- call Responses API for natural-language output
- call Embeddings API for vector generation
- retry requests when the network is unstable

## 13.5 `aiTripPlannerController.js`

Purpose:

- connect the existing Node app to the new Python AI runtime

Main responsibilities:

- proxy planner requests to FastAPI
- proxy planner health checks to FastAPI
- fall back to the old JS planner if Python is temporarily unavailable

This file is the bridge that lets us improve AI architecture without breaking the existing app.

## 13.6 `ChatBot.jsx`

Purpose:

- provide the user-facing AI trip planner experience

Main responsibilities:

- send user prompts
- preserve planner state between turns
- render follow-up suggestions
- render selected cities
- render itinerary days and hotel choices

## 14. Example of the Current Working Behavior

Prompt used in testing:

`Plan a 3 day relaxing beach trip in Sri Lanka for 2 people with a medium budget`

Current observed behavior:

- planner status: `planned`
- selected city: `Mirissa`
- hotel match: `Mandara Resort`
- itinerary generated for 3 days
- activities grounded from the cleaned RAG index

This confirms that the Python-first planner is now operational and is no longer defaulting to Colombo package wrappers as the primary answer.

## 15. Member-by-Member Work Breakdown

The following split is the correct 6-member responsibility model for this project.

## Member 1 - Data Reset and Import Pipeline

Scope:

- raw data restoration from `db.sql`
- database reset strategy
- reproducible tourism table import

Files:

- `ai-python-service/app/services/dump_importer.py`
- `ai-python-service/app/core/config.py`
- `ai-python-service/app/core/db.py`

What this member did:

- connected the Python service to the project database
- read the SQL dump safely
- dropped outdated AI tables
- restored `tbl_lifestyle` and `hotels`
- made the rebuild process repeatable

## Member 2 - RAG Corpus Engineering

Scope:

- create the clean AI document corpus
- design AI retrieval tables
- build embedding storage

Files:

- `ai-python-service/app/services/index_builder.py`

What this member did:

- created `ai_trip_documents`
- created `ai_trip_embeddings`
- normalized city names
- filtered transport / package / training noise
- built combined retrieval text
- prepared the vector search dataset

## Member 3 - Planner Intelligence and Ranking

Scope:

- AI reasoning flow
- ranking
- itinerary generation

Files:

- `ai-python-service/app/services/planner_service.py`

What this member did:

- built the structured requirement extraction flow
- added follow-up question logic
- computed semantic similarity scores
- added city affinity boosts
- added quality penalties for noisy candidates
- removed itinerary duplicates
- matched hotels
- returned final structured trip plans

## Member 4 - AI API Service Layer

Scope:

- FastAPI service architecture
- request models
- runtime routing

Files:

- `ai-python-service/app/main.py`
- `ai-python-service/app/routers/planner.py`
- `ai-python-service/app/routers/admin.py`
- `ai-python-service/app/schemas/planner.py`

What this member did:

- created the FastAPI app
- added planner routes
- added admin routes for import and indexing
- created typed request payload models
- prepared the service for `/docs` and API validation

## Member 5 - Platform Integration and Chatbot UI

Scope:

- connect AI service to the main web app
- user-facing chatbot behavior

Files:

- `travellanka-ai/server/ai-trip-planner-management/controllers/aiTripPlannerController.js`
- `travellanka-ai/client/src/components/shared/ChatBot.jsx`
- `travellanka-ai/client/src/components/shared/ChatBot.css`
- `travellanka-ai/client/src/services/api.js`

What this member did:

- connected Node to Python
- preserved the existing frontend architecture
- connected the chatbot to the planner API
- rendered itinerary responses in the UI
- kept a JS fallback path for resilience

## Member 6 - Evaluation, Testing, and Documentation

Scope:

- validation
- testing workflow
- project documentation

Files:

- `ai-python-service/scripts/test_planner.py`
- `ai-python-service/scripts/run_import_and_index.py`
- `ai-python-service/README.md`
- `travellanka-ai/docs/AI_TRIP_PLANNER_COMPLETE_IMPLEMENTED_DOCUMENTATION.md`

What this member did:

- prepared repeatable test scripts
- documented the rebuild flow
- documented the final architecture
- captured the correct academic explanation of RAG vs training vs planning

## 16. Why This Is Better Than the Previous JS-Only AI Design

The earlier design was useful for a prototype, but the Python-first architecture is better because:

1. it separates the AI runtime from the general web backend
2. it creates a proper RAG document layer
3. it gives a clean place for future experimentation
4. it is easier to extend with offline evaluation and training workflows
5. it makes the AI pipeline more explainable

## 17. What We Are Not Claiming

To keep the project academically correct, the team should **not** claim:

- that we trained a custom LLM already
- that the system is purely fine-tuned
- that the itinerary is generated only by rules
- that raw `tbl_lifestyle` rows are used directly without cleaning

The correct claim is:

> We implemented a hybrid RAG-based AI trip planner with Python FastAPI, OpenAI models, semantic retrieval, and deterministic itinerary logic.

## 18. Future Roadmap

The correct next-stage roadmap is:

1. collect real user prompts and approved itinerary outputs
2. build an evaluation dataset
3. add automated offline planner evaluation
4. improve destination coverage and hotel matching
5. optionally fine-tune a supported model for slot extraction or reranking after enough clean labeled data is collected

## 19. How to Run the Current System

### 19.1 Install Python dependencies

From:

`C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\ai-python-service`

Run:

```powershell
python -m pip install -r requirements.txt
```

### 19.2 Re-import database tables from `db.sql`

```powershell
python -c "from app.services.dump_importer import import_tables_from_dump; print(import_tables_from_dump())"
```

### 19.3 Rebuild the clean RAG index

```powershell
python -c "from app.services.index_builder import rebuild_full_index; print(rebuild_full_index())"
```

### 19.4 Start FastAPI

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8100 --reload
```

### 19.5 Start the main TravelLanka backend

From:

`C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai\server`

Run the normal backend start command used by the project.

### 19.6 Start the frontend

From:

`C:\Users\Lenovo\Desktop\UNI projects\pathFinderSL\travellanka-ai\client`

Run the normal Vite client start command used by the project.

## 20. Final Viva / Report Answer

If asked in a viva:

**What type of system is this?**

Answer:

> This is a hybrid database-grounded RAG trip planner built with a Python FastAPI AI service, OpenAI models, vector embeddings, and deterministic itinerary generation logic.

**Did you train a model?**

Answer:

> No custom model is trained in the current production version. We use pretrained OpenAI models plus our own RAG and planning pipeline. Fine-tuning is reserved for a later phase after collecting enough labeled data and evaluation benchmarks.

**Why not use only rules?**

Answer:

> Pure rules are too rigid for natural user prompts. We need LLM understanding for flexible travel requests, but we also need grounding and planning logic for correctness. That is why we use a hybrid system.

**Why Python and FastAPI?**

Answer:

> Python is the right long-term environment for AI pipelines, evaluation, RAG improvements, and future training experiments, while FastAPI gives us a clean production API boundary for the chatbot.
