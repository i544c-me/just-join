import type {
  MessageBackground,
  MessageOffscreen,
  MessagePopup,
  Notice,
} from "./lib/common";
import VRChat from "./lib/vrchat";

let client: VRChat;

function notice(content: Notice) {
  browser.runtime.sendMessage<MessagePopup>({
    target: "popup",
    type: "notice",
    content,
  });
}

function ring() {
  setupOffscreen().then(() => {
    browser.runtime.sendMessage<MessageOffscreen>({
      target: "offscreen",
      type: "ring",
    });
  });
}

async function init() {
  const authCookie = await browser.cookies.get({
    name: "auth",
    url: "https://vrchat.com/",
  });
  const authToken = authCookie?.value || "";
  if (!authToken) {
    notice({
      level: "warn",
      message: "vrchat.com/login を開いてログインしてください",
    });
  } else {
    client = VRChat.getInstance({ authToken });
    client.connectStream();
  }
}

async function setupOffscreen() {
  // NOTE: ここを async で書くことができないので、渋々 then を使っている
  // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#listener
  const offscreenUrl = browser.runtime.getURL("/offscreen.html");
  browser.runtime.getContexts({
    contextTypes: [browser.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl],
  }).then((existingContexts) => {
    if (existingContexts.length > 0) return;
    browser.offscreen.createDocument({
      url: "/offscreen.html",
      reasons: [browser.offscreen.Reason.AUDIO_PLAYBACK],
      justification: "For play audio",
    });
  });
}

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  init();
  setupOffscreen();

  browser.runtime.onMessage.addListener(
    (message: MessageBackground, _sender, sendResponse) => {
      if (message.target !== "background") return true;

      switch (message.type) {
        case "init":
          init();
          break;

        case "searchUser":
          // NOTE: ここを async で書くことができないので、渋々 then を使っている
          // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#listener
          client.searchUser(message.content.username).then((users) => {
            if (users.length === 0) sendResponse({});
            const user = users[0];
            client.getUser(user.id).then((user) => {
              client.getWorld(user.worldId).then((world) => {
                user.world = world;
                sendResponse(user);
              });
            });
          });
          break;

        case "listenUser": {
          const userId = message.content.userId;
          client.registerEvent((e) => {
            if ("err" in e) {
              browser.runtime.sendMessage<MessagePopup>({
                target: "popup",
                type: "notice",
                content: {
                  level: "warn",
                  message: "接続に失敗、VRC にログインし直してください",
                },
              });
              return;
            }

            // TODO: online, offline も検出する
            if (e.type !== "friend-location" || e.content.userId !== userId)
              return;

            const friendLocation =
              e.content.travelingToLocation || e.content.location;

            if (friendLocation) {
              ring();
              client.inviteMe(friendLocation);

              browser.runtime.sendMessage<MessagePopup>({
                target: "popup",
                type: "updateLocation",
                content: {
                  location: friendLocation,
                  world: e.content.world,
                },
              });
            }
          });
          break;
        }

        default:
          console.trace("Unknown message", message satisfies never);
      }
      return true;
    },
  );
});
