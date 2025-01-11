type Params = {
  authToken: string;
};

export type VRCUser = {
  id: string;
  isFriend: boolean;
  displayName: string;
  currentAvatarImageUrl: string;
  location: `wrld_${string}` | "traveling" | "private" | "offline";
};

export type VRCEvent =
  | VRCEventFriendLocation
  | VRCEventNotActiveSession
  | VRCEventSomething

type VRCEventFriendLocation = {
  type: "friend-location";
  content: {
    userId: string;
    worldId: string;
    world: {
      name: string;
      description: string;
    };
    location: `wrld_${string}` | "traveling" | "private" | "offline";
    travelingToLocation: `wrld_${string}` | "";
  };
};

type VRCEventNotActiveSession = {
  err: string;
  authToken: string;
  ip: string;
}

type VRCEventSomething = {
  type: "something";
}

export default class VRChat {
  private static instance: VRChat
  private readonly authToken: string;
  private socket: WebSocket | null;
  private prevController: AbortController;
  connectionState = false;

  private constructor(params: Params) {
    this.authToken = params.authToken;
    this.connectionState = false;
    this.socket = null;
    this.prevController = new AbortController();
  }

  static getInstance(params: Params) {
    if (!VRChat.instance) VRChat.instance = new VRChat(params);
    return VRChat.instance;
  }

  connectStream() {
    if (!this.socket || this.socket.readyState === this.socket.CLOSED) {
      this.connectionState = false;
      this.socket = new WebSocket(
        `wss://pipeline.vrchat.cloud/?authToken=${this.authToken}`,
      );
      this.socket.addEventListener("open", () => {
        console.log("open");
        this.connectionState = true;
      });
      this.socket.addEventListener("close", () => {
        console.log("close")
        this.connectionState = false;
      });
    }
  }

  private async fetch(url: string, init?: RequestInit) {
    return fetch(url, {
      mode: "no-cors",
      headers: {
        Cookie: `auth=${this.authToken}`,
      },
      ...init,
    });
  }

  async searchUser(username: string): Promise<VRCUser[]> {
    if (username === "") return [];

    const res = await this.fetch(
      `https://vrchat.com/api/1/users?search=${username}`,
    );
    return await res.json();
  }

  async getUser(userId: string): Promise<VRCUser> {
    if (userId === "") return {} as VRCUser;

    const res = await this.fetch(`https://vrchat.com/api/1/users/${userId}`);
    return await res.json();
  }

  async inviteMe(friendLocation: string) {
    if (friendLocation === "") return;

    console.log("invite!");
    await this.fetch(
      `https://vrchat.com/api/1/invite/myself/to/${friendLocation}`,
      {
        method: "POST",
      },
    );
  }

  registerEvent(func: (e: VRCEvent) => void) {
    this.prevController.abort();
    const newController = new AbortController();
    this.socket?.addEventListener(
      "message",
      (e) => {
        const data: VRCEvent = JSON.parse(e.data, (_key, value) => {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        });
        func(data);
      },
      { signal: newController.signal },
    );
    this.prevController = newController;
  }
}
