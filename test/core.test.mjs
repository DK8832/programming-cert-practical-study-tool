import test from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS } from "../questions.js";
import {
  EXAM_DURATION_SECONDS,
  csvEscape,
  formatDuration,
  gradeAnswers,
  isCorrect,
  resultToCsv,
  validateQuestionBank,
} from "../core.mjs";

test("문제 수와 영역별 구성이 계획과 일치한다", () => {
  assert.equal(QUESTIONS.length, 50);
  const counts = Object.groupBy(QUESTIONS, (question) => question.category);
  assert.equal(counts.SQL.length, 20);
  assert.equal(counts.Python.length, 10);
  assert.equal(counts.Java.length, 10);
  assert.equal(counts.Linux.length, 10);
  assert.deepEqual(validateQuestionBank(QUESTIONS), []);
});

test("선택형과 단답형 정답 판정이 동작한다", () => {
  assert.equal(isCorrect(QUESTIONS[0], 1), true);
  assert.equal(isCorrect(QUESTIONS[0], 0), false);
  const textQuestion = QUESTIONS.find((question) => question.id === "linux-10");
  assert.equal(isCorrect(textQuestion, "  ~  "), true);
});

test("전체 정답과 미응답 점수가 정확히 계산된다", () => {
  const correctAnswers = Object.fromEntries(
    QUESTIONS.map((question) => [question.id, question.type === "choice" ? question.answer : question.answers[0]]),
  );
  const full = gradeAnswers(QUESTIONS, correctAnswers);
  assert.equal(full.correct, 50);
  assert.equal(full.percent, 100);
  assert.equal(full.categories.SQL.percent, 100);

  const empty = gradeAnswers(QUESTIONS, {});
  assert.equal(empty.answered, 0);
  assert.equal(empty.correct, 0);
  assert.equal(empty.percent, 0);
});

test("시간 표기와 CSV 이스케이프가 경계값을 처리한다", () => {
  assert.equal(EXAM_DURATION_SECONDS, 5400);
  assert.equal(formatDuration(5400), "90:00");
  assert.equal(formatDuration(-1), "00:00");
  assert.equal(csvEscape('a,"b"'), '"a,""b"""');

  const result = gradeAnswers(QUESTIONS.slice(0, 2), {});
  const csv = resultToCsv(result);
  assert.match(csv, /번호,영역,문제/);
  assert.match(csv, /미응답/);
});

