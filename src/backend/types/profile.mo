import Common "common";

module {
  public type StudentProfile = {
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    points : Nat;
    studentLevel : Nat;
    lessonsCompleted : Nat;
    exercisesCompleted : Nat;
    updatedAt : Common.Timestamp;
  };

  public type ProfileInput = {
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
  };

  public type ProfileView = {
    level : Text;
    country : Text;
    curriculum : Text;
    language : Text;
    points : Nat;
    studentLevel : Nat;
    lessonsCompleted : Nat;
    exercisesCompleted : Nat;
    updatedAt : Common.Timestamp;
  };
};
