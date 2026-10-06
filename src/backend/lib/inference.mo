import { fromEnv } "mo:caffeineai-inference-client/Config";
import ChatApi "mo:caffeineai-inference-client/Apis/ChatApi";
import ChatCompletionRequest "mo:caffeineai-inference-client/Models/ChatCompletionRequest";
import ChatCompletionRequestMessageOneOf2 "mo:caffeineai-inference-client/Models/ChatCompletionRequestMessageOneOf2";
import Runtime "mo:core/Runtime";

module {
  public func runChat<system>(prompt : Text) : async* Text {
    let config = fromEnv<system>();
    let userMessage = ChatCompletionRequestMessageOneOf2.JSON.init({
      content = #string(prompt);
      role = #user;
    });
    let req = ChatCompletionRequest.JSON.init({
      messages = [#user(userMessage)];
      model = "router";
    });
    let resp = await* ChatApi.createChatCompletion(config, req);
    if (resp.choices.size() == 0) {
      Runtime.trap("Inference returned no choices");
    };
    resp.choices[0].message.content
      ?? Runtime.trap("Inference returned no text content");
  };
};
