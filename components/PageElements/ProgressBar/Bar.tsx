import * as React from 'react';
import styles from '/styles/Home.module.scss';

interface Props{
    score: number
}

export default function LinearWithValueLabel({score}:Props) {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    var from = progress;
    var to = score*10 + 10;
    var gap = to - from;
    // 일반적으로 퍼즐 맞추는 경우 10번에 나누어 올리기
    if (gap >= 0){
      for (let i = 1; i <= 10; i++) {
        setTimeout(() => { setProgress(Math.floor(from + gap/10 * i)) }, i * 10);
      }
    // 아이템으로 한번에 10으로 떨어질 경우 100번에 나누어 천천히 내리기
    }else{
      for (let i = 1; i <= 100; i++) {
        setTimeout(() => { setProgress(Math.floor(from + gap/100 * i)) }, i * 10);
      }
    }
  }, [score]);

  return (
    <div className={styles.neonbar}>
      <progress className={styles.bar} value={progress} max='100'></progress>
      <span className={styles.barvalue}>{progress}%</span>
    </div>
  );
}