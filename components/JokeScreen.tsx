"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CopyIcon, RetryIcon, ShareIcon } from "./icons";
import styles from "./JokeScreen.module.css";

const MAX_TOPIC_LENGTH = 100;
const CLIENT_TIMEOUT_MS = 30_000;
const COPY_FEEDBACK_MS = 2_000;

type Status = "idle" | "loading" | "success" | "error";
type ErrorKind = "general" | "offline" | "refused" | "rateLimited";
type CopyState = "idle" | "copied" | "failed";

// Texts from PRD section 4.ב.
const ERROR_TEXTS: Record<ErrorKind, { title: string; body: string }> = {
  general: {
    title: "משהו השתבש",
    body: "לא הצלחנו ליצור בדיחה כרגע. נסה שוב בעוד כמה רגעים.",
  },
  offline: {
    title: "אין חיבור לאינטרנט",
    body: "בדוק את החיבור ונסה שוב.",
  },
  refused: {
    title: "לא הצלחנו להצחיק על זה",
    body: "נסה נושא אחר.",
  },
  rateLimited: {
    title: "רגע, לאט לאט...",
    body: "יותר מדי בקשות. נסה שוב בעוד דקה.",
  },
};

const COPY_LABELS: Record<CopyState, string> = {
  idle: "העתק",
  copied: "הועתק!",
  failed: "ההעתקה נכשלה",
};

function classifyHttpError(status: number): ErrorKind {
  if (status === 422) return "refused";
  if (status === 429) return "rateLimited";
  return "general";
}

export default function JokeScreen() {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [joke, setJoke] = useState("");
  const [errorKind, setErrorKind] = useState<ErrorKind>("general");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  // Decided after mount so server and client first render match.
  const [canShare, setCanShare] = useState(false);
  // Guards against double submits before React re-renders the disabled button.
  const inFlight = useRef(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = status === "loading";

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  function resetCopyFeedback() {
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = null;
    setCopyState("idle");
  }

  function fail(kind: ErrorKind) {
    setErrorKind(kind);
    setStatus("error");
  }

  async function requestJoke() {
    if (inFlight.current) return;
    inFlight.current = true;
    resetCopyFeedback();
    setStatus("loading");

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    try {
      const res = await fetch("/api/joke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
        signal: controller.signal,
      });
      if (!res.ok) {
        fail(classifyHttpError(res.status));
        return;
      }
      const data: unknown = await res.json().catch(() => null);
      const text = (data as { joke?: unknown } | null)?.joke;
      if (typeof text === "string" && text.trim() !== "") {
        setJoke(text);
        setStatus("success");
      } else {
        fail("general");
      }
    } catch {
      // Network failure or client timeout.
      fail(!timedOut && navigator.onLine === false ? "offline" : "general");
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    requestJoke();
  }

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(joke);
      ok = true;
    } catch {
      // Clipboard missing or denied.
    }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    setCopyState(ok ? "copied" : "failed");
    copyTimer.current = setTimeout(() => setCopyState("idle"), COPY_FEEDBACK_MS);
  }

  async function handleShare() {
    try {
      await navigator.share({ text: joke });
    } catch {
      // User cancel (AbortError) is not an error; other failures have no
      // defined message in the PRD, and Copy remains available.
    }
  }

  const errorText = ERROR_TEXTS[errorKind];

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

      {/* Always in the DOM so screen readers announce new content. */}
      <div aria-live="polite">
        {status === "success" && (
          <section className={styles.card} aria-labelledby="joke-title">
            <h2 id="joke-title" className={styles.cardTitle}>
              הבדיחה שלך
            </h2>
            <p className={styles.jokeText}>{joke}</p>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleCopy}
              >
                <CopyIcon />
                <span>{COPY_LABELS[copyState]}</span>
              </button>
              {canShare && (
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={handleShare}
                >
                  <ShareIcon />
                  <span>שתף</span>
                </button>
              )}
            </div>
          </section>
        )}

        {status === "error" && (
          <section className={styles.card} aria-labelledby="error-title">
            {/* Illustration slot: error.webp is added in Milestone 4. */}
            <h2 id="error-title" className={styles.cardTitle}>
              {errorText.title}
            </h2>
            <p className={styles.errorBody}>{errorText.body}</p>
            <button
              type="button"
              className={styles.retryButton}
              onClick={requestJoke}
            >
              <RetryIcon />
              <span>נסה שוב</span>
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
