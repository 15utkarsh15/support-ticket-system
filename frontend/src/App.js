import React, { useState, useCallback } from "react";
import TicketForm from "./components/TicketForm";
import TicketList from "./components/TicketList";
import StatsPanel from "./components/StatsPanel";
import "./styles.css";

export default function App() {
  const [view, setView] = useState("list");
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  return (
    <div className="shell">
      <header className="topbar">
        <span className="topbar-brand">Tickets</span>
        <nav className="topbar-nav">
          <button
            className={view === "list" ? "nav-link active" : "nav-link"}
            onClick={() => setView("list")}
          >
            All Tickets
          </button>
          <button
            className={view === "new" ? "nav-link active" : "nav-link"}
            onClick={() => setView("new")}
          >
            New Ticket
          </button>
          <button
            className={view === "stats" ? "nav-link active" : "nav-link"}
            onClick={() => setView("stats")}
          >
            Dashboard
          </button>
        </nav>
      </header>

      <main className="content">
        {view === "list" && <TicketList key={tick} />}
        {view === "new" && (
          <TicketForm
            onSubmitted={() => {
              refresh();
              setView("list");
            }}
          />
        )}
        {view === "stats" && <StatsPanel refreshKey={tick} />}
      </main>
    </div>
  );
}
