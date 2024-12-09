import VRChat from './vrchat';

type EventData = {
  type: string | 'friend-location';
  content: EventContent;
}

type EventContent = {
  userId: string;
  worldId: string;
  location: `wrld_${string}` | 'traveling' | 'private';
}

function listenUser(event: MessageEvent, userId: string) {
  const data: EventData = JSON.parse(event.data, (_key, value) => {
    try {
      return JSON.parse(value)
    } catch {
      return value;
    }
  });
  if (data.type !== 'friend-location' && data.content.userId !== userId) return;

  if (data.content.location.startsWith("wrld_")) {
    browser.runtime.sendMessage({
      method: 'friend-location',
      content: data.content,
    });
  }
}


export default defineBackground(async () => {
  console.log('Hello background!', { id: browser.runtime.id });

  const authCookie = await browser.cookies.get({ name: 'auth', url: 'https://vrchat.com/' });
  const authToken = authCookie?.value || '';
  if (!authToken) {
    // TODO: VRChat でログインするようにユーザーに通知する
  }

  const client = new VRChat({ authToken });

  const socket = new WebSocket(`wss://pipeline.vrchat.cloud/?authToken=${authToken}`);

  socket.addEventListener('open', () => console.log('open') );
  socket.addEventListener('close', () => console.log('close') );

  browser.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    switch (request.method) {
      case 'searchUser':
        console.log('searchUser: ', request.content);
        // NOTE: ここを async で書くことができないので、渋々 then を使っている
        // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#listener
        client.searchUser(request.content).then(users => {
          sendResponse(users);
        });
        break;
      case 'listenUser':
        socket.removeEventListener('message', e => listenUser(e, request.content));
        socket.addEventListener('message', e => listenUser(e, request.content));
        break;
      default:
        console.error('unknown method...');
    }
    return true;
  })
});
