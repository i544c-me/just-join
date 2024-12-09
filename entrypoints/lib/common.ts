export type MessageBackground = {
  method: 'searchUser' | 'listenUser';
  content: object | string;
}

export type MessagePopup = {
  method: 'updateLocation';
  content: object | string;
}

