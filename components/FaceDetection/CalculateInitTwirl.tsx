
import { useCallback } from 'react';

export function CalculateInitTwirl() {
  
    const centerX = 160;
    const centerY = 120;
    const radius = 120;
    const arrTwirl = new Array(40).fill(null).map(() => new Array(320 * 240).fill(0));
    let dx;
    let dy;
    let distance;
    let conv;
    let index;
    let an;
    let newX;
    let newY;
    let d = 0.7
        
    const convolution = (t: number) => {
    if (t < 4) {
        return d * t * (4 - t);
    } else return d * (t - 4) * (t - 8);
    };
   
    
    for (let z = 0; z < 40; z++) {
    conv = convolution(0.2 * z);
    for (let y = 0; y < 240; y++) {
        dy = y - centerY;
        for (let x = 40; x < 280; x++) {
        // 정사각형 모양으로 잘라서 필요한 부분만 계산
        index = (y * 320 + x) * 4;
        // Calculate the distance from the center point..
        dx = x - centerX;
        distance = Math.sqrt(dx * dx + dy * dy);
        // Calculate the angle from the center point..
        an = Math.atan2(dy, dx) + (conv * (radius - distance)) / radius;
        newX = Math.round(centerX + distance * Math.cos(an));
        newY = Math.round(centerY + distance * Math.sin(an));
        let temp = (newY * 320 + newX) * 4;
        if (temp >= 307200 || temp < 0) continue; //307200 = 320*240*4
        arrTwirl[z][y * 320 + x - 40] = temp;
        }
    }
    }
    return arrTwirl;
}