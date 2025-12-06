/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import * as quizzesClient from "../../client";
import { setQuizzes } from "../../reducer";
import type { Quiz } from "../../reducer";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | "TA" | string;

type CurrentUser = { _id?: string; role?: Role } | null;

type RootState = {
  quizzesReducer: { quizzes: Quiz[] };
  accountReducer: { currentUser: CurrentUser };
};

type PersistedChoice = {
  text?: string;
  correct?: boolean;
};

type PersistedBlank = string | { text?: string };

type PersistedQuizQuestion = {
  _id?: string;
  title?: string;
  questionText?: string;
  question?: string;
  type?: string;
  questionType?: string;
  points?: number;
  choices?: PersistedChoice[];
  trueFalseAnswer?: string | boolean;
  blanks?: PersistedBlank[];
};

type QuizWithQuestions = Quiz & {
  questions?: PersistedQuizQuestion[];
};

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";

type MultipleChoiceOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type QuestionForPreview = {
  id: string;
  title: string;
  prompt: string;
  questionType: QuestionType;
  points: number;
  multipleChoiceOptions: MultipleChoiceOption[];
  trueFalseAnswer: "TRUE" | "FALSE";
  acceptableFillBlankAnswers: string[];
};

type StudentAnswer = {
  questionId: string;
  answerType: QuestionType;
  selectedChoiceId?: string;
  trueFalseSelection?: "TRUE" | "FALSE";
  fillBlankResponse?: string;
};

type AnswerEvaluation = {
  questionId: string;
  isCorrect: boolean;
  earnedPoints: number;
};

type QuizAttemptRecord = {
  _id?: string;
  quiz: string;
  student: string;
  attemptNumber: number;
  submittedAt: string;
  score: number;
  maxScore: number;
  answers: {
    questionId: string;
    answerType: QuestionType;
    selectedChoiceId?: string;
    trueFalseSelection?: "TRUE" | "FALSE";
    fillBlankResponse?: string;
    isCorrect: boolean;
    earnedPoints: number;
  }[];
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  FILL_BLANK: "Fill in the Blank",
};

const generateStableId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const normalizePersistedType = (rawType?: string): QuestionType => {
  if (!rawType) return "MULTIPLE_CHOICE";
  const compact = rawType.replace(/[\s_-]/g, "").toUpperCase();
  if (compact === "TRUEFALSE") return "TRUE_FALSE";
  if (compact === "FILLINTHEBLANK" || compact === "FILLBLANK") {
    return "FILL_BLANK";
  }
  return "MULTIPLE_CHOICE";
};

const convertChoices = (
  choices?: PersistedChoice[]
): MultipleChoiceOption[] => {
  if (!Array.isArray(choices) || choices.length === 0) {
    return [
      { id: generateStableId("choice"), text: "Option 1", isCorrect: true },
      { id: generateStableId("choice"), text: "Option 2", isCorrect: false },
    ];
  }
  const mapped = choices.map((choice, index) => ({
    id: generateStableId("choice"),
    text: choice?.text ?? `Choice ${index + 1}`,
    isCorrect: Boolean(choice?.correct),
  }));
  if (!mapped.some((choice) => choice.isCorrect)) {
    mapped[0].isCorrect = true;
  }
  return mapped;
};

const convertTrueFalseAnswer = (
  answer?: string | boolean
): "TRUE" | "FALSE" => {
  if (typeof answer === "string") {
    return answer.trim().toUpperCase() === "FALSE" ? "FALSE" : "TRUE";
  }
  return answer === false ? "FALSE" : "TRUE";
};

const convertBlanks = (blanks?: PersistedBlank[]): string[] => {
  if (!Array.isArray(blanks) || blanks.length === 0) {
    return [];
  }
  return blanks
    .map((blank, index) =>
      typeof blank === "string" ? blank : blank?.text ?? `Answer ${index + 1}`
    )
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0);
};

