import { IsNotEmpty } from 'class-validator';
import { IdeaEntity } from 'src/idea/idea.entity';

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
  avatarUrl?: string;
  bookmarks?: IdeaEntity[];
  ideas?: IdeaEntity[];
}
