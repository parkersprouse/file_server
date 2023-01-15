#!/bin/bash

#####
# Finds all videos in the provided source directory that are likely to not be browser-compatible
# and converts them to browser-compatible .mp4 videos.
#####

envfile=".env"
if test -f "$envfile"; then
  export $(cat $envfile | xargs)
else
  envfile="$(cd ../ && pwd)/.env"
  if test -f "$envfile"; then
    export $(cat $envfile | xargs)
  fi
fi

IFS=$(printf '\n.'); IFS=${IFS%.}; set -f

dir=$1
if [ -z "$dir" ]; then dir=$(echo $FILE_SERVER_UTILITY_SCRIPTS_SOURCE); fi
if [ -z "$dir" ]; then echo 'No source directory provided'; exit 20; fi

# These are not containers / encodings that can be played in a browser and must be re-encoded.
for file in $(find $dir -type f -iname '*.avi' -or -iname '*.wmv' -or -iname '*.flv');
do
  if [[ $* == *--exec* ]]; then
    stripped=${file%.*}
    ffmpeg -i "$file" -c:v libx264 -preset veryslow -crf 20 -c:a aac "$stripped".mp4
  else
    echo $file;
    echo '----';
  fi
done

# .mov files are in a container that can potentially be played in a browser,
# but we move them to .mp4 to be sure, and then we can determine if the encoding is good or not.
for file in $(find $dir -type f -iname '*.mov');
do
  if [[ $* == *--exec* ]]; then
    stripped=${file%.*}
    ffmpeg -i "$file" -c:v copy -c:a copy "$stripped".mp4
  else
    echo $file;
    echo '----';
  fi
done

unset IFS; set +f
