# TravelLanka AI Trip Planner Research and Implementation Plan

## 1. Goal

Build a grounded AI trip planner for Sri Lanka that:

- accepts a natural-language prompt such as `I want to tour Sri Lanka for 3 days`
- asks follow-up questions to collect missing preferences
- retrieves only real places, hotels, and transport options from the existing database
- generates a feasible multi-day itinerary with explanations, estimated budget, and bookable options
- can be explained in the AIML report under:
  - AIML features used
  - model choices and methods
  - dataset usage
  - validation
  - system impact

## 2. Current Project Reality

### 2.1 Existing product state

- The backend already exposes hotels, destinations, lifestyles, budget, reviews, and transport APIs.
- The frontend already has a chatbot shell, but the input and suggestion buttons are still disabled, so the AI feature is not implemented yet.
- `destinations.city_key` is already being used as the bridge between curated destinations and `tbl_lifestyle`.

### 2.2 Exact database counts checked on `production_test4_new`

| Table | Exact rows | AI value |
| --- | ---: | --- |
| `destinations` | 10 | Canonical Sri Lanka destination layer |
| `tbl_lifestyle` | 15,342 | Main activity corpus |
| `tbl_lifestyle_intelligence` | 0 | Intended AI enrichment table, currently empty |
| `hotels` | 33 | Accommodation candidates |
| `transport_gigs` | 26 | Transport candidates |
| `transport_bookings` | 4 | Weak historical demand signal |
| `driver_applications` | 10 | Driver metadata support |
| `budget_plans` | 4 | Weak budget-pattern signal |
| `budget_items` | 8 | Weak budget-category signal |
| `orders` | 10 | Booking history |
| `order_items` | 14 | Product-level demand signal |
| `reviews` | 7 | Very small quality signal |
| `users` | 17 | User profiles, not enough for training |
| `carts` | 13 | Commerce behavior support |
| `cart_items` | 20 | Commerce behavior support |
| `lifestyle` | 45 | Likely legacy/demo duplicate, not the main live corpus |

### 2.3 What the data already supports well

- Curated destination pages for the main Sri Lanka tourism areas
- A very large activity corpus in `tbl_lifestyle`
- Hotel lookup by city
- Transport lookup by route, capacity, and price
- Budget plan and review modules that can later feed personalization

### 2.4 What the data does **not** support yet

- End-to-end model training for itinerary generation
- Reliable ML personalization from user history
- Embedding-based retrieval using the existing `tbl_lifestyle_intelligence` table, because that table is empty
- Clean geographic reasoning without normalization work
- Safe direct embedding of all lifestyle rows without first removing noisy non-attraction entries

## 3. Database Findings That Matter for AI Design

## 3.1 Strong findings

- `tbl_lifestyle` is the most valuable AI dataset in the system.
- The curated `destinations` table covers the core Sri Lanka cities the product wants to show to users.
- `hotels` and `transport_gigs` are good enough to produce grounded recommendations.
- `reviews`, `orders`, and `budget_*` are currently too small to act as primary training data.

## 3.2 Data-quality risks

- `tbl_lifestyle` contains many non-Sri-Lanka cities such as Singapore, Hanoi, Bangkok, Phuket, Dubai, and others.
- City names are inconsistent:
  - `Ella` vs `ella`
  - `Nuwaraeliya` vs `Nuwara Eliya`
  - route names also vary by casing and formatting
- Even after Sri Lanka city filtering, some rows are still not real attractions.
  - local examples found in Colombo-like rows include visa services, test rows, ticket-like rows, and airport-service rows
- Some curated destinations have weak hotel coverage:
  - `ArugamBay`: 0 matching hotels
  - `Anuradhapura`: 0 matching hotels
  - `Trincomalee`: 1 matching hotel
- `tbl_lifestyle_intelligence` exists as a schema but currently has 0 rows, so it cannot be used yet.
- `budget_plans.destination` is not normalized and sometimes stores comma-separated city lists.
- `tbl_lifestyle_intelligence` currently mixes:
  - static enrichment fields such as embeddings, tags, and attraction-profile scores
  - runtime fields such as semantic match and final ranking scores

## 3.3 Best immediate interpretation

The database is strong enough for a **grounded hybrid itinerary planner**, but not for a **fully trained recommender model** yet.

