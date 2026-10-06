import Common "common";

module {
  public type Subject = {
    id : Common.SubjectId;
    name : Text;
    description : Text;
    icon : Text;
  };

  public type Lesson = {
    id : Common.LessonId;
    subjectId : Common.SubjectId;
    title : Text;
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    explanation : Text;
    example : Text;
    keyPoints : [Text];
    memorizationSummary : Text;
    memorizationPoints : [Text];
  };

  public type Exercise = {
    id : Common.ExerciseId;
    lessonId : Common.LessonId;
    prompt : Text;
    choices : [Text];
    correctIndex : Nat;
    explanation : Text;
  };

  public type ExamQuestion = {
    exerciseId : Common.ExerciseId;
    prompt : Text;
    choices : [Text];
  };

  public type Exam = {
    id : Common.ExamId;
    lessonId : Common.LessonId;
    title : Text;
    durationSeconds : Nat;
    questions : [ExamQuestion];
  };

  public type SubjectView = {
    id : Common.SubjectId;
    name : Text;
    description : Text;
    icon : Text;
  };

  public type LessonSummary = {
    id : Common.LessonId;
    subjectId : Common.SubjectId;
    title : Text;
    level : Text;
  };

  public type LessonDetail = {
    id : Common.LessonId;
    subjectId : Common.SubjectId;
    title : Text;
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    explanation : Text;
    example : Text;
    keyPoints : [Text];
    memorizationSummary : Text;
    memorizationPoints : [Text];
  };

  public type ExerciseView = {
    id : Common.ExerciseId;
    lessonId : Common.LessonId;
    prompt : Text;
    choices : [Text];
  };

  public type ExamView = {
    id : Common.ExamId;
    lessonId : Common.LessonId;
    title : Text;
    durationSeconds : Nat;
    questions : [ExamQuestion];
  };
};
