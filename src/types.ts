import type {
  AddDjCommand,
  BaseCommand,
  NewSongCommand,
  VoteCommand,
  SpeakCommand,
  UpdateStickerPlacementCommand,
  UserJoinCommand,
  UserLeaveCommand,
  RoomInfo,
  Song,
} from "./ttfm-types";

type EventHandler<DataType> = (
  handler: (data: DataType) => unknown
) => () => unknown;

// user API
export type TtfmUserApi = {
  getInfo: () => Promise<void>;
};
// room API
export type TtfmRoomApi = {
  say: (text: string) => Promise<void>;
  getInfo: () => Promise<RoomInfo>;
  upvote: () => Promise<void>;
  downvote: () => Promise<void>;
};
// bot API
export type TtfmBotApi = {
  joinRoom: (roomid: string) => Promise<TtfmRoomApi>;
  getUser: (userid: string) => Promise<TtfmUserApi>;
  onNewSong: EventHandler<NewSongCommand>;
  onVote: EventHandler<VoteCommand>;
  onSpeak: EventHandler<SpeakCommand>;
  onUserJoin: EventHandler<UserJoinCommand>;
  onUserLeave: EventHandler<UserLeaveCommand>;
  onAddDj: EventHandler<AddDjCommand>;
  onUpdateStickers: EventHandler<UpdateStickerPlacementCommand>;
};
// base API
type AuthOptions = {
  email: string;
  password: string;
};
type PreAuthOptions = {
  userid: string;
  userauth: string;
};
export type TtfmApiOptions = AuthOptions | PreAuthOptions;
export type TtfmApi = {
  connect: (options: TtfmApiOptions) => Promise<TtfmBotApi>;
};
// internals
export type WebsocketApi = {
  say: (roomid: string, text: string) => Promise<void>;
  joinRoom: (roomid: string) => Promise<RoomInfo>;
  upvote: (roomid: string, song: Song) => Promise<void>;
  downvote: (roomid: string, song: Song) => Promise<void>;
  onCommand: (handler: (data: BaseCommand) => unknown) => () => unknown;
};

export type UserContext = {
  userid: string;
  userauth: string;
};
