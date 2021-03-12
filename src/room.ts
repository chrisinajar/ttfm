import { TtfmRoomApi, UserContext, WebsocketApi } from "./types";
import { Commands } from "./ttfm-types";
import type { RoomInfo, Room, BaseCommand, NewSongCommand } from "./ttfm-types";

export function makeRoomApi(
  ws: WebsocketApi,
  user: UserContext,
  room: RoomInfo
): TtfmRoomApi {
  const unlisten = ws.onCommand((data: BaseCommand) => {
    if (data.command === Commands.NewSong) {
      const newSongData = data as NewSongCommand;
      room.room = newSongData.room;
    }
  });

  const getInfo = async (): Promise<RoomInfo> => {
    return room;
  };
  const say = async (text: string): Promise<void> => {
    await ws.say(room.room.roomid, text);
  };
  const upvote = async (): Promise<void> => {
    await ws.upvote(room.room.roomid, room.room.metadata.current_song);
  };
  const downvote = async (): Promise<void> => {
    await ws.downvote(room.room.roomid, room.room.metadata.current_song);
  };
  return {
    getInfo,
    say,
    upvote,
    downvote,
  };
}
