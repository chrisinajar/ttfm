import { TtfmUserApi, UserContext, WebsocketApi } from "./types";

export function makeUserApi(
  ws: WebsocketApi,
  user: UserContext,
  userid: string
): TtfmUserApi {
  const getInfo = async () => {};
  return { getInfo };
}
