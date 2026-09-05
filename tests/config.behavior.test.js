"use strict";

/* Behaviour tests (BDD) for the shipped course configuration.
   Run `npm test` after editing SITE_CONFIG — these guard the data
   you publish so a typo cannot ship to students. */

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { loadTL } = require("./helpers/extract");

const TL = loadTL();
const cfg = TL.getConfig();

describe("course config", () => {
  it("exposes quiz, grades, notes and tutorials blocks", () => {
    assert.ok(Array.isArray(cfg.quiz.questions));
    assert.ok(Array.isArray(cfg.grades.years));
    assert.ok(Array.isArray(cfg.notes));
    assert.ok(Array.isArray(cfg.tutorials));
  });

  it("keeps sample flags as booleans", () => {
    assert.equal(typeof cfg.quiz.sample, "boolean");
    assert.equal(typeof cfg.grades.sample, "boolean");
  });

  it("has a passcode configured (private sections gated)", () => {
    assert.equal(typeof cfg.passcode, "string");
    assert.notEqual(cfg.passcode.trim(), "");
  });
});

describe("mock quiz data", () => {
  it("gives every question a non-empty prompt", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(q.prompt && q.prompt.trim().length > 0, "question " + q.id);
    });
  });

  it("gives every question between 2 and 6 options", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(q.options.length >= 2 && q.options.length <= 6, "question " + q.id);
    });
  });

  it("points answerIndex at an existing option", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.options.length, "question " + q.id);
    });
  });

  it("keeps question ids unique", () => {
    const ids = cfg.quiz.questions.map((q) => q.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("provides an explanation for every question", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(q.explanation && q.explanation.trim().length > 0, "question " + q.id);
    });
  });

  it("has no duplicate option text within a question", () => {
    cfg.quiz.questions.forEach((q) => {
      const keys = q.options.map((o) => o.trim().toLowerCase());
      assert.equal(new Set(keys).size, keys.length, "question " + q.id);
    });
  });
});

describe("grade distribution data", () => {
  it("gives every year a non-empty distribution", () => {
    cfg.grades.years.forEach((y) => {
      assert.ok(Object.keys(y.distribution || {}).length > 0, y.year);
    });
  });

  it("keeps every cohort at 1 or more students", () => {
    cfg.grades.years.forEach((y) => {
      assert.ok(Number.isInteger(y.cohort) && y.cohort >= 1, y.year);
    });
  });

  it("sums each year's distribution to its stated cohort", () => {
    cfg.grades.years.forEach((y) => {
      const sum = Object.values(y.distribution).reduce((a, b) => a + b, 0);
      assert.equal(sum, y.cohort, y.year + " counts do not match cohort");
    });
  });

  it("uses non-negative integer counts", () => {
    cfg.grades.years.forEach((y) => {
      Object.values(y.distribution).forEach((n) => {
        assert.ok(Number.isInteger(n) && n >= 0, y.year);
      });
    });
  });

  it("lists fail bands that actually exist somewhere in the data", () => {
    const all = new Set();
    cfg.grades.years.forEach((y) => Object.keys(y.distribution).forEach((b) => all.add(b)));
    cfg.grades.failBands.forEach((b) => {
      assert.ok(all.has(b), "fail band " + b + " not present in any year");
    });
  });
});

describe("links in notes and tutorials", () => {
  it("keeps every note url well-formed http(s)", () => {
    cfg.notes.forEach((n) => {
      assert.match(n.url, /^https?:\/\/\S+$/, "note " + n.title);
    });
  });

  it("keeps every tutorial item url well-formed http(s)", () => {
    cfg.tutorials.forEach((g) => {
      (g.items || []).forEach((i) => {
        assert.match(i.url, /^https?:\/\/\S+$/, "tutorial item " + i.title);
      });
    });
  });

  it("gives every note and tutorial item a title", () => {
    cfg.notes.forEach((n) => assert.ok(n.title && n.title.trim(), "note"));
    cfg.tutorials.forEach((g) => {
      assert.ok(g.topic && g.topic.trim(), "tutorial group");
      (g.items || []).forEach((i) => assert.ok(i.title && i.title.trim(), "tutorial item"));
    });
  });
});
