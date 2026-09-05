"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const HTML_PATH = path.join(__dirname, "..", "..", "index.html");
const START = "/* ===APP-CORE-START=== */";
const END = "/* ===APP-CORE-END=== */";

function loadHtml() {
  return fs.readFileSync(HTML_PATH, "utf8");
}

function extractCoreScript(html) {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("APP-CORE markers not found in index.html");
  }
  return html.slice(start, end + END.length);
}

/**
 * Run the app's core script in a minimal sandbox (no DOM) and return
 * the pure-logic API attached to window.TL. DOM initialisation is
 * guarded in the script, so this is safe without a browser.
 */
function loadTL() {
  const code = extractCoreScript(loadHtml());
  const sandbox = {
    window: {},
    document: undefined,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "index.html.core.js" });
  return sandbox.window.TL;
}

module.exports = { loadHtml, extractCoreScript, loadTL, HTML_PATH };