That means:

- do **not** start with custom model training
- do **not** build pure RAG only
- do build a **hybrid AI pipeline**
- do populate `tbl_lifestyle_intelligence`, but only after cleaning the source rows and separating static vs runtime scoring

## 4. Approaches Considered

| Approach | Pros | Cons | Verdict |
| --- | --- | --- | --- |
| Pure RAG chatbot | Quick to build, grounded to DB | Good at Q&A, weak at route optimization and day-by-day planning | Not enough alone |
| Fine-tuned / trained itinerary model | Strong behavior control if data is large | Current dataset is too small and too noisy for supervised itinerary training | Not recommended now |
| Rule-based planner only | Feasible and predictable | Weak conversation quality, poor handling of vague prompts | Not ideal alone |
| **Hybrid LLM + retrieval + rule/scoring planner** | Best balance of grounding, explanation, and itinerary feasibility | Needs more engineering | **Recommended** |

## 5. Recommended AI Solution

## 5.1 Final recommendation

Use a **hybrid conversational planner**:

1. An LLM handles the conversation and asks clarifying questions.
2. Structured backend functions query the real DB.
3. A deterministic ranking/planning layer selects cities, activities, hotels, and transport.
4. The LLM rewrites the grounded plan into a natural user-friendly itinerary.

This is the best fit because itinerary generation is not only a retrieval problem. It is also:

- a slot-filling problem
- a route-selection problem
- a constraint-satisfaction problem
- a grounded recommendation problem

## 5.2 AI flow

### Step 1. User sends a vague prompt

Example:

`I want to tour Sri Lanka for 3 days`

### Step 2. AI asks follow-up questions

Collect the minimum required fields:

- travel days
- start city / arrival city
- travel dates
- number of adults and children
- budget level
- mood or style
  - adventure
  - relaxing
  - culture
  - beach
  - wildlife
  - luxury
  - budget
- must-visit places
- places to avoid
- hotel needed or not
- transport needed or not

### Step 3. Retrieval layer pulls grounded candidates

The backend should retrieve:

- destination candidates from `destinations`
- activity candidates from `tbl_lifestyle`
- hotel candidates from `hotels`
- transport candidates from `transport_gigs`
- weak quality boosts from `reviews`
- weak budget references from `budget_plans` and `budget_items`

### Step 4. Scoring layer ranks the candidates

Use a weighted score such as:

`final_score = mood_match + city_match + budget_fit + group_fit + review_boost + availability_boost - travel_time_penalty`

### Step 5. Itinerary builder assembles a route

The builder should produce:

- day-by-day city allocation
- morning / afternoon / evening blocks
- matched hotels per overnight city
- matched transport between cities
- estimated daily and total cost
- reasons for each recommendation

### Step 6. LLM produces the final answer

The final user-facing answer should include:

- trip summary
- day-wise itinerary
- recommended hotel options
- transport suggestion
- budget summary
- why these places were chosen
- next actions such as book hotel / book transport / save itinerary

## 6. Model Choices

## 6.1 Runtime model stack

### Primary conversation model

- Recommended: `GPT-5 mini`
- Why:
  - lower runtime cost than the largest frontier model
  - strong enough for structured follow-up questioning
  - suitable for well-defined tool-using application logic

### Fallback / premium planner model

- Recommended: `GPT-5.2`
- Use only when:
  - the itinerary is complex
  - many constraints conflict
  - multi-city route planning needs a better explanation

### Embedding model

- Start with: `text-embedding-3-small`
- Upgrade path: `text-embedding-3-large` if semantic retrieval quality is not good enough

## 6.2 Best option for `tbl_lifestyle_intelligence`

Yes, we **can** populate `tbl_lifestyle_intelligence` using OpenAI, and this is the best next AI-data step after cleaning the lifestyle dataset.

However, the best option is **not** to fill every column in that table in one blind pass.

The correct option is a **two-stage enrichment pipeline**:

### Stage A. Clean and normalize first

Build `ai_lifestyle_clean` from `tbl_lifestyle` by:

- keeping Sri Lanka-relevant rows only
- keeping `active_status = 1` and `deleted_at IS NULL`
- normalizing city names to canonical destination keys
- removing non-attraction noise such as visa services, test rows, ticket-like rows, and generic service entries
- producing a stable `combined_text_content`

