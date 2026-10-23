"use client";

import { useState } from "react";
import styles from "./JokeScreen.module.css";

const MAX_TOPIC_LENGTH = 100;

export default function JokeScreen() {
  const [topic, setTopic] = useState("");

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <h1 className={styles.title}>מחולל בדיחות AI</h1>
        <p className={styles.subtitle}>
          <span aria-hidden="true">🐾</span> הכנס נושא וקבל בדיחה מצחיקה
        </p>
      </header>

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
            enterKeyHint="done"
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

      {/* No action yet; joke generation is added in Milestone 2. */}
      <button type="button" className={styles.primaryButton}>
        <span aria-hidden="true">✨</span> צור בדיחה
      </button>
    </div>
  );
}
