import { VRCUser } from '../lib/vrchat';
import { MessageBackground, MessagePopup } from '../lib/common';

function App() {
  const [targetUser, setTargetUser] = createSignal({} as VRCUser);
  let inputUsername = document.createElement('input');

  const onMessage = (request: MessagePopup) => {
    console.log('onMessage', request)

    switch (request.method) {
      case 'updateLocation':
        break;
      default:
        return request.method satisfies never;
    }
  }

  onMount(async () => {
    browser.runtime.onMessage.addListener(onMessage);
  });

  onCleanup(() => {
    browser.runtime.onMessage.removeListener(onMessage);
  });

  const CheckKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      SearchUser();
    }
  };

  const SearchUser = async () => {
    const username = inputUsername.value;
    const users = await browser.runtime.sendMessage<MessageBackground, VRCUser[]>({ method: 'searchUser', content: username });
    if (users.length > 0) {
      setTargetUser(users[0]);
      await browser.runtime.sendMessage<MessageBackground>({ method: 'listenUser', content: users[0].id })
    } else {
      setTargetUser({} as VRCUser);
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

        <Show when={!targetUser().displayName}>
          <div role="alert" class="alert alert-warning">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>まず検索してください！</span>
          </div>
        </Show>

        <Show when={targetUser().displayName}>
          <div class="avatar online">
            <div class="w-12 rounded-full">
              <img src={targetUser().currentAvatarImageUrl} />
            </div>
          </div>
          <p>{targetUser().displayName}</p>

          <div class="stat">
            <div class="stat-figure text-2xl">
              <span>⏳</span>
            </div>
            <div class="stat-title">今の状態</div>
            <div class="stat-value text-primary">待機中...</div>
            <div class="stat-desc">ジョイン可能になるのを待っています</div>
          </div>
        </Show>
      </div>
    </>
  );
}

export default App;
