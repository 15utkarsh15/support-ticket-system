import React, { useState, useEffect, useCallback } from "react";
import { getTickets, patchTicket } from "../api";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    priority: "",
    status: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTickets(filters);
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const changeStatus = async (id, status) => {
    try {
      await patchTicket(id, { status });
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fmtDate = (iso) => {
    const d = new Date(iso);
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const time = d.toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${month} ${day}, ${time}`;
  };

  return (
    <div>
      <div className="filters-bar">
        <input
          type="text"
          placeholder="Search tickets..."
          value={filters.search}
          onChange={(e) => setFilter("search", e.target.value)}
        />
        <select
          value={filters.category}
          onChange={(e) => setFilter("category", e.target.value)}
        >
          <option value="">All categories</option>
          <option value="billing">Billing</option>
          <option value="technical">Technical</option>
          <option value="account">Account</option>
          <option value="general">General</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilter("priority", e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilter("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loader-text">Loading...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-msg">
          {Object.values(filters).some(Boolean)
            ? "No tickets match these filters."
            : "No tickets yet. Create one to get started."}
        </div>
      ) : (
        tickets.map((t) => (
          <div className="ticket-row" key={t.id}>
            <div className="ticket-top">
              <span className="ticket-title">{t.title}</span>
              <div className="tags">
                <span className="tag tag-cat">{t.category}</span>
                <span className={`tag tag-${t.priority}`}>{t.priority}</span>
              </div>
            </div>
            <p className="ticket-desc">{t.description}</p>
            <div className="ticket-bottom">
              <span className="ticket-time">{fmtDate(t.created_at)}</span>
              <select
                className="status-picker"
                value={t.status}
                onChange={(e) => changeStatus(t.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
