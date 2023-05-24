#!/bin/bash

#####
# Find all browser-friendly videos and let FFMPEG choose a frame from them to save as a
# thumbnail to be displayed on the file browser.
#####

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

short=r:,s:,e
long=root:,source:,exec
opts=$(getopt --options $short --longoptions $long -- "$@")

# prefix of the source dir path that we do not want to include in the thumbnail file path relative to the thumbnail dir root
prefix=$(echo $FILE_SERVER_FILES_SOURCE)

# directory we're reading files from to generate thumbnails for
source_dir=$(echo $FILE_SERVER_UTILITY_SCRIPTS_SOURCE)

execute=false

eval set -- "$opts"
while [ : ]; do
  case "$1" in
    -r | --root)
        prefix=$2
        shift 2
        ;;
    -s | --source)
        source_dir=$2
        shift 2
        ;;
    -e | --exec)
        execute=true
        shift
        ;;
    --) shift;
        break
        ;;
  esac
done

if [ -z "$prefix" ]; then echo 'No source directory provided'; exit 64; fi
if [ -z "$source_dir" ]; then echo 'No script target directory provided'; exit 64; fi

# directory we will store all thumbnails in
thumbnail_root_dir="$prefix/.thumbnails"

# the goal is to end up with a file path structure in the .thumbnails dir that follows the source dir
# i.e. "/mnt/c/my/cool/videos" with a prefix of "/mnt/c" would store thumbnails in "/mnt/c/.thumbnails/my/cool/videos"

for file in $(find $source_dir -type f -iname '*.mp4' -or -iname '*.m4v' -or -iname '*.webm' -or -name '*.mov');
do
  # current file path without file extension
  stripped=${file%.*}

  stripped_thumbnail_dir_path=${stripped#"$prefix"}
  concat_thumbnail_dir_path="$thumbnail_root_dir$stripped_thumbnail_dir_path"
  final_thumbnail_file_path="$concat_thumbnail_dir_path.png"

  # don't generate a thumbnail for a file we already have one for
  if test -f "$final_thumbnail_file_path"; then continue; fi

  if [ "$execute" = true ]; then
    if ! test -f ${concat_thumbnail_dir_path%/*}; then mkdir -p ${concat_thumbnail_dir_path%/*}; fi
    ffmpeg -i "$file" -vf "thumbnail=300,scale=w=200:h=-1:force_original_aspect_ratio=decrease" -frames:v 1 "$final_thumbnail_file_path"
  else
    echo $file;
    echo $final_thumbnail_file_path;
    echo '----';
  fi
done

unset IFS; set +f
