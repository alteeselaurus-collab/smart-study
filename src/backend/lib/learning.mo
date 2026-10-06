import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import CatalogTypes "../types/catalog";
import ProfileTypes "../types/profile";
import Types "../types/learning";

module {
  // Shared mutable state slice needed by the learning domain.
  public type LearningState = {
    subjects : Map.Map<Nat, CatalogTypes.Subject>;
    lessons : Map.Map<Nat, CatalogTypes.Lesson>;
    exercises : Map.Map<Nat, CatalogTypes.Exercise>;
    exams : Map.Map<Nat, CatalogTypes.Exam>;
    profiles : Map.Map<Principal, ProfileTypes.StudentProfile>;
    progress : Map.Map<Principal, Map.Map<Nat, Types.LessonProgress>>;
    examSessions : Map.Map<Nat, Types.ExamSession>;
    examResults : Map.Map<Nat, Types.ExamResult>;
    activity : Map.Map<Principal, List.List<Types.ActivityEntry>>;
    badges : Map.Map<Text, Types.Badge>;
    nextSessionId : { var value : Nat };
  };

  let allSteps : [Types.LearningStep] = [
    #comprendre, #exemple, #entrainer, #corriger, #memoriser, #tester, #maitriser,
  ];

  func stepIndex(step : Types.LearningStep) : Nat {
    switch (step) {
      case (#comprendre) 0;
      case (#exemple) 1;
      case (#entrainer) 2;
      case (#corriger) 3;
      case (#memoriser) 4;
      case (#tester) 5;
      case (#maitriser) 6;
    };
  };

  func freshSteps() : [Types.StepState] {
    allSteps.map(func(s) = { step = s; completed = false });
  };

  func freshProgress(lessonId : Nat) : Types.LessonProgress {
    {
      lessonId;
      steps = freshSteps();
      currentStep = #comprendre;
      masteryRate = 0;
      updatedAt = Time.now();
    };
  };

  func getOrCreateProgress(state : LearningState, caller : Principal, lessonId : Nat) : Types.LessonProgress {
    let userProgress = switch (state.progress.get(caller)) {
      case (?p) p;
      case null {
        let p = Map.empty<Nat, Types.LessonProgress>();
        state.progress.add(caller, p);
        p;
      };
    };
    switch (userProgress.get(lessonId)) {
      case (?lp) lp;
      case null {
        let lp = freshProgress(lessonId);
        userProgress.add(lessonId, lp);
        lp;
      };
    };
  };

  func saveProgress(state : LearningState, caller : Principal, lp : Types.LessonProgress) {
    let userProgress = switch (state.progress.get(caller)) {
      case (?p) p;
      case null {
        let p = Map.empty<Nat, Types.LessonProgress>();
        state.progress.add(caller, p);
        p;
      };
    };
    userProgress.add(lp.lessonId, lp);
  };

  func recordActivity(state : LearningState, caller : Principal, kind : Text, lessonId : Nat, detail : Text) {
    let entries = switch (state.activity.get(caller)) {
      case (?l) l;
      case null {
        let l = List.empty<Types.ActivityEntry>();
        state.activity.add(caller, l);
        l;
      };
    };
    entries.add({ kind; lessonId; detail; at = Time.now() });
  };

  func ensureProfile(state : LearningState, caller : Principal) : ProfileTypes.StudentProfile {
    switch (state.profiles.get(caller)) {
      case (?p) p;
      case null {
        let p : ProfileTypes.StudentProfile = {
          level = "college";
          country = "France";
          curriculum = "Programme national";
          language = "fr";
          points = 0;
          studentLevel = 1;
          lessonsCompleted = 0;
          exercisesCompleted = 0;
          updatedAt = Time.now();
        };
        state.profiles.add(caller, p);
        p;
      };
    };
  };

  func saveProfile(state : LearningState, caller : Principal, p : ProfileTypes.StudentProfile) {
    state.profiles.add(caller, p);
  };

  func levelForPoints(points : Nat) : Nat {
    points / 100 + 1;
  };

  func awardPoints(state : LearningState, caller : Principal, amount : Nat) {
    let p = ensureProfile(state, caller);
    let newPoints = p.points + amount;
    let updated : ProfileTypes.StudentProfile = {
      level = p.level;
      country = p.country;
      curriculum = p.curriculum;
      language = p.language;
      points = newPoints;
      studentLevel = levelForPoints(newPoints);
      lessonsCompleted = p.lessonsCompleted;
      exercisesCompleted = p.exercisesCompleted;
      updatedAt = Time.now();
    };
    saveProfile(state, caller, updated);
  };

  func bumpExercisesCompleted(state : LearningState, caller : Principal) {
    let p = ensureProfile(state, caller);
    let updated : ProfileTypes.StudentProfile = {
      level = p.level;
      country = p.country;
      curriculum = p.curriculum;
      language = p.language;
      points = p.points;
      studentLevel = p.studentLevel;
      lessonsCompleted = p.lessonsCompleted;
      exercisesCompleted = p.exercisesCompleted + 1;
      updatedAt = Time.now();
    };
    saveProfile(state, caller, updated);
  };

  func bumpLessonsCompleted(state : LearningState, caller : Principal) {
    let p = ensureProfile(state, caller);
    let updated : ProfileTypes.StudentProfile = {
      level = p.level;
      country = p.country;
      curriculum = p.curriculum;
      language = p.language;
      points = p.points;
      studentLevel = p.studentLevel;
      lessonsCompleted = p.lessonsCompleted + 1;
      exercisesCompleted = p.exercisesCompleted;
      updatedAt = Time.now();
    };
    saveProfile(state, caller, updated);
  };

  func masteryForSteps(steps : [Types.StepState]) : Nat {
    var done = 0;
    for (s in steps.values()) {
      if (s.completed) { done += 1 };
    };
    done * 100 / allSteps.size();
  };

  public func getLessonProgress(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
  ) : ?Types.LessonProgress {
    switch (state.progress.get(caller)) {
      case (?userProgress) userProgress.get(lessonId);
      case null null;
    };
  };

  public func advanceStep(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
  ) : Types.LessonProgress {
    let lp = getOrCreateProgress(state, caller, lessonId);
    let idx = stepIndex(lp.currentStep);
    let alreadyDone = lp.steps.any(func(s) = s.step == lp.currentStep and s.completed);
    let newSteps = lp.steps.map(func(s) {
      if (stepIndex(s.step) <= idx) { { step = s.step; completed = true } } else { s };
    });
    let nextStep = if (idx + 1 < allSteps.size()) { allSteps[idx + 1] } else { #maitriser };
    let updated : Types.LessonProgress = {
      lessonId = lp.lessonId;
      steps = newSteps;
      currentStep = nextStep;
      masteryRate = masteryForSteps(newSteps);
      updatedAt = Time.now();
    };
    saveProgress(state, caller, updated);
    if (not alreadyDone) {
      if (idx + 1 >= allSteps.size()) {
        bumpLessonsCompleted(state, caller);
        recordActivity(state, caller, "lecon", lessonId, "Leçon maîtrisée");
      } else {
        recordActivity(state, caller, "etape", lessonId, "Étape franchie");
      };
    };
    updated;
  };

  public func submitAnswer(
    state : LearningState,
    caller : Principal,
    exerciseId : Nat,
    selectedIndex : Nat,
  ) : Types.AnswerResult {
    let exercise = switch (state.exercises.get(exerciseId)) {
      case (?e) e;
      case null {
        return { correct = false; correctIndex = 0; explanation = "Exercice introuvable." };
      };
    };
    let correct = selectedIndex == exercise.correctIndex;
    if (correct) {
      awardPoints(state, caller, 10);
      bumpExercisesCompleted(state, caller);
      recordActivity(state, caller, "exercice", exercise.lessonId, "Bonne réponse");
      let lp = getOrCreateProgress(state, caller, exercise.lessonId);
      let newSteps = lp.steps.map(func(s) {
        if (s.step == #entrainer or s.step == #corriger) { { step = s.step; completed = true } } else { s };
      });
      let updated : Types.LessonProgress = {
        lessonId = lp.lessonId;
        steps = newSteps;
        currentStep = lp.currentStep;
        masteryRate = masteryForSteps(newSteps);
        updatedAt = Time.now();
      };
      saveProgress(state, caller, updated);
    } else {
      recordActivity(state, caller, "erreur", exercise.lessonId, "Réponse incorrecte");
    };
    { correct; correctIndex = exercise.correctIndex; explanation = exercise.explanation };
  };

  public func startExam(
    state : LearningState,
    caller : Principal,
    examId : Nat,
  ) : Types.ExamSession {
    let exam = switch (state.exams.get(examId)) {
      case (?e) e;
      case null {
        return {
          sessionId = 0;
          examId;
          lessonId = 0;
          startedAt = Time.now();
          durationSeconds = 0;
          submitted = true;
        };
      };
    };
    let sessionId = state.nextSessionId.value;
    state.nextSessionId.value := sessionId + 1;
    let session : Types.ExamSession = {
      sessionId;
      examId;
      lessonId = exam.lessonId;
      startedAt = Time.now();
      durationSeconds = exam.durationSeconds;
      submitted = false;
    };
    state.examSessions.add(sessionId, session);
    recordActivity(state, caller, "controle", exam.lessonId, "Contrôle démarré");
    session;
  };

  func scoreQuestion(
    state : LearningState,
    q : CatalogTypes.ExamQuestion,
    answers : [Types.ExamAnswer],
  ) : Types.ExamQuestionResult {
    let selected = switch (answers.find(func(a) = a.exerciseId == q.exerciseId)) {
      case (?a) a.selectedIndex;
      case null 0;
    };
    switch (state.exercises.get(q.exerciseId)) {
      case (?exercise) {
        {
          exerciseId = q.exerciseId;
          prompt = q.prompt;
          selectedIndex = selected;
          correctIndex = exercise.correctIndex;
          correct = selected == exercise.correctIndex;
          explanation = exercise.explanation;
        };
      };
      case null {
        {
          exerciseId = q.exerciseId;
          prompt = q.prompt;
          selectedIndex = selected;
          correctIndex = 0;
          correct = false;
          explanation = "Exercice introuvable.";
        };
      };
    };
  };

  public func submitExam(
    state : LearningState,
    caller : Principal,
    sessionId : Nat,
    answers : [Types.ExamAnswer],
  ) : Types.ExamResult {
    let session = switch (state.examSessions.get(sessionId)) {
      case (?s) s;
      case null {
        return { sessionId; examId = 0; score = 0; total = 0; results = [] };
      };
    };
    let exam = switch (state.exams.get(session.examId)) {
      case (?e) e;
      case null {
        return { sessionId; examId = session.examId; score = 0; total = 0; results = [] };
      };
    };
    let results = exam.questions.map(func(q) = scoreQuestion(state, q, answers));
    var score = 0;
    for (r in results.values()) {
      if (r.correct) { score += 1 };
    };
    let total = exam.questions.size();
    let result : Types.ExamResult = { sessionId; examId = session.examId; score; total; results };
    state.examResults.add(sessionId, result);
    let closed : Types.ExamSession = {
      sessionId = session.sessionId;
      examId = session.examId;
      lessonId = session.lessonId;
      startedAt = session.startedAt;
      durationSeconds = session.durationSeconds;
      submitted = true;
    };
    state.examSessions.add(sessionId, closed);
    awardPoints(state, caller, score * 20);
    recordActivity(state, caller, "controle", session.lessonId, "Contrôle terminé : " # score.toText() # "/" # total.toText());
    result;
  };

  public func listRevisions(
    state : LearningState,
    caller : Principal,
  ) : [Types.RevisionItem] {
    let userProgress = switch (state.progress.get(caller)) {
      case (?p) p;
      case null Map.empty<Nat, Types.LessonProgress>();
    };
    let items = List.empty<Types.RevisionItem>();
    for ((lessonId, lp) in userProgress.entries()) {
      let lesson = switch (state.lessons.get(lessonId)) {
        case (?l) l;
        case null { continue };
      };
      let priority = if (lp.masteryRate >= 100) 0 else 100 - lp.masteryRate;
      let reason = if (lp.masteryRate < 50) {
        "Maîtrise faible — à revoir en priorité";
      } else if (lp.masteryRate < 100) {
        "Leçon en cours — consolider les acquis";
      } else {
        "Leçon maîtrisée — révision d'entretien";
      };
      items.add({
        lessonId;
        subjectId = lesson.subjectId;
        title = lesson.title;
        priority;
        reason;
      });
    };
    let arr = items.toArray();
    arr.sort(func(a, b) = Nat.compare(b.priority, a.priority));
  };

  public func getProgress(
    state : LearningState,
    caller : Principal,
  ) : Types.ProgressOverview {
    let profile = ensureProfile(state, caller);
    let userProgress = switch (state.progress.get(caller)) {
      case (?p) p;
      case null Map.empty<Nat, Types.LessonProgress>();
    };
    // Aggregate mastery per subject.
    let subjectTotals = Map.empty<Nat, { var sum : Nat; var count : Nat }>();
    for ((lessonId, lp) in userProgress.entries()) {
      switch (state.lessons.get(lessonId)) {
        case (?lesson) {
          let agg = switch (subjectTotals.get(lesson.subjectId)) {
            case (?a) a;
            case null {
              let a = { var sum = 0; var count = 0 };
              subjectTotals.add(lesson.subjectId, a);
              a;
            };
          };
          agg.sum := agg.sum + lp.masteryRate;
          agg.count := agg.count + 1;
        };
        case null {};
      };
    };
    let subjects = subjectTotals.entries().map(func((subjectId, agg)) {
      let name = switch (state.subjects.get(subjectId)) {
        case (?s) s.name;
        case null "Matière";
      };
      {
        subjectId;
        name;
        masteryRate = if (agg.count == 0) 0 else agg.sum / agg.count;
      };
    }).toArray();
    let recent = switch (state.activity.get(caller)) {
      case (?entries) {
        let arr = entries.toArray();
        let n = arr.size();
        let start = if (n > 10) n - 10 else 0;
        arr.sliceToArray(start.toInt(), n.toInt());
      };
      case null [];
    };
    {
      totalPoints = profile.points;
      level = profile.studentLevel;
      subjects;
      recentActivity = recent;
    };
  };

  public func getRewards(
    state : LearningState,
    caller : Principal,
  ) : Types.RewardState {
    let profile = ensureProfile(state, caller);
    let unlocked = List.empty<Types.Badge>();
    for ((_, badge) in state.badges.entries()) {
      let earned = switch (badge.id) {
        case "premier-pas" profile.exercisesCompleted >= 1;
        case "studieux" profile.exercisesCompleted >= 10;
        case "expert" profile.points >= 500;
        case "maitre" profile.lessonsCompleted >= 5;
        case _ false;
      };
      if (earned) { unlocked.add(badge) };
    };
    {
      points = profile.points;
      level = profile.studentLevel;
      badges = unlocked.toArray();
    };
  };

  public func getCondensedPath(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
    durationMinutes : Nat,
  ) : Types.CondensedPath {
    let lesson = state.lessons.get(lessonId);
    let steps : [Types.LearningStep] = if (durationMinutes <= 5) {
      [#comprendre, #memoriser, #tester];
    } else if (durationMinutes <= 10) {
      [#comprendre, #exemple, #memoriser, #tester];
    } else {
      [#comprendre, #exemple, #entrainer, #corriger, #memoriser, #tester, #maitriser];
    };
    let summary = switch (lesson) {
      case (?l) {
        "Parcours condensé de " # durationMinutes.toText() # " minutes : " # l.memorizationSummary;
      };
      case null {
        "Parcours condensé de " # durationMinutes.toText() # " minutes.";
      };
    };
    { lessonId; durationMinutes; steps; summary };
  };

  public func askAiTeacher(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
    question : Text,
  ) : Types.AiExplanation {
    let lesson = state.lessons.get(lessonId);
    let profile = ensureProfile(state, caller);
    let answer = switch (lesson) {
      case (?l) {
        "Voici une explication simple pour « " # l.title # " » : " # l.explanation #
        " Exemple : " # l.example;
      };
      case null {
        "Je n'ai pas trouvé cette leçon. Reformule ta question ou choisis une leçon.";
      };
    };
    { question; answer; level = profile.level };
  };

  public func buildAiPrompt(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
    question : Text,
  ) : Text {
    let lesson = state.lessons.get(lessonId);
    let profile = ensureProfile(state, caller);
    let context = switch (lesson) {
      case (?l) {
        "Leçon : " # l.title # "\nExplication : " # l.explanation # "\nExemple : " # l.example;
      };
      case null "Aucune leçon sélectionnée.";
    };
    "Tu es un professeur bienveillant pour un élève de niveau " # profile.level #
    ". Explique simplement, en français, avec un exemple concret.\n" # context #
    "\nQuestion de l'élève : " # question;
  };

  public func recordAiActivity(
    state : LearningState,
    caller : Principal,
    lessonId : Nat,
  ) {
    recordActivity(state, caller, "professeur-ia", lessonId, "Question au professeur IA");
  };
};
