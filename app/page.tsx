import JokeScreen from "@/components/JokeScreen";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <JokeScreen />
    </main>
  );
}
