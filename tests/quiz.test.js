"use strict";

/* Unit tests (TDD) for the pure quiz logic. */

const test = require("node:test");
const assert = require("node:assert/strict");
const { loadTL } = require("./helpers/extract");

const TL = loadTL();

test("evaluateQuestion marks a matching index as correct", () => {
  const q = { id: "q1", answerIndex: 2 };
  const res = TL.evaluateQuestion(q, 2);
  assert.equal(res.correct, true);
  assert.equal(res.answerIndex, 2);
});

test("evaluateQuestion marks a non-matching index as incorrect", () => {
  const q = { id: "q1", answerIndex: 2 };
  const res = TL.evaluateQuestion(q, 0);
  assert.equal(res.correct, false);
  assert.equal(res.answerIndex, 2);
});

test("computeScore tallies correct answers and total", () => {
  const questions = [
    { id: "a", answerIndex: 0 },
    { id: "b", answerIndex: 1 },
    { id: "c", answerIndex: 2 }
  ];
  const res = TL.computeScore(questions, { a: 0, b: 0, c: 2 });
  assert.equal(res.correct, 2);
  assert.equal(res.total, 3);
});

test("computeScore percent rounds to one decimal", () => {
  const questions = [
    { id: "a", answerIndex: 0 },
    { id: "b", answerIndex: 1 },
    { id: "c", answerIndex: 2 }
  ];
  assert.equal(TL.computeScore(questions, { a: 0 }).percent, 33.3);
  assert.equal(TL.computeScore(questions, {}).percent, 0);
  assert.equal(TL.computeScore(questions, { a: 0, b: 1, c: 2 }).percent, 100);
});

test("computeScore handles an empty question list", () => {
  const res = TL.computeScore([], {});
  assert.equal(res.correct, 0);
  assert.equal(res.total, 0);
  assert.equal(res.percent, 0);
});

test("bandSort orders A+ > A > A- > B+ > B > B- > ... > F", () => {
  const input = ["F", "B", "A-", "A+", "A", "B+", "C", "D", "B-"];
  assert.deepEqual(TL.bandSort(input), ["A+", "A", "A-", "B+", "B", "B-", "C", "D", "F"]);
});

test("bandSort leaves unknown bands after the standard ones, sorted", () => {
  assert.deepEqual(TL.bandSort(["X", "A", "Y"]), ["A", "X", "Y"]);
});
