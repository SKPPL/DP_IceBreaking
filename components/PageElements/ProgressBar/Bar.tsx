import * as React from 'react';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import { StyledEngineProvider } from '@mui/material/styles';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <MyLinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
      <Typography variant="body2" color="text.secondary">{`${props.value}%`}</Typography>
      </Box>
    </Box>
  );
}
interface Props{
    score: number
}

export default function LinearWithValueLabel({score}:Props) {
  const [progress, setProgress] = React.useState(10);

  React.useEffect(() => {
    setProgress(score*10 + 10)
  }, [score]);

  return (
    <StyledEngineProvider injectFirst>
    <MyBox sx={{ width: '95%' }}>
      <LinearProgressWithLabel value={progress} />
    </MyBox>
    </StyledEngineProvider>
  );
}

const MyLinearProgress = styled(LinearProgress)`
  background: #fab1a0;
  border: 0;
  border-radius: 3px;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, 0.3);
  color: white;
  height: 40px;
  .MuiLinearProgress-bar {
    background: linear-gradient(90deg, #fe6b8b 20%, #ff4757 50%);
  }
`;

const MyBox = styled(Box)`
    position: absolute;
    margin-top: 700px;
    width: 50%;
`;