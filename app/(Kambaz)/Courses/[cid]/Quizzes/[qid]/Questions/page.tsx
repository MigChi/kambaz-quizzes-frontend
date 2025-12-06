"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Badge,
  Button,
  Card,
  Form,
  InputGroup,
  Nav,
} from "react-bootstrap";
import * as quizzesClient from "../../client";
import { setQuizzes, updateQuiz, Quiz } from "../../reducer";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | string;

type CurrentUser = { _id?: string; role?: Role } | null;

type RootState = {
  quizzesReducer: { quizzes: Quiz[] };
  accountReducer: { currentUser: CurrentUser };
};

type QuizQuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";

type MultipleChoiceOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type FillBlankAnswer = {
  id: string;
  text: string;
};

type QuestionFormState = {
  persistedId?: string;
  localId: string;
  title: string;
  prompt: string;
  points: number;
  questionType: QuizQuestionType;
  multipleChoiceOptions: MultipleChoiceOption[];
  trueFalseAnswer: "TRUE" | "FALSE";
  fillBlankAnswers: FillBlankAnswer[];
  isEditing: boolean;
  isNewlyCreated: boolean;
};

type PersistedChoice = {
  id?: string;
  text?: string;
  correct?: boolean;
};

type PersistedBlank = string | { text?: string };

type PersistedQuizQuestion = {
  _id?: string;
  title?: string;
  questionText?: string;
  question?: string;
  points?: number;
  type?: string;
  questionType?: string;
  choices?: PersistedChoice[];
  trueFalseAnswer?: string | boolean;
  blanks?: PersistedBlank[];
};

type QuizWithQuestions = Quiz & {
  questions?: PersistedQuizQuestion[];
};

const QUIZ_QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
  FILL_BLANK: "Fill in the Blank",
};

const generateStableId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createDefaultMultipleChoiceOption = (
  text: string,
  isCorrect = false
): MultipleChoiceOption => ({
  id: generateStableId("choice"),
  text,
  isCorrect,
});

const createDefaultFillBlankAnswer = (
  text = ""
): FillBlankAnswer => ({
  id: generateStableId("blank"),
  text,
});

const createDefaultQuestionFormState = (): QuestionFormState => ({
  persistedId: undefined,
  localId: generateStableId("question"),
  title: "New Question",
  prompt: "",
  points: 5,
  questionType: "MULTIPLE_CHOICE",
  multipleChoiceOptions: [
    createDefaultMultipleChoiceOption("Option 1", true),
    createDefaultMultipleChoiceOption("Option 2", false),
  ],
  trueFalseAnswer: "TRUE",
  fillBlankAnswers: [createDefaultFillBlankAnswer("")],
  isEditing: true,
  isNewlyCreated: true,
});

const normalizePersistedQuestionType = (
  rawType?: string
): QuizQuestionType => {
  if (!rawType) return "MULTIPLE_CHOICE";
  const compact = rawType.replace(/[\s_-]/g, "").toUpperCase();
  if (compact === "TRUEFALSE") return "TRUE_FALSE";
  if (compact === "FILLINTHEBLANK" || compact === "FILLBLANK") {
    return "FILL_BLANK";
  }
  return "MULTIPLE_CHOICE";
};

const convertPersistedChoicesToForm = (
  rawChoices?: PersistedChoice[]
): MultipleChoiceOption[] => {
  if (!Array.isArray(rawChoices) || rawChoices.length === 0) {
    return [
      createDefaultMultipleChoiceOption("Option 1", true),
      createDefaultMultipleChoiceOption("Option 2", false),
    ];
  }
  const mapped = rawChoices.map((choice, index) => ({
    id: choice?.id ?? generateStableId("choice"),
    text: choice?.text ?? `Choice ${index + 1}`,
    isCorrect: Boolean(choice?.correct),
  }));
  if (!mapped.some((choice) => choice.isCorrect)) {
    mapped[0].isCorrect = true;
  }
  return mapped;
};

