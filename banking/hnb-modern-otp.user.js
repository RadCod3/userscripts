// ==UserScript==
// @name         HNB Online Banking – Modern OTP entry
// @namespace    https://onlinebanking.hnb.lk/
// @version      1.0.0
// @description  Replaces HNB's tiny login OTP field with a clear six-digit entry view. OTPs never leave the banking page.
// @match        https://onlinebanking.hnb.lk/*
// @match        https://www.onlinebanking.hnb.lk/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  const SOURCE_INPUT = '#opt-number-confirm-input-field';
  const UI_CLASS = 'hnb-modern-otp';
  const STYLE_ID = 'hnb-modern-otp-style';

  function setNativeValue(input, value) {
    // React-controlled inputs need the native setter plus bubbling events.
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor.set.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .modal:has(#opt-number-confirm-input-field) .modal-dialog { max-width: 540px !important; }
      .modal:has(#opt-number-confirm-input-field) .modal-content { border: 0 !important; border-radius: 24px !important; overflow: hidden; box-shadow: 0 28px 80px rgba(2, 36, 63, .34) !important; }
      .modal:has(#opt-number-confirm-input-field) .modal-header { padding: 18px 20px 0 !important; border: 0 !important; }
      .modal:has(#opt-number-confirm-input-field) .modal-body { padding: 8px 38px 28px !important; }
      .modal:has(#opt-number-confirm-input-field) .modal-footer { padding: 0 28px 24px !important; border: 0 !important; }
      .modal:has(#opt-number-confirm-input-field) .dl-login-otp-modal-content__icon { margin: 0 auto 12px !important; transform: scale(.82); transform-origin: center bottom; }
      .modal:has(#opt-number-confirm-input-field) .dl-confirmation-modal-content__otp-wrapper h4 { max-width: 390px; margin: 0 auto 24px !important; color: #102f4a !important; font-size: 17px !important; font-weight: 600 !important; line-height: 1.55 !important; text-align: center !important; }
      .modal:has(#opt-number-confirm-input-field) .dl-confirmation-modal-content__otp-wrapper h4 span { display: block; margin-top: 4px; color: #0061af !important; font-size: 14px; letter-spacing: .03em; }
      .modal:has(#opt-number-confirm-input-field) .dl-confirmation-modal-content__otpinput { display: none !important; }
      .${UI_CLASS} { display: grid; justify-items: center; gap: 18px; direction: ltr; }
      .${UI_CLASS}__digits { display: flex; justify-content: center; gap: clamp(7px, 2vw, 13px); }
      .${UI_CLASS}__digit { width: clamp(39px, 9vw, 55px); height: clamp(51px, 12vw, 64px); border: 2px solid #c9d9e5; border-radius: 13px; background: #f9fcff; color: #063b63; font: 700 28px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; text-align: center; caret-color: #0061af; outline: none; transition: border-color .16s ease, box-shadow .16s ease, background .16s ease; }
      .${UI_CLASS}__digit:focus { border-color: #0061af; background: #fff; box-shadow: 0 0 0 4px rgba(0, 97, 175, .15); }
      .${UI_CLASS}__digit:not(:placeholder-shown) { border-color: #52aa78; background: #f5fff8; }
      .${UI_CLASS}__confirm { min-width: 190px; min-height: 46px; border: 0; border-radius: 12px; background: #0061af; box-shadow: 0 8px 18px rgba(0, 97, 175, .22); color: #fff; cursor: pointer; font: 700 15px/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; transition: background .16s ease, transform .16s ease, opacity .16s ease; }
      .${UI_CLASS}__confirm:hover:not(:disabled) { background: #004f90; transform: translateY(-1px); }
      .${UI_CLASS}__confirm:disabled { cursor: not-allowed; opacity: .45; box-shadow: none; }
      .modal:has(#opt-number-confirm-input-field) .dl-login-otp-modal-content__otptime { margin-top: 23px !important; text-align: center; }
      .modal:has(#opt-number-confirm-input-field) .dl-login-otp-modal-content__otptime h5 { color: #526575 !important; font-size: 13px !important; font-weight: 500 !important; line-height: 1.55 !important; }
      .modal:has(#opt-number-confirm-input-field) .dl-login-otp-modal-content__otptime a { color: #0061af !important; font-weight: 700; cursor: pointer; }
      .modal:has(#opt-number-confirm-input-field) .dl-otp-call-assist { width: 100%; text-align: center; }
      .modal:has(#opt-number-confirm-input-field) .dl-callfor-assistance { justify-content: center; color: #506273; font-size: 13px; }
      @media (max-width: 460px) { .modal:has(#opt-number-confirm-input-field) .modal-body { padding-inline: 18px !important; } .modal:has(#opt-number-confirm-input-field) .modal-footer { padding-inline: 12px !important; } }
    `;
    document.head.append(style);
  }

  function createOtpView(source) {
    const modal = source.closest('.modal-content');
    if (!source.isConnected || modal?.querySelector('.' + UI_CLASS)) return;

    const host = document.createElement('div');
    host.className = UI_CLASS;
    host.setAttribute('aria-label', 'Six digit verification code');
    host.setAttribute('role', 'group');
    const digitRow = document.createElement('div');
    digitRow.className = UI_CLASS + '__digits';
    host.append(digitRow);

    const boxes = Array.from({ length: 6 }, (_, index) => {
      const box = document.createElement('input');
      box.className = UI_CLASS + '__digit';
      box.type = 'text';
      box.inputMode = 'numeric';
      box.autocomplete = index === 0 ? 'one-time-code' : 'off';
      box.maxLength = 1;
      box.placeholder = ' ';
      box.setAttribute('aria-label', `Digit ${index + 1} of 6`);
      digitRow.append(box);
      return box;
    });

    const confirm = document.createElement('button');
    confirm.className = UI_CLASS + '__confirm';
    confirm.type = 'button';
    confirm.textContent = 'Confirm code';
    confirm.disabled = true;
    host.append(confirm);

    const value = () => boxes.map(box => box.value).join('');
    const updateSource = () => {
      setNativeValue(source, value());
      confirm.disabled = value().length !== 6;
    };
    const fillFrom = text => {
      const digits = String(text).replace(/\D/g, '').slice(0, 6).split('');
      boxes.forEach((box, index) => { box.value = digits[index] || ''; });
      updateSource();
      (boxes[Math.min(digits.length, 5)] || boxes[0]).focus();
    };

    boxes.forEach((box, index) => {
      box.addEventListener('input', () => {
        const digits = box.value.replace(/\D/g, '');
        if (digits.length > 1) { fillFrom(value().slice(0, index) + digits + value().slice(index + 1)); return; }
        box.value = digits;
        updateSource();
        if (digits && index < boxes.length - 1) boxes[index + 1].focus();
      });
      box.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !box.value && index > 0) { boxes[index - 1].value = ''; boxes[index - 1].focus(); updateSource(); }
        if (event.key === 'ArrowLeft' && index > 0) boxes[index - 1].focus();
        if (event.key === 'ArrowRight' && index < boxes.length - 1) boxes[index + 1].focus();
      });
      box.addEventListener('paste', event => { event.preventDefault(); fillFrom(event.clipboardData.getData('text')); });
    });

    // HNB's own code submits as soon as its input receives the sixth digit.
    // This button gives that action an obvious affordance without replacing
    // the banking site's confirmation logic.
    confirm.addEventListener('click', () => {
      if (value().length !== 6) return;
      updateSource();
      confirm.textContent = 'Confirming…';
      confirm.disabled = true;
    });

    source.addEventListener('input', () => {
      const actual = source.value.replace(/\D/g, '').slice(0, 6);
      if (actual !== value()) boxes.forEach((box, index) => { box.value = actual[index] || ''; });
      confirm.disabled = actual.length !== 6;
    });

    source.closest('.dl-confirmation-modal-content__otpinput')?.after(host);
    (source.value || '').split('').forEach((digit, index) => { if (boxes[index]) boxes[index].value = digit; });
    confirm.disabled = value().length !== 6;
    requestAnimationFrame(() => boxes[0].focus());
  }

  function enhance() {
    injectStyle();
    document.querySelectorAll(SOURCE_INPUT).forEach(createOtpView);
  }

  enhance();
  new MutationObserver(enhance).observe(document.documentElement, { childList: true, subtree: true });
})();
