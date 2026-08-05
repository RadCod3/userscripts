// ==UserScript==
// @name         Commercial Bank – Normal password and OTP fields
// @namespace    https://www.combankdigital.com/
// @version      1.1.0
// @description  Restores normal typing, paste, and password-manager behaviour on ComBank Digital.
// @match        https://www.combankdigital.com/*
// @match        https://combankdigital.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const STYLE_ID = 'combank-normal-password-style';
  const enhanced = new WeakSet();

  const isVisible = input => {
    if (!input.isConnected) return false;
    const style = getComputedStyle(input);
    return style.display !== 'none' && style.visibility !== 'hidden' && input.getClientRects().length > 0;
  };

  // Angular's pasteCallback prevents the browser's normal paste action.  Handle
  // the event during capture, then notify Angular using its normal input events.
  function installPasteBridge(input) {
    if (enhanced.has(input)) return;
    enhanced.add(input);
    input.addEventListener('paste', event => {
      const text = event.clipboardData?.getData('text') ?? '';
      event.preventDefault();
      event.stopImmediatePropagation();
      const start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      const max = input.maxLength > -1 ? input.maxLength : Infinity;
      const value = (input.value.slice(0, start) + text + input.value.slice(end)).slice(0, max);
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(input, value);
      else input.value = value;
      input.setSelectionRange(start + text.length, start + text.length);
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }, true);
  }

  function normalize(input) {
    if (!isVisible(input)) return;
    const isOtp = input.matches('input[autocomplete="one-time-code"]') || input.closest('[otp-field="true"]');
    input.removeAttribute('ccpdisabled');
    input.removeAttribute('ccp-disabled');
    input.closest('[otp-field="true"]')?.removeAttribute('ccp-disabled');
    input.removeAttribute('ng-readonly');
    input.autocomplete = isOtp
      ? 'one-time-code'
      : (location.hash.toLowerCase().includes('changepin') ? 'new-password' : 'current-password');
    input.setAttribute('autocomplete', input.autocomplete);
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off');
    installPasteBridge(input);
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      input[type="password"].field, input[autocomplete="one-time-code"].field { user-select: text !important; -webkit-user-select: text !important; }
      input[type="password"].field:focus, input[autocomplete="one-time-code"].field:focus { caret-color: auto !important; }
    `;
    (document.head || document.documentElement).append(style);
  }

  function enhance() {
    injectStyle();
    document.querySelectorAll('input[type="password"], input[autocomplete="one-time-code"], [otp-field="true"] input').forEach(normalize);
  }

  enhance();
  new MutationObserver(enhance).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'disabled']
  });
  window.addEventListener('hashchange', enhance);
})();
