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
import { setQuizzes } from "../../reducer";
import type { Quiz } from "../../reducer";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | string;

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
  question: PersistedQuizQuestion
): QuestionForPreview => {
  const questionType = normalizePersistedType(
    question?.type ?? question?.questionType
  );
  const prompt = question?.questionText ?? question?.question ?? "";
  return {
    id: question?._id ?? generateStableId("question"),
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
  return quiz.questions.map((question) => convertQuestionForPreview(question));
};

const computeInitialAnswers = (
  questions: QuestionForPreview[]
): StudentAnswer[] =>
  questions.map((question) => ({
    questionId: question.id,
    answerType: question.questionType,
    selectedChoiceId: undefined,
    trueFalseSelection: question.questionType === "TRUE_FALSE" ? "TRUE" : undefined,
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
      const studentResponse = (answer.fillBlankResponse ?? "").trim().toLowerCase();
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

const computeScoreSummary = (evaluations: AnswerEvaluation[]) => {
  const earnedPoints = evaluations.reduce(
    (sum, evaluation) => sum + evaluation.earnedPoints,
    0
  );
  const maxPoints = evaluations.reduce(
    (sum, evaluation) =>
      sum + (evaluation.earnedPoints > 0 ? evaluation.earnedPoints : 0),
    earnedPoints
  );
  return { earnedPoints, maxPoints };
};

export default function QuizPreviewPage() {
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

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!qid || quizFromStore) return;
    const loadQuiz = async () => {
      try {
        setIsLoadingQuiz(true);
        const fetchedQuiz = (await quizzesClient.findQuizById(
          qid
        )) as QuizWithQuestions;
        setLoadedQuiz(fetchedQuiz);
        setQuestions(convertQuizQuestionsForPreview(fetchedQuiz));
        setStudentAnswers(
          computeInitialAnswers(convertQuizQuestionsForPreview(fetchedQuiz))
        );
        dispatch(setQuizzes([fetchedQuiz]));
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setIsLoadingQuiz(false);
      }
    };
    loadQuiz();
  }, [qid, quizFromStore, dispatch]);

  useEffect(() => {
    if (quizFromStore) {
      setLoadedQuiz(quizFromStore);
      const previewQuestions = convertQuizQuestionsForPreview(quizFromStore);
      setQuestions(previewQuestions);
      setStudentAnswers(computeInitialAnswers(previewQuestions));
    }
  }, [quizFromStore]);

  const totalPoints = useMemo(
    () => questions.reduce((sum, question) => sum + question.points, 0),
    [questions]
  );

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

  const handleSubmitPreview = () => {
    setIsSubmitting(true);
    const evaluations = evaluateAnswers(questions, studentAnswers);
    setAnswerEvaluations(evaluations);
    setIsSubmitting(false);
  };

  const handleReturnToQuestions = () => {
    router.push(`/Courses/${cid}/Quizzes/${qid}/Questions`);
  };

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

  const scoreSummary = answerEvaluations
    ? {
        earned: answerEvaluations.reduce(
          (sum, evaluation) => sum + evaluation.earnedPoints,
          0
        ),
        possible: questions.reduce((sum, question) => sum + question.points, 0),
      }
    : null;

  const renderSummaryBanner = () => {
    if (!answerEvaluations || !scoreSummary) return null;
    const percentage =
      scoreSummary.possible === 0
        ? 0
        : Math.round((scoreSummary.earned / scoreSummary.possible) * 100);
    return (
      <Alert variant="info" className="d-flex justify-content-between align-items-center">
        <div>
          Score:{" "}
          <Badge bg="primary">
            {scoreSummary.earned} / {scoreSummary.possible}
          </Badge>{" "}
          ({percentage}%)
        </div>
        <div>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setAnswerEvaluations(null)}
          >
            Retake Preview
          </Button>
        </div>
      </Alert>
    );
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
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {isFaculty && (
            <Button variant="outline-secondary" onClick={handleReturnToQuestions}>
              Edit Questions
            </Button>
          )}
          <Button
            variant="danger"
            onClick={handleSubmitPreview}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Preview"}
          </Button>
        </div>
      </div>

      {renderSummaryBanner()}

      <ListGroup>
        {questions.map((question, index) => {
          const studentAnswer = studentAnswers.find(
            (answer) => answer.questionId === question.id
          );
          const evaluation = answerEvaluations?.find(
            (result) => result.questionId === question.id
          );
          const isCorrect = evaluation?.isCorrect ?? null;

          return (
            <ListGroup.Item key={question.id} className="mb-3 border-0">
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
                          type="radio"
                          name={`question-${question.id}`}
                          key={option.id}
                          label={option.text}
                          checked={studentAnswer?.selectedChoiceId === option.id}
                          onChange={() =>
                            handleSelectChoice(question.id, option.id)
                          }
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
                        checked={studentAnswer?.trueFalseSelection === "TRUE"}
                        onChange={() => handleSelectTrueFalse(question.id, "TRUE")}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        name={`tf-${question.id}`}
                        label="False"
                        checked={studentAnswer?.trueFalseSelection === "FALSE"}
                        onChange={() => handleSelectTrueFalse(question.id, "FALSE")}
                      />
                    </Form>
                  )}

                  {question.questionType === "FILL_BLANK" && (
                    <Form.Group>
                      <Form.Control
                        placeholder="Type your answer"
                        value={studentAnswer?.fillBlankResponse ?? ""}
                        onChange={(event) =>
                          handleFillBlankResponse(question.id, event.target.value)
                        }
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
                          : question.acceptableFillBlankAnswers.join(", ") || "—"}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}
