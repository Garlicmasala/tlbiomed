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

  it("keeps quiz shuffle flags as booleans when present", () => {
    if ("shuffle" in cfg.quiz) assert.equal(typeof cfg.quiz.shuffle, "boolean");
    if ("shuffleOptions" in cfg.quiz) assert.equal(typeof cfg.quiz.shuffleOptions, "boolean");
  });

  it("has a passcode configured (private sections gated)", () => {
    assert.equal(typeof cfg.passcode, "string");
    assert.notEqual(cfg.passcode.trim(), "");
  });

  it("declares a supported default language", () => {
    assert.ok(cfg.language && cfg.language.default, "language config missing");
    assert.ok(TL.LANGS[cfg.language.default], "unsupported default language: " + cfg.language.default);
    if ("detect" in cfg.language) assert.equal(typeof cfg.language.detect, "boolean");
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

  it("ships a reasonable sample bank (at least 8 questions)", () => {
    assert.ok(cfg.quiz.questions.length >= 8, "only " + cfg.quiz.questions.length + " questions");
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

describe("quiz taxonomy (topic & difficulty)", () => {
  it("gives every question a topic from the declared subject set", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(q.topic && typeof q.topic === "string" && q.topic.trim() !== "", "question " + q.id);
      assert.ok(TL.LANGS.en["quiz.topic." + q.topic], "unknown topic " + q.topic + " (question " + q.id + ")");
    });
  });

  it("gives every question a valid difficulty band", () => {
    const valid = ["basic", "intermediate", "advanced"];
    cfg.quiz.questions.forEach((q) => {
      assert.ok(valid.indexOf(q.difficulty) !== -1, "question " + q.id + " difficulty " + q.difficulty);
    });
  });

  it("represents all three difficulty bands", () => {
    const bands = new Set(cfg.quiz.questions.map((q) => q.difficulty));
    ["basic", "intermediate", "advanced"].forEach((b) => assert.ok(bands.has(b), "missing band " + b));
  });

  it("covers a healthy spread of distinct topics (at least 15)", () => {
    const topics = new Set(cfg.quiz.questions.map((q) => q.topic));
    assert.ok(topics.size >= 15, "only " + topics.size + " distinct topics");
  });

  it("provides English labels for every topic used", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(TL.LANGS.en["quiz.topic." + q.topic], "en label missing for " + q.topic);
    });
  });

  it("provides Traditional-Chinese labels for every topic used", () => {
    cfg.quiz.questions.forEach((q) => {
      assert.ok(TL.LANGS.zh["quiz.topic." + q.topic], "zh label missing for " + q.topic);
    });
  });

  it("provides bilingual labels for the three difficulty bands", () => {
    ["quiz.diffBasic", "quiz.diffInter", "quiz.diffAdv"].forEach((k) => {
      assert.ok(TL.LANGS.en[k], "en missing " + k);
      assert.ok(TL.LANGS.zh[k], "zh missing " + k);
    });
  });

  it("keeps every topic label key in use", () => {
    const used = new Set(cfg.quiz.questions.map((q) => "quiz.topic." + q.topic));
    Object.keys(TL.LANGS.en).forEach((k) => {
      if (k.indexOf("quiz.topic.") === 0) assert.ok(used.has(k), "unused topic key " + k);
    });
  });

  it("resolves custom subject labels from SITE_CONFIG.quiz.topics", () => {
    const map = { "_demo-sub": { en: "Demo Subject", zh: "示範科目" } };
    assert.equal(TL.topicLabelFor("_demo-sub", "en", map), "Demo Subject");
    assert.equal(TL.topicLabelFor("_demo-sub", "zh", map), "示範科目");
    assert.ok(TL.hasTopicLabel("_demo-sub", "en", map) && TL.hasTopicLabel("_demo-sub", "zh", map));
    assert.equal(TL.topicLabelFor("_demo-sub", "en", {}), "demo sub", "falls back when map lacks the id");
    assert.ok(cfg.quiz.topics && typeof cfg.quiz.topics === "object" && !Array.isArray(cfg.quiz.topics), "quiz.topics config slot exists");
  });

  it("falls back to LANGS labels for built-in subjects not listed in quiz.topics", () => {
    assert.equal(TL.topicLabelFor("cell-bio", "en"), "Cell biology");
    assert.equal(TL.topicLabelFor("cell-bio", "zh"), "細胞生物學");
    assert.equal(TL.topicLabelFor("virology", "en"), "Virology");
    assert.equal(TL.topicLabelFor("virology", "zh"), "病毒學");
  });

  it("renders a readable fallback for an unknown subject id", () => {
    assert.equal(TL.topicLabelFor("neural-crest", "en"), "neural crest");
  });
});
