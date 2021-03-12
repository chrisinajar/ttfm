import { login } from "./rest";
import { connectToChat } from "./ws";
import { TtfmApi as TtfmApiType, TtfmBotApi, TtfmApiOptions } from "./types";
import { createBotApi } from "./bot";

export const TtfmApi: TtfmApiType = {
  connect,
};

///@TODO TtfmBotApi
async function connect(options: TtfmApiOptions): Promise<TtfmBotApi> {
  const userContext = await login(options);
  const ws = await connectToChat(userContext);

  return createBotApi(ws, userContext);
}
