import { assignIn } from "lodash";
import * as request from "superagent";
import type { SuperAgentRequest } from "superagent";
import type { UserContext } from "./types";

const API_ROOT = "https://turntable.fm/api";

type GetUserOptions = {
  userid: string;
};
async function getUserInfo({ userid }: GetUserOptions, user: UserContext) {
  return get("user.info", {
    query: {
      userid,
    },
    user,
  });
}

async function getRooms() {
  return get("room.directory_rooms");
}

type LoginOptions = {
  email: string;
  password: string;
};
type UserEmailLoginReturn = {
  userid: string;
  userauth: string;
};

export async function login(options: LoginOptions): Promise<UserContext> {
  const loginData: UserEmailLoginReturn = (await post("user.email_login", {
    form: options,
  })) as UserEmailLoginReturn;
  const authData = await get("user.authenticate", {
    query: loginData,
  });
  return loginData;
}

type ApiOptions = {
  token?: string;
  user?: UserContext;
};
type PostOptions = ApiOptions & {
  form?: any;
};

async function post(api: string, options: PostOptions = {}) {
  let req = request.post(`${API_ROOT}/${api}`).set("accept", "json");
  if (options.form) {
    req = req.send(options.form);
  }
  req = addUserToRequest(req, options.user);
  return promiseRequest(req);
}

type GetOptions = ApiOptions & {
  query?: any;
};
async function get(api: string, options: GetOptions = {}) {
  let req = request.get(`${API_ROOT}/${api}`).set("accept", "json");

  if (options.query) {
    req = req.query(options.query);
  }
  req = addUserToRequest(req, options.user);
  return promiseRequest(req);
}

async function promiseRequest(req: SuperAgentRequest) {
  return new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        return reject(err);
      }
      const [success, result] = res.body;
      if (!success) {
        const err = result.err || result;
        assignIn(err, result);
        return reject(err);
      }
      resolve(result);
    });
  });
}

function addUserToRequest(req: SuperAgentRequest, user?: UserContext) {
  if (!user) {
    return req;
  }
  return req.query({ userauth: user.userauth });
}
