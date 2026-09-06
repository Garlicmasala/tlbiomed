"use strict";

/* Smoke tests: the shipped page must be a single self-contained
   file that follows the locked dependency whitelist. */

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadHtml, loadTL, loadPaper } = require("./helpers/extract");

const html = loadHtml();
const TL = loadTL();
const paper = loadPaper();

test("index.html exists and starts with a doctype", () => {
  assert.match(html, /^<!DOCTYPE html>/i);
  assert.match(html, /<html lang="en">/);
});

test("exposes the four course tabs as routes", () => {
  ["notes", "quiz", "grades", "tutorials"].forEach((r) => {
    assert.ok(html.includes('data-route="' + r + '"'), "missing route " + r);
  });
});

test("exposes the interactive feature elements", () => {
  [
    "quiz-timer", "quiz-stats", "res-ring", "res-time",
    "notes-filter", "tutorials-filter",
    "grade-mode-seg", "grade-table",
    "toast-wrap", "theme-btn", "copy-link-btn", "lang-btn"
  ].forEach((id) => {
    assert.ok(html.includes('id="' + id + '"'), "missing id " + id);
  });
});

test("is a single self-contained file (no non-URL asset references)", () => {
  const localRefs = html.match(/(?:href|src)="(?!https?:\/\/|data:)[^"]*"/g) || [];
  assert.deepEqual(localRefs, [], "found non-URL asset references: " + localRefs.join(", "));
});

test("echarts is loaded from the locked jsDelivr URL with SRI and crossorigin", () => {
  const tag = html.match(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/echarts@5\.6\.0\/dist\/echarts\.min\.js"[^>]*><\/script>/);
  assert.ok(tag, "echarts script tag missing or version changed");
  assert.ok(tag[0].includes('integrity="sha384-pPi0zxBAoDu6+JXW/C68UZLvBUUtU+7zonhif43rqj7pxsGyqyqzcian2Rj37Rss"'), "SRI mismatch");
  assert.ok(tag[0].includes('crossorigin="anonymous"'), "crossorigin missing");
});

test("stylesheets are served only from the allowed font mirror", () => {
  const links = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
  assert.ok(links.length >= 1, "no stylesheet links found");
  links.forEach((l) => {
    assert.ok(l.includes("miaoda.feishu.cn/fonts/css2"), "disallowed stylesheet: " + l);
  });
});

test("contains no emoji anywhere in the file", () => {
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
  assert.equal(emoji.test(html), false);
});

test("forbids scrollIntoView and type=module", () => {
  assert.equal(html.includes("scrollIntoView"), false);
  assert.equal(html.includes('type="module"'), false);
});

test("core script exposes the pure-logic API used by the tests", () => {
  ["evaluateQuestion", "computeScore", "gradeStats", "bandSort", "getConfig"].forEach((fn) => {
    assert.equal(typeof TL[fn], "function", "missing TL." + fn);
  });
});

test("no bare local paths in the markup", () => {
  assert.equal(html.includes('src="/'), false);
  assert.equal(html.includes('href="/'), false);
  assert.equal(html.includes("file://"), false);
});

/* --- paper.html (technical report) --- */

test("paper.html exists and starts with a doctype", () => {
  assert.match(paper, /^<!DOCTYPE html>/i);
  assert.ok(paper.includes("T&amp;L@Biomed"));
  assert.ok(paper.includes("Technical Report"));
});

test("paper.html is self-contained (no local asset references)", () => {
  const localRefs = paper.match(/(?:href|src)="(?!https?:\/\/|data:|#)[^"]*"/g) || [];
  assert.deepEqual(localRefs, [], "found non-URL asset references: " + localRefs.join(", "));
});

test("paper.html uses the locked ECharts CDN with SRI", () => {
  const tag = paper.match(/<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/echarts@5\.6\.0\/dist\/echarts\.min\.js"[^>]*><\/script>/);
  assert.ok(tag, "echarts script tag missing or version changed");
  assert.ok(tag[0].includes('integrity="sha384-pPi0zxBAoDu6+JXW/C68UZLvBUUtU+7zonhif43rqj7pxsGyqyqzcian2Rj37Rss"'), "SRI mismatch");
});

test("paper.html stylesheets only from the allowed font mirror", () => {
  const links = paper.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || [];
  assert.ok(links.length >= 1, "no stylesheet links found");
  links.forEach((l) => {
    assert.ok(l.includes("miaoda.feishu.cn/fonts/css2"), "disallowed stylesheet: " + l);
  });
});
