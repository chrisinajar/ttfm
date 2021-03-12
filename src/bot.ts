import Event from "geval/event";
import {
  TtfmBotApi,
  TtfmRoomApi,
  TtfmUserApi,
  UserContext,
  WebsocketApi,
} from "./types";
import {
  Commands,
  BaseCommand,
  NewSongCommand,
  VoteCommand,
  SpeakCommand,
} from "./ttfm-types";
import { makeRoomApi } from "./room";
import { makeUserApi } from "./user";

export function createBotApi(ws: WebsocketApi, user: UserContext): TtfmBotApi {
  const newSongEvent = Event<NewSongCommand>();
  const voteEvent = Event<VoteCommand>();
  const speakEvent = Event<SpeakCommand>();

  let currentRoomid: null | string = null;
  let currentRoomApi: null | TtfmRoomApi = null;

  const unlisten = ws.onCommand((data: BaseCommand) => {
    switch (data.command) {
      case Commands.NewSong:
        newSongEvent.broadcast(data as NewSongCommand);
        break;

      case Commands.Vote:
        voteEvent.broadcast(data as VoteCommand);
        break;

      case Commands.Speak:
        speakEvent.broadcast(data as SpeakCommand);
        break;

      case Commands.UserJoin:
      case Commands.UserLeave:
      case Commands.UpdateStickerPlacement:
      default:
        console.log("Unknown command", data);
        break;
    }
  });

  const joinRoom = async (roomid: string): Promise<TtfmRoomApi> => {
    if (currentRoomid === roomid && currentRoomApi) {
      return currentRoomApi;
    }
    const roomData = await ws.joinRoom(roomid);
    currentRoomid = roomid;
    currentRoomApi = makeRoomApi(ws, user, roomData);
    return currentRoomApi;
  };
  const getUser = async (userid: string): Promise<TtfmUserApi> => {
    return makeUserApi(ws, user, userid);
  };
  return {
    joinRoom,
    getUser,
    onNewSong: newSongEvent.listen,
    onVote: voteEvent.listen,
    onSpeak: speakEvent.listen,
  };
}
