type Params = {
  authToken: string;
}

export type VRCUser = {
  id: string;
  isFriend: boolean;
  displayName: string;
  currentAvatarImageUrl: string;
  location: `wrld_${string}` | 'traveling' | 'private';
}

export type VRCEvent = {
  type: string | 'friend-location';
  content: {
    userId: string;
    worldId: string;
    world: {
      name: string,
      description: string,
    },
    location: `wrld_${string}` | 'traveling' | 'private';
    travelingToLocation: `wrld_${string}` | '';
  }
}

class VRChat {
  private authToken: string;

  constructor(params: Params) {
    this.authToken = params.authToken;
  }

  async searchUser(username: string): Promise<VRCUser[]> {
    if (username === "") return [];

    const res = await fetch(`https://vrchat.com/api/1/users?search=${username}`, {
      mode: 'no-cors',
      headers: {
        Cookie: `auth=${this.authToken}`,
      },
    });
    return await res.json();
  }
}

export default VRChat;
