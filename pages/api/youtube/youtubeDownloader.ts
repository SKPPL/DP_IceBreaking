// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { spawn, spawnSync } from 'child_process';
import { encode } from 'punycode';
import fs from 'fs';
type Data = {
    videoId: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    console.log(req.query.videoId)
    var child = spawnSync("node", ["./pages/api/youtube/youtubeDownload.js", `${req.query.videoId}`], { encoding: 'utf8', timeout: 10000 });
    // var result = child.stdout
    var ret = req.query.videoId as string;
    if (!fs.existsSync(`./public/${req.query.videoId}.mp4`)) {
        ret = "error"
    }
    console.log(ret)
    res.status(200).json({ videoId: ret })
}

