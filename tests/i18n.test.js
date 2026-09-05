"use strict";

/* i18n tests: every UI string must exist in every shipped language,
   lookups must fall back safely, and placeholders must substitute. */

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadHtml, loadTL } = require("./helpers/extract");

const html = loadHtml();
const TL = loadTL();

test("every English UI string has a Chinese translation", () => {
  const en = TL.LANGS.en;
  const zh = TL.LANGS.zh;
  Object.keys(en).forEach((k) => {
    assert.ok(k in zh, "missing zh key: " + k);
  });
});

test("t() falls back to English, then to the key itself", () => {
  assert.equal(TL.t("lang.other", "zh"), "English");
  assert.equal(TL.t("site.title", "en"), "T&L@Biomed — course hub");
  assert.equal(TL.t("site.title", "zh"), "T&L@Biomed — 課程中心");
  assert.equal(TL.t("no.such.key", "zh"), "no.such.key");
});

test("fmt() substitutes placeholders in both languages", () => {
  assert.equal(TL.fmt("quiz.qnum", { c: 2, t: 10 }, "en"), "Question 2 of 10");
  assert.equal(TL.fmt("quiz.qnum", { c: 2, t: 10 }, "zh"), "第 2 題，共 10 題");
  assert.equal(TL.fmt("notes.none", { q: "x" }, "zh"), "沒有符合「x」的筆記。");
  assert.equal(TL.fmt("quiz.finished", { t: "1:07" }, "en"), "Finished in 1:07");
});

test("every data-i18n key used in the markup exists in both languages", () => {
  const used = new Set();
  (html.match(/data-i18n(?:-ph)?="([^"]+)"/g) || []).forEach((m) => {
    const key = m.replace(/data-i18n(?:-ph)?="/, "").replace(/"$/, "");
    used.add(key);
  });
  assert.ok(used.size > 0, "no data-i18n keys found");
  used.forEach((k) => {
    assert.ok(k in TL.LANGS.en, "en missing markup key: " + k);
    assert.ok(k in TL.LANGS.zh, "zh missing markup key: " + k);
  });
});
