type EventData = {
  type: string | 'friend-location';
  content: EventContent;
}

type EventContent = {
  userId: string;
  worldId: string;
  location: string;
}

function App() {
  const [authToken, setAuthToken] = createSignal('');

  let socket: WebSocket;

  onMount(async () => {
    const authCookie = await browser.cookies.get({ name: 'auth', url: 'https://vrchat.com/' });
    setAuthToken(authCookie?.value || '');

    socket = new WebSocket(`wss://pipeline.vrchat.cloud/?authToken=${authToken()}`);
    socket.addEventListener('open', () => console.log('open') );
    socket.addEventListener('close', () => console.log('close') );
    socket.addEventListener('message', event => {
      const data: EventData = JSON.parse(event.data, (_key, value) => {
        try {
          return JSON.parse(value)
        } catch {
          return value;
        }
      });
      if (data.type !== 'friend-location') return;

      console.log(data);
    });
  });

  onCleanup(() => {
    socket.close();
  });

  return (
    <>
      <div>
        <h1 class="text-2xl">Just join!</h1>
        <label class="input input-bordered flex items-center gap-2">
          🏃
          <input type="text" class="grow" placeholder="Username" />
        </label>
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
