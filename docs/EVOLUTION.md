# LearningBot → WriteToLearn

## What LearningBot / backupBot did

LearningBot was a LINE-first personal learning record and backup bot. A
message or file sent through LINE was stored in a Google Spreadsheet and Google
Drive. The bot organised records by learning space, presented them in LINE Flex
Message carousels, and offered search, browsing, broadcast, and scheduled
reminder features.

```text
LINE event
  → doPost(e)
  → command / postback routing
  ├─ Spreadsheet: learner spaces, logs, metadata
  ├─ Drive: uploaded files and thumbnails
  ├─ LINE reply / push API: menus and Flex carousels
  └─ time triggers: reminders and notifications
```

## Evolution comparison

| Dimension | LearningBot / backupBot | WriteToLearn |
| --- | --- | --- |
| Central interaction | LINE commands, postbacks, and Flex Messages | Learning-process writing workflow in LINE |
| Storage model | One bound Spreadsheet plus Drive folders | Structured records and retrieval-oriented knowledge base |
| Configuration | Global constants embedded in source (historically) | Student-facing setup and explicit configuration guidance |
| Access control | Administrator / host LINE IDs stored in sheets | Explicit ownership and onboarding flow |
| Retrieval | Sheet browsing, page navigation, keyword search | Drive-based retrieval and RAG-oriented design |
| Teaching value | Shows the early, direct event-to-sheet architecture | Shows how the same learning-record idea grew into a maintainable learning tool |

## Reading the source

| File | Role |
| --- | --- |
| `main.js` | LINE webhook (`doPost`), message routing, uploads, replies |
| `parameters.js` | Configuration and sheet-layout constants |
| `defined function.js` | Spreadsheet helpers, room creation, profiles, reusable replies |
| `menu.js` | Flex-message menus, broadcasts, file browsing and retrieval |
| `carouselInfo.js` / `show_searchResult.js` | Paginated carousel and search result rendering |
| `triggers.js` | Time-based reminders and trigger lifecycle |
| `getThumbnailURL.js` | Drive thumbnail and content helpers |

## Discussion prompts

1. What did a spreadsheet make easy for an early prototype?
2. Which assumptions make this historical design difficult to share safely?
3. How does moving credentials to Script Properties change the maintenance model?
4. Which parts of the LINE event router survived conceptually in WriteToLearn?

