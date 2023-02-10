let n = 3

let canvas;

let srcVideo = document.getElementById("video");

// window에 뜬 사이즈가 아닌 src 영상의 본래 해상도의 width, height 저장
let srcVideoWidth = srcVideo.videoWidth;
let srcVideoHeight = srcVideo.videoHeight;

// n*n canvas 설정
for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
        // canvas 태그 0~(n*n-1) 가져오기
        canvas = document.getElementById("canvas" + (i * n + j))

        // canvas width & height src 영상 해상도의 1/n 동일 사이즈로 입력
        canvas.width = srcVideoWidth / n;
        canvas.height = srcVideoHeight / n;
    }
}

// client window size
let width = window.innerWidth;
let height = window.innerHeight;

// [window 1/2.5 폭 사이즈] x [video 높이/폭 비율] = 맞는 비율의 높이
// 폭에 맞는 비율의 높이 및 추가(조각 사전 배치 공간) 높이 설정
let originalHeight = width / 2.5 * (srcVideoHeight / srcVideoWidth);

// Konva library    [_document.js]의 Head 태그에 넣어서 client 실행
// 폭 window 사이즈 1/2.5   &   높이는 같은 비율 의 1.6배 ( 배치 전 조각들 아래에 놓기 위한 공간 )
// play stage 생성
let stage = new Konva.Stage({
    container: 'stage',
    width: width / 2.5,
    height: originalHeight,
});

// layer 생성 후 stage에 추가
let layer = new Konva.Layer();
stage.add(layer);

// canvas 담을 틀
let video = [];

// 퍼즐 조각 shape 담을 틀
let image = [];

// 퍼즐 판 담을 틀
let puzzle = [];

//  layer 에 들어갈 image shape 크기 설정
let imageWidth = stage.width() / n;
let imageHeight = originalHeight / n;

//  퍼즐 판 만들기                                                                              0   3   6
// 사각형 shape 생성 후 puzzle판 용도의 배열에 추가          1   4   7
// 각 puzzle 판 조각의 좌표는 좌상단                                         2   5   8
for (let i = 0; i < n * n; i++) {
    puzzle[i] = new Konva.Rect({
        x: ((i - i % n) / n) * stage.width() / n,
        y: (i % n) * originalHeight / n,
        width: imageWidth,
        height: imageHeight,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 0.5,
    });

    //  layer에 shape 추가
    layer.add(puzzle[i]);
}


// 퍼즐판 채워진 정보 (가능한거 일단 임시)
let tmp = [1, 8, 2, 0, 3, 5, 6, 4, 7];

// 퍼즐판 채워진 정보 (update용)
let puzzleStatus = [1, 8, 2, 0, 3, 5, 6, 4, 7];

// i번째 조각 만들 때 tmp에서 그 조각의 위치 임시저장
let tmpNum;

// 정답 확인용 배열
let ans = Array.from(Array(n*n).keys());

// slide 시킬 수 있는 image조각인지 확인
function isClickable(key){
    let location = puzzleStatus.indexOf(key);
    let tmpI = puzzleStatus.indexOf(8);
    let tmpA = tmpI+3;
    let tmpB = tmpI-3;
    let tmpC = -10;
    let tmpD = -10;
    switch(tmpI%3){
        case 0:
            tmpC = tmpI +1;
            break;
        case 1:
            tmpC = tmpI +1;
            tmpD = tmpI -1;
            break;
        case 2:
            tmpD = tmpI -1;
    }
    if ((tmpI%3) === 1){
        tmpC = tmpI +1;
        tmpD = tmpI -1;
    }
    if (location === tmpA || location === tmpB || location === tmpC || location === tmpD){
        return true;
    } 
    return false;
}

// layer 퍼즐 조각shape들에 각 canvas 넣고 layer에 각각 추가
//  퍼즐판 영역에 고정시키기
for (let i = 0; i < n * n - 1; i++) {
    tmpNum = tmp.indexOf(i);
    video[i] = document.getElementById("canvas" + i);
    image[i] = new Konva.Image({
        image: video[i],
        width: imageWidth,
        height: imageHeight,
        x: ((tmpNum - tmpNum % n) / n) * stage.width() / n,
        y: (tmpNum % n) * originalHeight / n
    });

    image[i].key = i;

    //image조각 클릭 이벤트 생성
    image[i].on('click', function () {
        if(isClickable(this.key) ) {
            let tmpIndex = puzzleStatus.indexOf(8);
            let tmpKey = puzzleStatus.indexOf(this.key);
            this.x(((tmpIndex - tmpIndex % n) / n) * stage.width() / n);
            this.y((tmpIndex % n) * originalHeight / n);
            puzzleStatus[puzzleStatus.indexOf(8)] = this.key;
            puzzleStatus[tmpKey] = 8;

            // 정답인지 확인 후 이벤트 종료
            if(JSON.stringify(puzzleStatus) === JSON.stringify(ans)){
                setTimeout(function(){
                    layer.add(image[8]);
                    alert('Done');
                }, 10);

                //  성공시 마지막 조각 자리에 영상 추가
                image[8] = new Konva.Image({
                    image: document.getElementById("canvas8"),
                    width: imageWidth,
                    height: imageHeight,
                    x: ((8 - 8 % n) / n) * stage.width() / n,
                    y: (8 % n) * originalHeight / n
                });

                // 클릭 이동 불가상태로 변환
                for (let j = 0; j < n * n - 1; j++) {
                    image[j].key = -1;
                };
            }
        }
    });

    layer.add(image[i]);
}

// layer에 시작 전 알림 text shape 추가
let text = new Konva.Text({
    text: 'Press Play Button',
    width: stage.width(),
    height: originalHeight,
    align: 'center',
    verticalAlign: 'middle',
});
layer.add(text);


//  layer를 밀리초 속성으로 업데이트시켜줌
// layer 에 animation 추가
let anim = new Konva.Animation(function () {
    // do nothing, animation just need to update the layer
}, layer);


// play 버튼 클릭시 doLoad()    &   animation control
document.getElementById('play').addEventListener('click', function () {
    text.destroy();
    document.getElementById('video').play();
    //when click play button, starts the animation
    doLoad(n);
    anim.start();
});
document.getElementById('pause').addEventListener('click', function () {
    document.getElementById('video').pause();
    anim.stop();
});


// canvas 담을 틀
let ctx = [];

//  srcVideo가 재생중이라면 쉼없이 computeFrame 호출
function timerCallback (imageWidth, imageHeight, n) {
    if (srcVideo.paused || srcVideo.ended) {
        return;
    }
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            computeFrame(imageWidth * i, imageHeight * j, i * n + j);
        }
    }
    setTimeout(function () {
        timerCallback(imageWidth, imageHeight, n);
    }, 0);
}

// canvas 빈 통 n*n개 2d로 개시하고 ctx에 담기  &   play 리스너에 timerCallBack추가
function doLoad(n) {
    for (let i = 0; i < n * n; i++) {
        ctx[i] = document.getElementById("canvas" + i).getContext("2d");
    }

    srcVideo.addEventListener(
        "play",
        function () {
            timerCallback(srcVideoWidth / n, srcVideoHeight / n, n); //n*n으로 분할
        }
    );
}

//  src비디오에서 잘라서 각 canvas에 그리기
 function computeFrame(a, b, num) {
    ctx[num].drawImage(
        srcVideo,
        a,
        b,
        srcVideoWidth,
        srcVideoHeight,
        0,
        0,
        srcVideoWidth,
        srcVideoHeight
    );
    return;
}
