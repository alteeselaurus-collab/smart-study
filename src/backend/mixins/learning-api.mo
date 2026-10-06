import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import CatalogTypes "../types/catalog";
import ProfileTypes "../types/profile";
import LearningTypes "../types/learning";
import LearningLib "../lib/learning";
import Inference "../lib/inference";

mixin (state : LearningLib.LearningState) {
  public query ({ caller }) func getLessonProgress(lessonId : Nat) : async ?LearningTypes.LessonProgress {
    LearningLib.getLessonProgress(state, caller, lessonId);
  };

  public shared ({ caller }) func advanceStep(lessonId : Nat) : async LearningTypes.LessonProgress {
    LearningLib.advanceStep(state, caller, lessonId);
  };

  public shared ({ caller }) func submitAnswer(exerciseId : Nat, selectedIndex : Nat) : async LearningTypes.AnswerResult {
    LearningLib.submitAnswer(state, caller, exerciseId, selectedIndex);
  };

  public shared ({ caller }) func startExam(examId : Nat) : async LearningTypes.ExamSession {
    LearningLib.startExam(state, caller, examId);
  };

  public shared ({ caller }) func submitExam(sessionId : Nat, answers : [LearningTypes.ExamAnswer]) : async LearningTypes.ExamResult {
    LearningLib.submitExam(state, caller, sessionId, answers);
  };

  public query ({ caller }) func listRevisions() : async [LearningTypes.RevisionItem] {
    LearningLib.listRevisions(state, caller);
  };

  public query ({ caller }) func getProgress() : async LearningTypes.ProgressOverview {
    LearningLib.getProgress(state, caller);
  };

  public query ({ caller }) func getRewards() : async LearningTypes.RewardState {
    LearningLib.getRewards(state, caller);
  };

  public query ({ caller }) func getCondensedPath(lessonId : Nat, durationMinutes : Nat) : async LearningTypes.CondensedPath {
    LearningLib.getCondensedPath(state, caller, lessonId, durationMinutes);
  };

  public shared ({ caller }) func askAiTeacher(lessonId : Nat, question : Text) : async LearningTypes.AiExplanation {
    let fallback = LearningLib.askAiTeacher(state, caller, lessonId, question);
    let prompt = LearningLib.buildAiPrompt(state, caller, lessonId, question);
    let answer = try {
      await* Inference.runChat<system>(prompt);
    } catch (_) {
      fallback.answer;
    };
    LearningLib.recordAiActivity(state, caller, lessonId);
    { question; answer; level = fallback.level };
  };
};
