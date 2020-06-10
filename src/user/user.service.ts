import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserRO, UserInputDTO } from './user.dto';
import { IdeaRO } from 'src/idea/idea.dto';
import { formatIdeaRO } from '../shared/funcs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private sortIdeas = (user: UserRO): UserRO => {
    return {
      ...user,
      bookmarks: user.bookmarks.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
      ideas: user.ideas.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      ),
    };
  };

  async getUsers(): Promise<UserRO[]> {
    const users = await this.userRepository.find({
      relations: ['ideas', 'bookmarks'],
    });
    return users.map(user => this.sortIdeas(user.returnResponseObject(false)));
  }

  async getCurrentUser(userId: string): Promise<UserRO> {
    const user = await this.userRepository.findOne({
      where: { _id: userId },
      relations: ['ideas', 'bookmarks'],
    });

    return this.sortIdeas(user.returnResponseObject(false));
  }

  async getUser(username: string): Promise<UserRO> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [
        'ideas',
        'bookmarks',
        'ideas.upvotes',
        'ideas.downvotes',
        'ideas.comments',
        'ideas.createdBy',
        'bookmarks.upvotes',
        'bookmarks.downvotes',
        'bookmarks.comments',
        'bookmarks.createdBy',
      ],
    });

    return this.sortIdeas(user.returnResponseObject(false));
  }

  async getUserIdeas(username: string): Promise<IdeaRO[]> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [
        'ideas',
        'bookmarks',
        'ideas.upvotes',
        'ideas.downvotes',
        'ideas.comments',
        'ideas.createdBy',
        'ideas.comments.createdBy',
      ],
    });
    let returnData = this.sortIdeas(user.returnResponseObject(false)).ideas;

    return returnData.map(item => formatIdeaRO(item));
  }

  async getUserBookmarks(username: string, userId: string): Promise<IdeaRO[]> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [
        'ideas',
        'bookmarks',
        'bookmarks.upvotes',
        'bookmarks.downvotes',
        'bookmarks.comments',
        'bookmarks.createdBy',
        'bookmarks.comments.createdBy',
      ],
    });

    if (user._id !== userId) {
      throw new HttpException('Unauthorized action.', HttpStatus.UNAUTHORIZED);
    }

    let returnData = this.sortIdeas(user.returnResponseObject(false)).bookmarks;

    return returnData.map(item => formatIdeaRO(item));
  }

  async setUserAvatar(
    username: string,
    currentUsername: string,
    { imageUrl }: any,
  ): Promise<UserRO> {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: ['ideas', 'bookmarks'],
    });

    if (user) {
      if (username === currentUsername) {
        await this.userRepository.update({ username }, { avatarUrl: imageUrl });
        user.avatarUrl = imageUrl;

        return user.returnResponseObject(false);
      }
      throw new HttpException('Unauthorized action.', HttpStatus.UNAUTHORIZED);
    }

    throw new HttpException('User not found.', HttpStatus.BAD_REQUEST);
  }

  async register(data: UserDTO): Promise<UserRO> {
    let user = await this.userRepository.findOne({
      where: [
        { username: data.username },
        { email: data.email },
        { phoneNumber: data.phoneNumber },
      ],
    });

    if (user) {
      if (user.username === data.username) {
        throw new HttpException(
          'Already exist username',
          HttpStatus.BAD_REQUEST,
        );
      } else if (user.email === data.email) {
        throw new HttpException('Already exist email', HttpStatus.BAD_REQUEST);
      } else if (user.phoneNumber === data.phoneNumber) {
        throw new HttpException(
          'Already exist phone number',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    user = this.userRepository.create(data);
    await this.userRepository.save(user);

    return user.returnResponseObject();
  }

  async login({ username, password }: UserInputDTO): Promise<UserRO> {
    const user = await this.userRepository.findOne({ where: { username } });

    if (!user || !(await user.comparePassword(password))) {
      throw new HttpException(
        'Invalid username/password',
        HttpStatus.BAD_REQUEST,
      );
    }

    return user.returnResponseObject();
  }

  async destroyUser(_id: string) {
    const user = await this.userRepository.findOne({ where: { _id } });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'This is a custom message',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.userRepository.delete({ _id });
    return { destroyed: true };
  }

  async followUser(currentUserId: string, userId: string) {
    const currentUser = await this.userRepository.findOne({
      where: { _id: currentUserId },
    });

    if (currentUser) {
      const followUser = await this.userRepository.findOne({
        where: { _id: userId },
      });

      currentUser.followings.push(followUser);
      followUser.followers.push(currentUser);

      await this.userRepository.save([currentUser, followUser]);

      return currentUser.returnResponseObject(false);
    }

    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'This is a custom message',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
