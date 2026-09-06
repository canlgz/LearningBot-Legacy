# Script Properties required by this historical teaching edition

In the Apps Script editor, open **Project Settings → Script properties** and
create the following keys with values from **your own** LINE channel and Google
Drive. Never place these values in a `.js` file or commit them to Git.

| Key | Value to provide |
| --- | --- |
| `LINE_CHANNEL_ACCESS_TOKEN` | A Messaging API channel access token for your own channel |
| `LINE_NOTIFY_TOKEN` | Optional historical setting. Leave it unset for classroom use; the reminder/notification paths will log and skip. |
| `DESTINATION_FOLDER_ID` | Google Drive folder ID that will store uploads |
| `LEARNING_CENTER_SHEET_NAME` | Worksheet name used as the learning centre |
| `ADMINISTRATOR_LINE_USER_ID` | LINE user ID allowed to run administrator commands |
| `DEFAULT_THUMBNAIL_FILE_ID` | Optional Drive image file ID used as a fallback thumbnail |

The active spreadsheet is intentionally obtained with
`SpreadsheetApp.getActiveSpreadsheet()`: this source is a **bound script** for
the spreadsheet used by the bot.
