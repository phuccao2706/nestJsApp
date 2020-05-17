import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  BeforeInsert,
  OneToMany,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserRO } from './user.dto';
import { IdeaEntity } from 'src/idea/idea.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdateAt: Date;

  @Column({
    type: 'text',
    unique: true,
  })
  username: string;

  @Column()
  password: string;

  @OneToMany(
    type => IdeaEntity,
    idea => idea.createdBy,
  )
  ideas: IdeaEntity[];

  @ManyToMany(type => IdeaEntity, { cascade: true })
  @JoinTable()
  bookmarks: IdeaEntity[];

  @BeforeInsert()
  async hasPassword() {
    this.password = await bcrypt.hash(this.password, 9);
  }

  returnResponseObject(showToken: boolean = true): UserRO {
    const { _id, createdAt, username, token } = this;
    const responseObject: any = { _id, createdAt, username };

    if (showToken) {
      responseObject.token = token;
    }

    if (this.ideas) {
      responseObject.ideas = this.ideas;
    }

    if (this.bookmarks) {
      responseObject.bookmarks = this.bookmarks;
    }

    return responseObject;
  }

  async comparePassword(attempPassword: string) {
    return bcrypt.compare(attempPassword, this.password);
  }

  private get token() {
    const { _id, username } = this;
    return jwt.sign(
      {
        _id,
        username,
      },
      process.env.SECRET,
      { expiresIn: '7d' },
    );
  }
}
