import { login } from "./rest";
import { connectToChat } from "./ws";
import {
  TtfmApi as TtfmApiType,
  TtfmBotApi,
  TtfmApiOptions,
  UserContext,
} from "./types";
import { createBotApi } from "./bot";
import type { LoginOptions } from "./rest";

export const TtfmApi: TtfmApiType = {
  connect,
};

///@TODO TtfmBotApi
async function connect(options: TtfmApiOptions): Promise<TtfmBotApi> {
  const userContext = isAuth(options)
    ? await login(options)
    : createUserContext(options);
  const ws = await connectToChat(userContext);

  return createBotApi(ws, userContext);
}

function isAuth(options: Record<string, any>): options is LoginOptions {
  return options.email && options.password;
}

function isPreAuth(options: Record<string, any>): options is UserContext {
  return options.userid && options.userauth;
}

function createUserContext(options: TtfmApiOptions): UserContext {
  if (isPreAuth(options)) {
    return options;
  }
  throw new Error("Missing options userid or userauth or both");
}
