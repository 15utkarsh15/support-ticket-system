import React, { useState, useEffect, useRef } from "react";
import { createTicket, classifyDescription } from "../api";

export default function TicketForm({ onSubmitted }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [classifyNote, setClassifyNote] = useState("");
  const timerRef = useRef(null);

  // Debounced classify on description change
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (desc.trim().length < 12) {
      setClassifyNote("");
      return;
    }

    timerRef.current = setTimeout(() => {
      setClassifying(true);
      setClassifyNote("");

      classifyDescription(desc.trim())
        .then((res) => {
          setCategory(res.suggested_category);
          setPriority(res.suggested_priority);
          setClassifyNote("Auto-suggested — feel free to change.");
        })
        .catch(() => {
          setClassifyNote("Couldn't auto-classify. Pick manually.");
        })
        .finally(() => setClassifying(false));
    }, 800);

    return () => clearTimeout(timerRef.current);
  }, [desc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    setSaving(true);
    try {
      await createTicket({
        title: title.trim(),
        description: desc.trim(),
        category,
        priority,
      });
      onSubmitted();
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>New Ticket</h2>

      <div className="field">
        <label htmlFor="f-title">Title</label>
        <input
          id="f-title"
          type="text"
          maxLength={200}
          placeholder="Short summary of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <div className="char-counter">{title.length}/200</div>
      </div>

      <div className="field">
        <label htmlFor="f-desc">Description</label>
        <textarea
          id="f-desc"
          placeholder="Explain what's happening. The more detail, the better the auto-classification."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        {classifying && (
          <div className="field-hint is-loading">Classifying...</div>
        )}
        {!classifying && classifyNote && (
          <div
            className={`field-hint ${
              classifyNote.includes("Couldn't") ? "is-error" : ""
            }`}
          >
            {classifyNote}
          </div>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="f-cat">Category</label>
          <select
            id="f-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-pri">Priority</label>
          <select
            id="f-pri"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
