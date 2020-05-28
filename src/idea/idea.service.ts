import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

import { IdeaEntity } from './idea.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaDTO, IdeaRO } from './idea.dto';
import { UserEntity } from 'src/user/user.entity';
import { Votes } from 'src/shared/vote.enum';

@Injectable()
export class IdeaService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  private formatRO = (idea: IdeaEntity): IdeaRO => {
    return {
      ...idea,
      createdBy: idea.createdBy
        ? idea.createdBy.returnResponseObject(false)
        : null,
      upvotes: idea.upvotes
        ? idea.upvotes.map(item => item.returnResponseObject(false))
        : [],
      downvotes: idea.downvotes
        ? idea.downvotes.map(item => item.returnResponseObject(false))
        : [],
      comments: idea.comments
        ? idea.comments.map(item => ({
            ...item,
            createdBy: item.createdBy.returnResponseObject(false),
          }))
        : [],
      hashtags: idea.hashtags.split('-'),
    };
  };

  private isLegitOwner = (ownerId: string, userId: string) => {
    if (ownerId !== userId) {
      throw new HttpException('Unauthorized action.', HttpStatus.UNAUTHORIZED);
    }
  };

  private async vote(_id: string, userId: string, vote: Votes) {
    const { UP, DOWN } = Votes;
    const oppositeOfVote = vote === DOWN ? UP : DOWN;

    const user = await this.userRepository.findOne({ where: { _id: userId } });
    const idea = await this.ideaRepository.findOne({
      where: { _id },
      relations: [
        'upvotes',
        'downvotes',
        'createdBy',
        'comments',
        'comments.createdBy',
      ],
    });
    if (
      idea[oppositeOfVote].filter(voter => voter._id === user._id).length > 0 ||
      idea[vote].filter(voter => voter._id === user._id).length > 0
    ) {
      idea[oppositeOfVote] = idea[oppositeOfVote].filter(
        voter => voter._id !== user._id,
      );
      idea[vote] = idea[vote].filter(voter => voter._id !== user._id);
      await this.ideaRepository.save(idea);
    } else if (idea[vote].filter(voter => voter._id === user._id).length < 1) {
      idea[vote].push(user);
      await this.ideaRepository.save(idea);
    } else {
      throw new HttpException(
        'Failed to vote.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    idea.comments = idea.comments
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return this.formatRO(idea);
  }

  //INFO: get all ideas
  async getIdeas(page: number = 1): Promise<IdeaRO[]> {
    const ideas = await this.ideaRepository.find({
      relations: [
        'createdBy',
        'upvotes',
        'downvotes',
        'comments',
        'comments.createdBy',
        'comments.idea',
      ],
      take: 10,
      skip: 10 * (page - 1),
      order: {
        createdAt: 'DESC',
      },
    });

    return ideas.map(idea => this.formatRO(idea));
  }

  //INFO: get amount of ideas
  async getAmoutOfIdeas(): Promise<Number> {
    const ideas = await this.ideaRepository.count({});
    return ideas;
  }

  //INFO: create an idea
  async createIdea(userId: string, data: IdeaDTO): Promise<IdeaRO> {
    const createdBy = await this.userRepository.findOne({
      where: { _id: userId },
    });
    const idea = this.ideaRepository.create({
      ...data,
      createdBy,
    });

    await this.ideaRepository.save(idea);
    return this.formatRO(idea);
  }

  //INFO: get an single idea
  async getIdea(_id: string): Promise<IdeaRO> {
    const idea = await this.ideaRepository.findOne({
      where: { _id },
      relations: [
        'createdBy',
        'upvotes',
        'downvotes',
        'comments',
        'comments.createdBy',
        'comments.idea',
      ],
    });

    idea.comments = idea.comments
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (!idea) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'This is a custom message',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.formatRO(idea);
  }

  //NOTE: Parital: expect the object but not the entire object
  //INFO: update an idea
  async updateIdea(
    _id: string,
    data: Partial<IdeaDTO>,
    userId: string,
  ): Promise<IdeaRO> {
    let idea = await this.ideaRepository.findOne({
      where: { _id },
      relations: ['createdBy'],
    });

    this.isLegitOwner(idea.createdBy._id, userId);

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
    idea = await this.ideaRepository.findOne({
      where: { _id },
      relations: ['createdBy'],
    });

    return this.formatRO(idea);
  }

  //INFO: destroy an idea
  async destroyIdea(_id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { _id } });

    this.isLegitOwner(idea.createdBy._id, userId);

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

  //INFO: add bookmark idea
  async bookmarkIdea(_id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({ where: { _id } });
    const user = await this.userRepository.findOne({
      where: { _id: userId },
      relations: ['bookmarks'],
    });

    if (user.bookmarks.find(idea => idea._id === _id)) {
      user.bookmarks = user.bookmarks.filter(item => item._id !== _id);
    } else {
      user.bookmarks.push(idea);
    }

    await this.userRepository.save(user);

    return user.returnResponseObject();
  }

  //INFO: remove bookmark idea
  async unbookmarkIdea(_id: string, userId: string) {
    const idea = await this.ideaRepository.findOne({
      where: { _id },
      relations: [
        'createdBy',
        'upvotes',
        'downvotes',
        'comments',
        'comments.createdBy',
        'comments.idea',
      ],
    });
    const user = await this.userRepository.findOne({
      where: { _id: userId },
      relations: ['bookmarks'],
    });

    if (!user.bookmarks.find(item => item._id === idea._id)) {
      throw new HttpException('Cannot find idea', HttpStatus.BAD_REQUEST);
    }

    user.bookmarks = user.bookmarks.filter(item => item._id !== _id);
    await this.userRepository.save(user);

    return user.returnResponseObject(false);
  }

  //INFO: vote an idea
  upvoteIdea = (_id: string, userId: string) =>
    this.vote(_id, userId, Votes.UP);

  //INFO: downvote an idea
  downvoteIdea = (_id: string, userId: string) =>
    this.vote(_id, userId, Votes.DOWN);
}
