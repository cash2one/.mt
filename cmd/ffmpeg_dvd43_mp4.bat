ffmpeg -i %1 -b:v 800k -vf yadif=0:0:0,scale=640:480 -movflags faststart %2