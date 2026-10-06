import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CatalogTypes "../types/catalog";
import ProfileTypes "../types/profile";
import CatalogLib "../lib/catalog";

mixin (
  subjects : Map.Map<Nat, CatalogTypes.Subject>,
  lessons : Map.Map<Nat, CatalogTypes.Lesson>,
  exercises : Map.Map<Nat, CatalogTypes.Exercise>,
  exams : Map.Map<Nat, CatalogTypes.Exam>,
  profiles : Map.Map<Principal, ProfileTypes.StudentProfile>,
) {
  public query func listSubjects() : async [CatalogTypes.SubjectView] {
    CatalogLib.listSubjects(subjects);
  };

  public query ({ caller }) func listLessons(subjectId : Nat, level : Text) : async [CatalogTypes.LessonSummary] {
    CatalogLib.listLessons(lessons, profiles, caller, subjectId, level);
  };

  public query func getLesson(lessonId : Nat) : async ?CatalogTypes.LessonDetail {
    CatalogLib.getLesson(lessons, lessonId);
  };

  public query func listExercises(lessonId : Nat) : async [CatalogTypes.ExerciseView] {
    CatalogLib.listExercises(exercises, lessonId);
  };

  public query func getExam(lessonId : Nat) : async ?CatalogTypes.ExamView {
    CatalogLib.getExam(exams, lessonId);
  };
};
