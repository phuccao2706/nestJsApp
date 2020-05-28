import { IsNotEmpty } from 'class-validator';
import { UserEntity } from './user.entity';

export class UserDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  email: string;
}

export class UserInputDTO {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

export class UserRO {
  _id: string;
  username: string;
  createdAt: string;
  firstname: string;
  lastname: string;
  phoneNumber: string;
  email: string;
  token?: string;
  bookmarks?: UserEntity[];
}