const convertPersistedBlanksToForm = (
  rawBlanks?: PersistedBlank[]
): FillBlankAnswer[] => {
  if (!Array.isArray(rawBlanks) || rawBlanks.length === 0) {
    return [createDefaultFillBlankAnswer("")];
  }
  return rawBlanks.map((answer, index) => {
    const text =
      typeof answer === "string"
        ? answer
        : answer?.text ?? `Answer ${index + 1}`;
    return createDefaultFillBlankAnswer(text);
  });
};

const normalizePersistedTrueFalseAnswer = (
  answer: string | boolean | undefined
): "TRUE" | "FALSE" => {
  if (typeof answer === "string") {
    return answer.trim().toUpperCase() === "FALSE" ? "FALSE" : "TRUE";
  }
  return answer === false ? "FALSE" : "TRUE";
};

const convertPersistedQuestionToForm = (
  persistedQuestion: PersistedQuizQuestion
): QuestionFormState => {
  const questionType = normalizePersistedQuestionType(
    persistedQuestion?.type ?? persistedQuestion?.questionType
  );
  const prompt =
    persistedQuestion?.questionText ??
    persistedQuestion?.question ??
    "";

  return {
    persistedId: persistedQuestion?._id,
    localId: persistedQuestion?._id ?? generateStableId("question"),
    title: persistedQuestion?.title ?? "Question",
    prompt,
    points: Number(persistedQuestion?.points ?? 0),
    questionType,
    multipleChoiceOptions: convertPersistedChoicesToForm(
      persistedQuestion?.choices
    ),
    trueFalseAnswer: normalizePersistedTrueFalseAnswer(
      persistedQuestion?.trueFalseAnswer
    ),
    fillBlankAnswers: convertPersistedBlanksToForm(
      persistedQuestion?.blanks
    ),
    isEditing: false,
    isNewlyCreated: false,
  };
};

const convertPersistedQuizQuestionsForEditor = (
  persistedQuestions?: PersistedQuizQuestion[]
): QuestionFormState[] => {
  if (!Array.isArray(persistedQuestions)) {
    return [];
  }
  return persistedQuestions.map((question) =>
    convertPersistedQuestionToForm(question)
  );
};

const convertQuestionFormStateForPersistence = (
  question: QuestionFormState
) => ({
  _id: question.persistedId,
  title: question.title,
  points: Number(question.points) || 0,
  type: question.questionType,
  questionText: question.prompt,
  choices:
    question.questionType === "MULTIPLE_CHOICE"
      ? question.multipleChoiceOptions.map((option) => ({
          text: option.text,
          correct: option.isCorrect,
        }))
      : undefined,
  trueFalseAnswer:
    question.questionType === "TRUE_FALSE"
      ? question.trueFalseAnswer
      : undefined,
  blanks:
    question.questionType === "FILL_BLANK"
      ? question.fillBlankAnswers
          .map((answer) => answer.text.trim())
          .filter((text) => text.length > 0)
      : undefined,
});

const convertFormQuestionsForPersistence = (
  questions: QuestionFormState[]
) => questions.map(convertQuestionFormStateForPersistence);

const cloneQuestionFormState = (
  question: QuestionFormState
): QuestionFormState => ({
  ...question,
  multipleChoiceOptions: question.multipleChoiceOptions.map((option) => ({
    ...option,
  })),
  fillBlankAnswers: question.fillBlankAnswers.map((answer) => ({
    ...answer,
  })),
});

const computeQuestionListWithMutation = (
  questions: QuestionFormState[],
  localId: string,
  mutator: (question: QuestionFormState) => QuestionFormState
) =>
  questions.map((question) =>
    question.localId === localId ? mutator(question) : question
  );

