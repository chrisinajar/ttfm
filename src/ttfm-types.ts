export type User = {
  fanofs: number;
  name: string;
  created: number;
  laptop: string;
  userid: string;
  acl: number;
  fans: number;
  points: number;
  images: any;
  _id: string;
  avatarid: number;
  registered: number;
};
export type ShortSong = {
  _id: string;
  starttime: number;
};
export type Song = {
  source: string;
  sourceid: string;
  created: number;
  djid: string;
  score: number;
  djname: string;
  _id: string;
  metadata: {
    coverart: string;
    length: number;
    artist: string;
    song: string;
  };
};
export type VotePairs = [string, string];
export type VoteMetadata = {
  upvotes: number;
  downvotes: number;
  listeners: number;
  votelog: VotePairs[];
};
export type Room = {
  chatserver: [string, number];
  description: string;
  created: number;
  shortcut: string;
  name: string;
  roomid: string;
  metadata: VoteMetadata & {
    songlog: Song[];
    dj_full: boolean;
    djs: User[];
    screen_uploads_allowed: boolean;
    current_song: Song;
    privacy: string;
    max_djs: number;
    creator: User;
    userid: string;
    sticker_placements: any;
    screens: any;
    featured: boolean;
    djcount: number;
    current_dj: string;
    djthreshold: number;
    moderator_id: any[];
    max_size: number;
  };
};

export enum Commands {
  NewSong = "newsong",
  UpdateStickerPlacement = "update_sticker_placements",
  Vote = "update_votes",
  UserJoin = "registered",
  UserLeave = "deregistered",
  Speak = "speak",
}

export type BaseResponse = {
  success: boolean;
  msgid: number;
};
export type RoomInfo = BaseResponse & {
  room: Room;
  djids: string[];
  listenerids: string[];
  now: number;
  users: User[];
};

//////
// command types
//////
export type BaseCommand = {
  command: string;
  now?: number;
  success?: boolean;
};
export type NewSongCommand = BaseCommand & {
  command: Commands.NewSong;
  roomid: string;
  room: Room;
};
export type VoteCommand = BaseCommand & {
  current_song: ShortSong;
  roomid: string;
  command: Commands.Vote;
  success: boolean;
  room: {
    metadata: VoteMetadata;
  };
};
export type SpeakCommand = BaseCommand & {
  command: Commands.Speak;
  userid: string;
  name: string;
  roomid: string;
  text: string;
};
