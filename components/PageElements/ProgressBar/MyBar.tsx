import * as React from 'react';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import styled from 'styled-components';
import { StyledEngineProvider } from '@mui/material/styles';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ minWidth: 35 }}>
        <MyTypography variant="body2" color="text.secondary">{`${100 - props.value}%`}</MyTypography>
      </Box>
      <Box sx={{ width: '100%', mr: 1 }}>
        <MyLinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}

interface Props{
    score: number
}

export default function LinearWithValueLabel({score}:Props) {
  const [progress, setProgress] = React.useState(90);

  React.useEffect(() => {
    setProgress(90 - 10*score);
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
  background: #ff4757;
  border: 0;
  border-radius: 3px;
  box-shadow: 0 3px 5px 2px rgba(255, 105, 135, 0.3);
  color: white;
  height: 40px;
  .MuiLinearProgress-bar {
    background: #fab1a0;
  }
`;

const MyBox = styled(Box)`
    position: absolute;
    margin-left: 10px;
    margin-top: 670px;
    width: 48%;
    border: 0.2rem solid #fff;
    // border-radius: 2rem;
    padding: 0.4em;
    box-shadow: 0 0 .2rem #fff,
              0 0 .2rem #fff,
              0 0 2rem #bc13fe,
              0 0 0.8rem #bc13fe,
              0 0 2.8rem #bc13fe,
              inset 0 0 1.3rem #bc13fe; 
`;

const MyTypography = styled(Typography)`
  color: #fff;
  text-shadow:
    0 0 7px #fff,
    0 0 10px #fff,
    0 0 21px #fff,
    0 0 42px #0fa,
    0 0 82px #0fa,
    0 0 92px #0fa,
    0 0 102px #0fa,
    0 0 151px #0fa;
`;