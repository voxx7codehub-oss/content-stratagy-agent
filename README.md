# Content Intelligence

> **“Your content history. Your brand memory. Your next strategy.”**

Enterprise AI Content Strategy Agent powered by **Hindsight persistent organizational memory**.

---

## 1. Overview & Architecture

Content Intelligence bridges the gap between historical editorial publishing and future content strategy. Rather than treating an AI strategist as an ephemeral conversational chatbot with zero memory, Content Intelligence integrates directly with **Vectorize Hindsight** to build a continuous, graph-backed organizational memory bank.

```
[ User / Marketer ]
         │
         ▼
[ Enterprise React SPA ]
         │
         ▼
[ Express API Router ]
   ├── [ SQLite Database ] (Local content records, metrics, campaigns, gaps)
   └── [ Hindsight Memory Service ]
            ├── RETAIN (Extracts entities, metrics, tone into memory bank)
            ├── RECALL (TEMPR multi-strategy search across past signals)
            └── REFLECT (Reasons over accumulated historical evidence)
                    │
                    ▼
          [ AI Strategy Engine ] (Groq / Gemini reasoning model)
                    │
                    ▼
     [ Evidence-Backed Strategy Report ]
```

---

## 2. Core Capabilities

*   **Hindsight Persistent Memory**: Every article, video, case study, and post retained into memory bank `content-strategy`.
*   **Zero-Hallucination Grounding**: Strategic recommendations must cite specific recalled historical memories, dates, and engagement differentials.
*   **Content Gap Discovery**: Algorithmic comparison of coverage volume versus performance metrics to highlight unmet demand (e.g. Case Studies and Code Tutorials).
*   **Topic Intelligence & Graph**: Semantic relationships mapped between subject verticals (AI & ML $\rightarrow$ Workflow Automation $\rightarrow$ Data Engineering).
*   **Brand Voice Architecture**: Corpus-derived tone spectrum, syntactic pacing, preferred themes, and prohibited clichés.
*   **Executive Dashboard**: Real-time KPI cards, performance over time, topic engagement benchmarks, format distribution, and platform efficiency.

---

## 3. Environment Variables

Create `.env` using `.env.example`:

```bash
# Port configuration
PORT=3000

# Google Gemini API (Automatically injected in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Groq High-Speed Inference (Configurable model)
GROQ_API_KEY=""
GROQ_MODEL="openai/gpt-oss-120b" # or "qwen/qwen3-32b"

# Hindsight Vectorize Memory Service
HINDSIGHT_BASE_URL="https://api.hindsight.vectorize.io"
HINDSIGHT_API_KEY=""
HINDSIGHT_BANK_ID="content-strategy"

# Database & Environment
DATABASE_URL="./data/content_intelligence.db"
DEMO_MODE="true"
```

*Note: If `HINDSIGHT_API_KEY` is not set, the platform operates in local resilient memory mode, storing all memories and running local TEMPR search over SQLite so features remain 100% operational.*

---

## 4. Quick Start

### Install Dependencies
```bash
npm install
```

### Seed Database
```bash
npm run seed
```

### Start Development Server
```bash
npm run dev
```

Open `http://localhost:3000` to access the full platform.

---

## 5. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & Hindsight connectivity status |
| `GET` | `/api/dashboard` | Aggregated KPIs and top content cohorts |
| `GET` | `/api/content` | Filterable, searchable content library |
| `POST` | `/api/content` | Save content & retain into Hindsight memory |
| `GET` | `/api/content/:id` | Detail content asset and linked memory |
| `PUT` | `/api/content/:id` | Update content item |
| `DELETE` | `/api/content/:id` | Remove content & memory |
| `GET` | `/api/analytics` | Performance timeline, topic & format breakdowns |
| `GET` | `/api/topics` | Thematic knowledge graph and relationship links |
| `GET` | `/api/gaps` | Algorithmic gap analysis with opportunity scores |
| `GET` | `/api/brand-voice` | Corpus-derived brand tone and guidelines |
| `POST` | `/api/strategy` | Run AI Strategist with Hindsight recall & reflect |
| `POST` | `/api/memory/retain` | Ingest raw memory into bank |
| `POST` | `/api/memory/recall` | Search memory bank with query |
| `POST` | `/api/memory/reflect` | Reflective reasoning over memory bank |
| `GET` | `/api/memory/status` | Real-time memory bank status & telemetry |
| `GET` | `/api/memory/activity` | Audit log of memory operations |
| `GET` | `/api/settings` | Current model and bank configurations |
| `POST` | `/api/settings` | Update API keys and models |

---

## 6. Official Hindsight Documentation
*   Documentation: [https://hindsight.vectorize.io/](https://hindsight.vectorize.io/)
*   Repository: [https://github.com/vectorize-io/hindsight](https://github.com/vectorize-io/hindsight)
