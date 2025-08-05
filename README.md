# Quickstart Chrome Extension Template with NPM

Base template for quickly creating working extensions.

This repo was build for beginners to Chrome Extension development and veteran
developers who don't create new extensions often but need to create one fast.

- Good for people with little Chrome experience as there are examples
  of common tasks with explanations.

- Good for quick development since the descriptions will remind you how things
  work. See `Speed tips` for even faster development.

## Icons

Generate favicon and icons at https://favicon.io.

Use https://imageresizer.com/resize for 128x128.

## Used technologies

- [Node Package Manager](https://www.npmjs.com) for ability to import
  dependencies.
- [React framework](https://react.dev) for some logic in Chrome Extension
  toolbar popup panel.
- [Material UI](https://mui.com) for modern UI styling.
- `@fontsource` fonts.

## Speed tips

- Program in the browser console instead of `npm run build` for each change

## Getting started with development

### 1. Change code files

`src` directory contains the React related files. This is shown only in the
popup when clicking on the extension icon.

`public` directory is the conventional Chrome extension files. This contains
the logic for the extension.

- `background.js` - Service worker script which overrides listeners.
- `content_scripts/` - Controls the Document Object Model. Use `document.*` in
  this file. _This is where the core logic is written for controlling the webpage._
  - `content.js`
  - `other.js`
- `images/` - Images used by extension
- `popup/` - Resources for pop up window when clicking on extension icon.
  - `popup.html`
  - `popup.js`
  - `popup.css`

**NOTE:** Search for "TODO" for notes on which pieces need the immediate
attention. _REMOVE_ the TODO comments once actioned or errors will be shown.

### 2. Install dependencies

```bash
npm install
```

### 3. Build package

This project uses npm with the Chrome Extension.

To build and further upload, sideload, or distribute the extension, run
`npm run build` which will create a `build` directory which should be pointed
to when loading into a Chromium type browser.

As compared to a conventional Chrome Extension, the `manifest.json`,
`background.js` script, etc. are found in the `public` directory.

The contents of React app are found in the `src` directory.

### 4. Load extension locally

Sideload on local Chrome or Chromium based browser. A `build` directory which
should be pointed to when loading into a Chromium type browser.

https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#load-unpacked

### 5. Debug errors

Errors can be found in different consoles depending on the script

https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/#logs

### 6. Deploy to Chrome Extension Marketplace

Make sure you have an developer account with required application info.

Turn the contents of the `build` directory into a ZIP file. Upload the ZIP
file to the Chrome Extension Marketplace.

## Service worker vs content_scripts

**Service workers** (background script in v2) work in the context of the
extension and can access Chrome API's with listeners.

The Document object cannot be accessed from the Service workers.

**Content scripts** only work when they are needed. Otherwise, they become
inactive. Content scripts can call on storage, i18n, and runtime directly.

## Storing data

The `service_worker` or background.js contains the listeners but the document
page is manipulated in `content_scripts`. Since `service_workers` are not
persistent, store data in the `storage` API.

## Message passing

Scripts work independently of each other and so to communicate data, the data
must be passed through a message:
https://developer.chrome.com/docs/extensions/develop/concepts/messaging

Data can also be passed between background.js, popup.js, and content_scripts
through "messages".

**background, options, popup, or content -> background, options, popup.**

`chrome.runtime.sendMessage(MESSAGE, CALLBACK);`

```js
chrome.runtime.sendMessage("some message", (response) => {
  console.log(response)
})
```

**background, popup -> content.**

`chrome.tabs.sendMessage(TAB_ID, MESSAGE, CALLBACK);`

```js
chrome.tabs.sendMessage("tab id", "some message", (response) => {
  console.log(response)
})
```

Receive the data by using:

```js
chrome.runtime.onMessage.addListener(request, sender, (sendResponse) => {
  if (request.message === "get_name") {
    sendResponse("My name")
  } else if (request.message === "change_name") {
    chrome.storage.local.set({ name: request.payload }, () => {
      if (chrome.runtime.lastError) {
        sendResponse({ message: "fail" })
      } else {
        sendResponse({ message: "success" })
      }
    })
  }

  return true // Add this for asynchronous functions.
})
```

## Typescript

At the current time, Chrome Extensions do not support Typescript.

## Useful tutorials

https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab
