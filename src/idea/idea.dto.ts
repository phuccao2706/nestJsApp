import { IsString } from 'class-validator';
import { UserRO } from 'src/user/user.dto';
import { UserEntity } from 'src/user/user.entity';
import { CommentEntity } from 'src/comment/comment.entity';
import { CommentRO } from 'src/comment/comment.dto';

export class IdeaDTO {
  @IsString()
  idea: string;

  @IsString()
  description: string;

  @IsString()
  hashtags?: string;

  @IsString()
  imageUrl?: string;
}

export class IdeaRO {
  _id?: string;
  createdAt: Date;
  lastUpdateAt?: Date;
  idea: string;
  description: string;
  hashtags: string[];
  createdBy: UserRO;
  upvotes?: UserRO[];
  downvotes?: UserRO[];
  comments?: CommentRO[];
}
