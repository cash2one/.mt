rem directory inputFile outputFilename
set tmpFile=%1\\.tmp_%3.m4v
ffmpeg -i %1\\%2 -vf scale=-1:540 -b:v 800k -acodec copy -movflags faststart %tmpFile%
rename %tmpFile% %1\\%3.m4v
