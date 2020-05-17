import { IsString } from 'class-validator';
import { UserRO } from 'src/user/user.dto';
import { IdeaEntity } from 'src/idea/idea.entity';

export class CommentDTO {
  @IsString()
  comment: string;
}

export class CommentRO {
  createdBy: UserRO;
  _id: string;
  createdAt: Date;
  comment: string;
  idea: IdeaEntity;
}
