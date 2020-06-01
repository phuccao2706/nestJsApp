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

  @Column('simple-array') hashtags: string[];

  @Column('text') imageUrl: string;

  @ManyToOne(
    type => UserEntity,
    createdBy => createdBy.ideas,
  )
  createdBy: UserEntity;

  @ManyToMany(type => UserEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  upvotes: UserEntity[];

  @ManyToMany(type => UserEntity, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable()
  downvotes: UserEntity[];

  @OneToMany(
    type => CommentEntity,
    comment => comment.idea,
    { onDelete: 'CASCADE' },
  )
  comments: CommentEntity[];
}
