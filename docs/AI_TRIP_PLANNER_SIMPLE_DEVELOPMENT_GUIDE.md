# TravelLanka AI Trip Planner Simple Development Guide

## 0. Current Implementation Status

The phase-1 MVP is now implemented in the project as a real working AI pipeline.

Completed parts:

- cleaned attraction dataset pipeline in `ai-model-development/`
- embedding backfill into `tbl_lifestyle_intelligence`
- server-side AI planner in `server/ai-trip-planner-management/`
- chatbot integration in `client/src/components/shared/ChatBot.jsx`

Current runtime flow:

1. user types a trip request
2. `gpt-5-mini` extracts missing fields into structured planner state
3. the system asks follow-up questions if key fields are missing
4. the backend creates an embedding for the trip request
5. the planner retrieves and ranks matching attractions from `ai_lifestyle_clean` and `tbl_lifestyle_intelligence`
6. deterministic logic builds the day-by-day itinerary
7. `gpt-5-mini` turns the grounded plan into a natural response

Current API endpoints:

- `POST /api/ai-trip-planner/message`
- `GET /api/ai-trip-planner/health`

## 1. Executive Summary

This system should be built as a **hybrid AI application**, not as a custom-trained model in phase 1.

Best real-world approach:

1. run the app, database, and scripts on the **local PC**
2. clean and normalize the Sri Lanka attraction data
3. generate embeddings for the cleaned attraction rows
4. build a grounded retrieval layer
5. build a deterministic itinerary planner
6. use an LLM for conversation, requirement extraction, and final explanation
7. evaluate the system before thinking about fine-tuning

This is the best option because the current project already has useful tourism inventory data, but it does **not** yet have enough high-quality supervised training data for a proper custom itinerary model.

## 2. Final Answer to “What AI Are We Using?”

If someone asks what AI we used, the short answer is:

> We used a hybrid LLM-based trip planning architecture. The system uses a language model for conversational interaction, follow-up questioning, structured information extraction, and natural-language itinerary explanation. It uses OpenAI embeddings for semantic retrieval over our cleaned attraction dataset. It uses deterministic backend planning logic for route selection, budget checks, and itinerary construction. We did not train a custom model in phase 1 because our available historical data is too small and too noisy for reliable supervised model training.

## 3. Models We Use

## 3.1 Primary runtime model

### `gpt-5-mini`

Use for:

- chat conversation
- follow-up questions
- requirement extraction
- tool/function calling
- final itinerary explanation

Why:

- cheaper than flagship models
- strong enough for structured, well-defined planning flows
- good fit for a production system that calls backend tools

## 3.2 Fallback planning model

### `gpt-5.2`

Use only when:

- the itinerary is complex
- the user has many constraints
- route tradeoffs are difficult
- the response needs stronger reasoning quality

Why:

- better for complex multi-step planning
- more expensive, so it should not be the default for every request

## 3.3 Embedding model

### `text-embedding-3-small`

Use for:

- attraction embeddings
- semantic retrieval
- similarity search between user prompt and attraction text

Why:

- lower cost
- good enough for the first retrieval system
- practical for rerunning the embedding job when the DB changes

## 3.4 Optional embedding upgrade

### `text-embedding-3-large`

Use only if:

- offline evaluation shows that retrieval quality is clearly better
- the team is satisfied the accuracy gain is worth the extra cost

## 3.5 Model we may use later for fine-tuning

If the project later reaches the fine-tuning stage, use a model family that actually supports fine-tuning on the OpenAI platform.

For now:

- do **not** assume GPT-5 mini or GPT-5.2 will be fine-tuned
- treat fine-tuning as a future optimization step, not the first build step

## 4. How Each Model Is Used in the System

| Component | Model / method | What it does |
| --- | --- | --- |
| Conversation layer | `gpt-5-mini` | drives the trip conversation and asks missing questions |
| Requirement extraction | `gpt-5-mini` + structured outputs | converts free text into fields like days, budget, mood, and traveler count |
| Retrieval layer | `text-embedding-3-small` + SQL ranking | finds semantically relevant attractions from cleaned data |
| Planner layer | deterministic backend logic | builds the actual route, day plan, city choice, hotel match, and transport suggestions |
| Final explanation layer | `gpt-5-mini` | explains the grounded itinerary in natural language |
| Evaluation layer | prompt tests + human review + metrics | checks if the system is useful, grounded, and feasible |

## 5. Methods We Are Using

## 5.1 Conversational slot filling

The AI asks for missing fields before it plans.

Example fields:

- travel duration
- start city
- budget
- traveler count
- travel mood
- hotel need
- transport need

## 5.2 Structured outputs

We use structured outputs so the model returns clean machine-readable data instead of random free text.

Use cases:

- extracting trip requirements
- optional tag extraction for attractions
- response schemas for the planner

## 5.3 Tool / function calling

The model should not invent data from memory.

Instead, it should call backend functions such as:

- `extractTripRequirements`
- `createEmbedding`
- `rankActivities`
- `matchHotels`
- `matchTransport`
- `buildItinerary`

In the current implementation, these are handled inside the server planner service even though they are not yet exposed as separate public APIs.

## 5.4 Retrieval-Augmented Generation (RAG)

Yes, we are using **RAG**, but in a **database-grounded** form.

That means:

- the user prompt is turned into an embedding
- the system retrieves relevant attractions from the cleaned attraction dataset
- the LLM writes the answer using those retrieved results

This is not open-web RAG.  
This is **private data RAG over our own system database**.

## 5.5 Embedding-based retrieval

We use embeddings to improve relevance for prompts like:

- `I want a relaxing 3-day trip`
- `family trip with beach and culture`
- `budget wildlife plan from Colombo`

