class User {
  constructor(
    public readonly displayName: String,
    public readonly username: String,
    public readonly password: String
  ) {}

  static parseFromJson(obj: any): User {
    const displayName: String = obj.displayName;
    const username: String = obj.username;
    const password: String = obj.password;
    return new User(displayName, username, password);
  }
}

export default User;
