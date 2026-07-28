# WebTyping

WebTyping is a lightweight browser extension that turns an article or any selected page element into a private typing trainer. Page text never leaves the browser: there are no external APIs, analytics, trackers, or cloud storage.

WebTyping is open-source software released under the [MIT License](LICENSE).

The extension detects the likely main content, highlights it for confirmation, and renders a clean reader inside an isolated Shadow DOM. It shows character-level errors, a smooth Monkeytype-style caret, live WPM, weighted average WPM, accuracy, and segment progress. A DevTools-style picker is always available when automatic detection chooses the wrong area.

## Interface

The fixed top bar contains stable-width fields for current WPM, average WPM, accuracy, typing state, and segment progress. The reader dims completed and distant words, emphasizes the current word and the configured number of upcoming words, and scrolls only when the active line leaves the safe viewport area.

When Caps Lock is active, the top bar displays a high-contrast **CAPS LOCK ON** warning. Its state is refreshed from every keyboard event without counting the Caps Lock key as typing input.

The settings panel includes:

- words per WPM segment;
- idle timeout;
- number of highlighted upcoming words;
- case sensitivity;
- emoji skipping, enabled by default;
- optional punctuation skipping that removes punctuation before tokenization;
- font size and text column width;
- a dark-only interface with always-on automatic scrolling and accuracy.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- Chrome, another Chromium browser, or Firefox 121+

## Install and build

```bash
npm install
npm run build
```

Development build with watch mode:

```bash
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm test
npm run build
```

## Load in Chrome or Chromium

1. Run `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Select **Load unpacked** and choose the `dist` directory.
5. Pin WebTyping, open an article, and click its toolbar icon.

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on**.
3. Choose `dist/manifest.json`.

Firefox removes temporary add-ons after a browser restart. Permanent distribution requires signing through Mozilla Add-ons. The manifest contains both Chromium's `background.service_worker` and Firefox's `background.scripts` fallback.

## Keyboard controls

- Toolbar icon or `Alt+Shift+T`: start or exit WebTyping.
- `Space`: finish the current word; an empty word is skipped.
- `Backspace`: delete the last typed character.
- `Ctrl/Cmd+Backspace`: clear the current typed word.
- `Escape`: pause; press it again while paused to exit.
- `Escape` in element picker mode: cancel selection.

Typing keys are captured before they can control the underlying page. Common browser shortcuts such as `Ctrl/Cmd+L`, `T`, `W`, `R`, and DevTools remain available. Input is handled through a hidden `textarea`, `beforeinput`, and composition events to support diacritics, keyboard layouts, and IME.

## WPM, accuracy, and idle time

WPM uses the standard five-character normalization:

```text
WPM = (correct characters / 5) / active minutes
```

Current WPM is finalized after the configured number of completed target words. Average WPM is calculated directly from all correct characters and total active time, not as an arithmetic mean of segment values. Incorrect, extra, and skipped characters never count as correct performance.

Timing begins with the first valid character and uses `performance.now()`. Once the idle limit is reached, active time stops increasing. The next valid input starts a new active interval without discarding the current segment or progress.

Accuracy is `correct keystrokes / all relevant keystrokes`. Backspace changes the visible word but does not erase the original mistake from history. Every target character in a skipped word counts as a relevant incorrect input.

**Skip emojis** is enabled by default. Emoji sequences—including flags, keycaps, skin-tone modifiers, and joined emoji—are removed before tokenization. Emoji-only tokens disappear and surrounding whitespace is normalized. **Skip punctuation** is disabled by default; when enabled, Unicode punctuation is removed from displayed typing targets before tokenization.

## Architecture

- `src/background`: minimal explicit-injection background worker/script.
- `src/typing`: DOM-independent tokenizer, typing engine, WPM tracker, and session summary.
- `src/content`: content detection and extraction, picker, controller, scrolling, and Shadow DOM shell.
- `src/input`: keyboard, IME, and composition input handling.
- `src/settings`: versioned typed settings, migration, validation, and local persistence.
- `src/ui`: incremental typing view, top bar, settings panel, and results view.
- `tests`: engine, tokenizer, WPM, detector, and 10,000-word regression tests.

The reader creates its word elements once. Each keystroke updates only the current and nearby state classes. The caret is a persistent absolutely positioned element whose transform is animated between character positions, avoiding the visual reset caused by recreating it on every input.

## Permissions and privacy

- `activeTab`: temporary access to the page explicitly activated by the user.
- `scripting`: one-off injection of the bundled content script.
- `storage`: local settings persistence.
- `commands`: declares the keyboard shortcut and is not a separate permission.

There are no host permissions and no content script running on every page. The extension performs no network requests and does not store article text. The source page is not destructively edited; only a temporary candidate outline is applied and restored.

## Known limitations

- Browsers block injection on internal pages, extension stores, and some built-in PDF viewers.
- Cross-origin iframe contents cannot be selected from the top-level document.
- Unusual single-page applications and canvas-based content may require manual selection.
- Mobile virtual keyboard behavior depends on the browser allowing the hidden input to retain focus.
- Session statistics remain in memory; only settings are persisted.
- The initial 10,000-word DOM is supported and incrementally updated, but the first release does not use full viewport virtualization.
