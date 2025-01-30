# Chrome Extension Setup Guide

This guide will walk you through setting up and loading an unpacked Chrome extension from a repository.

## Prerequisites

- Google Chrome installed
- Git installed

## Steps to Set Up the Unpacked Chrome Extension

### 1. Clone the Repository

First, open a terminal and navigate to the directory where you want to clone the repository. Then, run the following command:

```sh
git clone https://github.com/Mohammed-Miswah-DFT/FISDuplicateIds
```

### 2. Navigate to the Extension Directory

Change to the directory where the extension files are located:

```sh
cd FISDuplicateids
```
Verify the files are present in the directory

### 3. Open Chrome Extensions Page

1. Open Google Chrome.
2. Go to `chrome://extensions/` in the address bar.
3. Enable **Developer mode** by toggling the switch in the top right corner.

### 4. Load the Unpacked Extension

1. Click on **Load unpacked**.
2. Select the directory where the extension files are located (the cloned repository folder).
3. Click **Open**.

### 5. Verify the Extension

- The extension should now appear in the list of installed extensions.
- If there are errors, check the Chrome Developer Console (`chrome://extensions/` > click **Errors**) for debugging information.

### 6. Updating the Extension

If you make changes to the extension code, you can reload it without reloading Chrome:

1. Go to `chrome://extensions/`.
2. Click the **Reload** button under the extension.

### 7. Removing the Extension

If you need to remove the extension:

1. Go to `chrome://extensions/`.
2. Click **Remove** under the extension.
3. Confirm by clicking **Remove** in the popup.

---
