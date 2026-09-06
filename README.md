# LearningBot / backupBot — historical teaching edition

This is a **sanitised historical snapshot** of LearningBot (later named
`backupBot`), the predecessor of [WriteToLearn](https://github.com/canlgz/WriteToLearn).
It is published for code reading, course discussion, and comparison of the
tool's evolution—not as a production-ready bot.

## Why this repository exists

LearningBot used LINE as the front door to a personal learning archive. It
accepted messages and files, saved them to a bound Google Spreadsheet and
Google Drive, then let learners browse, search, and retrieve their records by
LINE menus and Flex Message carousels.

Read [the evolution guide](docs/EVOLUTION.md) before opening the source.

## Important safety note

The original project contained real credentials and identifiers. They have
been removed. This repository does **not** include a working production token,
webhook, spreadsheet, Drive folder, or learner data.

Do not paste credentials into source files. See [configuration](CONFIG.example.md)
and [security guidance](SECURITY.md).

## Source layout

The historical Apps Script source lives in [`src`](src). It remains close to
its original file structure so students can trace an actual GAS / LINE Bot
prototype:

```text
src/
├── main.js                 LINE webhook and message router
├── parameters.js           Script Properties and sheet layout constants
├── defined function.js     shared helpers
├── menu.js                 menus, browsing, broadcasting, file retrieval
├── carouselInfo.js         paginated Flex carousel
├── show_searchResult.js    search carousel
├── triggers.js             time-based reminders
└── getThumbnailURL.js      Google Drive helper
```

## Teaching use

Use it alongside WriteToLearn to discuss how an experimental, tightly-coupled
bot can evolve toward a more reproducible learning system. For a live student
installation of WriteToLearn, see the separate
[student setup repository](https://github.com/canlgz/WriteToLearn-Student-Setup).

## License and provenance

Copyright © Guanze Liao. This repository preserves a historical project for
educational comparison. Please retain attribution when reusing excerpts.

