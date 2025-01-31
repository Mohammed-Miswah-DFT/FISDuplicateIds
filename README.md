
# User Guide for FIS Duplicate ID Checker

This guide will walk you through setting up and using the FIS Duplicate ID Checker Chrome extension.

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
Verify the files are present in the directory.

### 3. Open Chrome Extensions Page

1. Open Google Chrome.
2. Go to 

chrome://extensions/

 in the address bar.
3. Enable **Developer mode** by toggling the switch in the top right corner.

### 4. Load the Unpacked Extension

1. Click on **Load unpacked**.
2. Select the directory where the extension files are located (the cloned repository folder).
3. Click **Open**.

### 5. Verify the Extension

- The extension should now appear in the list of installed extensions.
- If there are errors, check the Chrome Developer Console (

chrome://extensions/

 > click **Errors** for debugging information.

## Using the Extension

### Generate Duplicate ID Report

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Click the **Generate Duplicate ID Report** button.
3. The extension will analyze the current page and generate a report of duplicate IDs.

### Highlight Duplicate IDs

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Click the **Highlight Duplicate IDs** button.
3. The extension will highlight elements with duplicate IDs on the current page.

### Highlight Specific ID

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Enter the ID you want to highlight in the input field.
3. Click the **Highlight ID** button.
4. The extension will highlight elements with the specified ID on the current page.

### Updating the Extension

If you make changes to the extension code, you can reload it without reloading Chrome:

1. Go to 

chrome://extensions/

.
2. Click the **Reload** button under the extension.

### Removing the Extension

If you need to remove the extension:

1. Go to 

chrome://extensions/

.
2. Click **Remove** under the extension.
3. Confirm by clicking **Remove** in the popup.

## Files Overview

### manifest.json

Defines the extension's metadata, permissions, and resources.

### popup.html

The HTML file for the extension's popup interface.

### popup.js

The JavaScript file that handles the logic for the popup interface, including generating reports and highlighting IDs.

### content.js

The javascript file that inject js code required for highlighting the tags