import styles from "./styles.module.css";

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.text}>
        다이나믹 퍼즐을 준비 중입니다.
      </div>
    </div>
  );
}