Practical note from the current DB:

- Sri Lanka-core city filtering currently gives about `3,459` rows
- about `2,833` of those are active rows
- this is a reasonable size for an offline embedding backfill job

### Stage B. Populate only the static intelligence fields

Use OpenAI to generate and store:

- `combined_text_content`
- `text_embedding`
- `embedding_model`
- `embedding_generated_at`
- optional stable attraction-profile values such as:
  - theme scores
  - persona tags
  - extracted keywords
  - category keys
  - analysis metadata

### Do **not** permanently prefill runtime query scores

These fields depend on the current traveler request and should be calculated at runtime:

- `semantic_similarity_score`
- `overall_persona_match_score`
- `combined_final_score`
- `matched_interests`

Best practice:

- keep embeddings and static tags in `tbl_lifestyle_intelligence`
- calculate user-query match scores in the planner service or a runtime results table

### Best first model choice for the backfill

- use `text-embedding-3-small` first

Reason:

- this is mainly a retrieval problem
- cost-efficient re-indexing matters because lifestyle content will change
- the cleaned dataset is not so large that a first full embedding pass becomes risky

Upgrade to `text-embedding-3-large` only if offline retrieval evaluation clearly shows better ranking quality.

### Best text recipe for `combined_text_content`

Build one normalized text block using:

- lifestyle name
- canonical city
- attraction type
- main description
- sub description
- selling points
- address and micro location
- category values
- price and currency values
- destination name when available

Example shape:

`[Name]. Located in [Canonical City], Sri Lanka. Type: [Attraction Type]. Description: [Main Description]. Highlights: [Selling Points]. Categories: [category1, category2, category3]. Price: [adult_rate] [currency]. Address: [address].`

### Best implementation style

Use an offline rerunnable enrichment job:

1. read from `ai_lifestyle_clean`
2. generate `combined_text_content`
3. create embeddings in chunks
4. upsert into `tbl_lifestyle_intelligence`
5. log failures for retry
6. rerun only changed rows later

## 6.3 Why not fine-tune first

Do **not** start with fine-tuning in phase 1 because:

- the current project has only a tiny amount of booking/review/budget interaction data
- there is no cleaned conversation-to-itinerary training set
- the inventory changes over time, so grounding to DB matters more than memorization

Fine-tuning becomes useful later only after the team has:

- logged real AI conversations
- stored accepted / edited itineraries
- built an evaluation dataset

## 7. Methods We Are Using

These are the methods you can confidently state in the AIML report.

## 7.1 Conversational slot filling

The AI asks follow-up questions to fill required trip slots before planning.

Example slots:

- duration
- travelers
- budget
- mood
- origin
- accommodation preference
- transport preference

## 7.2 Retrieval-Augmented Generation (RAG)

Use retrieval for:

- activity descriptions
- city options
- hotel options
- transport options

But keep the RAG scope **database-grounded**, not web-grounded.

## 7.3 Tool calling / structured orchestration

The model should not directly invent itineraries from memory.  
It should call backend functions such as:

- `extract_trip_requirements`
- `search_destinations`
- `search_lifestyles`
- `search_hotels`
- `search_transport`
- `build_itinerary`
- `estimate_budget`

## 7.4 Deterministic ranking and planning

The itinerary itself should be built with backend logic, not left entirely to free-form generation.

This improves:

- reproducibility
- budget control
- city consistency
- lower hallucination risk

## 7.5 Optional semantic retrieval

After `tbl_lifestyle_intelligence` is populated, semantic search can improve matching for moods like:

- peaceful honeymoon
- family-friendly
- adventure-packed
- low-budget cultural tour

But this is phase 2, not phase 1.

## 7.6 Two-stage enrichment method for the intelligence table

This is the recommended method for `tbl_lifestyle_intelligence`:

### Method 1. Deterministic preprocessing

Use backend code to:

- clean rows
- normalize cities
- remove noise entries
- assemble `combined_text_content`

### Method 2. Embedding generation

Use the embeddings API to create vector representations for each cleaned attraction text.

### Method 3. Optional structured tag extraction

Use a small LLM call with structured outputs to extract stable labels such as:

