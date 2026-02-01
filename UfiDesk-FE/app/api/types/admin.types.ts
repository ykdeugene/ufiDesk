export interface UserDto {
  email: string;
  admin: boolean;
  active: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  admin: boolean;
  active: boolean;
  createTime: string;
}

export interface UpdateUserRequest {
  email: string;
  password?: string;
  admin: boolean;
  active: boolean;
  updateTime: string;
}
