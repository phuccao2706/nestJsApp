import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { IdeaEntity } from 'src/idea/idea.entity';

@Entity('comment')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid') _id: string;

  @CreateDateColumn() createdAt: Date;

  @Column('text') comment: string;

  @ManyToOne(type => UserEntity, { onDelete: 'CASCADE' })
  @JoinTable()
  createdBy: UserEntity;

  @ManyToOne(
    type => IdeaEntity,
    idea => idea.comments,
    { onDelete: 'CASCADE' },
  )
  idea: IdeaEntity;
}
