import sys
import json
from youtubesearchpython import VideosSearch
name = sys.argv[1]
videosSearch = VideosSearch(name, limit = 10)
print(json.dumps(videosSearch.result(), ensure_ascii=False))
