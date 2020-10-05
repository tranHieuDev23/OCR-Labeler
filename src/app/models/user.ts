class User {
  constructor(
    public readonly displayName: string,
    public readonly username: string
  ) { }

  static parseFromJson(obj: any): User {
    const displayName: string = obj.displayName;
    const username: string = obj.username;
    return new User(displayName, username);
  }
}

export default User;
