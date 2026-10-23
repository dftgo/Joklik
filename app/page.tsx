import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import JokeScreen from "@/components/JokeScreen";
import styles from "./page.module.css";

// Illustrations are supplied by the project owner; any missing file is skipped.
function hasIllustration(name: string) {
  return fs.existsSync(path.join(process.cwd(), "public", "illustrations", name));
}

export default function Home() {
  return (
    <main className={styles.main}>
      {hasIllustration("background.webp") && (
        <Image
          src="/illustrations/background.webp"
          alt=""
          fill
          preload
          sizes="(max-width: 480px) 100vw, 480px"
          className={styles.background}
        />
      )}
      <div className={styles.content}>
        <JokeScreen
          hasHero={hasIllustration("hero.webp")}
          hasLoading={hasIllustration("loading.webp")}
          hasError={hasIllustration("error.webp")}
        />
      </div>
    </main>
  );
}
