type MessageBackgroundInit = {
  type: "init";
};

type MessageBackgroundSearchUser = {
  type: "searchUser";
  content: {
    username: string;
  };
};

type MessageBackgroundListenUser = {
  type: "listenUser";
  content: {
    userId: string;
  };
};

export type MessageBackground = { target: "background" } & (
  | MessageBackgroundInit
  | MessageBackgroundSearchUser
  | MessageBackgroundListenUser
);

export type Notice = {
  level: "info" | "warn";
  message: string;
};

type MessagePopupNotice = {
  type: "notice";
  content: Notice;
};

type MessagePopupUpdateLocation = {
  type: "updateLocation";
  content: {
    location: `wrld_${string}` | "traveling" | "private" | "offline";
    world: {
      name: string;
      description: string;
    };
  };
};

export type MessagePopup = { target: "popup" } & (
  | MessagePopupNotice
  | MessagePopupUpdateLocation
);

type MessageOffscreenRing = {
  type: "ring";
};

type MessageOffscreenOther = {
  type: "other";
};

export type MessageOffscreen = { target: "offscreen" } & (
  | MessageOffscreenRing
  | MessageOffscreenOther
);
