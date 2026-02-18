import json
import logging

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

CLASSIFY_PROMPT = """You are a support ticket classifier. Given a customer's issue description, determine the appropriate category and priority.

CATEGORIES (pick exactly one):
- billing: charges, invoices, payments, refunds, subscription issues, pricing questions
- technical: bugs, errors, crashes, slow performance, features not working, integration problems
- account: login issues, password resets, profile updates, permissions, account access
- general: feedback, feature requests, how-to questions, anything that doesn't clearly fit above

PRIORITY (pick exactly one):
- critical: total outage, data loss risk, security vulnerability, complete inability to use product
- high: major feature broken, blocking issue with no workaround, time-sensitive business impact
- medium: partial breakage with workaround available, moderate disruption
- low: cosmetic issue, general question, minor inconvenience, feature request

Return ONLY a JSON object, no markdown, no explanation:
{"category": "...", "priority": "..."}"""


VALID_CATEGORIES = {"billing", "technical", "account", "general"}
VALID_PRIORITIES = {"low", "medium", "high", "critical"}


def classify_ticket(description):
    """
    Sends the description to OpenAI and returns suggested category + priority.
    Raises ValueError for bad config or unparseable response.
    Raises ConnectionError for API failures.
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key or api_key.startswith("your-"):
        raise ValueError("OpenAI API key not configured")

    client = OpenAI(api_key=api_key)

    try:
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": CLASSIFY_PROMPT},
                {"role": "user", "content": description},
            ],
            temperature=0.1,
            max_tokens=50,
        )
    except Exception as e:
        logger.error("OpenAI API error: %s", e)
        raise ConnectionError(f"LLM unavailable: {e}") from e

    raw = resp.choices[0].message.content.strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        logger.error("LLM returned non-JSON: %s", raw)
        raise ValueError("Could not parse LLM response")

    category = data.get("category", "").lower().strip()
    priority = data.get("priority", "").lower().strip()

    if category not in VALID_CATEGORIES or priority not in VALID_PRIORITIES:
        logger.error("LLM returned invalid values: %s / %s", category, priority)
        raise ValueError("LLM returned invalid classification")

    return {
        "suggested_category": category,
        "suggested_priority": priority,
    }