const computeTotalPointsFromQuestions = (
  questions: QuestionFormState[]
) =>
  questions.reduce(
    (sum, question) => sum + (Number(question.points) || 0),
    0
  );

const filterChoicesEnsuringCorrectFlag = (
  options: MultipleChoiceOption[],
  choiceIdToRemove: string
) => {
  const remaining = options.filter(
    (option) => option.id !== choiceIdToRemove
  );
  if (remaining.length === 0) {
    return [
      createDefaultMultipleChoiceOption("Option 1", true),
      createDefaultMultipleChoiceOption("Option 2", false),
    ];
  }
  if (!remaining.some((option) => option.isCorrect)) {
    remaining[0].isCorrect = true;
  }
  return remaining;
};

const removeBlankEnsuringMinimumOne = (
  blanks: FillBlankAnswer[],
  blankIdToRemove: string
) => {
  const remaining = blanks.filter((blank) => blank.id !== blankIdToRemove);
  return remaining.length > 0 ? remaining : [createDefaultFillBlankAnswer("")];
};

const persistQuizWithQuestions = async (
  quiz: QuizWithQuestions,
  questions: QuestionFormState[],
  totalPoints: number
): Promise<QuizWithQuestions> => {
  const payload = {
    ...quiz,
    points: totalPoints,
    questions: convertFormQuestionsForPersistence(questions),
  };
  return quizzesClient.updateQuiz(payload) as Promise<QuizWithQuestions>;
};

