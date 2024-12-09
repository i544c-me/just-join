import VRChat, { VRCEvent } from './lib/vrchat';
import { MessageBackground, MessagePopup } from './lib/common';

function listenUser(event: MessageEvent, userId: string) {
  const data: VRCEvent = JSON.parse(event.data, (_key, value) => {
    try {
      return JSON.parse(value)
    } catch {
      return value;
    }
  });
  if (data.type !== 'friend-location' || data.content.userId !== userId) return;

  const newLocation = data.content.location || data.content.travelingToLocation;
  console.log('newLocation', newLocation);

  if (newLocation) {
    browser.runtime.sendMessage<MessagePopup>({
      method: 'updateLocation',
      content: newLocation,
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

  browser.runtime.onMessage.addListener((request: MessageBackground, _sender, sendResponse) => {
    switch (request.method) {
      case 'searchUser':
        console.log('searchUser: ', request.content);
        // NOTE: ここを async で書くことができないので、渋々 then を使っている
        // https://developer.mozilla.org/ja/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#listener
        client.searchUser(request.content as string).then(users => {
          sendResponse(users);
        });
        break;
      case 'listenUser':
        socket.removeEventListener('message', e => listenUser(e, request.content as string));
        socket.addEventListener('message', e => listenUser(e, request.content as string));
        break;
      default:
        console.error('unknown method...');
        return request.method satisfies never;
    }
    return true;
  })
});
