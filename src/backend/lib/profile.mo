import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/profile";

module {
  public func defaultProfile() : Types.StudentProfile {
    {
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
  };

  public func getProfile(
    profiles : Map.Map<Principal, Types.StudentProfile>,
    caller : Principal,
  ) : ?Types.ProfileView {
    switch (profiles.get(caller)) {
      case (?p) ?toView(p);
      case null null;
    };
  };

  public func updateProfile(
    profiles : Map.Map<Principal, Types.StudentProfile>,
    caller : Principal,
    input : Types.ProfileInput,
  ) : Types.ProfileView {
    let existing = switch (profiles.get(caller)) {
      case (?p) p;
      case null defaultProfile();
    };
    let updated : Types.StudentProfile = {
      level = input.level;
      country = input.country;
      curriculum = input.curriculum;
      language = input.language;
      points = existing.points;
      studentLevel = existing.studentLevel;
      lessonsCompleted = existing.lessonsCompleted;
      exercisesCompleted = existing.exercisesCompleted;
      updatedAt = Time.now();
    };
    profiles.add(caller, updated);
    toView(updated);
  };

  public func toView(p : Types.StudentProfile) : Types.ProfileView {
    {
      level = p.level;
      country = p.country;
      curriculum = p.curriculum;
      language = p.language;
      points = p.points;
      studentLevel = p.studentLevel;
      lessonsCompleted = p.lessonsCompleted;
      exercisesCompleted = p.exercisesCompleted;
      updatedAt = p.updatedAt;
    };
  };
};
