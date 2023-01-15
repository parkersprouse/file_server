# Local File Server

This is a basic [Hapi-powered](https://hapi.dev/) file server for serving a local directory through a minimalist, easy-to-use browser interface.

### Features

- Minimalist, intuitive UI for easy navigation
- Both list view and grid view for displaying files
- Icons for identifying basic file types (text, image, video, `.url`)
- Auto-linking of `.url` files so they can simply be clicked and visited
- Thumbnail display of images and videos in grid view
  - For videos, must generate thumbnails using the provided thumbnail generation utility script
- Parsing and displaying of duration for video files
- Sorting by either file name or video duration

---

## Prerequisites

The app was built with and tested on:
  - [Node](https://nodejs.org/en/) `18.12.1`
  - [NPM](https://www.npmjs.com/) `8.19.2`

So you should have at least these version installed to run it.  
No guarantee about later versions.

There are various environment variables that the app will look for:
- `FILE_SERVER_FILES_SOURCE` - the absolute path to the local directory that files should be served from
  - default: n/a
- `FILE_SERVER_HOST` - the host address that the server will run on
  - default: `0.0.0.0`
- `FILE_SERVER_PORT` - the port that the server will run on
  - default: `3000`

The utility scripts (`/bin/`) look for one additional env var:
- `FILE_SERVER_UTILITY_SCRIPTS_SOURCE` - the absolute path to the local directory that the scripts should be run against
  - default: n/a
  - this is so that you don't have to convert all videos / generate thumbnails for all videos in your file source and can target specific subdirectories

In addition to environment variables, both the app and scripts can be used with command line arguments.  
Simply pass the absolute path to the file source directory and it will be used instead of the environment variables.  

- `node index.js /my/file/source`
- `./bin/convert_videos.sh /my/file/source/videos`
- `./bin/generate_thumbnails.sh /my/file/source /my/file/source/videos`
  - thumbnail script would need both file source root and path to desired subdirectory to work on

---

## Running

Install dependencies:
```sh
npm install
```

Start server:
```sh
npm start
```

That's it!
