function App() {
  const [authToken, setAuthToken] = createSignal('');
  let inputUsername = document.createElement('input');

  onMount(async () => {
  });

  onCleanup(() => {
  });

  const CheckKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      SearchUser();
    }
  };

  const SearchUser = async () => {
    const username = inputUsername.value;
    const users = await browser.runtime.sendMessage({ method: 'searchUser', content: username });
    console.log(users);
  };

  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <div class="join">
          <input class="input input-bordered join-item" placeholder="ユーザー名" ref={inputUsername} onKeyDown={CheckKey} />
          <button class="btn join-item" onClick={SearchUser}>検索</button>
        </div>
        <div class="stat">
          <div class="stat-figure text-2xl">
            <span>⏳</span>
          </div>
          <div class="stat-title">今の状態</div>
          <div class="stat-value text-primary">待機中...</div>
          <div class="stat-desc">ジョイン可能になるのを待っています</div>
        </div>
      </div>
    </>
  );
}

export default App;
