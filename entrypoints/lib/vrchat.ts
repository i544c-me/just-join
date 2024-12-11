type Params = {
  authToken: string;
};

export type VRCUser = {
  id: string;
  isFriend: boolean;
  displayName: string;
  currentAvatarImageUrl: string;
  location: `wrld_${string}` | "traveling" | "private";
};

export type VRCEvent = {
  type: "friend-location" | "something";
  content: {
    userId: string;
    worldId: string;
    world: {
      name: string;
      description: string;
    };
    location: `wrld_${string}` | "traveling" | "private";
    travelingToLocation: `wrld_${string}` | "";
  };
};

class VRChat {
  private authToken: string;
  private socket: WebSocket;
  private prevController: AbortController;

  constructor(params: Params) {
    this.authToken = params.authToken;
    this.socket = new WebSocket(
      `wss://pipeline.vrchat.cloud/?authToken=${this.authToken}`,
    );
    this.prevController = new AbortController();

    this.socket.addEventListener("open", () => console.log("open"));
    this.socket.addEventListener("close", () => console.log("close"));
  }

  async searchUser(username: string): Promise<VRCUser[]> {
    if (username === "") return [];

    const res = await fetch(
      `https://vrchat.com/api/1/users?search=${username}`,
      {
        mode: "no-cors",
        headers: {
          Cookie: `auth=${this.authToken}`,
        },
      },
    );
    return await res.json();
  }

  async inviteMe(friendLocation: string) {
    if (friendLocation === "") return;

    console.log("invite!");
    //await fetch(`https://vrchat.com/api/1/invite/myself/to/${friendLocation}`, {
    //  mode: 'no-cors',
    //  method: 'POST',
    //  headers: {
    //    Cookie: `auth=${this.authToken}`,
    //  },
    //});
  }

  registerEvent(func: (e: VRCEvent) => void) {
    this.prevController.abort();
    const newController = new AbortController();
    this.socket.addEventListener(
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

export default VRChat;
