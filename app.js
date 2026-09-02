import { QUESTIONS } from "./questions.js";
import {
  EXAM_DURATION_SECONDS,
  formatDuration,
  gradeAnswers,
  isCorrect,
  resultToCsv,
  validateQuestionBank,
} from "./core.mjs";

const STORAGE_KEY = "code90-state-v1";
const bankErrors = validateQuestionBank(QUESTIONS);
if (bankErrors.length) throw new Error(`문제 데이터 오류: ${bankErrors.join(", ")}`);

const elements = {
  timer: document.querySelector("#timer"),
  saveStatus: document.querySelector("#save-status"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  questionGrid: document.querySelector("#question-grid"),
  questionKicker: document.querySelector("#question-kicker"),
  categoryBadge: document.querySelector("#category-badge"),
  questionNumber: document.querySelector("#question-number"),
  prompt: document.querySelector("#question-prompt"),
  code: document.querySelector("#question-code"),
  form: document.querySelector("#answer-form"),
  feedback: document.querySelector("#feedback"),
  previous: document.querySelector("#previous-button"),
  check: document.querySelector("#check-button"),
  next: document.querySelector("#next-button"),
  submit: document.querySelector("#submit-button"),
  reset: document.querySelector("#reset-button"),
  resultPanel: document.querySelector("#result-panel"),
  scoreValue: document.querySelector("#score-value"),
  scoreSummary: document.querySelector("#score-summary"),
  categoryResults: document.querySelector("#category-results"),
  missedList: document.querySelector("#missed-list"),
  weakness: document.querySelector("#weakness-button"),
  csv: document.querySelector("#csv-button"),
  json: document.querySelector("#json-button"),
  print: document.querySelector("#print-button"),
};

const baseState = {
  version: 1,
  mode: "mock",
  currentIndex: 0,
  answers: {},
  checked: {},
  remainingSeconds: EXAM_DURATION_SECONDS,
  startedAt: null,
  submittedAt: null,
  weaknessIds: null,
};

let state = loadState();
let latestResult = null;
let timerId = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 1) return structuredClone(baseState);
    return { ...structuredClone(baseState), ...saved };
  } catch {
    return structuredClone(baseState);
  }
}

function saveState(message = "자동 저장 완료") {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  elements.saveStatus.textContent = message;
  window.clearTimeout(saveState.statusTimer);
  saveState.statusTimer = window.setTimeout(() => {
    elements.saveStatus.textContent = "브라우저에 자동 저장됨";
  }, 1600);
}

function activeQuestions() {
  if (!state.weaknessIds) return QUESTIONS;
  const ids = new Set(state.weaknessIds);
  return QUESTIONS.filter((question) => ids.has(question.id));
}

function currentQuestion() {
  return activeQuestions()[state.currentIndex];
}

function answerExists(questionId) {
  const value = state.answers[questionId];
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function render() {
  const questions = activeQuestions();
  if (!questions.length) {
    state.weaknessIds = null;
    state.currentIndex = 0;
  }
  state.currentIndex = Math.min(state.currentIndex, activeQuestions().length - 1);
  renderMode();
  renderQuestion();
  renderNavigator();
  renderProgress();
  renderTimer();
}

function renderMode() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === state.mode);
    button.setAttribute("aria-pressed", String(button.dataset.mode === state.mode));
  });
  elements.check.hidden = state.mode === "mock";
}

function renderQuestion() {
  const question = currentQuestion();
  const questions = activeQuestions();
  const globalIndex = QUESTIONS.findIndex((item) => item.id === question.id);
  elements.questionKicker.textContent = `${question.category} · ${String(globalIndex + 1).padStart(2, "0")}`;
  elements.categoryBadge.textContent = question.category;
  elements.questionNumber.textContent = `${state.currentIndex + 1} / ${questions.length}`;
  elements.prompt.textContent = question.prompt;

  if (question.code) {
    elements.code.hidden = false;
    elements.code.querySelector("code").textContent = question.code;
  } else {
    elements.code.hidden = true;
    elements.code.querySelector("code").textContent = "";
  }

  elements.form.replaceChildren();
  if (question.type === "choice") {
    question.options.forEach((option, index) => {
      const label = document.createElement("label");
      label.className = "choice-label";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = String(index);
      input.checked = Number(state.answers[question.id]) === index;
      input.addEventListener("change", () => updateAnswer(question.id, input.value));
      const text = document.createElement("span");
      text.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
      label.append(input, text);
      elements.form.append(label);
    });
  } else {
    const input = document.createElement("input");
    input.className = "text-answer";
    input.type = "text";
    input.autocomplete = "off";
    input.placeholder = "정답을 입력하세요";
    input.setAttribute("aria-label", "단답형 정답");
    input.value = state.answers[question.id] ?? "";
    input.addEventListener("input", () => updateAnswer(question.id, input.value));
    elements.form.append(input);
  }

  const checked = Boolean(state.checked[question.id]);
  elements.feedback.hidden = !checked;
  if (checked) {
    const correct = isCorrect(question, state.answers[question.id]);
    elements.feedback.className = `feedback ${correct ? "correct" : "incorrect"}`;
    elements.feedback.textContent = `${correct ? "정답입니다." : "다시 확인해 보세요."} ${question.explanation}`;
  }

  elements.previous.disabled = state.currentIndex === 0;
  elements.next.disabled = state.currentIndex === questions.length - 1;
}

function renderNavigator() {
  const questions = activeQuestions();
  elements.questionGrid.replaceChildren();
  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "question-jump";
    if (index === state.currentIndex) button.classList.add("is-current");
    if (answerExists(question.id)) button.classList.add("is-answered");
    if (state.checked[question.id]) button.classList.add("is-checked");
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", `${index + 1}번 문제${answerExists(question.id) ? ", 응답함" : ""}`);
    button.addEventListener("click", () => goTo(index));
    elements.questionGrid.append(button);
  });
}

