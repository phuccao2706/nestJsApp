import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO } from './idea.dto';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
  ) {}

  async getIdeas() {
    return await this.ideaRepository.find();
  }

  async createIdea(data: IdeaDTO) {
    const item = this.ideaRepository.create(data);
    await this.ideaRepository.save(item);
    return item;
  }

  async getIdea(_id: string) {
    const idea = await this.ideaRepository.findOne({ where: { _id } });

    if (!idea) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'This is a custom message',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return idea;
  }

  //NOTE: Parital: expect the object but not the entire object
  async updateIdea(_id: string, data: Partial<IdeaDTO>) {
    const idea = await this.ideaRepository.findOne({ where: { _id } });

    if (!idea) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'This is a custom message',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.ideaRepository.update({ _id }, data);
    return await this.ideaRepository.findOne({ where: { _id } });
  }

  async destroyIdea(_id: string) {
    const idea = await this.ideaRepository.findOne({ where: { _id } });

    if (!idea) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'This is a custom message',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.ideaRepository.delete({ _id });
    return { destroyed: true };
  }
}
