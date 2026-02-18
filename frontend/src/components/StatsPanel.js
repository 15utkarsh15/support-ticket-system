import React, { useState, useEffect } from "react";
import { getStats } from "../api";

export default function StatsPanel({ refreshKey }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) return <div className="loader-text">Loading stats...</div>;
  if (!stats) return <div className="empty-msg">Could not load statistics.</div>;

  const maxPri = Math.max(...Object.values(stats.priority_breakdown), 1);
  const maxCat = Math.max(...Object.values(stats.category_breakdown), 1);

  return (
    <div className="stats-grid">
      <div className="stat-box">
        <div className="stat-label">Total</div>
        <div className="stat-num">{stats.total_tickets}</div>
      </div>
      <div className="stat-box">
        <div className="stat-label">Open</div>
        <div className="stat-num">{stats.open_tickets}</div>
      </div>
      <div className="stat-box">
        <div className="stat-label">Avg / day</div>
        <div className="stat-num">{stats.avg_tickets_per_day}</div>
      </div>

      <div className="breakdown-box">
        <h3>Priority</h3>
        {Object.entries(stats.priority_breakdown).map(([k, v]) => (
          <div className="bd-row" key={k}>
            <span className="bd-label">{k}</span>
            <div className="bd-bar-wrap">
              <div
                className="bd-bar pri"
                style={{ width: `${(v / maxPri) * 100}%` }}
              />
            </div>
            <span className="bd-count">{v}</span>
          </div>
        ))}
      </div>

      <div className="breakdown-box">
        <h3>Category</h3>
        {Object.entries(stats.category_breakdown).map(([k, v]) => (
          <div className="bd-row" key={k}>
            <span className="bd-label">{k}</span>
            <div className="bd-bar-wrap">
              <div
                className="bd-bar cat"
                style={{ width: `${(v / maxCat) * 100}%` }}
              />
            </div>
            <span className="bd-count">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