The embedding layer helps find relevant attractions even when the user prompt does not exactly match the words stored in the database.

## 5.6 Deterministic planning logic

The actual itinerary should not be generated only by an LLM.

The backend must decide:

- which cities are feasible
- which attractions fit the trip
- which hotels match the city
- which transport options match the route and group size
- whether the plan stays inside budget

This is why the planner engine is rule-based and score-based.

## 5.7 Evaluation-driven development

Before training anything, we validate the planner with:

- test prompts
- human review
- grounding checks
- budget checks
- route feasibility checks

## 6. Methods We Are **Not** Using Initially

## 6.1 Full custom model training

We are not training a deep learning itinerary model from scratch in phase 1.

Why not:

- not enough high-quality labeled itinerary data
- current data contains noise
- custom training would be harder to explain and maintain
- retrieved inventory changes over time, so grounding matters more

## 6.2 End-to-end neural recommender

We are not building a recommender purely from reviews/orders because:

- reviews are too few
- orders are too few
- user-history signals are too weak

## 6.3 Pure prompt-only chatbot

We are also **not** building a chatbot that only uses prompting with no retrieval and no planner logic.

That approach is weak for:

- factual grounding
- route feasibility
- budget control
- reproducibility

## 6.4 Fine-tuning in phase 1

We are not starting with fine-tuning.

Fine-tuning may be considered later only if:

- we collect enough real user prompts
- we store accepted or corrected itineraries
- we define a stable output format
- we build a proper evaluation dataset

## 7. Real-World Production Architecture

The system should work like this:

1. User enters a trip prompt.
2. LLM extracts what is already known.
3. LLM asks for missing important details.
4. Backend retrieves grounded candidates from:
   - destinations
   - cleaned lifestyle data
   - hotels
   - transport
5. Embedding similarity ranks attraction candidates.
6. Planner engine builds a feasible multi-day itinerary.
7. LLM explains the final itinerary in natural language.
8. UI shows hotels, transport, and budget summary.

This is the correct production pattern because the LLM is used where it is strongest:

- conversation
- interpretation
- explanation

And the backend is used where it is strongest:

- retrieval
- validation
- scoring
- planning

## 8. Do We Need Training Right Now?

## 8.1 Phase 1 answer

No.

What we need now is:

- prompting
- structured outputs
- embeddings
- retrieval
- planner logic
- evaluation

## 8.2 What “training” actually means here

There are two different ideas people often confuse:

### A. Embedding generation

This is **not** model training.

We send cleaned attraction text to the embeddings API and store the returned vectors.

### B. Fine-tuning

This **is** a training-like optimization step, but it is not needed in phase 1.

If we ever do it:

- dataset preparation is done by us
- job execution happens on the OpenAI platform
- not on the local PC GPU

## 9. Where to Run the Development

## 9.1 Local PC

This is the **main environment**.

Use the local PC for:

- backend server
- frontend client
- MySQL database
- cleanup scripts
- embedding backfill scripts
- planner development

## 9.2 Google Colab

Use only for optional experiments such as:

- notebook-based data exploration
- prototype evaluation
- clustering / visualization

Colab is not the main build environment for this project.

## 9.3 OpenAI platform

Use for:

- chat requests
- embeddings
- structured outputs
- tool-calling orchestration
- evals
- future fine-tuning if ever needed

## 10. Recommended Development Order

## Step 1. Clean the data

Create `ai_lifestyle_clean`.

Keep only:

- Sri Lanka-relevant rows
- active rows
- true attractions / activities

Remove:

- visa rows
- test rows
- ticket/service rows
- obvious noise rows

## Step 2. Build clean retrieval text

Create `combined_text_content` using:

- name
- city
- attraction type
- description
- selling points
- categories
- address
- price

## Step 3. Populate `tbl_lifestyle_intelligence`

Store static enrichment only:

- cleaned text
- embedding
- embedding model
- embedding timestamp
- optional tags and stable attraction-profile scores

Do **not** store prompt-specific similarity scores permanently.

## Step 4. Build semantic retrieval

At runtime:

1. embed the user query
2. compare it with stored attraction embeddings
3. return the top candidate attractions

## Step 5. Build the planner engine

The planner must:

- choose destination cities
- choose attractions
- choose hotels
- choose transport
- estimate cost
- build the day plan

## Step 6. Build the conversation layer

The LLM should:

- ask follow-up questions
- extract missing requirements
- call tools
- explain the final result

## Step 7. Evaluate the system

Measure:

- grounding quality
- relevance
- itinerary feasibility
- budget fit
- hotel/transport correctness

## 11. What to Say If They Ask “Why This Method?”

Use this answer:

> We selected a hybrid AI architecture because it is the most reliable method for the current state of our data. The language model is used for conversational interaction, structured extraction, and explanation. Embeddings are used for semantic retrieval over our cleaned attraction dataset. Deterministic planner logic is used for itinerary generation, budget checks, and route feasibility. We did not start with custom model training because our historical user interaction data is currently too limited for a robust supervised training pipeline.

## 12. What to Say If They Ask “Why Not Train a Model?”

Use this answer:

> In a real-world AI product, training is not always the best first step. Our inventory data changes over time, and the current project has limited review, order, and itinerary-label data. Because of that, grounding, retrieval, and planning logic deliver better quality and lower risk than custom model training in the first version. Training can be considered later after collecting real prompts, accepted plans, and evaluation data.

## 13. One-Line Final Recommendation

Build the system as a **hybrid production AI pipeline**: use `gpt-5-mini` for conversation, `text-embedding-3-small` for retrieval, backend planning logic for itinerary generation, run the build on the **local PC**, treat **Colab as optional**, and postpone **fine-tuning/training** until the system is already working and evaluated.
