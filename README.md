# Arqen Motion

Animated graphics clips for videos: counting numbers, quote cards, timelines and side-by-side comparisons. Templates are plain HTML + GSAP, rendered to MP4 with [HyperFrames](https://github.com/heygen-com/hyperframes) (headless Chrome + FFmpeg). Every template works in 16:9 and 9:16.

Requires Node 22+ and FFmpeg.

```bash
npm install
npm start                 # web UI at http://localhost:4320
```

## CLI

```bash
node motion.mjs list                                   # templates and their fields
node motion.mjs number --set value=40 --set suffix=B --set "label=raised in its latest round"
node motion.mjs compare values.json --portrait -o out.mp4
node motion.mjs timeline values.json --size 1080x730 --no-outro   # custom size, hold the last frame
```

The CLI prints the output path on stdout. Image fields (logos) accept a local file path.

## Templates

| id | What it shows |
|---|---|
| `number` | A number counting up, with a label and source |
| `quote` | A quote revealed word by word, with author and role |
| `timeline` | Up to 7 events (`year \| text`, one per line) |
| `compare` | Two sides with logos and up to 5 rows (`label \| left \| right`); numeric rows get bars |
| `ranking` | Up to 6 items (`name \| value`) as animated bars, biggest first |
| `flow` | One input branching into 2-4 parts that join into a result, wires lighting up as it flows |
| `steps` | 2-5 numbered cards with icons (`icon \| title \| subtitle`), lit one after another |
| `checklist` | 2-5 key points ticked off with drawn check marks |
| `ring` | A ring filling up to a percentage while the number counts up |

Icons for `steps`: code, browser, bolt, video, mic, image, chart, spark, search, globe, file, chat, cloud, lock, user, gear, play, check, upload, money, cpu, rocket.

Write `*word*` in any text to highlight it in the accent color.

`checklist`, `steps`, `flow`, `timeline` and `compare` take an optional `cues` field: comma-separated seconds at which each item appears (for `flow`: the input, each branch, then the result). Arqen Studio fills it from the narration, so items light up as they are named. Without it, items appear at a steady pace.

To add a template, drop an HTML file in `templates/`: declare its fields in `data-composition-variables`, use `{{W}}`, `{{H}}` and `{{DURATION}}` on the root element and build the timeline with the helpers in `templates/_shared/base.js`.

### Templates for other apps

`node motion.mjs list --json` prints every template's id, title, description and fields. Apps such as [Arqen Studio](https://github.com/stefansemb/arqen-studio) use it to offer new templates to their AI scene planner automatically. A template is offered when it has:

- `<meta name="description" content="...">`: what it shows
- `<meta name="motion-use" content="...">`: when to pick it
- a `"hint"` on each field the planner should fill (fields without one keep their defaults)

See `templates/ranking.html` for an example.

Renders run with `DO_NOT_TRACK=1`, which turns off HyperFrames' anonymous telemetry.
