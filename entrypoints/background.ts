import VRChat from "./lib/vrchat";
import type { MessageBackground, MessagePopup, Notice } from "./lib/common";

let client: VRChat;

function notice(content: Notice) {
  browser.runtime.sendMessage<MessagePopup>({
    type: "notice",
    content,
  });
}

async function init() {
  const authCookie = await browser.cookies.get({
    name: "auth",
    url: "https://vrchat.com/",
  });
  const authToken = authCookie?.value || "";
  if (!authToken) {
    // TODO: 現状この通知は popup にほとんど届かないので修正
    // 未認証という状態を popup に持って行ければ良い
    notice({
      level: "warn",
      message: "vrchat.com/login を開いてログインしてください",
    });
  } else {
    notice({
      level: "info",
      message: "認証に成功しました",
    });
    client = new VRChat({ authToken });
  }
}

export default defineBackground(() => {
  console.log("Hello background!", { id: browser.runtime.id });

  init();

  browser.runtime.onMessage.addListener(
    (request: MessageBackground, _sender, sendResponse) => {
      switch (request.type) {
        case "init":
          init();
          break;

        case "searchUser":
          console.log("searchUser: ", request.content);
          // NOTE: ここを async で書くことができないので、渋々 then を使っている
          // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#listener
          client.searchUser(request.content.username).then((users) => {
            if (users.length === 0) sendResponse({});
            const user = users[0];
            client.getUser(user.id).then(sendResponse);
          });
          break;

        case "listenUser": {
          const userId = request.content.userId;
          client.registerEvent((e) => {
            // TODO: online, offline も検出する
            if (e.type !== "friend-location" || e.content.userId !== userId)
              return;

            const friendLocation =
              e.content.travelingToLocation || e.content.location;

            if (friendLocation) {
              client.inviteMe(friendLocation);

              browser.runtime.sendMessage<MessagePopup>({
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
          return request satisfies never;
      }
      return true;
    },
  );
});
