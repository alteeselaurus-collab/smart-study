import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Types "../types/catalog";
import ProfileTypes "../types/profile";

module {
  public func listSubjects(subjects : Map.Map<Nat, Types.Subject>) : [Types.SubjectView] {
    let all = subjects.values().toArray();
    let sorted = all.sort(func(a, b) = Nat.compare(a.id, b.id));
    sorted.map(func(s) = toSubjectView(s));
  };

  public func listLessons(
    lessons : Map.Map<Nat, Types.Lesson>,
    profiles : Map.Map<Principal, ProfileTypes.StudentProfile>,
    caller : Principal,
    subjectId : Nat,
    level : Text,
  ) : [Types.LessonSummary] {
    let all = lessons.values().toArray();
    let bySubject = all.filter(func(l) = l.subjectId == subjectId);
    let bySubjectLevel = bySubject.filter(func(l) {
      level == "" or l.level == level
    });
    // Tolérance aux niveaux hérités : si le niveau demandé ne correspond à
    // aucune leçon (par ex. une ancienne valeur « 6e »), on ne renvoie pas une
    // liste vide mais toutes les leçons de la matière, tous niveaux confondus.
    let scoped = if (bySubjectLevel.size() > 0) { bySubjectLevel } else { bySubject };
    // Localisation : privilégier les leçons qui correspondent au pays, au
    // programme et à la langue du profil de l'élève. Si aucune variante ne
    // correspond, on retombe sur toutes les leçons de la matière et du niveau.
    let localized = switch (profiles.get(caller)) {
      case (?p) {
        let matched = scoped.filter(func(l) {
          (p.country == "" or l.country == p.country) and
          (p.curriculum == "" or l.curriculum == p.curriculum) and
          (p.language == "" or l.language == p.language)
        });
        if (matched.size() > 0) { matched } else { scoped };
      };
      case null { scoped };
    };
    let sorted = localized.sort(func(a, b) = Nat.compare(a.id, b.id));
    sorted.map(func(l) = toLessonSummary(l));
  };

  public func getLesson(
    lessons : Map.Map<Nat, Types.Lesson>,
    lessonId : Nat,
  ) : ?Types.LessonDetail {
    switch (lessons.get(lessonId)) {
      case (?l) ?toLessonDetail(l);
      case null null;
    };
  };

  public func listExercises(
    exercises : Map.Map<Nat, Types.Exercise>,
    lessonId : Nat,
  ) : [Types.ExerciseView] {
    let all = exercises.values().toArray();
    let filtered = all.filter(func(e) = e.lessonId == lessonId);
    let sorted = filtered.sort(func(a, b) = Nat.compare(a.id, b.id));
    sorted.map(func(e) = toExerciseView(e));
  };

  public func getExam(
    exams : Map.Map<Nat, Types.Exam>,
    lessonId : Nat,
  ) : ?Types.ExamView {
    let all = exams.values().toArray();
    let filtered = all.filter(func(e) = e.lessonId == lessonId);
    let sorted = filtered.sort(func(a, b) = Nat.compare(a.id, b.id));
    if (sorted.size() == 0) { null } else { ?toExamView(sorted[0]) };
  };

  public func toSubjectView(s : Types.Subject) : Types.SubjectView {
    { id = s.id; name = s.name; description = s.description; icon = s.icon };
  };

  public func toLessonSummary(l : Types.Lesson) : Types.LessonSummary {
    { id = l.id; subjectId = l.subjectId; title = l.title; level = l.level };
  };

  public func toLessonDetail(l : Types.Lesson) : Types.LessonDetail {
    {
      id = l.id;
      subjectId = l.subjectId;
      title = l.title;
      level = l.level;
      country = l.country;
      curriculum = l.curriculum;
      language = l.language;
      explanation = l.explanation;
      example = l.example;
      keyPoints = l.keyPoints;
      memorizationSummary = l.memorizationSummary;
      memorizationPoints = l.memorizationPoints;
    };
  };

  public func toExerciseView(e : Types.Exercise) : Types.ExerciseView {
    { id = e.id; lessonId = e.lessonId; prompt = e.prompt; choices = e.choices };
  };

  public func toExamView(e : Types.Exam) : Types.ExamView {
    {
      id = e.id;
      lessonId = e.lessonId;
      title = e.title;
      durationSeconds = e.durationSeconds;
      questions = e.questions;
    };
  };
};
