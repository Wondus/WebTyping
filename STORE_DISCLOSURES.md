# WebTyping store privacy disclosures

These declarations describe WebTyping 1.5.0. Update them whenever the extension's data handling or permissions change.

## Prominent store-listing disclosure

WebTyping reads text from the page you explicitly activate solely to create a local typing exercise. Page content, typing input, results, and settings are never transmitted to the developer or third parties. Only extension preferences are stored locally.

## Single purpose

Turn text from a user-activated webpage into a private, local typing exercise.

## Data handling

- Webpage content: accessed only after explicit user activation and processed locally.
- Typing input and results: processed temporarily in memory and not transmitted.
- Settings: stored locally in browser extension storage.
- Developer collection: none.
- Third-party sharing: none.
- Analytics, advertising, and tracking: none.
- Remote code: none.

## Permission justifications

- `activeTab`: provides temporary access to the current page only after the user invokes WebTyping.
- `scripting`: injects the packaged WebTyping interface into that explicitly activated page.
- `storage`: saves user-selected extension preferences locally.

## Store form guidance

- Privacy policy URL: <https://wondus.github.io/WebTyping/privacy.html>
- Remote code: No.
- Data collected or transmitted to the developer or third parties: None.
- Website content access: Yes, locally and only for the user-facing typing feature after explicit activation.
- Firefox data collection permission: `required: ["none"]` because no data is transmitted outside the extension or local browser.
