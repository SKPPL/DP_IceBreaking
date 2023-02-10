const getVideos = (req, res) => {

    const body = JSON.parse(req.body)
    const { input } = body

    var child_process = require('child_process');
    var child = child_process.spawnSync("python3", ["pages/api/youtube/youtubeScrap.py", input], { encoding: 'utf-8' });
    var result = child.stdout;

    res.status(200).json(JSON.parse(result))
}

export default getVideos