export default function QuizQuestionsEditorPage() {
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

  const [questionForms, setQuestionForms] = useState<QuestionFormState[]>(
    () =>
      convertPersistedQuizQuestionsForEditor(quizFromStore?.questions)
  );
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [questionSnapshots, setQuestionSnapshots] = useState<
    Record<string, QuestionFormState>
  >({});

  const isFacultyUser =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    if (!qid || quizFromStore) return;
    const loadQuizById = async () => {
      try {
        setIsLoadingQuiz(true);
        const fetchedQuiz = (await quizzesClient.findQuizById(
          qid
        )) as QuizWithQuestions;
        if (fetchedQuiz) {
          dispatch(setQuizzes([fetchedQuiz]));
        }
      } catch (err) {
        console.error("Failed to load quiz:", err);
      } finally {
        setIsLoadingQuiz(false);
      }
    };
    loadQuizById();
  }, [qid, quizFromStore, dispatch]);

  useEffect(() => {
    if (quizFromStore) {
      setQuestionForms(
        convertPersistedQuizQuestionsForEditor(quizFromStore.questions)
      );
    }
  }, [quizFromStore]);

  const totalQuizPoints = useMemo(
    () => computeTotalPointsFromQuestions(questionForms),
    [questionForms]
  );

  const handleAddNewQuestion = () => {
    setQuestionForms((previous) => [...previous, createDefaultQuestionFormState()]);
  };

  const handleDeleteQuestionByLocalId = (localId: string) => {
    setQuestionForms((previous) =>
      previous.filter((question) => question.localId !== localId)
    );
    setQuestionSnapshots((previous) => {
      const clonedSnapshots = { ...previous };
      delete clonedSnapshots[localId];
      return clonedSnapshots;
    });
  };

  const handleEditQuestion = (question: QuestionFormState) => {
    setQuestionSnapshots((previous) => ({
      ...previous,
      [question.localId]: cloneQuestionFormState(question),
    }));
    setQuestionForms((previous) =>
      computeQuestionListWithMutation(previous, question.localId, (current) => ({
        ...current,
        isEditing: true,
      }))
    );
  };

  const handleCancelQuestionEditing = (question: QuestionFormState) => {
    if (question.isNewlyCreated && !question.persistedId) {
      handleDeleteQuestionByLocalId(question.localId);
      return;
    }
    const snapshot = questionSnapshots[question.localId];
    if (snapshot) {
      setQuestionForms((previous) =>
        computeQuestionListWithMutation(previous, question.localId, () => ({
          ...snapshot,
          isEditing: false,
          isNewlyCreated: false,
        }))
      );
      setQuestionSnapshots((previous) => {
        const clonedSnapshots = { ...previous };
        delete clonedSnapshots[question.localId];
        return clonedSnapshots;
      });
    } else {
      setQuestionForms((previous) =>
        computeQuestionListWithMutation(previous, question.localId, (current) => ({
          ...current,
          isEditing: false,
        }))
      );
    }
  };

  const handleSaveQuestionEditing = (question: QuestionFormState) => {
    setQuestionForms((previous) =>
      computeQuestionListWithMutation(previous, question.localId, (current) => ({
        ...current,
        isEditing: false,
        isNewlyCreated: false,
      }))
    );
    setQuestionSnapshots((previous) => {
      const clonedSnapshots = { ...previous };
      delete clonedSnapshots[question.localId];
      return clonedSnapshots;
    });
  };

  const handleUpdateQuestionField = (
    localId: string,
    updater: (current: QuestionFormState) => QuestionFormState
  ) => {
    setQuestionForms((previous) =>
      computeQuestionListWithMutation(previous, localId, updater)
    );
  };

  const handleQuestionTypeChange = (localId: string, nextType: QuizQuestionType) =>
    handleUpdateQuestionField(localId, (current) => ({
      ...current,
      questionType: nextType,
      multipleChoiceOptions:
        nextType === "MULTIPLE_CHOICE"
          ? convertPersistedChoicesToForm(current.multipleChoiceOptions)
          : current.multipleChoiceOptions,
      fillBlankAnswers:
        nextType === "FILL_BLANK"
          ? current.fillBlankAnswers.length
            ? current.fillBlankAnswers
            : [createDefaultFillBlankAnswer("")]
          : current.fillBlankAnswers,
      trueFalseAnswer:
        nextType === "TRUE_FALSE" ? current.trueFalseAnswer : "TRUE",
    }));

  const handleChoiceTextChange = (
    questionId: string,
    choiceId: string,
    text: string
  ) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      multipleChoiceOptions: current.multipleChoiceOptions.map((option) =>
        option.id === choiceId ? { ...option, text } : option
      ),
    }));

  const handleChoiceCorrectSelection = (questionId: string, choiceId: string) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      multipleChoiceOptions: current.multipleChoiceOptions.map((option) => ({
        ...option,
        isCorrect: option.id === choiceId,
      })),
    }));

  const handleAddChoiceToQuestion = (questionId: string) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      multipleChoiceOptions: [
        ...current.multipleChoiceOptions,
        createDefaultMultipleChoiceOption("New Choice", false),
      ],
    }));

  const handleRemoveChoiceFromQuestion = (questionId: string, choiceId: string) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      multipleChoiceOptions: filterChoicesEnsuringCorrectFlag(
        current.multipleChoiceOptions,
        choiceId
      ),
    }));

  const handleTrueFalseChange = (questionId: string, value: "TRUE" | "FALSE") =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      trueFalseAnswer: value,
    }));

  const handleBlankAnswerChange = (
    questionId: string,
    blankId: string,
    text: string
  ) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      fillBlankAnswers: current.fillBlankAnswers.map((blank) =>
        blank.id === blankId ? { ...blank, text } : blank
      ),
    }));

  const handleAddBlankAnswer = (questionId: string) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      fillBlankAnswers: [
        ...current.fillBlankAnswers,
        createDefaultFillBlankAnswer(""),
      ],
    }));

  const handleRemoveBlankAnswer = (questionId: string, blankId: string) =>
    handleUpdateQuestionField(questionId, (current) => ({
      ...current,
      fillBlankAnswers: removeBlankEnsuringMinimumOne(
        current.fillBlankAnswers,
        blankId
      ),
    }));

  const handlePersistQuestions = async () => {
    if (!quizFromStore || !cid || !qid) return;
    try {
      setIsSavingQuestions(true);
      const updatedQuiz = await persistQuizWithQuestions(
        quizFromStore,
        questionForms,
        totalQuizPoints
      );
      dispatch(updateQuiz(updatedQuiz));
      router.push(`/Courses/${cid}/Quizzes/${qid}`);
    } catch (err) {
      console.error("Failed to save questions:", err);
    } finally {
      setIsSavingQuestions(false);
    }
  };

  const handleCancelEditing = () => {
    router.push(
      quizFromStore
        ? `/Courses/${cid}/Quizzes/${qid}`
        : `/Courses/${cid}/Quizzes`
    );
  };

  if (!isFacultyUser) {
    return (
      <div className="text-muted">
        Quiz questions can only be edited by faculty members.
      </div>
    );
  }

  if (isLoadingQuiz && !quizFromStore) {
    return <div className="text-muted">Loading quiz...</div>;
  }

  if (!quizFromStore) {
    return <div className="text-muted">Quiz not found.</div>;
  }

  const renderQuestionSummary = (question: QuestionFormState) => {
    if (question.questionType === "MULTIPLE_CHOICE") {
      return (
        <ul className="mb-0">
          {question.multipleChoiceOptions.map((option) => (
            <li key={option.id}>
              {option.text}{" "}
              {option.isCorrect && (
                <Badge bg="success" pill>
                  Correct
                </Badge>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (question.questionType === "TRUE_FALSE") {
      return (
        <p className="mb-0">
          Answer:{" "}
          <Badge bg="info">
            {question.trueFalseAnswer === "TRUE" ? "True" : "False"}
          </Badge>
        </p>
      );
    }
    return (
      <ul className="mb-0">
        {question.fillBlankAnswers.map((answer) => (
          <li key={answer.id}>{answer.text || "(blank)"}</li>
        ))}
      </ul>
    );
  };

  return (
    <div
      id="wd-quiz-questions"
      className="mx-auto"
      style={{ maxWidth: 850 }}
    >
      <Nav variant="tabs" className="mb-4">
        <Nav.Item>
          <Nav.Link
            role="button"
            onClick={() =>
              router.push(`/Courses/${cid}/Quizzes/${qid}/Edit`)
            }
          >
            Details
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active>Questions</Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <span className="fw-semibold">Points:</span>{" "}
          <Badge bg="secondary">{totalQuizPoints}</Badge>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={handleAddNewQuestion}
          id="wd-add-question"
        >
          New Question
        </Button>
      </div>

      {questionForms.length === 0 && (
        <p className="text-muted">
          No questions yet. Click &ldquo;New Question&rdquo; to add one.
        </p>
      )}

      {questionForms.map((question) => (
        <Card key={question.localId} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-semibold">{question.title}</div>
              <small className="text-muted">
                {QUIZ_QUESTION_TYPE_LABELS[question.questionType]}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Badge bg="light" text="dark">
                {question.points} pts
              </Badge>
              {question.isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleSaveQuestionEditing(question)}
                  >
                    Save Question
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => handleCancelQuestionEditing(question)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleEditQuestion(question)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() =>
                      handleDeleteQuestionByLocalId(question.localId)
                    }
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {question.isEditing ? (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    value={question.title}
                    onChange={(event) =>
                      handleUpdateQuestionField(question.localId, (current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" style={{ maxWidth: 200 }}>
                  <Form.Label>Points</Form.Label>
                  <Form.Control
                    type="number"
                    value={question.points}
                    onChange={(event) =>
                      handleUpdateQuestionField(question.localId, (current) => ({
                        ...current,
                        points: Number(event.target.value) || 0,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group className="mb-3" style={{ maxWidth: 260 }}>
                  <Form.Label>Question Type</Form.Label>
                  <Form.Select
                    value={question.questionType}
                    onChange={(event) =>
                      handleQuestionTypeChange(
                        question.localId,
                        event.target.value as QuizQuestionType
                      )
                    }
                  >
                    <option value="MULTIPLE_CHOICE">
                      Multiple Choice
                    </option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="FILL_BLANK">Fill in the Blank</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={question.prompt}
                    onChange={(event) =>
                      handleUpdateQuestionField(question.localId, (current) => ({
                        ...current,
                        prompt: event.target.value,
                      }))
                    }
                  />
                </Form.Group>

                {question.questionType === "MULTIPLE_CHOICE" && (
                  <div className="mb-3">
                    <Form.Label>Choices</Form.Label>
                    {question.multipleChoiceOptions.map((choice, index) => (
                      <InputGroup className="mb-2" key={choice.id}>
                        <InputGroup.Text>
                          <Form.Check
                            type="radio"
                            name={`correct-${question.localId}`}
                            checked={choice.isCorrect}
                            onChange={() =>
                              handleChoiceCorrectSelection(
                                question.localId,
                                choice.id
                              )
                            }
                          />
                        </InputGroup.Text>
                        <Form.Control
                          value={choice.text}
                          placeholder={`Choice ${index + 1}`}
                          onChange={(event) =>
                            handleChoiceTextChange(
                              question.localId,
                              choice.id,
                              event.target.value
                            )
                          }
                        />
                        <Button
                          variant="outline-danger"
                          onClick={() =>
                            handleRemoveChoiceFromQuestion(
                              question.localId,
                              choice.id
                            )
                          }
                          disabled={question.multipleChoiceOptions.length <= 2}
                        >
                          Remove
                        </Button>
                      </InputGroup>
                    ))}
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleAddChoiceToQuestion(question.localId)}
                    >
                      Add Choice
                    </Button>
                  </div>
                )}

                {question.questionType === "TRUE_FALSE" && (
                  <div className="mb-3">
                    <Form.Label>Correct Answer</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        label="True"
                        type="radio"
                        name={`true-false-${question.localId}`}
                        checked={question.trueFalseAnswer === "TRUE"}
                        onChange={() =>
                          handleTrueFalseChange(question.localId, "TRUE")
                        }
                      />
                      <Form.Check
                        inline
                        label="False"
                        type="radio"
                        name={`true-false-${question.localId}`}
                        checked={question.trueFalseAnswer === "FALSE"}
                        onChange={() =>
                          handleTrueFalseChange(question.localId, "FALSE")
                        }
                      />
                    </div>
                  </div>
                )}

                {question.questionType === "FILL_BLANK" && (
                  <div className="mb-3">
                    <Form.Label>Acceptable Answers</Form.Label>
                    {question.fillBlankAnswers.map((answer, index) => (
                      <InputGroup className="mb-2" key={answer.id}>
                        <InputGroup.Text>Answer {index + 1}</InputGroup.Text>
                        <Form.Control
                          value={answer.text}
                          onChange={(event) =>
                            handleBlankAnswerChange(
                              question.localId,
                              answer.id,
                              event.target.value
                            )
                          }
                        />
                        <Button
                          variant="outline-danger"
                          onClick={() =>
                            handleRemoveBlankAnswer(
                              question.localId,
                              answer.id
                            )
                          }
                          disabled={question.fillBlankAnswers.length <= 1}
                        >
                          Remove
                        </Button>
                      </InputGroup>
                    ))}
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleAddBlankAnswer(question.localId)}
                    >
                      Add Another Answer
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-muted">{question.prompt}</p>
                {renderQuestionSummary(question)}
              </>
            )}
          </Card.Body>
        </Card>
      ))}

      <div className="d-flex justify-content-end gap-2 mt-4 flex-wrap">
        <Button variant="light" onClick={handleCancelEditing}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handlePersistQuestions}
          disabled={isSavingQuestions}
          id="wd-save-quiz-questions"
        >
          {isSavingQuestions ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
