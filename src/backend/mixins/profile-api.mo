import Map "mo:core/Map";
import Principal "mo:core/Principal";
import ProfileTypes "../types/profile";
import ProfileLib "../lib/profile";

mixin (
  profiles : Map.Map<Principal, ProfileTypes.StudentProfile>,
) {
  public query ({ caller }) func getProfile() : async ?ProfileTypes.ProfileView {
    ProfileLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func updateProfile(input : ProfileTypes.ProfileInput) : async ProfileTypes.ProfileView {
    ProfileLib.updateProfile(profiles, caller, input);
  };
};
