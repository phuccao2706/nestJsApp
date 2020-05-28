import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserRO, UserInputDTO } from './user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUsers(): Promise<UserRO[]> {
    const users = await this.userRepository.find({
      relations: ['ideas', 'bookmarks'],
    });
    return users.map(user => user.returnResponseObject(false));
  }

  async getCurrentUser(userId: string): Promise<UserRO> {
    const user = await this.userRepository.findOne({
      where: { _id: userId },
      relations: ['ideas', 'bookmarks'],
    });
    return user.returnResponseObject(false);
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
}
