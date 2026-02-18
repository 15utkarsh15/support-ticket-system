# Support Ticket System

Full-stack support ticket manager with LLM-powered auto-classification. Built with Django, React, and PostgreSQL.

## Quick Start

```bash
# 1. Clone and add your API key
cp .env.example .env
# Edit .env → set OPENAI_API_KEY=sk-...

# 2. Run everything
docker-compose up --build

# 3. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/tickets/
```

Migrations run automatically on startup. The app is fully functional without an API key — the LLM auto-classify feature just won't work.

## LLM Choice

I used **OpenAI GPT-3.5 Turbo** for ticket classification. Reasons:

- **Speed**: Sub-second responses, which matters because classification runs while the user is still on the form. GPT-4 would add noticeable latency for no real benefit here — the task is straightforward categorization.
- **Reliability**: With `temperature=0.1` and a tightly constrained prompt, it returns valid JSON consistently. I validate the output server-side anyway.
- **Cost**: Fractions of a cent per classification. Doesn't matter for a demo but it's good practice to not over-provision.

The prompt explicitly lists what each category/priority means with concrete examples, which helps the model make consistent decisions. I ask for JSON-only output and validate the response against allowed values before returning it.

## Architecture

```
├── backend/           Django + DRF
│   ├── tickets/       Models, views, serializers, LLM classifier
│   └── support_project/  Settings, URL config
├── frontend/          React 18
│   └── src/
│       ├── components/  TicketForm, TicketList, StatsPanel
│       └── api.js       Centralized API client
└── docker-compose.yml
```

## Design Decisions

- **DB-level constraints**: All choices (category, priority, status) are enforced via Django's model field choices, which translate to CHECK constraints in PostgreSQL. `max_length` and `NOT NULL` are also DB-enforced.
- **Stats aggregation**: The `/api/tickets/stats/` endpoint uses `aggregate()` and `annotate()` exclusively — no Python loops over querysets.
- **Graceful LLM fallback**: If the OpenAI call fails (bad key, timeout, malformed response), the classify endpoint returns 503 and the frontend lets the user pick category/priority manually. Ticket creation never depends on the LLM.
- **Debounced classification**: The frontend waits 800ms after the user stops typing before hitting the classify endpoint, avoiding excessive API calls.
- **Search**: Uses `icontains` on both title and description via `Q` objects, combined with OR logic.

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tickets/` | Create ticket (returns 201) |
| `GET` | `/api/tickets/` | List tickets, newest first. Filters: `?category=`, `?priority=`, `?status=`, `?search=` |
| `PATCH` | `/api/tickets/<id>/` | Update ticket fields |
| `GET` | `/api/tickets/stats/` | Aggregated statistics |
| `POST` | `/api/tickets/classify/` | LLM auto-classification |
