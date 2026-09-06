# Spreadsheet template for the LearningBot sandbox

LearningBot is a **bound Apps Script**. The script reads the spreadsheet in
which it is installed with `SpreadsheetApp.getActiveSpreadsheet()`.

Create one new spreadsheet for testing—never use a production or class-record
spreadsheet—and add these sheets:

| Sheet | Required | Purpose |
| --- | --- | --- |
| `templet` | Yes | The template copied whenever the bot meets a new LINE user, room, or group. The spelling is historical and must not be changed. |
| `Triggers` | Recommended | Used by the historical scheduled-reminder functions. |
| `Learning Center` | Recommended | An example centre sheet; its exact name must match `LEARNING_CENTER_SHEET_NAME`. |

## `templet` layout

The first eight rows are control rows. Do not add headings in column C before
row 9: the old code uses the first empty cell in that column as its user index.

| Row | Column A | Value for a fresh template |
| --- | --- | --- |
| 1 | temporary navigation state | leave blank |
| 2 | room owner LINE user ID | leave blank; the bot fills it |
| 3 | room label | leave blank; the bot fills it |
| 4 | Drive upload-folder ID | leave blank; the bot fills it |
| 5 | forwarding interval in minutes | `-1` (paused) |
| 6 | message count | `0` |
| 7 | broadcast start marker | `--` |
| 8 | broadcast selection marker | `--` |
| 9 onward | event records | leave blank; the bot appends records |

For readability, you may add labels in column B. The historical code records
message data in columns E–K: forwarding state, sender ID, sender name,
timestamp, type, visible content, and raw payload or Drive file ID.

## What happens on the first LINE message

The bot creates a new worksheet whose name is the LINE `userId`, `roomId`, or
`groupId`, copies `templet`, creates a matching subfolder beneath
`DESTINATION_FOLDER_ID`, then begins appending records from row 9.

