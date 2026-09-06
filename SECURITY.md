# Before publishing or deploying

This repository is a sanitised teaching snapshot. The original private project
contained secrets and identifiers that must never be copied into a public
repository:

- LINE channel access tokens and notification tokens
- LINE user IDs
- Google Drive folder and file IDs
- deployment URLs and production spreadsheet data

The source now reads its configuration from Script Properties. Use your own
test channel and test spreadsheet. Do not deploy this snapshot against the
original production spreadsheet or point a LINE webhook at the historical
deployment.