function renderProgress() {
  const questions = activeQuestions();
  const answered = questions.filter((question) => answerExists(question.id)).length;
  const percent = Math.round((answered / questions.length) * 100);
  elements.progressLabel.textContent = `${answered} / ${questions.length}`;
  elements.progressBar.style.width = `${percent}%`;
}

function renderTimer() {
  elements.timer.textContent = state.mode === "mock" ? formatDuration(state.remainingSeconds) : "연습";
  elements.timer.style.background = state.remainingSeconds <= 600 && state.mode === "mock" ? "#8f3028" : "";
}

function updateAnswer(questionId, value) {
  state.answers[questionId] = value;
  delete state.checked[questionId];
  if (!state.startedAt) state.startedAt = new Date().toISOString();
  saveState();
  renderNavigator();
  renderProgress();
}

function goTo(index) {
  state.currentIndex = Math.max(0, Math.min(index, activeQuestions().length - 1));
  saveState("현재 위치 저장");
  renderQuestion();
  renderNavigator();
  document.querySelector("#question-panel").focus({ preventScroll: true });
}

function checkCurrent() {
  const question = currentQuestion();
  state.checked[question.id] = true;
  saveState("채점 결과 저장");
  renderQuestion();
  renderNavigator();
}

function submitAll(reason = "사용자 제출") {
  const questions = activeQuestions();
  latestResult = gradeAnswers(questions, state.answers);
  state.submittedAt = new Date().toISOString();
  for (const question of questions) state.checked[question.id] = true;
  saveState(reason);
  render();
  renderResult(latestResult);
}

function renderResult(result) {
  elements.resultPanel.hidden = false;
  elements.scoreValue.textContent = String(result.percent);
  elements.scoreSummary.textContent = `${result.total}문제 중 ${result.correct}개 정답 · ${result.answered}개 응답`;
  elements.categoryResults.replaceChildren();
  for (const [category, score] of Object.entries(result.categories)) {
    const card = document.createElement("div");
    card.className = "category-card";
    card.innerHTML = `<span>${category}</span><strong>${score.percent}점</strong><span>${score.correct} / ${score.total}</span>`;
    elements.categoryResults.append(card);
  }

  const missed = result.details.filter((detail) => !detail.correct);
  elements.missedList.replaceChildren();
  if (!missed.length) {
    const item = document.createElement("li");
    item.textContent = "모든 문제를 맞혔습니다. 약점보정 세트가 필요하지 않습니다.";
    elements.missedList.append(item);
  } else {
    missed.forEach((detail) => {
      const item = document.createElement("li");
      item.textContent = `[${detail.question.category}] ${detail.question.prompt} — ${detail.question.explanation}`;
      elements.missedList.append(item);
    });
  }
  elements.weakness.disabled = missed.length === 0;
  elements.resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startWeaknessSet() {
  if (!latestResult) return;
  const ids = latestResult.details.filter((detail) => !detail.correct).map((detail) => detail.question.id);
  if (!ids.length) return;
  state.weaknessIds = ids;
  state.currentIndex = 0;
  state.mode = "practice";
  state.checked = {};
  state.submittedAt = null;
  elements.resultPanel.hidden = true;
  saveState("약점보정 세트 시작");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetState() {
  const confirmed = window.confirm("현재 답안·채점·타이머 기록을 모두 초기화할까요?");
  if (!confirmed) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(baseState);
  latestResult = null;
  elements.resultPanel.hidden = true;
  saveState("새 시험 시작");
  startTimer();
  render();
}

function download(name, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function startTimer() {
  window.clearInterval(timerId);
  timerId = window.setInterval(() => {
    if (state.mode !== "mock" || state.submittedAt) return;
    if (!state.startedAt) return;
    state.remainingSeconds = Math.max(0, state.remainingSeconds - 1);
    renderTimer();
    if (state.remainingSeconds % 10 === 0) saveState("시간·답안 자동 저장");
    if (state.remainingSeconds === 0) {
      window.clearInterval(timerId);
      submitAll("제한 시간 종료로 자동 제출");
    }
  }, 1000);
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    state.submittedAt = null;
    if (state.mode === "mock" && state.remainingSeconds <= 0) state.remainingSeconds = EXAM_DURATION_SECONDS;
    saveState("학습 모드 저장");
    render();
  });
});

elements.previous.addEventListener("click", () => goTo(state.currentIndex - 1));
elements.next.addEventListener("click", () => goTo(state.currentIndex + 1));
elements.check.addEventListener("click", checkCurrent);
elements.submit.addEventListener("click", () => submitAll());
elements.reset.addEventListener("click", resetState);
elements.weakness.addEventListener("click", startWeaknessSet);
elements.csv.addEventListener("click", () => latestResult && download("code90-result.csv", "text/csv;charset=utf-8", `\ufeff${resultToCsv(latestResult)}`));
elements.json.addEventListener("click", () => {
  if (!latestResult) return;
  const safeResult = {
    createdAt: new Date().toISOString(),
    score: latestResult.percent,
    correct: latestResult.correct,
    total: latestResult.total,
    categories: latestResult.categories,
    missedQuestionIds: latestResult.details.filter((detail) => !detail.correct).map((detail) => detail.question.id),
  };
  download("code90-result.json", "application/json", JSON.stringify(safeResult, null, 2));
});
elements.print.addEventListener("click", () => window.print());

if (state.submittedAt) {
  latestResult = gradeAnswers(activeQuestions(), state.answers);
  renderResult(latestResult);
}
render();
startTimer();

