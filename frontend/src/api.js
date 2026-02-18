const API_BASE = "/api";

async function request(path, opts = {}) {
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...opts.headers },
    ...opts,
  });

  const body = await resp.json().catch(() => null);

  if (!resp.ok) {
    const err = new Error(body?.detail || `Request failed (${resp.status})`);
    err.status = resp.status;
    throw err;
  }

  return body;
}

export function getTickets(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const qs = params.toString();
  return request(`/tickets/${qs ? `?${qs}` : ""}`);
}

export function createTicket(data) {
  return request("/tickets/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function patchTicket(id, data) {
  return request(`/tickets/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getStats() {
  return request("/tickets/stats/");
}

export function classifyDescription(description) {
  return request("/tickets/classify/", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}
