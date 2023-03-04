import * as React from 'react';
import styles from '/styles/Home.module.scss';

interface Props{
    score: number
}

export default function LinearWithValueLabel({score}:Props) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    var from = progress;
    var to = score*10;
    var gap = to - from;
    var startTime = null;
    var duration = 300;
    if (gap < 0){
      duration = gap * (-10);
    }
    
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      var progressTime = timestamp - startTime!;
      var progressRatio = Math.min(progressTime / duration, 1);
      var progressValue = Math.floor(from + gap * progressRatio);
      setProgress(progressValue);
      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    if (gap >= 0) {
      requestAnimationFrame(animate);
    } else {
      // 반대 방향 애니메이션 수행시 startTime 초기화
      startTime = null;
      requestAnimationFrame(animate);
    }
  }, [score]);

  return (
    <div className={styles.neonbarPeer}>
      <span className={styles.barvaluePeer}>{score}/9</span>
      <progress className={styles.barPeer} value={progress} max='90'></progress>
    </div>
  );
}