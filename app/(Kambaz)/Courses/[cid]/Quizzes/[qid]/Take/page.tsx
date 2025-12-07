"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { setQuizzes, Quiz } from "../../reducer";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | string;

type CurrentUser = { _id?: string; role?: Role } | null;

type RootState = {
  quizzesReducer: { quizzes: Quiz[] };
  accountReducer: { currentUser: CurrentUser };
};

type PersistedChoice = {
  id?: string;
  _id?: string;
  text?: string;
  correct?: boolean;
};

type PersistedQuizQuestion = {
  _id?: string;
  title?: string;
  questionText?: string;
  question?: string;
  prompt?: string;
  type?: string;
  questionType?: string;
  points?: number;
  choices?: PersistedChoice[];
  trueFalseAnswer?: string | boolean;
  blanks?: Array<string | { text?: string }>;
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

type QuestionForTaking = {
  questionId: string;
  title: string;
  prompt: string;
  questionType: QuestionType;
  points: number;
  multipleChoiceOptions: MultipleChoiceOption[];
  trueFalseAnswer: "TRUE" | "FALSE";
  acceptableFillBlankAnswers: string[];
};

type StudentAnswerDraft = {
  questionId: string;
  selectedChoiceId?: string;
  trueFalseSelection?: "TRUE" | "FALSE";
  fillBlankResponse?: string;
};

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  FILL_BLANK: "Fill in the Blank",
};

type QuizAttemptSummary = {
  _id: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  submittedAt: string;
};

const normalizeQuestionType = (rawType?: string): QuestionType => {
  if (!rawType) return "MULTIPLE_CHOICE";
  const compact = rawType.replace(/[\s_-]/g, "").toUpperCase();
  if (compact === "TRUEFALSE") return "TRUE_FALSE";
  if (compact === "FILLINTHEBLANK" || compact === "FILLBLANK") {
    return "FILL_BLANK";
  }
  return "MULTIPLE_CHOICE";
};

const normalizeTrueFalseAnswer = (
  answer?: string | boolean
): "TRUE" | "FALSE" => {
  if (typeof answer === "string") {
    return answer.trim().toUpperCase() === "FALSE" ? "FALSE" : "TRUE";
  }
  return answer === false ? "FALSE" : "TRUE";
};

const convertChoices = (
  choices?: PersistedChoice[]
): MultipleChoiceOption[] => {
  if (!Array.isArray(choices) || choices.length === 0) {
    return [
      { id: "choice-1", text: "Option 1", isCorrect: true },
      { id: "choice-2", text: "Option 2", isCorrect: false },
    ];
  }
  const mapped = choices.map((choice, index) => ({
    id: choice?.id ?? choice?._id?.toString() ?? `choice-${index}`,
    text: choice?.text ?? `Choice ${index + 1}`,
    isCorrect: Boolean(choice?.correct),
  }));
  if (!mapped.some((choice) => choice.isCorrect)) {
    mapped[0].isCorrect = true;
  }
  return mapped;
};

const convertBlanks = (
  blanks?: Array<string | { text?: string }>
): string[] => {
  if (!Array.isArray(blanks)) {
    return [];
  }
  return blanks
    .map((blank) =>
      typeof blank === "string" ? blank : blank?.text ?? ""
    )
    .map((text) => text.trim())
    .filter((text) => text.length > 0);
};

const convertQuizQuestions = (
  quiz?: QuizWithQuestions
): QuestionForTaking[] => {
  if (!quiz?.questions) return [];
  return quiz.questions.map((question, index) => ({
    questionId:
      question?._id?.toString() ??
      `quiz-${quiz._id}-question-${index + 1}`,
    title: question?.title ?? `Question ${index + 1}`,
    prompt:
      question?.questionText ??
      question?.question ??
      question?.prompt ??
      "",
    questionType: normalizeQuestionType(
      question?.type ?? question?.questionType
    ),
    points: Number(question?.points ?? 0),
    multipleChoiceOptions: convertChoices(question?.choices),
    trueFalseAnswer: normalizeTrueFalseAnswer(question?.trueFalseAnswer),
    acceptableFillBlankAnswers: convertBlanks(question?.blanks),
  }));
};

const computeDefaultAnswers = (
  questions: QuestionForTaking[]
): StudentAnswerDraft[] =>
  questions.map((question) => ({
    questionId: question.questionId,
    selectedChoiceId: undefined,
    trueFalseSelection: "TRUE",
    fillBlankResponse: "",
  }));

