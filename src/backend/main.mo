import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import CatalogTypes "types/catalog";
import LearningTypes "types/learning";
import ProfileTypes "types/profile";
import CatalogApi "mixins/catalog-api";
import LearningApi "mixins/learning-api";
import ProfileApi "mixins/profile-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let subjects : Map.Map<Nat, CatalogTypes.Subject>;
  let lessons : Map.Map<Nat, CatalogTypes.Lesson>;
  let exercises : Map.Map<Nat, CatalogTypes.Exercise>;
  let exams : Map.Map<Nat, CatalogTypes.Exam>;
  let profiles : Map.Map<Principal, ProfileTypes.StudentProfile>;
  let progress : Map.Map<Principal, Map.Map<Nat, LearningTypes.LessonProgress>>;
  let examSessions : Map.Map<Nat, LearningTypes.ExamSession>;
  let examResults : Map.Map<Nat, LearningTypes.ExamResult>;
  let activity : Map.Map<Principal, List.List<LearningTypes.ActivityEntry>>;
  let badges : Map.Map<Text, LearningTypes.Badge>;
  let nextSessionId : { var value : Nat };

  transient let anyP = Principal.fromText("aaaaa-aa");

  func stepToText(step : LearningTypes.LearningStep) : Text {
    switch (step) {
      case (#comprendre) "comprendre";
      case (#exemple) "exemple";
      case (#entrainer) "entrainer";
      case (#corriger) "corriger";
      case (#memoriser) "memoriser";
      case (#tester) "tester";
      case (#maitriser) "maitriser";
    };
  };

  func stepsCompleted(steps : [LearningTypes.StepState]) : Nat {
    var n = 0;
    for (s in steps.values()) {
      if (s.completed) { n += 1 };
    };
    n;
  };

  func progressRows() : Iter.Iter<(Principal, LearningTypes.LessonProgress)> {
    let out = List.empty<(Principal, LearningTypes.LessonProgress)>();
    for ((p, userProgress) in progress.entries()) {
      for ((_, lp) in userProgress.entries()) {
        out.add((p, lp));
      };
    };
    out.values();
  };

  func activityRows() : Iter.Iter<(Principal, LearningTypes.ActivityEntry)> {
    let out = List.empty<(Principal, LearningTypes.ActivityEntry)>();
    for ((p, entries) in activity.entries()) {
      for (e in entries.values()) {
        out.add((p, e));
      };
    };
    out.values();
  };

  func ownerIsCaller(caller : Principal, owner : OQL.Value) : Bool =
    owner == #text(caller.toText());

  include MixinAuthorization(accessControlState, null);
  include Expose({
    entities = [
      // Catalogue public : matières, leçons, exercices, contrôles, badges.
      subjects.toEntity("subject", "Subject", "id")
        .sample({ id = 0; name = ""; description = ""; icon = "" })
        .public_()
        .build(),
      OQL.Entity.manual<CatalogTypes.Lesson>("lesson", func () = lessons.values(), "Lesson", "id")
        .sample({
          id = 0;
          subjectId = 0;
          title = "";
          level = "";
          country = "";
          curriculum = "";
          language = "";
          explanation = "";
          example = "";
          keyPoints = [];
          memorizationSummary = "";
          memorizationPoints = [];
        })
        .payload("id", func l = l.id)
        .payload("subjectId", func l = l.subjectId)
        .edge("subjectId", "subject")
        .payload("title", func l = l.title)
        .payload("level", func l = l.level)
        .payload("country", func l = l.country)
        .payload("curriculum", func l = l.curriculum)
        .payload("language", func l = l.language)
        .payload("explanation", func l = l.explanation)
        .payload("example", func l = l.example)
        .payload("keyPoints", func l = l.keyPoints.values().join(" | "))
        .payload("memorizationSummary", func l = l.memorizationSummary)
        .payload("memorizationPoints", func l = l.memorizationPoints.values().join(" | "))
        .public_()
        .build(),
      OQL.Entity.manual<CatalogTypes.Exercise>("exercise", func () = exercises.values(), "Exercise", "id")
        .sample({
          id = 0;
          lessonId = 0;
          prompt = "";
          choices = [];
          correctIndex = 0;
          explanation = "";
        })
        .payload("id", func e = e.id)
        .payload("lessonId", func e = e.lessonId)
        .edge("lessonId", "lesson")
        .payload("prompt", func e = e.prompt)
        .payload("choices", func e = e.choices.values().join(" | "))
        .payload("correctIndex", func e = e.correctIndex)
        .payload("explanation", func e = e.explanation)
        .public_()
        .build(),
      OQL.Entity.manual<CatalogTypes.Exam>("exam", func () = exams.values(), "Exam", "id")
        .sample({
          id = 0;
          lessonId = 0;
          title = "";
          durationSeconds = 0;
          questions = [];
        })
        .payload("id", func e = e.id)
        .payload("lessonId", func e = e.lessonId)
        .edge("lessonId", "lesson")
        .payload("title", func e = e.title)
        .payload("durationSeconds", func e = e.durationSeconds)
        .payload("questionCount", func e = e.questions.size())
        .public_()
        .build(),
      badges.toEntity("badge", "Badge", "id")
        .sample({ id = ""; name = ""; description = ""; icon = "" })
        .public_()
        .build(),
      // Profils élève : chaque appelant signé ne lit que sa propre ligne.
      OQL.Entity.manual<(Principal, ProfileTypes.StudentProfile)>(
        "studentProfile",
        func () = profiles.entries(),
        "StudentProfile",
        "owner",
      )
        .sample((
          anyP,
          {
            level = "";
            country = "";
            curriculum = "";
            language = "";
            points = 0;
            studentLevel = 0;
            lessonsCompleted = 0;
            exercisesCompleted = 0;
            updatedAt = 0;
          },
        ))
        .payload("owner", func ((p, _)) = p.toText())
        .payload("level", func ((_, s)) = s.level)
        .payload("country", func ((_, s)) = s.country)
        .payload("curriculum", func ((_, s)) = s.curriculum)
        .payload("language", func ((_, s)) = s.language)
        .payload("points", func ((_, s)) = s.points)
        .payload("studentLevel", func ((_, s)) = s.studentLevel)
        .payload("lessonsCompleted", func ((_, s)) = s.lessonsCompleted)
        .payload("exercisesCompleted", func ((_, s)) = s.exercisesCompleted)
        .payload("updatedAt", func ((_, s)) = s.updatedAt)
        .ownedByWith("owner", ownerIsCaller)
        .controllerOrScoped()
        .build(),
      // Progression par leçon : lignes aplaties depuis la carte imbriquée.
      OQL.Entity.manual<(Principal, LearningTypes.LessonProgress)>(
        "lessonProgress",
        progressRows,
        "LessonProgress",
        "id",
      )
        .sample((
          anyP,
          {
            lessonId = 0;
            steps = [];
            currentStep = #comprendre;
            masteryRate = 0;
            updatedAt = 0;
          },
        ))
        .payload("id", func ((p, lp)) = p.toText() # ":" # lp.lessonId.toText())
        .payload("owner", func ((p, _)) = p.toText())
        .payload("lessonId", func ((_, lp)) = lp.lessonId)
        .edge("lessonId", "lesson")
        .payload("currentStep", func ((_, lp)) = stepToText(lp.currentStep))
        .payload("stepsCompleted", func ((_, lp)) = stepsCompleted(lp.steps))
        .payload("masteryRate", func ((_, lp)) = lp.masteryRate)
        .payload("updatedAt", func ((_, lp)) = lp.updatedAt)
        .ownedByWith("owner", ownerIsCaller)
        .controllerOrScoped()
        .build(),
      // Sessions de contrôle : données d'exploitation, lecture contrôleur.
      examSessions.toEntity("examSession", "ExamSession", "sessionId")
        .sample({
          sessionId = 0;
          examId = 0;
          lessonId = 0;
          startedAt = 0;
          durationSeconds = 0;
          submitted = false;
        })
        .edge("examId", "exam")
        .edge("lessonId", "lesson")
        .controllerOnly()
        .build(),
      // Historique d'activité : lignes aplaties depuis la liste par utilisateur.
      OQL.Entity.manual<(Principal, LearningTypes.ActivityEntry)>(
        "activityEntry",
        activityRows,
        "ActivityEntry",
        "id",
      )
        .sample((anyP, { kind = ""; lessonId = 0; detail = ""; at = 0 }))
        .payload("id", func ((p, e)) = p.toText() # ":" # e.at.toText() # ":" # e.kind)
        .payload("owner", func ((p, _)) = p.toText())
        .payload("kind", func ((_, e)) = e.kind)
        .payload("lessonId", func ((_, e)) = e.lessonId)
        .edge("lessonId", "lesson")
        .payload("detail", func ((_, e)) = e.detail)
        .payload("at", func ((_, e)) = e.at)
        .ownedByWith("owner", ownerIsCaller)
        .controllerOrScoped()
        .build(),
    ];
  });
  include CatalogApi(subjects, lessons, exercises, exams, profiles);
  include LearningApi({
    subjects;
    lessons;
    exercises;
    exams;
    profiles;
    progress;
    examSessions;
    examResults;
    activity;
    badges;
    nextSessionId;
  });
  include ProfileApi(profiles);
  include ApiDocMixin();
};
