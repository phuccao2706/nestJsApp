import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { CommentEntity } from 'src/comment/comment.entity';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid') _id: string;

  @CreateDateColumn() createdAt: Date;

  @Column('text') idea: string;

  @Column('text') description: string;

  @Column('text') hashtags: string;

  @ManyToOne(
    type => UserEntity,
    createdBy => createdBy.ideas,
  )
  createdBy: UserEntity;

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, { cascade: true })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany(
    type => CommentEntity,
    comment => comment.idea,
    { cascade: true },
  )
  comments: CommentEntity[];
}
