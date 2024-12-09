export type MessageBackground = {
  method: 'searchUser' | 'listenUser';
  content: object | string;
}

export type MessagePopup = {
  method: 'updateLocation';
  content: {
    location: `wrld_${string}` | 'traveling' | 'private';
    world: {
      name: string;
      description: string;
    },
  },
}

