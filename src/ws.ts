import { partial } from "lodash";
import WebSocket from "ws";
import Event from "geval/event";
import * as crypto from "crypto";
import type { UserContext, WebsocketApi } from "./types";
import type { RoomInfo, Song, BaseCommand } from "./ttfm-types";

export type ExtendedWebsocket = WebSocket & {
  user: UserContext;
  clientId: string;
  responseQueue: {
    [key: string]: (data: Record<string, any>) => unknown;
  };
  onCommand: WebsocketApi["onCommand"];
};

let msgid = 0;

export async function connectToChat(user: UserContext): Promise<WebsocketApi> {
  const ws = new WebSocket(
    "wss://chat1.turntable.fm:8080/socket.io/websocket"
  ) as ExtendedWebsocket;

  const commandEvent = Event<BaseCommand>();

  ws.clientId = `${Date.now()}-${Math.random()}`;
  ws.user = user;
  ws.responseQueue = {};
  ws.onCommand = commandEvent.listen;

  ws.on("open", function open() {});

  return new Promise<WebsocketApi>((resolve, reject) => {
    ws.on("message", async function incoming(message: string) {
      const parts = message.split("~m~");
      parts.shift();
      const lengthPart = parts.shift();
      if (!lengthPart) {
        return;
      }
      const length: number = parseInt(lengthPart);
      let data: string | Record<string, any> = parts.join("~m~");
      try {
        data = JSON.parse(data);
      } catch (e) {}
      // console.log(JSON.stringify(data, null, 2));
      if (typeof data === "object") {
        if (data.msgid !== undefined) {
          const msgid: number = data.msgid;
          const msgIdStr: string = msgid.toString();
          if (ws.responseQueue[msgIdStr]) {
            const callback = ws.responseQueue[msgIdStr];
            delete ws.responseQueue[msgIdStr];
            callback(data);
          }
        } else if (data.command) {
          commandEvent.broadcast(data as BaseCommand);
        } else {
          console.log("Unknown message", data);
        }
      } else if (data === "no_session") {
        await initializeSession(ws);
        resolve(makeApiObject(ws));
      } else {
        console.log("Unknown string message", data);
      }
    });
  });
}

function makeApiObject(ws: ExtendedWebsocket): WebsocketApi {
  return {
    joinRoom: partial(joinRoom, ws),
    say: partial(say, ws),
    upvote: partial(upvote, ws),
    downvote: partial(downvote, ws),
    onCommand: ws.onCommand,
  };
}

type PresenceUpdateReturn = {
  msgid: number;
  now: number;
  success: boolean;
  interval: number;
};

export async function initializeSession(ws: ExtendedWebsocket) {
  await startPresenceLoop(ws);
  await sendUserModify(ws);
}

export async function startPresenceLoop(ws: ExtendedWebsocket) {
  const presenceData = await sendPresenceUpdate(ws);
  setTimeout(() => {
    startPresenceLoop(ws);
  }, presenceData.interval * 1000);
}

export async function sendPresenceUpdate(
  ws: ExtendedWebsocket
): Promise<PresenceUpdateReturn> {
  return sendPayloadWithReturn<PresenceUpdateReturn>(ws, {
    api: "presence.update",
    status: "available",
  });
}

export async function sendUserModify(ws: ExtendedWebsocket) {
  return sendPayloadWithReturn(ws, {
    api: "user.modify",
    laptop: "mac",
  });
}

export async function joinRoom(
  ws: ExtendedWebsocket,
  roomid: string
): Promise<RoomInfo> {
  await sendPayloadWithReturn(ws, {
    api: "room.register",
    roomid,
  });
  return sendPayloadWithReturn(ws, {
    api: "room.info",
    roomid,
  });
}

export async function say(
  ws: ExtendedWebsocket,
  roomid: string,
  text: string
): Promise<void> {
  return sendPayloadWithReturn(ws, {
    api: "room.speak",
    text,
    roomid,
  });
}

export async function upvote(
  ws: ExtendedWebsocket,
  roomid: string,
  song: Song
): Promise<void> {
  return vote(ws, roomid, song, "up");
}
export async function downvote(
  ws: ExtendedWebsocket,
  roomid: string,
  song: Song
): Promise<void> {
  return vote(ws, roomid, song, "down");
}

export async function vote(
  ws: ExtendedWebsocket,
  roomid: string,
  song: Song,
  vote: "up" | "down"
): Promise<void> {
  const vh = crypto.createHash("sha1");
  const th = crypto.createHash("sha1");
  const ph = crypto.createHash("sha1");

  vh.update(`${roomid}${vote}${song._id}`);
  th.update(`${Math.random()}`);
  ph.update(`${Math.random()}`);

  return sendPayloadWithReturn(ws, {
    api: "room.vote",
    ph: ph.digest("hex"),
    th: th.digest("hex"),
    vh: vh.digest("hex"),
    roomid,
    val: vote,
  });
}

///////
// helpers
///////

export function makeWrappedSend<ReturnType>(
  ws: ExtendedWebsocket,
  api: string,
  method: (...args: any[]) => any
): (...args: any[]) => Promise<ReturnType> {
  return (...args: any[]): Promise<ReturnType> => {
    return sendPayloadWithReturn<ReturnType>(ws, {
      api,
      ...method(...args),
    });
  };
}

export async function sendPayloadWithReturn<ReturnType>(
  ws: ExtendedWebsocket,
  payload: { [key: string]: any }
): Promise<ReturnType> {
  const msgId: number = sendPayload(ws, payload);
  const msgIdStr: string = msgId.toString();
  return new Promise<ReturnType>((resolve) => {
    ws.responseQueue[msgIdStr] = resolve;
  });
}

export function sendPayload(
  ws: ExtendedWebsocket,
  payload: { [key: string]: any }
): number {
  const currentMessageId = msgid++;
  const payloadString = JSON.stringify({
    client: "web",
    clientid: ws.clientId,
    msgid: currentMessageId,
    userauth: ws.user.userauth,
    userid: ws.user.userid,
    ...payload,
  });
  const outgoing = `~m~${payloadString.length}~m~${payloadString}`;
  ws.send(outgoing);

  return currentMessageId;
}
