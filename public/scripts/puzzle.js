var n = 3;
var canvas;

var videoSize = document.getElementById("video");
var stageSize = document.getElementById("stage");

var videoWidth = videoSize.videoWidth;
var videoHeight = videoSize.videoHeight;
var width = window.innerWidth;
var height = window.innerHeight;

if (videoSize.videoHeight > videoSize.videoWidth) {
    videoWidth *= 0.4;
    videoHeight *= 0.4;
    width *= 0.4;
    height *= 0.4;
}

var segmentw = videoWidth;
var segmenth = videoHeight;


for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
        canvas = document.getElementById("canvas" + (i * n + j))
        canvas.width = segmentw / n;
        canvas.height = segmenth / n;
    }
}



//가로세로 2.5로 나눔 둘다
var originalHeight = width / 2.5 * (videoHeight / videoWidth)
var additionalHeight = originalHeight * 0.6

var stage = new Konva.Stage({
    container: 'stage',
    width: width / 2.5,
    height: originalHeight + additionalHeight,
});
stageSize.style["width"] = stage.width() + "px";

var layer = new Konva.Layer();
stage.add(layer);
var score = n * n;

var outlines = {}
var video = [];
var image = [];
var puzzle = [];

var imageWidth = stage.width() / n;
var imageHeight = originalHeight / n;
for (var i = 0; i < n * n; i++) {
    puzzle[i] = new Konva.Rect({
        x: ((i - i % n) / n) * stage.width() / n,
        y: (i % n) * originalHeight / n,
        width: imageWidth,
        height: imageHeight,
        fill: 'white',
        stroke: 'black',
        strokeWidth: 0.5,
    });
    layer.add(puzzle[i]);
}



for (var i = 0; i < n * n; i++) {
    video[i] = document.getElementById("canvas" + i);
    image[i] = new Konva.Image({
        image: video[i],
        draggable: true,
        width: imageWidth,
        height: imageHeight,
        x: (Math.random() * 0.6) * stage.width(),
        y: originalHeight + (Math.random() * 0.6) * additionalHeight
    });

    //image on to top when drag starts
    image[i].on('dragstart', function () {
        this.moveToTop();
    });

    image[i].key = i;
    // cursor style back to default and check if image is near outline
    image[i].on('dragend', function () {
        document.body.style.cursor = 'default';
        var outline = puzzle[this.key]
        if (!this.inRightPlace && isNearOutline(this, outline)) {
            this.position({
                x: outline.x(),
                y: outline.y(),
            });
            this.inRightPlace = true;
            if (--score <= 0) {
                // alert('You win!');
                // drawBackground(background, images.beach, text);
            }
            this.draggable(false);
        }
    });

    // make cursor style pointer
    image[i].on('dragmove', function () {
        document.body.style.cursor = 'pointer';
    });

    layer.add(image[i]);
}

var text = new Konva.Text({
    text: 'Press Play Button',
    width: stage.width(),
    height: originalHeight,
    align: 'center',
    verticalAlign: 'middle',
});
layer.add(text);

var anim = new Konva.Animation(function () {
    // do nothing, animation just need to update the layer
}, layer);


var processor = {
    timerCallback: function (a, b, n) {
        if (this.video.paused || this.video.ended) {
            return;
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                this.computeFrame(a * i, b * j, i * n + j);
            }
        }
        let self = this;
        setTimeout(function () {
            self.timerCallback(a, b, n);
        }, 0);
    },
    doLoad: function (n) {
        this.video = document.getElementById("video");
        var ctx = [];
        for (let i = 0; i < n * n; i++) {
            ctx[i] = document.getElementById("canvas" + i).getContext("2d");
        }
        this.ctx = ctx;
        let self = this;
        this.video.addEventListener(
            "play",
            function () {
                self.width = self.video.videoWidth / n;
                self.height = self.video.videoHeight / n;
                self.timerCallback(self.width, self.height, n); //n*n으로 분할
            },
            false
        );
    },
    computeFrame: function (a, b, num) {
        this.ctx[num].drawImage(
            this.video,
            a,
            b,
            this.width,
            this.height,
            0,
            0,
            this.width,
            this.height
        );
        return;
    },
};


document.getElementById('play').addEventListener('click', function () {
    text.destroy();
    document.getElementById('video').play();
    //when click play button, starts the animation
    processor.doLoad(n);
    anim.start();
});
document.getElementById('pause').addEventListener('click', function () {
    document.getElementById('video').pause();
    anim.stop();
});


// is image near puzzle outline?
function isNearOutline(image, outline) {
    var dx = imageWidth * 0.2;
    var dy = imageHeight * 0.2;
    var ox = outline.x();
    var oy = outline.y();
    var ix = image.x();
    var iy = image.y();

    if (ix > ox - dx && ix < ox + dx && iy > oy - dy && iy < oy + dy) {
        return true;
    } else {
        return false;
    }
}
