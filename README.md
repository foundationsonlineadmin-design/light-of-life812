# Light of Life — Discovery Bible Series PWA

A responsive, data-driven PWA prototype with separate English and Hindi series pages and a standalone, shareable URL for every lesson. The supplied logos are included unchanged. Lessons 1–15 use the supplied shared image set in both English and Hindi; each image appears after the lesson text.

## Run locally

The home page opens with language selection; Hindi appears first. Choosing a language opens its translated home page and installation guidance, with one link to that language's lessons. Service workers require localhost or HTTPS. From this folder, start a static file server, for example:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. Use the install button when offered, or follow the platform instructions on the selected language's home page. Pages and lesson data are cached as they are opened; YouTube videos require an internet connection.

## Add or update lessons

The small `catalog.js` file contains the language names and lesson list used by navigation. Each lesson has its own JSON file under `lessons/en/` or `lessons/hi/`. Add a lesson record there, then add its title, id, number, reference, and duration to `catalog.js`. Its `sections` hold the lesson text. Optional fields `image` and `imageAlt` add one image after the text; `videoId` adds a YouTube embed. Hindi video IDs are already included on Hindi lessons 1–15 only.

The shared lesson illustrations are stored in `assets/lesson-images/lesson-01.png` through `lesson-15.png`. To replace an illustration, update that lesson data file’s `image` path. The introduction currently has no illustration.

Progress is stored locally in the browser and organized into groups. Create and switch groups in the progress tracker; lesson completion is saved to the currently selected group. Existing saved progress is retained in a default group. The tracker follows the most recently selected language. Text-size preference is stored locally; the `Aa` control adjusts text from 80% to 140% across all pages. Share a lesson with its `lesson.html?lang=...&id=...` URL.
