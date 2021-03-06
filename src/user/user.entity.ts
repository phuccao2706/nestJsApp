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

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({
    type: 'text',
    unique: true,
  })
  phoneNumber: string;

  @Column({
    type: 'text',
    unique: true,
  })
  email: string;

  @Column({ default: null })
  avatarUrl: string;

  @OneToMany(
    type => IdeaEntity,
    idea => idea.createdBy,
  )
  ideas: IdeaEntity[];

  @ManyToMany(type => IdeaEntity, { onDelete: 'CASCADE' })
  @JoinTable()
  bookmarks: IdeaEntity[];

  @ManyToMany(type => UserEntity, {
    cascade: true,
  })
  @JoinTable()
  followers: UserEntity[];

  @ManyToMany(type => UserEntity, {
    cascade: true,
  })
  @JoinTable()
  followings: UserEntity[];

  @BeforeInsert()
  async hasPassword() {
    this.password = await bcrypt.hash(this.password, 9);
  }

  returnResponseObject(showToken: boolean = true): UserRO {
    const {
      _id,
      createdAt,
      username,
      token,
      firstname,
      lastname,
      phoneNumber,
      email,
      avatarUrl,
    } = this;
    const responseObject: any = {
      _id,
      createdAt,
      username,
      firstname,
      lastname,
      phoneNumber,
      email,
      avatarUrl,
    };

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
