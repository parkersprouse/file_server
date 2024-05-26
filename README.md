# Local File Browser

This is a basic [hapi-powered](https://hapi.dev/), web-based file browser for serving a local directory through a minimalist, easy-to-use interface.

### Features

- Minimalist, intuitive UI for easy navigation, including dark and light modes
- List view and grid view options for viewing directory content
- Icons for identifying basic file types (text, image, video, audio)
- Auto-linking of `.url` files so they can simply be clicked and visited
- Thumbnail display of images and videos in grid view
  - For videos, must generate thumbnails using the provided thumbnail generation utility
- Parsing and displaying of duration for video files
- Sorting options for file name, file last modified time, or video duration (for video files)

---

## Prerequisites

The app was built with and tested on:
  - [Node](https://nodejs.org/en/) `^20`
  - [pnpm](https://www.pnpm.io/) `^9`

You should have at least these versions installed to run it.  
No guarantee about other versions or package managers.

There are various environment variables that the app will look for:
- `FILE_SERVER_FILES_SOURCE` ( :exclamation: _**REQUIRED**_ :exclamation: )
  - the absolute path to the local directory that files should be served from
  - **default:** :x:
- `FILE_SERVER_HOST`
  - the host address that the server will run on
  - **default:** `0.0.0.0`
- `FILE_SERVER_PORT`
  - the port that the server will run on
  - **default:** `3000`

The utility scripts (`/bin/`) look for one additional env var:
- `FILE_SERVER_UTILITY_SCRIPTS_SOURCE`
  - the absolute path to the local directory that the scripts should be run against
    - this is so that you don't have to convert all videos / generate thumbnails for all videos in your file source and can target specific subdirectories
  - default: :x:

In addition to environment variables, both the app and scripts can be used with command line arguments.  
Simply pass the absolute path to the file source directory and it will be used instead of the environment variables.  

- `node index.js /my/server/source`
- `./bin/convert_videos.sh /my/server/source/videos`
- `./bin/generate_thumbnails.sh /my/server/source /my/server/source/videos`
  - thumbnail script needs both file source root and path to desired subdirectory to work with

---

## Running

Install dependencies:
```sh
pnpm install
```

Start server:
```sh
pnpm start
```

That's it!
