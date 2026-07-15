# Truth Hound

Truth Hound is a lightweight, privacy-focused Chrome Extension designed to monitor web pages for silent, unannounced text alterations and highlight the changes.

---

## Overview

In the digital landscape, web pages, news articles, and policy documents are frequently modified with no public record. Truth Hound acts as a local watchdog by taking snapshots of web pages, allowing you to compare live content against past versions and pinpointing exactly what was added or deleted.

### Key Features

* **Polished User Interface:** A clean, modern light-mode interface with rounded elements designed to fit seamlessly into the browser environment.
* **Instant Snapshotting:** Capture and archive the exact text of any webpage with a single click.
* **Multi-Version History:** Track multiple snapshots of a single URL over time and select specific versions for comparison.
* **Word-by-Word Diff Engine:** Color-coded visual output displaying precisely what text was inserted or deleted.
* **Local Storage Integration:** All data is stored locally within the browser. No information is transmitted to external servers.

---

## Installation Guide (Developer Mode)

To load Truth Hound directly into Google Chrome during development, follow these steps:

1. **Prepare the Files:**
   Create a directory named `Truth Hound` on your system and place the following files inside it:
   * `manifest.json` (Extension configuration)
   * `popup.html` (User interface layout)
   * `popup.js` (Diff engine and snapshot logic)
   * `icon.svg` (The custom vector logo)

2. **Access Chrome Extensions:**
   Navigate to the extensions management page in your Google Chrome browser:
   ```text
   chrome://extensions/