const convertQuestionForPreview = (
  question: PersistedQuizQuestion,
  index: number
): QuestionForPreview => {
  const questionType = normalizePersistedType(
    question?.type ?? question?.questionType
  );
  const prompt = question?.questionText ?? question?.question ?? "";

  // Use persisted subdocument _id if present; otherwise fall back to
  // a stable index-based ID so attempts can hydrate reliably.
  const stableId =
    (question as any)?._id?.toString?.() ?? `q-${index}`;

  return {
    id: stableId,
    title: question?.title ?? "Question",
    prompt,
    questionType,
    points: Number(question?.points ?? 0),
    multipleChoiceOptions: convertChoices(question?.choices),
    trueFalseAnswer: convertTrueFalseAnswer(question?.trueFalseAnswer),
    acceptableFillBlankAnswers: convertBlanks(question?.blanks),
  };
};

const convertQuizQuestionsForPreview = (
  quiz?: QuizWithQuestions
): QuestionForPreview[] => {
  if (!quiz?.questions) {
    return [];
  }
  return quiz.questions.map((question, index) =>
    convertQuestionForPreview(question, index)
  );
};

const computeInitialAnswers = (
  questions: QuestionForPreview[]
): StudentAnswer[] =>
  questions.map((question) => ({
    questionId: question.id,
    answerType: question.questionType,
    selectedChoiceId: undefined,
    // Don't pre-select True/False; start unanswered
    trueFalseSelection: undefined,
    fillBlankResponse: "",
  }));

const evaluateAnswers = (
  questions: QuestionForPreview[],
  answers: StudentAnswer[]
): AnswerEvaluation[] =>
  questions.map((question) => {
    const answer = answers.find(
      (studentAnswer) => studentAnswer.questionId === question.id
    );
    if (!answer) {
      return { questionId: question.id, isCorrect: false, earnedPoints: 0 };
    }

    let isCorrect = false;
    if (question.questionType === "MULTIPLE_CHOICE") {
      const selected = question.multipleChoiceOptions.find(
        (option) => option.id === answer.selectedChoiceId
      );
      isCorrect = Boolean(selected?.isCorrect);
    } else if (question.questionType === "TRUE_FALSE") {
      isCorrect = answer.trueFalseSelection === question.trueFalseAnswer;
    } else {
      const studentResponse = (answer.fillBlankResponse ?? "")
        .trim()
        .toLowerCase();
      isCorrect = question.acceptableFillBlankAnswers.some(
        (acceptable) => acceptable.trim().toLowerCase() === studentResponse
      );
    }

    return {
      questionId: question.id,
      isCorrect,
      earnedPoints: isCorrect ? question.points : 0,
    };
  });

const computeScoreSummary = (
  evaluations: AnswerEvaluation[],
  questions: QuestionForPreview[]
) => {
  const earnedPoints = evaluations.reduce(
    (sum, evaluation) => sum + evaluation.earnedPoints,
    0
  );
  const maxPoints = questions.reduce(
    (sum, question) => sum + question.points,
    0
  );
  return { earnedPoints, maxPoints };
};

const isQuestionAnswered = (
  question: QuestionForPreview,
  answer?: StudentAnswer
): boolean => {
  if (!answer) return false;
  if (question.questionType === "MULTIPLE_CHOICE") {
    return !!answer.selectedChoiceId;
  }
  if (question.questionType === "TRUE_FALSE") {
    return !!answer.trueFalseSelection;
  }
  return !!answer.fillBlankResponse && answer.fillBlankResponse.trim().length > 0;
};

