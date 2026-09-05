"use strict";
const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
const tags = ["div", "section", "button", "main", "footer", "header", "nav", "ul", "li", "span", "svg", "form", "p", "h1", "h2", "h3", "script", "link", "style", "a"];
const bad = [];
for (const t of tags) {
  const open = (h.match(new RegExp("<" + t + "(\\s|>)", "g")) || []).length;
  const close = (h.match(new RegExp("</" + t + ">", "g")) || []).length;
  if (open !== close) bad.push(t + ":" + open + "/" + close);
}
console.log(bad.length ? "UNBALANCED " + bad.join(", ") : "All tags balanced");
console.log("script tags:", (h.match(/<script/g) || []).length);
console.log("stylesheet links:", (h.match(/rel="stylesheet"/g) || []).length);
console.log("bytes:", Buffer.byteLength(h, "utf8"));