- attraction themes
- persona tags
- keywords
- explainable attraction-profile scores

This should remain optional because embeddings are the main requirement for semantic retrieval.

### Method 4. Runtime scoring

When a user asks a query:

- embed the user request
- compare it with stored attraction embeddings
- calculate semantic similarity
- merge that score with budget, route, hotel, and transport logic
- compute the final ranking in the planner service

This is better than storing fixed `semantic_similarity_score` values in the table, because those values change for every new prompt.

## 8. Dataset Usage

## 8.1 Dataset roles

| Dataset / table | Role in AI system | Use now? |
| --- | --- | --- |
| `destinations` | Canonical city layer | Yes |
| `tbl_lifestyle` | Main activity retrieval corpus | Yes |
| `hotels` | Accommodation retrieval corpus | Yes |
| `transport_gigs` | Transport retrieval corpus | Yes |
| `reviews` | Small ranking boost and future quality signal | Limited |
| `orders`, `order_items` | Weak popularity signal | Limited |
| `budget_plans`, `budget_items` | Weak budget priors | Limited |
| `tbl_lifestyle_intelligence` | Future embedding / persona store | Not yet |
| `users` | Session ownership and future personalization | Limited |

## 8.2 Required data preprocessing

Before production AI use, create a cleaned AI-ready view or table:

- filter `tbl_lifestyle` to Sri Lanka-relevant rows only
- normalize city names into one canonical format
- attach destination IDs or canonical city keys
- normalize price fields and missing currency fields
- remove inactive or deleted rows
- create consistent category tags

## 8.3 Recommended derived tables / views

### `ai_location_aliases`

Purpose:

- map `Ella`, `ella`, `Nuwara Eliya`, `Nuwaraeliya`, `BIA`, `Bandaranaike International Airport` and similar aliases into canonical values

### `ai_lifestyle_clean`

Purpose:

- store only Sri Lanka-ready activity rows
- attach canonical city, category, and searchable combined text
- act as the clean source for backfilling `tbl_lifestyle_intelligence`

### `ai_hotel_clean`

Purpose:

- normalize hotel city names and useful price/quality fields

### `ai_transport_clean`

Purpose:

- normalize route endpoints and capacity categories

### `ai_itinerary_*` tables

Recommended new persistence layer:

- `ai_trip_sessions`
- `ai_trip_preferences`
- `ai_itineraries`
- `ai_itinerary_days`
- `ai_itinerary_items`

### `ai_trip_candidate_scores`

Recommended runtime table:

- stores query/session-level ranking outputs
- keeps dynamic scores out of `tbl_lifestyle_intelligence`
- makes debugging and validation easier

## 8.4 Static enrichment vs runtime scoring

This distinction is important for the whole AI design.

### Static fields that should be stored once per attraction

- cleaned text
- embedding vector
- attraction-profile theme scores
- persona tags
- extracted keywords
- canonical categories

### Runtime fields that should be recalculated per user prompt

- semantic similarity to the current prompt
- persona match to the current traveler
- final blended ranking score
- matched interests for the current conversation

### Sensitive or risky fields

The current table includes demographic-style fields such as:

- `male_score`
- `female_score`
- age-group scores
- income-group scores

Best option for MVP:

- do not use these fields in ranking
- keep them unused unless the team has a strong, explainable requirement and faculty approval

This keeps the first version simpler, safer, and easier to justify.

## 9. Proposed Backend Design

## 9.1 New server modules

Create a new module:

- `server/ai-trip-planner/`

Recommended structure:

- `controllers/aiPlannerController.js`
- `routes/aiPlannerRoutes.js`
- `services/aiConversationService.js`
- `services/aiRetrievalService.js`
- `services/itineraryBuilderService.js`
- `services/budgetEstimatorService.js`
- `services/promptTemplates.js`
- `utils/cityNormalizer.js`
- `utils/scoring.js`
- `utils/validation.js`

## 9.2 Core backend functions

### `extractTripRequirements(prompt, conversationHistory)`

Returns structured requirement fields.

### `generateFollowUpQuestions(missingFields)`

Asks only the missing high-value questions.

### `retrieveCandidates(requirements)`

Returns candidate destinations, activities, hotels, and transport.

### `rankCandidates(requirements, candidates)`