export default function QuizPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialIntent: "start" | "review" =
    modeParam === "review" ? "review" : "start";

  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const dispatch = useDispatch();

  const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
  const { currentUser } = useSelector(
    (state: RootState) => state.accountReducer
  );

  const quizFromStore = useMemo<QuizWithQuestions | undefined>(
    () =>
      quizzes.find((quiz) => quiz._id === qid) as
        | QuizWithQuestions
        | undefined,
    [quizzes, qid]
  );

  const [loadedQuiz, setLoadedQuiz] = useState<QuizWithQuestions | null>(
    quizFromStore ?? null
  );
  const [questions, setQuestions] = useState<QuestionForPreview[]>(
    () => convertQuizQuestionsForPreview(quizFromStore)
  );
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>(() =>
    computeInitialAnswers(convertQuizQuestionsForPreview(quizFromStore))
  );
  const [answerEvaluations, setAnswerEvaluations] = useState<
    AnswerEvaluation[] | null
  >(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState(false);
  const [hasLoadedAttempts, setHasLoadedAttempts] = useState(false);

  const [mode, setMode] = useState<"VIEW_LAST_ATTEMPT" | "TAKE_NEW_ATTEMPT">(
    initialIntent === "review" ? "VIEW_LAST_ATTEMPT" : "TAKE_NEW_ATTEMPT"
  );

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [lockedQuestionIds, setLockedQuestionIds] = useState<string[]>([]);

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number | null>(
    null
  );
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const role = currentUser?.role;
  const isStudent = role === "STUDENT";
  const isTA = role === "TA";
  const isFaculty = role === "FACULTY" || role === "ADMIN";
  const isStaffPreview = !isStudent; // faculty or TA

  // Load quiz if direct nav
  useEffect(() => {
    if (!qid || quizFromStore) return;
    const loadQuiz = async () => {
      try {
        setIsLoadingQuiz(true);
        const fetchedQuiz = (await quizzesClient.findQuizById(
          qid
        )) as QuizWithQuestions;
        setLoadedQuiz(fetchedQuiz);
        const previewQuestions = convertQuizQuestionsForPreview(fetchedQuiz);
        setQuestions(previewQuestions);
        setStudentAnswers(computeInitialAnswers(previewQuestions));
        setCurrentQuestionIndex(0);
        setLockedQuestionIds([]);
        setAnswerEvaluations(null);
        dispatch(setQuizzes([fetchedQuiz]));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setIsLoadingQuiz(false);
      }
    };
    loadQuiz();
  }, [qid, quizFromStore, dispatch]);

  // Keep local quiz/questions in sync with store
  useEffect(() => {
    if (!quizFromStore) return;
    setLoadedQuiz(quizFromStore);
    const previewQuestions = convertQuizQuestionsForPreview(quizFromStore);
    setQuestions(previewQuestions);
    setStudentAnswers(computeInitialAnswers(previewQuestions));
    setCurrentQuestionIndex(0);
    setLockedQuestionIds([]);
    setAnswerEvaluations(null);
  }, [quizFromStore]);

  const hydrateFromAttempt = (
    attempt: QuizAttemptRecord,
    baseQuestions: QuestionForPreview[]
  ) => {
    const hydratedAnswers: StudentAnswer[] = baseQuestions.map((question) => {
      const stored = attempt.answers.find(
        (a) => a.questionId === question.id
      );
      if (!stored) {
        return {
          questionId: question.id,
          answerType: question.questionType,
          selectedChoiceId: undefined,
          trueFalseSelection: undefined,
          fillBlankResponse: "",
        };
      }
      return {
        questionId: question.id,
        answerType: stored.answerType as QuestionType,
        selectedChoiceId: stored.selectedChoiceId,
        trueFalseSelection:
          (stored.trueFalseSelection as "TRUE" | "FALSE" | undefined) ??
          undefined,
        fillBlankResponse: stored.fillBlankResponse ?? "",
      };
    });

    const hydratedEvaluations: AnswerEvaluation[] = baseQuestions.map(
      (question) => {
        const stored = attempt.answers.find(
          (a) => a.questionId === question.id
        );
        if (!stored) {
          return {
            questionId: question.id,
            isCorrect: false,
            earnedPoints: 0,
          };
        }
        return {
          questionId: question.id,
          isCorrect: Boolean(stored.isCorrect),
          earnedPoints: Number(stored.earnedPoints ?? 0),
        };
      }
    );

    setStudentAnswers(hydratedAnswers);
    setAnswerEvaluations(hydratedEvaluations);
    setCurrentQuestionIndex(0);
    setLockedQuestionIds([]);
  };

  // Load attempts for STUDENT
  useEffect(() => {
    const loadAttempts = async () => {
      if (!isStudent) return;
      if (!qid || !currentUser?._id) return;
      if (!loadedQuiz) return;
      if (!questions.length) return;
      if (hasLoadedAttempts) return;

      try {
        setIsLoadingAttempts(true);
        const data =
          (await quizzesClient.findAttemptsForQuizAndStudent(
            qid,
            currentUser._id
          )) ?? [];
        const arr: QuizAttemptRecord[] = Array.isArray(data) ? data : [];
        arr.sort(
          (a, b) =>
            (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0) ||
            new Date(a.submittedAt).getTime() -
              new Date(b.submittedAt).getTime()
        );
        setAttempts(arr);

        if (arr.length > 0) {
          const last = arr[arr.length - 1];

          const multipleAttemptsEnabled =
            (loadedQuiz.multipleAttempts ?? "No")
              .toString()
              .toUpperCase() === "YES";
          const allowed =
            typeof loadedQuiz.allowedAttempts === "number" &&
            loadedQuiz.allowedAttempts > 0
              ? loadedQuiz.allowedAttempts
              : 1;
          const maxAttempts = multipleAttemptsEnabled ? allowed : 1;
          const attemptsRemaining = Math.max(0, maxAttempts - arr.length);
          const outOfAttempts = attemptsRemaining <= 0;

          if (initialIntent === "review" || outOfAttempts) {
            hydrateFromAttempt(last, questions);
            setMode("VIEW_LAST_ATTEMPT");
          } else {
            // initialIntent === "start" and there ARE attempts left:
            // stay in TAKE_NEW_ATTEMPT, leave answers blank
            setAnswerEvaluations(null);
            setMode("TAKE_NEW_ATTEMPT");
          }
        } else {
          // no attempts: always start fresh
          setAnswerEvaluations(null);
          setMode("TAKE_NEW_ATTEMPT");
        }

        setHasLoadedAttempts(true);
      } catch (err) {
        console.error("Failed to load quiz attempts:", err);
      } finally {
        setIsLoadingAttempts(false);
      }
    };
    loadAttempts();
  }, [
    isStudent,
    qid,
    currentUser,
    loadedQuiz,
    questions,
    hasLoadedAttempts,
    initialIntent,
  ]);

  const totalPoints = useMemo(
    () => questions.reduce((sum, question) => sum + question.points, 0),
    [questions]
  );

  const attemptsCount = isStudent ? attempts.length : 0;
  const multipleAttemptsEnabled =
    loadedQuiz && typeof loadedQuiz.multipleAttempts === "string"
      ? loadedQuiz.multipleAttempts.toUpperCase() === "YES"
      : false;
  const allowedAttempts =
    loadedQuiz &&
    typeof loadedQuiz.allowedAttempts === "number" &&
    loadedQuiz.allowedAttempts > 0
      ? loadedQuiz.allowedAttempts
      : 1;
  const maxAttempts = multipleAttemptsEnabled ? allowedAttempts : 1;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsCount);
  const studentOutOfAttempts =
    isStudent && hasLoadedAttempts && attemptsRemaining <= 0;

  // Timer: reset whenever we start a new attempt (and timeLimit > 0)
  useEffect(() => {
    if (!isStudent || !loadedQuiz) {
      setTimeRemainingSeconds(null);
      setHasAutoSubmitted(false);
      return;
    }
    const limitMinutes =
      typeof loadedQuiz.timeLimit === "number" ? loadedQuiz.timeLimit : 0;

    if (mode === "TAKE_NEW_ATTEMPT" && limitMinutes > 0) {
      setTimeRemainingSeconds(limitMinutes * 60);
      setHasAutoSubmitted(false);
    } else {
      setTimeRemainingSeconds(null);
      setHasAutoSubmitted(false);
    }
  }, [isStudent, loadedQuiz, mode]);

  // Timer countdown
  useEffect(() => {
    if (timeRemainingSeconds === null) return;
    if (timeRemainingSeconds <= 0) return;

    const intervalId = setInterval(() => {
      setTimeRemainingSeconds((prev) =>
        prev === null || prev <= 0 ? prev : prev - 1
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeRemainingSeconds]);

  const handleSelectChoice = (questionId: string, choiceId: string) => {
    setStudentAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedChoiceId: choiceId }
          : answer
      )
    );
  };

  const handleSelectTrueFalse = (
    questionId: string,
    selection: "TRUE" | "FALSE"
  ) => {
    setStudentAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, trueFalseSelection: selection }
          : answer
      )
    );
  };

  const handleFillBlankResponse = (questionId: string, response: string) => {
    setStudentAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, fillBlankResponse: response }
          : answer
      )
    );
  };

  const handleReturnToQuestions = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/Questions`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const evaluations = evaluateAnswers(questions, studentAnswers);
      setAnswerEvaluations(evaluations);

      if (!isStudent) {
        // Faculty / TA: preview only, no persistence
        return;
      }

      // STUDENT: don't submit until we know attempts status
      if (!hasLoadedAttempts) {
        return;
      }

      if (studentOutOfAttempts) {
        return;
      }

      if (!currentUser?._id || !qid) {
        return;
      }

      const { earnedPoints, maxPoints } = computeScoreSummary(
        evaluations,
        questions
      );

      const payload = {
        score: earnedPoints,
        maxScore: maxPoints,
        answers: questions.map((question) => {
          const ans = studentAnswers.find(
            (a) => a.questionId === question.id
          );
          const evalResult = evaluations.find(
            (ev) => ev.questionId === question.id
          );
          return {
            questionId: question.id,
            answerType: question.questionType,
            selectedChoiceId: ans?.selectedChoiceId,
            trueFalseSelection: ans?.trueFalseSelection,
            fillBlankResponse: ans?.fillBlankResponse ?? "",
            isCorrect: evalResult?.isCorrect ?? false,
            earnedPoints: evalResult?.earnedPoints ?? 0,
          };
        }),
      };

      const created =
        await quizzesClient.createAttemptForQuizAndStudent(
          qid,
          currentUser._id,
          payload
        );

      setAttempts((prev) => [...prev, created]);
      setMode("VIEW_LAST_ATTEMPT");
    } catch (err) {
      console.error("Failed to submit quiz attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-submit when time runs out (for active attempts only; students only)
  useEffect(() => {
    if (
      !isStudent ||
      mode !== "TAKE_NEW_ATTEMPT" ||
      timeRemainingSeconds === null ||
      timeRemainingSeconds > 0 ||
      hasAutoSubmitted
    ) {
      return;
    }
    setHasAutoSubmitted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    handleSubmit();
  }, [isStudent, mode, timeRemainingSeconds, hasAutoSubmitted]);

  // 🔽 EARLY RETURNS COME AFTER ALL HOOKS 🔽

  if (!loadedQuiz && isLoadingQuiz) {
    return (
      <div className="text-center text-muted py-5">
        <Spinner animation="border" role="status" className="me-2" />
        Loading quiz preview...
      </div>
    );
  }

  if (!loadedQuiz) {
    return <div className="text-muted">Quiz not found.</div>;
  }

  // Students cannot access unpublished quizzes, but TAs & Faculty can
  if (isStudent && !loadedQuiz.published) {
    return (
      <div className="text-muted">
        This quiz is not available for students.
      </div>
    );
  }

  const timeLimitMinutes =
    typeof loadedQuiz.timeLimit === "number" ? loadedQuiz.timeLimit : 0;

  const oneAtATimeRaw = (loadedQuiz.oneQuestionAtATime ?? "")
    .toString()
    .toUpperCase();
  const lockAfterAnswerRaw = (loadedQuiz.lockQuestionsAfterAnswering ?? "")
    .toString()
    .toUpperCase();

  // Only "YES" means enabled; blank or anything else is treated as off.
  const oneAtATimeEnabled = oneAtATimeRaw === "YES";
  const lockAfterAnswerEnabled =
    oneAtATimeEnabled && lockAfterAnswerRaw === "YES";

  const showCorrectAnswersRaw = (loadedQuiz.showCorrectAnswers ?? "")
    .toString()
    .toUpperCase();

  // Simple Yes/No behavior: if dropdown is "YES", show correct answers;
  // otherwise don't (students). Staff always see answers.
  const shouldShowCorrectAnswersToStudent =
    !!answerEvaluations && showCorrectAnswersRaw === "YES";

  const scoreSummary =
    answerEvaluations && questions.length
      ? computeScoreSummary(answerEvaluations, questions)
      : null;

  const renderSummaryBanner = () => {
    if (!answerEvaluations || !scoreSummary) return null;
    const percentage =
      scoreSummary.maxPoints === 0
        ? 0
        : Math.round(
            (scoreSummary.earnedPoints / scoreSummary.maxPoints) * 100
          );

    return (
      <Alert
        variant="info"
        className="d-flex justify-content-between align-items-center"
      >
        <div>
          Score:{" "}
          <Badge bg="primary">
            {scoreSummary.earnedPoints} / {scoreSummary.maxPoints}
          </Badge>{" "}
          ({percentage}%)
          {isStudent && (
            <>
              {" "}
              · Attempt {attemptsCount} of {maxAttempts}
            </>
          )}
        </div>
        {!isStudent && (
          <div>
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => {
                setAnswerEvaluations(null);
                setStudentAnswers(computeInitialAnswers(questions));
                setMode("TAKE_NEW_ATTEMPT");
                setLockedQuestionIds([]);
                setCurrentQuestionIndex(0);
              }}
            >
              Retake Preview
            </Button>
          </div>
        )}
      </Alert>
    );
  };

  const goToQuestion = (nextIndex: number) => {
    if (!oneAtATimeEnabled) return;
    if (nextIndex < 0 || nextIndex >= questions.length) return;

    if (lockAfterAnswerEnabled && mode === "TAKE_NEW_ATTEMPT") {
      const currentQuestion = questions[currentQuestionIndex];
      const currentAnswer = studentAnswers.find(
        (a) => a.questionId === currentQuestion.id
      );
      if (
        currentQuestion &&
        currentAnswer &&
        isQuestionAnswered(currentQuestion, currentAnswer) &&
        !lockedQuestionIds.includes(currentQuestion.id)
      ) {
        setLockedQuestionIds((prev) => [...prev, currentQuestion.id]);
      }
    }

    setCurrentQuestionIndex(nextIndex);
  };

  return (
    <div
      id="wd-quiz-preview"
      className="mx-auto"
      style={{ maxWidth: 750 }}
    >
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0">{loadedQuiz.title || "Quiz Preview"}</h2>
          <div className="text-muted small">
            {loadedQuiz.questions?.length ?? 0} questions · {totalPoints} points
          </div>
          {isStudent &&
            timeLimitMinutes > 0 &&
            mode === "TAKE_NEW_ATTEMPT" &&
            timeRemainingSeconds !== null && (
              <div className="text-muted small">
                Time remaining:{" "}
                {Math.floor(timeRemainingSeconds / 60)}:
                {String(timeRemainingSeconds % 60).padStart(2, "0")}
              </div>
            )}
          {isStudent && (
            <div className="text-muted small">
              Attempts used: {attemptsCount} / {maxAttempts}
              {isLoadingAttempts && " (loading...)"}
              {studentOutOfAttempts && hasLoadedAttempts && (
                <span className="text-danger ms-2">
                  No attempts remaining
                </span>
              )}
            </div>
          )}
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {isFaculty && (
            <Button
              variant="outline-secondary"
              onClick={handleReturnToQuestions}
            >
              Edit Questions
            </Button>
          )}

          {/* STAFF (Faculty / TA) preview button */}
          {isStaffPreview && (
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Preview"}
            </Button>
          )}

          {/* STUDENT buttons */}
          {isStudent && mode === "VIEW_LAST_ATTEMPT" && (
            <>
              {attemptsCount > 0 && scoreSummary && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled
                >
                  Last score: {scoreSummary.earnedPoints} /{" "}
                  {scoreSummary.maxPoints}
                </Button>
              )}
              {attemptsRemaining > 0 && hasLoadedAttempts && (
                <Button
                  variant="danger"
                  onClick={() => {
                    setMode("TAKE_NEW_ATTEMPT");
                    setStudentAnswers(computeInitialAnswers(questions));
                    setAnswerEvaluations(null);
                    setLockedQuestionIds([]);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  Retake Quiz
                </Button>
              )}
            </>
          )}

          {isStudent && mode === "TAKE_NEW_ATTEMPT" && (
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !hasLoadedAttempts ||
                studentOutOfAttempts
              }
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>

      {renderSummaryBanner()}

      <ListGroup>
        {questions.map((question, index) => {
          if (oneAtATimeEnabled && index !== currentQuestionIndex) {
            return null;
          }

          const studentAnswer = studentAnswers.find(
            (answer) => answer.questionId === question.id
          );
          const evaluation = answerEvaluations?.find(
            (result) => result.questionId === question.id
          );
          const isCorrect = evaluation?.isCorrect ?? null;

          const baseReadOnly = isStudent && mode === "VIEW_LAST_ATTEMPT";
          const lockedForThisQuestion =
            lockAfterAnswerEnabled &&
            lockedQuestionIds.includes(question.id) &&
            mode === "TAKE_NEW_ATTEMPT";
          const readOnly = baseReadOnly || lockedForThisQuestion;

          const canShowCorrectAnswers =
            !!evaluation &&
            (isStaffPreview || shouldShowCorrectAnswersToStudent);

          return (
            <ListGroup.Item
              key={question.id}
              className="mb-3 border-0"
            >
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <div className="fw-semibold">
                      Question {index + 1}: {question.title}
                    </div>
                    <small className="text-muted">
                      {QUESTION_TYPE_LABELS[question.questionType]}
                    </small>
                    {lockedForThisQuestion && !baseReadOnly && (
                      <span className="ms-2 badge bg-warning text-dark">
                        Locked after answering
                      </span>
                    )}
                  </div>
                  <Badge bg="light" text="dark">
                    {question.points} pts
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <p>{question.prompt}</p>

                  {question.questionType === "MULTIPLE_CHOICE" && (
                    <Form>
                      {question.multipleChoiceOptions.map((option) => (
                        <Form.Check
                          type="radio"
                          name={`question-${question.id}`}
                          key={option.id}
                          label={option.text}
                          checked={
                            studentAnswer?.selectedChoiceId === option.id
                          }
                          onChange={() =>
                            !readOnly &&
                            handleSelectChoice(question.id, option.id)
                          }
                          disabled={readOnly}
                          className="mb-2"
                        />
                      ))}
                    </Form>
                  )}

                  {question.questionType === "TRUE_FALSE" && (
                    <Form>
                      <Form.Check
                        inline
                        type="radio"
                        name={`tf-${question.id}`}
                        label="True"
                        checked={
                          studentAnswer?.trueFalseSelection === "TRUE"
                        }
                        onChange={() =>
                          !readOnly &&
                          handleSelectTrueFalse(question.id, "TRUE")
                        }
                        disabled={readOnly}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        name={`tf-${question.id}`}
                        label="False"
                        checked={
                          studentAnswer?.trueFalseSelection === "FALSE"
                        }
                        onChange={() =>
                          !readOnly &&
                          handleSelectTrueFalse(question.id, "FALSE")
                        }
                        disabled={readOnly}
                      />
                    </Form>
                  )}

                  {question.questionType === "FILL_BLANK" && (
                    <Form.Group>
                      <Form.Control
                        placeholder="Type your answer"
                        value={studentAnswer?.fillBlankResponse ?? ""}
                        onChange={(event) =>
                          !readOnly &&
                          handleFillBlankResponse(
                            question.id,
                            event.target.value
                          )
                        }
                        disabled={readOnly}
                      />
                    </Form.Group>
                  )}

                  {evaluation && (
                    <div className="mt-3">
                      {isCorrect ? (
                        <Badge bg="success">Correct</Badge>
                      ) : (
                        <Badge bg="danger">Incorrect</Badge>
                      )}
                      {canShowCorrectAnswers && (
                        <div className="mt-2 small">
                          <strong>Correct answer:</strong>{" "}
                          {question.questionType === "MULTIPLE_CHOICE"
                            ? question.multipleChoiceOptions
                                .filter((option) => option.isCorrect)
                                .map((option) => option.text)
                                .join(", ")
                            : question.questionType === "TRUE_FALSE"
                            ? question.trueFalseAnswer === "TRUE"
                              ? "True"
                              : "False"
                            : question.acceptableFillBlankAnswers.join(", ") ||
                              "—"}
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      {oneAtATimeEnabled && questions.length > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={currentQuestionIndex === 0}
            onClick={() => goToQuestion(currentQuestionIndex - 1)}
          >
            Previous
          </Button>
          <div className="text-muted small">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={currentQuestionIndex === questions.length - 1}
            onClick={() => goToQuestion(currentQuestionIndex + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
