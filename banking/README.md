# Banking userscripts

Userscripts that improve online-banking interfaces. Each script is narrowly scoped to its named site and runs entirely in the browser.

## HNB Online Banking

### Modern OTP entry

[`hnb-modern-otp.user.js`](hnb-modern-otp.user.js) replaces the small HNB login OTP field with six clear digit boxes and a confirmation affordance.

![HNB modern OTP entry](assets/hnb-modern-otp.png)

#### Features

- Accepts one digit per field, with automatic focus movement.
- Supports pasting a full six-digit OTP.
- Preserves HNB's original OTP input and confirmation behaviour.
- Runs only on `onlinebanking.hnb.lk`; the script does not send OTP values anywhere else.

#### Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Open [`hnb-modern-otp.user.js`](hnb-modern-otp.user.js) in the userscript manager and install it.
3. Log in to HNB Online Banking as usual; the enhanced OTP view appears when HNB displays its login OTP modal.

## Commercial Bank Digital

### Normal password and OTP fields

[`combank-normal-password.user.js`](combank-normal-password.user.js) fixes the visible password fields on ComBank Digital's login and change-password views, plus the login OTP field. It restores browser-native paste, typing, and password-manager hints while leaving the site's Angular model and submit flow intact.

It runs only on `combankdigital.com`, ignores the site's hidden decoy inputs, and does not send credentials anywhere.

## Future scripts

Add a subsection for each bank or banking workflow here, with its script, screenshot, features, and installation notes.
