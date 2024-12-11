import { VRCUser } from '../lib/vrchat';
import { MessageBackground, MessagePopup } from '../lib/common';

type Notice = {
  level: string;
  message: string;
}

type User = {
  id: string,
  displayName: string;
  image: string;
  location: string;
  world?: {
    name?: string;
    description?: string;
  };
};

function App() {
  const [notices, setNotices] = createSignal<Notice[]>([]);
  const [targetUser, setTargetUser] = createSignal({} as User);
  let inputUsername = document.createElement('input');

  const onMessage = (request: MessagePopup) => {
    console.log('onMessage', request)

    switch (request.type) {
      case 'notice':
        setNotices([...notices(), { ...request.content }]);
        break;

      case 'updateLocation':
        if (request.content.location === 'private') {
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
  }

  onMount(async () => {
    browser.runtime.onMessage.addListener(onMessage);

    // TODO: sendMessage で backend が持っている状態を取得しに行く
  });

  onCleanup(() => {
    browser.runtime.onMessage.removeListener(onMessage);
  });

  const init = () => {
    browser.runtime.sendMessage<MessageBackground>({ type: 'init' });
  }

  const CheckKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      SearchUser();
    }
  };

  const SearchUser = async () => {
    const username = inputUsername.value;
    const users = await browser.runtime.sendMessage<MessageBackground, VRCUser[]>({
      type: 'searchUser',
      content: { username }
    });
    if (users.length > 0) {
      const user = users[0];
      setTargetUser({
        id: user.id,
        displayName: user.displayName,
        image: user.currentAvatarImageUrl,
        location: user.location,
        // TODO: ワールドの情報も取得して保存
      });
      await browser.runtime.sendMessage<MessageBackground>({
        type: 'listenUser',
        content: { userId: users[0].id }
      });
    } else {
      setTargetUser({} as User);
    }
  };

  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <div class="join">
          <input class="input input-bordered join-item" placeholder="ユーザー名" ref={inputUsername} onKeyDown={CheckKey} />
          <button class="btn join-item" onClick={SearchUser}>検索</button>
        </div>

        <div>
          <button class="btn btn-neutral" onClick={init}>再認証</button>
        </div>

        <div class="toast">
          <For each={notices()}>{notice =>
            <div class={`alert ${notice.level === 'info' ? 'alert-info' : 'alert-warning'}`}>
              {notice.level}: {notice.message}
            </div>
          }</For>
        </div>

        <Show when={!targetUser().displayName}>
          <div role="alert" class="alert alert-warning">
            <span class="text-2xl">⚠</span>
            <span>まず検索してください！</span>
          </div>
        </Show>

        <Show when={targetUser().displayName}>
          <div class="avatar online">
            <div class="w-12 rounded-full">
              <img src={targetUser().image} />
            </div>
          </div>
          <p>{targetUser().displayName}</p>

          <div class="stat">
            <div class="stat-figure text-2xl">
              <span>⏳</span>
            </div>
            <div class="stat-title">今の状態</div>
            <div class="stat-value text-primary">{targetUser().world?.name ?? '待機中...'}</div>
            <div class="stat-desc">{targetUser().world?.name ? 'ジョイン可能です！' : 'ジョイン可能になるのを待っています'}</div>
          </div>
        </Show>
      </div>
    </>
  );
}

export default App;
