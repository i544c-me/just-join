import VRChat from './lib/vrchat';
import { MessageBackground, MessagePopup } from './lib/common';

export default defineBackground(async () => {
  console.log('Hello background!', { id: browser.runtime.id });

  const authCookie = await browser.cookies.get({ name: 'auth', url: 'https://vrchat.com/' });
  const authToken = authCookie?.value || '';
  if (!authToken) {
    // TODO: VRChat でログインするようにユーザーに通知する
  }

  const client = new VRChat({ authToken });

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
        const userId = request.content as string;
        client.registerEvent(e => {
          if (e.type !== 'friend-location' || e.content.userId !== userId) return;

          const friendLocation = e.content.travelingToLocation || e.content.location;

          if (friendLocation) {
            client.inviteMe(friendLocation);

            browser.runtime.sendMessage<MessagePopup>({
              method: 'updateLocation',
              content: {
                location: friendLocation,
                world: e.content.world,
              },
            });
          }
        });
        break;

      default:
        console.error('unknown method...');
        return request.method satisfies never;
    }
    return true;
  })
});
