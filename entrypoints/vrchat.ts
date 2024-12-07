type Params = {
  authToken: string;
}

type User = {
  isFriend: boolean;
  displayName: string;
  currentAvatarImageUrl: string;
  location: string;
}

class VRChat {
  private authToken: string;

  constructor(params: Params) {
    this.authToken = params.authToken;
  }

  async searchUser(username: string): Promise<User[]> {
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