Applies weighted scoring.

### `buildItinerary(requirements, rankedCandidates)`

Creates the actual day-by-day plan.

### `generateNaturalLanguagePlan(itinerary)`

Turns the structured plan into the user response.

## 10. Proposed Frontend Design

## 10.1 Chat experience

Upgrade the existing chatbot from disabled placeholder to a real planner with:

- chat input
- streaming answers
- follow-up chips
- trip summary panel
- itinerary timeline card
- hotel and transport recommendation cards
- save itinerary button

## 10.2 User flow

1. User opens chatbot
2. User sends a vague prompt
3. AI asks clarifying questions
4. User answers
5. AI returns itinerary
6. User can:
   - save itinerary
   - add hotel to cart
   - view transport options
   - create a budget plan from itinerary

## 11. Validation Plan

## 11.1 Offline validation

Create an evaluation set of at least 100 prompts across:

- 1 day, 3 day, 5 day, 7 day travel lengths
- solo, couple, family, friend group
- budget, mid-range, luxury
- culture, beach, wildlife, adventure, mixed mood
- airport arrival, Kandy start, Galle start, etc.

## 11.2 Automatic validation rules

Every generated itinerary should pass:

- all recommended cities exist in canonical destination mapping
- all activity IDs exist in DB
- all hotel IDs exist in DB
- all transport IDs exist in DB
- transport capacity is enough for traveler count
- no foreign-city activities appear in Sri Lanka plans
- no duplicate major attraction blocks in the same itinerary unless explicitly requested
- total cost stays within allowed budget band
- overnight city has a matching hotel option if hotel stay is requested

## 11.3 Human validation

Each team member reviews a subset of generated itineraries for:

- realism
- attractiveness
- budget suitability
- route feasibility
- Sri Lanka relevance

## 11.4 Key metrics

Use these metrics in the report:

- Slot completion rate
- Grounded recommendation rate
- Invalid recommendation rate
- Budget-fit accuracy
- Travel-feasibility pass rate
- Human relevance score
- User acceptance / save rate

## 12. System Impact

## 12.1 Positive product impact

- transforms the chatbot from a cosmetic feature into a real planning assistant
- increases cross-module usage:
  - destinations
  - lifestyles
  - hotels
  - transport
  - budget planner
- improves discoverability of database content
- creates a more guided experience for first-time tourists

## 12.2 Technical impact

- adds a new AI orchestration layer to the backend
- requires a cleaned retrieval dataset
- requires logging and evaluation support
- may require caching and background enrichment jobs

## 12.3 Risks

- hallucinated recommendations if tool usage is weak
- irrelevant results if Sri Lanka filtering is not enforced
- poor route quality if city normalization is incomplete
- inflated costs if the largest model is always used

## 13. Six-Member Team Partition

Split the work by independent workstreams, not by random feature chunks.

| Member | Ownership | Main deliverables |
| --- | --- | --- |
| Member 1 | Data engineering lead | `ai_location_aliases`, `ai_lifestyle_clean`, city normalization rules, Sri Lanka filtering, noise-row filtering, audit scripts |
| Member 2 | Intelligence pipeline lead | `combined_text_content` builder, OpenAI embedding backfill job, upsert logic for `tbl_lifestyle_intelligence`, retry/error logs, semantic retrieval benchmark |
| Member 3 | Planning engine lead | candidate merge logic, scoring formula, route feasibility rules, day allocation engine, budget estimation logic, runtime score calculation |
| Member 4 | AI orchestration lead | OpenAI chat integration, tool/function schemas, follow-up question prompts, session state APIs, structured-output extraction for optional tags |
| Member 5 | Frontend AI UX lead | real chatbot UI, question-answer flow, itinerary timeline, recommendation cards, loading/streaming states, save itinerary UX |
| Member 6 | Evaluation and documentation lead | eval dataset, acceptance criteria, test matrix, offline benchmark runs, assignment write-up, architecture diagrams, demo walkthrough |

## 13.1 Responsibility details

### Member 1: Data engineering lead

- defines the canonical city dictionary
- decides which `tbl_lifestyle` rows are valid attractions
- prepares the cleaned source dataset for AI
- hands a stable cleaned table/view to Member 2 and Member 3

