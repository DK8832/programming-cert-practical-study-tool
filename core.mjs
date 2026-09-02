export const EXAM_DURATION_SECONDS = 90 * 60;

export function normalizeAnswer(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/;$/, "");
}

export function isCorrect(question, value) {
  if (question.type === "choice") {
    return Number(value) === Number(question.answer);
  }

  const normalized = normalizeAnswer(value);
  return question.answers.some((answer) => normalizeAnswer(answer) === normalized);
}

export function gradeAnswers(questions, answers) {
  const details = questions.map((question) => {
    const value = answers[question.id];
    const answered = value !== undefined && value !== null && String(value).trim() !== "";
    const correct = answered && isCorrect(question, value);
    return { question, value, answered, correct };
  });

  const categoryNames = [...new Set(questions.map((question) => question.category))];
  const categories = Object.fromEntries(
    categoryNames.map((category) => {
      const rows = details.filter((detail) => detail.question.category === category);
      const correct = rows.filter((detail) => detail.correct).length;
      return [category, { total: rows.length, correct, percent: Math.round((correct / rows.length) * 100) }];
    }),
  );

  const correct = details.filter((detail) => detail.correct).length;
  const answered = details.filter((detail) => detail.answered).length;
  return {
    total: questions.length,
    answered,
    correct,
    percent: Math.round((correct / questions.length) * 100),
    categories,
    details,
  };
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function resultToCsv(result) {
  const header = ["번호", "영역", "문제", "입력 답", "정답 여부", "해설"];
  const rows = result.details.map((detail, index) => [
    index + 1,
    detail.question.category,
    detail.question.prompt,
    detail.value ?? "",
    detail.correct ? "정답" : detail.answered ? "오답" : "미응답",
    detail.question.explanation,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function validateQuestionBank(questions) {
  const ids = new Set();
  const errors = [];
  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`중복 ID: ${question.id}`);
    ids.add(question.id);
    if (!question.prompt || !question.category || !question.explanation) {
      errors.push(`필수 필드 누락: ${question.id}`);
    }
    if (question.type === "choice") {
      if (!Array.isArray(question.options) || question.options.length < 2) errors.push(`선택지 부족: ${question.id}`);
      if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer >= question.options.length) {
        errors.push(`정답 인덱스 오류: ${question.id}`);
      }
    } else if (!Array.isArray(question.answers) || question.answers.length === 0) {
      errors.push(`단답형 정답 누락: ${question.id}`);
    }
  }
  return errors;
}

