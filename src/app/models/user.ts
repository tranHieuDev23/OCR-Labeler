class User {
  constructor(
    public readonly displayName: string,
    public readonly username: string,
    public readonly password: string,
    public readonly canUpload: boolean,
    public readonly canLabel: boolean,
    public readonly canVerify: boolean,
    public readonly canManageUsers: boolean
  ) { }

  static parseFromJson(obj: any): User {
    const displayName: string = obj.displayName;
    const username: string = obj.username;
    const password: string = obj.password;
    const canUpload: boolean = obj.canUpload;
    const canLabel: boolean = obj.canLabel;
    const canVerify: boolean = obj.canVerify;
    const canManageUsers: boolean = obj.canManageUsers;
    return new User(displayName, username, password, canUpload, canLabel, canVerify, canManageUsers);
  }

  static newBaseUser(displayname: string, username: string): User {
    return new User(
      displayname,
      username,
      null,
      null,
      null,
      null,
      null
    );
  }

  static newAdminUser(displayName: string, username: string, password: string): User {
    return new User(
      displayName,
      username,
      password,
      true,
      true,
      true,
      true
    );
  }
}

export default User;
