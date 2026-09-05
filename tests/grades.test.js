"use strict";

/* Unit tests (TDD) for the grade statistics logic. */

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTL } = require("./helpers/extract");

const TL = loadTL();

test("gradeStats sums the cohort from the distribution", () => {
  const year = { distribution: { A: 10, B: 20, F: 2 } };
  assert.equal(TL.gradeStats(year, ["F"]).total, 32);
});

test("gradeStats pass rate excludes fail bands", () => {
  const year = { distribution: { A: 10, B: 20, F: 10 } };
  const s = TL.gradeStats(year, ["F"]);
  assert.equal(s.pass, 30);
  assert.equal(s.passRate, 75);
});

test("gradeStats pass rate rounds to one decimal", () => {
  const year = { distribution: { A: 1, F: 2 } };
  assert.equal(TL.gradeStats(year, ["F"]).passRate, 33.3);
});

test("gradeStats identifies the most common band", () => {
  const year = { distribution: { A: 5, B: 12, C: 12, F: 1 } };
  assert.equal(TL.gradeStats(year, ["F"]).modeBand, "B");
});

test("gradeStats returns zeros for an empty distribution", () => {
  const s = TL.gradeStats({ distribution: {} }, ["F"]);
  assert.equal(s.total, 0);
  assert.equal(s.fail, 0);
  assert.equal(s.passRate, 0);
  assert.equal(s.modeBand, null);
});
