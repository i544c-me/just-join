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

export type MessageBackground =
  | MessageBackgroundInit
  | MessageBackgroundSearchUser
  | MessageBackgroundListenUser;

type MessagePopupNotice = {
  type: "notice";
  content: {
    level: "info" | "warn";
    message: string;
  };
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

export type MessagePopup = MessagePopupNotice | MessagePopupUpdateLocation;