### Member 2: Intelligence pipeline lead

- designs the exact `combined_text_content` format
- chooses chunk size for embedding requests
- fills `tbl_lifestyle_intelligence` static fields
- validates embedding coverage and missing-row retries

### Member 3: Planning engine lead

- owns the ranking formula
- owns runtime `semantic_similarity_score` usage
- owns `combined_final_score` calculation
- ensures the itinerary is feasible, not just semantically relevant

### Member 4: AI orchestration lead

- owns conversation logic
- decides when the model should ask more questions
- integrates function calling and structured outputs
- turns planner JSON into final user-facing explanations

### Member 5: Frontend AI UX lead

- replaces the disabled chatbot placeholder
- implements a trustworthy trip-planning flow
- displays itinerary, hotels, transport, and budget clearly
- handles retries and partial-progress UI

### Member 6: Evaluation and documentation lead

- creates gold prompts and expected behaviors
- tracks retrieval precision and itinerary quality
- prepares the assignment wording for methods, validation, and impact
- keeps the final architecture consistent with what was actually built

## 13.2 Recommended dependency order

1. Member 1 prepares the clean data layer.
2. Member 2 backfills static intelligence data from the clean layer.
3. Member 3 defines runtime planner rules against the clean data and embeddings.
4. Member 4 connects the LLM and tool flow.
5. Member 5 connects the UI to the AI APIs.
6. Member 6 validates every phase and prepares the report.

## 14. Implementation Phases

## Phase 1. Data readiness

- create canonical city alias map
- create AI-clean views/tables
- filter non-Sri-Lanka `tbl_lifestyle` rows
- filter non-attraction noise rows from Sri Lanka city groups
- standardize route names
- add DB audit script

## Phase 2. Intelligence backfill

- finalize `combined_text_content` format
- populate `tbl_lifestyle_intelligence` static fields
- use `text-embedding-3-small` for the first full backfill
- benchmark semantic retrieval on a labeled prompt set
- keep query-dependent ranking fields out of permanent storage

## Phase 3. MVP planner

- implement AI planner backend
- implement structured follow-up question flow
- implement SQL retrieval
- implement embedding-assisted candidate retrieval
- implement deterministic itinerary builder
- return day-wise itinerary JSON

## Phase 4. Frontend integration

- connect chatbot UI
- show itinerary cards
- add save itinerary action
- add hotel and transport CTA links

## Phase 5. Evaluation and tuning

- build prompt set
- run offline evals
- tune weights and prompts
- tune whether `text-embedding-3-large` is worth the extra cost
- optionally add structured tag extraction

## Phase 6. Advanced personalization

- populate `tbl_lifestyle_intelligence` or a replacement AI feature store
- log accepted itineraries
- add review-based ranking improvements
- consider fine-tuning only after enough interaction data exists

## 15. Recommended MVP Scope

If the team has limited time, the MVP should do only this:

1. User enters a travel prompt.
2. AI asks up to 5 follow-up questions.
3. Backend retrieves grounded activities, hotels, and transport from DB.
4. Planner creates a 1 to 5 day itinerary.
5. UI shows the itinerary and booking suggestions.

This is enough to demonstrate:

- real AI interaction
- real database grounding
- clear AIML methodology
- measurable validation

## 16. What To Say In The Assignment

You can summarize the AIML solution like this:

> We implemented a hybrid AI trip planner for Sri Lanka. Instead of training a model from scratch, we used a large language model for conversational requirement gathering and natural-language explanation, combined with retrieval from our project database and a deterministic itinerary generation engine. This approach was chosen because our database already contains rich tourism inventory data, but our historical user interaction data is still too small for supervised model training. We used structured follow-up questioning, retrieval-augmented generation, rule-based ranking, and validation checks to ensure that itineraries stay grounded, feasible, and relevant to Sri Lanka.

## 17. Final Decision

The best solution for this project is:

- **not** full custom model training first
- **not** pure RAG chatbot only
- **yes** to populating `tbl_lifestyle_intelligence`, but only as a cleaned static enrichment store
- **yes** to a **hybrid LLM + DB retrieval + deterministic itinerary planner**

That gives the team:

- the best chance of finishing on time
- the strongest assignment explanation
- the lowest hallucination risk
- the clearest path to future improvements
