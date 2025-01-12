import { storage } from "wxt/storage";
import type { MessageBackground, MessagePopup, Notice } from "../lib/common";
import type { VRCUser } from "../lib/vrchat";
import { Context } from "./Context";
import Notification from "./Notification";

type User = {
  id: string;
  displayName: string;
  image: string;
  location: string;
  world?: {
    name?: string;
    description?: string;
  };
};

function App() {
  const { addNotification } = useContext(Context);
  const [targetUser, setTargetUser] = createSignal<User>({} as User);
  // biome-ignore lint/style/useConst: ref
  let inputUsername = document.createElement("input");

  const onMessage = (message: MessagePopup) => {
    console.log("onMessage", message);

    if (message.target !== "popup") return true;

    switch (message.type) {
      case "notice":
        addNotification(message.content);
        break;

      case "updateLocation":
        if (message.content.location === "private") {
          setTargetUser({
            ...targetUser(),
            world: {},
          });
        } else {
          setTargetUser({
            ...targetUser(),
            location: message.content.location,
            world: {
              name: message.content.world.name,
              description: message.content.world.description,
            },
          });
        }
        break;

      default:
        console.trace("Unknown message", message satisfies never);
    }

    return true;
  };

  onMount(async () => {
    browser.runtime.onMessage.addListener(onMessage);
    init();
  });

  onCleanup(() => {
    browser.runtime.onMessage.removeListener(onMessage);
  });

  const init = async () => {
    browser.runtime.sendMessage<MessageBackground>({
      target: "background",
      type: "init",
    });
    const user = await storage.getItem<VRCUser>("local:user");
    if (user?.displayName) {
      browser.runtime.sendMessage<MessageBackground>({
        target: "background",
        type: "listenUser",
        content: { userId: user.id },
      });
    }
    setTargetUser({
      id: user?.id || "",
      displayName: user?.displayName || "",
      image: user?.currentAvatarImageUrl || "",
      location: user?.location || "",
    });
  };

  const CheckKey = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.isComposing) {
      event.preventDefault();
      SearchUser();
    }
  };

  const SearchUser = async () => {
    const username = inputUsername.value;
    const user = await browser.runtime.sendMessage<MessageBackground, VRCUser>({
      target: "background",
      type: "searchUser",
      content: { username },
    });
    console.log("user", user);
    storage.setItem("local:user", user);
    setTargetUser({
      id: user.id,
      displayName: user.displayName,
      image: user.currentAvatarImageUrl,
      location: user.location,
      world: user.world,
    });
    await browser.runtime.sendMessage<MessageBackground>({
      target: "background",
      type: "listenUser",
      content: { userId: user.id },
    });
  };

  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <div class="join">
          <input
            class="input input-bordered join-item"
            placeholder="ユーザー名"
            ref={inputUsername}
            onKeyDown={CheckKey}
          />
          <button type="button" class="btn join-item" onClick={SearchUser}>
            検索
          </button>
        </div>

        <div>
          <button type="button" class="btn btn-neutral" onClick={init}>
            再認証
          </button>
        </div>

        <Notification />

        <Show when={!targetUser().displayName}>
          <div role="alert" class="alert alert-warning">
            <span class="text-2xl">⚠</span>
            <span>まず検索してください！</span>
          </div>
        </Show>

        <Show when={targetUser().displayName}>
          <div
            class={`avatar ${targetUser().location === "offline" ? "offline" : "online"}`}
          >
            <div class="w-12 rounded-full">
              <img alt="user's icon" src={targetUser().image} />
            </div>
          </div>
          <p>{targetUser().displayName}</p>

          <div class="stat">
            <div class="stat-figure text-2xl">
              <span>⏳</span>
            </div>
            <div class="stat-title">今の状態</div>
            <div class="stat-value text-primary">
              {targetUser().world?.name ?? "待機中..."}
            </div>
            <div class="stat-desc">
              {targetUser().world?.name
                ? "ジョイン可能です！"
                : "ジョイン可能になるのを待っています"}
            </div>
          </div>
        </Show>
      </div>
    </>
  );
}

export default App;
