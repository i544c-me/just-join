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

  const onMessage = (request: MessagePopup) => {
    console.log("onMessage", request);

    switch (request.type) {
      case "notice":
        addNotification(request.content);
        break;

      case "updateLocation":
        if (request.content.location === "private") {
          setTargetUser({
            ...targetUser(),
            world: {},
          });
        } else {
          setTargetUser({
            ...targetUser(),
            location: request.content.location,
            world: {
              name: request.content.world.name,
              description: request.content.world.description,
            },
          });
        }
        break;

      default:
        return request satisfies never;
    }
  };

  onMount(async () => {
    browser.runtime.onMessage.addListener(onMessage);
    init();
  });

  onCleanup(() => {
    browser.runtime.onMessage.removeListener(onMessage);
  });

  const init = async () => {
    browser.runtime.sendMessage<MessageBackground>({ type: "init" });
    const user = await storage.getItem<VRCUser>("local:user");
    if (user?.displayName) {
      browser.runtime.sendMessage<MessageBackground>({
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
