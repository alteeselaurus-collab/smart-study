import Common "common";

module {
  public type LearningStep = {
    #comprendre;
    #exemple;
    #entrainer;
    #corriger;
    #memoriser;
    #tester;
    #maitriser;
  };

  public type StepState = {
    step : LearningStep;
    completed : Bool;
  };

  public type LessonProgress = {
    lessonId : Common.LessonId;
    steps : [StepState];
    currentStep : LearningStep;
    masteryRate : Nat;
    updatedAt : Common.Timestamp;
  };

  public type AnswerResult = {
    correct : Bool;
    correctIndex : Nat;
    explanation : Text;
  };

  public type ExamSession = {
    sessionId : Common.SessionId;
    examId : Common.ExamId;
    lessonId : Common.LessonId;
    startedAt : Common.Timestamp;
    durationSeconds : Nat;
    submitted : Bool;
  };

  public type ExamAnswer = {
    exerciseId : Common.ExerciseId;
    selectedIndex : Nat;
  };

  public type ExamQuestionResult = {
    exerciseId : Common.ExerciseId;
    prompt : Text;
    selectedIndex : Nat;
    correctIndex : Nat;
    correct : Bool;
    explanation : Text;
  };

  public type ExamResult = {
    sessionId : Common.SessionId;
    examId : Common.ExamId;
    score : Nat;
    total : Nat;
    results : [ExamQuestionResult];
  };

  public type RevisionItem = {
    lessonId : Common.LessonId;
    subjectId : Common.SubjectId;
    title : Text;
    priority : Nat;
    reason : Text;
  };

  public type ActivityEntry = {
    kind : Text;
    lessonId : Common.LessonId;
    detail : Text;
    at : Common.Timestamp;
  };

  public type SubjectMastery = {
    subjectId : Common.SubjectId;
    name : Text;
    masteryRate : Nat;
  };

  public type ProgressOverview = {
    totalPoints : Nat;
    level : Nat;
    subjects : [SubjectMastery];
    recentActivity : [ActivityEntry];
  };

  public type Badge = {
    id : Common.BadgeId;
    name : Text;
    description : Text;
    icon : Text;
  };

  public type RewardState = {
    points : Nat;
    level : Nat;
    badges : [Badge];
  };

  public type CondensedPath = {
    lessonId : Common.LessonId;
    durationMinutes : Common.DurationMinutes;
    steps : [LearningStep];
    summary : Text;
  };

  public type AiExplanation = {
    question : Text;
    answer : Text;
    level : Text;
  };
};
