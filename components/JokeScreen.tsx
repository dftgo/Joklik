"use client";

import { useRef, useState, type FormEvent } from "react";
import styles from "./JokeScreen.module.css";

const MAX_TOPIC_LENGTH = 100;
const CLIENT_TIMEOUT_MS = 30_000;

type Status = "idle" | "loading" | "success" | "error";

export default function JokeScreen() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [joke, setJoke] = useState("");
  // Guards against double submits before React re-renders the disabled button.
  const inFlight = useRef(false);

  const isLoading = status === "loading";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setStatus("loading");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/joke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
        signal: controller.signal,
      });
      const data: unknown = await res.json().catch(() => null);
      const text = (data as { joke?: unknown } | null)?.joke;

      if (res.ok && typeof text === "string" && text.trim() !== "") {
        setJoke(text);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      // Network failure or client timeout.
      setStatus("error");
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
    }
  }

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>מחולל בדיחות AI</h1>
        <p className={styles.subtitle}>
          <span aria-hidden="true">🐾</span> הכנס נושא וקבל בדיחה מצחיקה
        </p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="topic" className={styles.visuallyHidden}>
            נושא לבדיחה
          </label>
          <div className={styles.inputWrap}>
            <span className={styles.inputIcon} aria-hidden="true">
              🐾
            </span>
            <input
              id="topic"
              type="text"
              className={styles.input}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={MAX_TOPIC_LENGTH}
              placeholder="הכנס נושא (אופציונלי)"
              dir="rtl"
              autoComplete="off"
              enterKeyHint="send"
              disabled={isLoading}
              aria-describedby="topic-counter topic-help"
            />
            <span id="topic-counter" className={styles.counter}>
              <span dir="ltr">
                {topic.length}/{MAX_TOPIC_LENGTH}
              </span>
            </span>
          </div>
          <p id="topic-help" className={styles.help}>
            אם לא יוזן נושא, תיווצר בדיחה כללית
          </p>
        </div>

        <button
          type="submit"
          className={`${styles.primaryButton} ${isLoading ? styles.loading : ""}`}
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" /> מכין לך
              בדיחה...
            </>
          ) : (
            <>
              <span aria-hidden="true">✨</span> צור בדיחה
            </>
          )}
        </button>
      </form>

      {status === "success" && (
        <section className={styles.card} aria-labelledby="joke-title">
          <h2 id="joke-title" className={styles.cardTitle}>
            הבדיחה שלך
          </h2>
          <p className={styles.jokeText}>{joke}</p>
        </section>
      )}

      {/* Temporary minimal error; replaced by the full error card in Milestone 3. */}
      {status === "error" && <p className={styles.errorText}>משהו השתבש</p>}
    </div>
  );
}
