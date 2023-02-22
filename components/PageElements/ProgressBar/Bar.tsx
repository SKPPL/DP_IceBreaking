import * as React from 'react';
import styles from '/styles/Home.module.scss';

interface Props{
    score: number
}

export default function LinearWithValueLabel({score}:Props) {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    setProgress(score*10 + 10)
  }, [score]);

  return (
    <div className={styles.neonbar}>
      <progress className={styles.bar} value={progress} max='100'></progress>
      <span className={styles.barvalue}>{progress}%</span>
    </div>
  );
}