const QuizTakePage = () => {
  const router = useRouter();
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const dispatch = useDispatch();

  const { quizzes } = useSelector((state: RootState) => state.quizzesReducer);
  const { currentUser } = useSelector(
    (state: RootState) => state.accountReducer
  );

  const quizFromStore = useMemo<QuizWithQuestions | undefined>(
    () => quizzes.find((quiz) => quiz._id === qid) as QuizWithQuestions | undefined,
    [quizzes, qid]
  );

  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(
    quizFromStore ?? null
  );
  const [questions, setQuestions] = useState<QuestionForTaking[]>(
    () => convertQuizQuestions(quizFromStore)
  );
  const [answers, setAnswers] = useState<StudentAnswerDraft[]>(() =>
    computeDefaultAnswers(convertQuizQuestions(quizFromStore))
  );
  const [attempts, setAttempts] = useState<QuizAttemptSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isStudent = currentUser?.role === "STUDENT";

  useEffect(() => {
    if (!qid || quizFromStore) return;
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const fetchedQuiz = (await quizzesClient.findQuizById(
          qid
        )) as QuizWithQuestions;
        setQuiz(fetchedQuiz);
        dispatch(setQuizzes([fetchedQuiz]));
        const converted = convertQuizQuestions(fetchedQuiz);
        setQuestions(converted);
        setAnswers(computeDefaultAnswers(converted));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadQuiz();
  }, [qid, quizFromStore, dispatch]);

  useEffect(() => {
    if (quizFromStore) {
      setQuiz(quizFromStore);
      const converted = convertQuizQuestions(quizFromStore);
      setQuestions(converted);
      setAnswers(computeDefaultAnswers(converted));
    }
  }, [quizFromStore]);

  useEffect(() => {
    if (!qid) return;
    const loadAttempts = async () => {
      try {
        const data = (await quizzesClient.findCurrentUserAttemptsForQuiz(
          qid
        )) as QuizAttemptSummary[];
        if (Array.isArray(data)) {
          setAttempts(data);
        }
      } catch (err) {
        console.error("Failed to load attempts:", err);
      }
    };
    loadAttempts();
  }, [qid]);

  const attemptLimit = useMemo(() => {
    if (quiz?.multipleAttempts === "Yes") {
      return Number(quiz?.allowedAttempts ?? 1);
    }
    return 1;
  }, [quiz]);

  const attemptsUsed = attempts.length > 0 ? attempts[0].attemptNumber : 0;
  const attemptsRemaining = Math.max(attemptLimit - attemptsUsed, 0);
  const latestAttempt = attempts[0] ?? null;

  const studentCannotAttempt = attemptsRemaining <= 0;

  const handleChoiceSelection = (questionId: string, choiceId: string) => {
    setAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, selectedChoiceId: choiceId }
          : answer
      )
    );
  };

  const handleTrueFalseSelection = (
    questionId: string,
    selection: "TRUE" | "FALSE"
  ) => {
    setAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, trueFalseSelection: selection }
          : answer
      )
    );
  };

  const handleFillBlankChange = (questionId: string, text: string) => {
    setAnswers((previous) =>
      previous.map((answer) =>
        answer.questionId === questionId
          ? { ...answer, fillBlankResponse: text }
          : answer
      )
    );
  };

  const handleSubmitQuiz = async () => {
    if (!qid || studentCannotAttempt) return;
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await quizzesClient.submitQuizAttempt(qid, answers);
      router.push(`/Courses/${cid}/Quizzes/${qid}/Results`);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Unable to submit quiz. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isStudent) {
    return (
      <div className="text-muted">
        Quiz taking is available to students only.
      </div>
    );
  }

  if (!quiz || isLoading) {
    return (
      <div className="text-center text-muted py-5">
        <Spinner animation="border" role="status" className="me-2" />
        Loading quiz...
      </div>
    );
  }

  return (
    <div
      id="wd-quiz-take"
      className="mx-auto"
      style={{ maxWidth: 750 }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-1">{quiz.title || "Quiz"}</h2>
          <div className="text-muted small">
            {questions.length} questions · Attempts remaining:{" "}
            <strong>{attemptsRemaining}</strong> / {attemptLimit}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {latestAttempt && (
            <Button
              variant="outline-secondary"
              onClick={() =>
                router.push(`/Courses/${cid}/Quizzes/${qid}/Results`)
              }
            >
              View Last Attempt
            </Button>
          )}
          <Button
            variant="danger"
            onClick={handleSubmitQuiz}
            disabled={studentCannotAttempt || isSubmitting}
          >
            {studentCannotAttempt
              ? "Attempt Limit Reached"
              : isSubmitting
              ? "Submitting..."
              : "Submit Quiz"}
          </Button>
        </div>
      </div>

      {studentCannotAttempt && latestAttempt && (
        <Alert variant="warning">
          You have used all available attempts. Your last score was{" "}
          <strong>
            {latestAttempt.score} / {latestAttempt.maxScore}
          </strong>{" "}
          on{" "}
          {new Date(latestAttempt.submittedAt).toLocaleString()}.
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
          {errorMessage}
        </Alert>
      )}

      <ListGroup>
        {questions.map((question, index) => {
          const answer = answers.find(
            (draft) => draft.questionId === question.questionId
          );
          return (
            <ListGroup.Item key={question.questionId} className="mb-3 border-0">
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <div className="fw-semibold">
                      Question {index + 1}: {question.title}
                    </div>
                    <small className="text-muted">
                      {QUESTION_TYPE_LABELS[question.questionType]}
                    </small>
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
                          key={option.id}
                          type="radio"
                          className="mb-2"
                          name={`mc-${question.questionId}`}
                          label={option.text}
                          checked={answer?.selectedChoiceId === option.id}
                          onChange={() =>
                            handleChoiceSelection(question.questionId, option.id)
                          }
                        />
                      ))}
                    </Form>
                  )}

                  {question.questionType === "TRUE_FALSE" && (
                    <Form>
                      <Form.Check
                        inline
                        type="radio"
                        label="True"
                        name={`tf-${question.questionId}`}
                        checked={answer?.trueFalseSelection === "TRUE"}
                        onChange={() =>
                          handleTrueFalseSelection(question.questionId, "TRUE")
                        }
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="False"
                        name={`tf-${question.questionId}`}
                        checked={answer?.trueFalseSelection === "FALSE"}
                        onChange={() =>
                          handleTrueFalseSelection(question.questionId, "FALSE")
                        }
                      />
                    </Form>
                  )}

                  {question.questionType === "FILL_BLANK" && (
                    <Form.Group>
                      <Form.Control
                        placeholder="Type your answer"
                        value={answer?.fillBlankResponse ?? ""}
                        onChange={(event) =>
                          handleFillBlankChange(
                            question.questionId,
                            event.target.value
                          )
                        }
                      />
                    </Form.Group>
                  )}
                </Card.Body>
              </Card>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
};

export default QuizTakePage;
