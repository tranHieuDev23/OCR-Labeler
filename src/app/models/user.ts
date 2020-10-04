class User {
  constructor(
    public readonly displayName: string,
    public readonly username: string,
    public readonly password: string
  ) { }

  static parseFromJson(obj: any): User {
    const displayName: string = obj.displayName;
    const username: string = obj.username;
    const password: string = obj.password;
    return new User(displayName, username, password);
  }
}

export default User;
