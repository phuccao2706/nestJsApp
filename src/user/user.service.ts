import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { Repository } from 'typeorm';
import { UserDTO, UserRO } from './user.dto';

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

  async register({ username, password }: UserDTO): Promise<UserRO> {
    let user = await this.userRepository.findOne({ where: { username } });

    if (user) {
      throw new HttpException('Already exist username', HttpStatus.BAD_REQUEST);
    }

    user = this.userRepository.create({ username, password });
    await this.userRepository.save(user);

    return user.returnResponseObject();
  }

  async login({ username, password }: UserDTO): Promise<UserRO> {
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
