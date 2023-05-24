#!/bin/bash

#####
# Finds all videos in the provided source directory that are likely to not be browser-compatible
# and converts them to browser-compatible .mp4 videos.
#####

BLACK='\033[0;30m'
BLUE='\033[0;34m'
CLEAR='\033[0m'
CYAN='\033[0;36m'
DARK_GRAY='\033[1;30m'
GREEN='\033[0;32m'
LIGHT_BLUE='\033[1;34m'
LIGHT_CYAN='\033[1;36m'
LIGHT_GRAY='\033[0;37m'
LIGHT_GREEN='\033[1;32m'
LIGHT_PURPLE='\033[1;35m'
LIGHT_RED='\033[1;31m'
ORANGE='\033[0;33m'
PURPLE='\033[0;35m'
RED='\033[0;31m'
WHITE='\033[1;37m'
YELLOW='\033[1;33m'

envfile=".env"
if test -f "$envfile"; then
  export $(cat $envfile | xargs)
else
  envfile="$(cd ../ && pwd)/.env"
  if test -f "$envfile"; then
    export $(cat $envfile | xargs)
  else
    echo 'No .env file found to extract file paths from'
    exit 64
  fi
fi

IFS=$(printf '\n.'); IFS=${IFS%.}; set -f

short=s:,e,c,a,m
long=source:,exec,clean,list-all,list-matched
opts=$(getopt --options $short --longoptions $long -- "$@")

dir=$(echo $FILE_SERVER_UTILITY_SCRIPTS_SOURCE)

clean=false
execute=false
listall=false
listmatched=false

eval set -- "$opts"
while [ : ]; do
  case "$1" in
    -s | --source)
        dir=$2
        shift 2
        ;;
    -e | --exec)
        execute=true
        shift
        ;;
    -c | --clean)
        clean=true
        shift
        ;;
    -a | --list-all)
        listall=true
        shift
        ;;
    -m | --list-matched)
        listmatched=true
        shift
        ;;
    --) shift;
        break
        ;;
  esac
done

if [ -z "$dir" ]; then echo 'No source directory provided'; exit 20; fi

if [ "$listall" = true ]; then
  for file in $(find $dir -type f -iname '*.avi' -or -iname '*.divx' -or -iname '*.flv' -or -iname '*.mov' -or -iname '*.mp4' -or -iname '*.mpeg' -or -iname '*.mpg' -or -iname '*.rmvb' -or -iname '*.wmv'); do
    echo $file
    echo -e "${PURPLE}----------${CLEAR}"
  done
else
  matched=()
  for file in $(find $dir -type f -iname '*.avi' -or -iname '*.divx' -or -iname '*.flv' -or -iname '*.mov' -or -iname '*.mp4' -or -iname '*.mpeg' -or -iname '*.mpg' -or -iname '*.rmvb' -or -iname '*.wmv'); do
    # bad
    # streams.stream.0.codec_name="mpeg4"
    # streams.stream.0.codec_name="vc1"
    # streams.stream.0.codec_name="mpeg1video"
    # streams.stream.0.codec_name="mpeg2video"
    # streams.stream.0.codec_name="rv40"
    #
    # good
    # streams.stream.0.codec_name="h264"
    # streams.stream.0.codec_name="vp8"
    echo "Checking $file"
    if ffprobe -v error -hide_banner -of default=noprint_wrappers=0 -print_format flat -select_streams v:0 -show_streams -show_entries stream_disposition=:format_tags=:stream_tags=:stream=codec_name "$file" | grep -i -E 'mpeg1video|mpeg2video|mpeg4|rv40|vc1'; then
      if [ "$execute" = true ]; then
        stripped=${file%.*}
        # https://stackoverflow.com/a/56681096
        ffmpeg -i "$file" -c:v libx264 -preset veryslow -crf 20 -c:a aac -max_muxing_queue_size 9999 "$stripped".new.mp4
      else
        if [ "$listmatched" = true ]; then
          matches+=( $file )
        fi
      fi

      if [ "$clean" = true ]; then rm "$file"; fi
    fi
    echo -e "${PURPLE}----------${CLEAR}"
  done

  if [ "$listmatched" = true ]; then
    echo -e "${YELLOW}========================================${CLEAR}"
    echo -e "${GREEN}MATCHES:${CLEAR}"
    echo -e "${YELLOW}========================================${CLEAR}"
    for match in ${matches[@]}; do
      echo $match
      echo -e "${PURPLE}----------${CLEAR}"
    done
  fi
fi

unset IFS; set +f
