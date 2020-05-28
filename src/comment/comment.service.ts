import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IdeaEntity } from 'src/idea/idea.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { CommentEntity } from './comment.entity';
import { CommentDTO } from './comment.dto';
import { IdeaRO } from 'src/idea/idea.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(IdeaEntity)
    private ideaRepository: Repository<IdeaEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
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

  private formatCommentRO = (comments: CommentEntity[]) =>
    comments.map(item => ({
      ...item,
      createdBy: item.createdBy.returnResponseObject(false),
    }));

  async getCommentsByIdea(ideaId: string) {
    const comments = await this.commentRepository.find({
      where: { idea: { _id: ideaId } },
      relations: ['createdBy', 'idea'],
    });

    return this.formatCommentRO(comments);
  }

  async getCommentsByUser(userId: string) {
    const comments = await this.commentRepository.find({
      where: { createdBy: { _id: userId } },
      relations: ['createdBy', 'idea'],
    });

    return this.formatCommentRO(comments);
  }

  async comment(ideaId: string, userId: string, data: CommentDTO) {
    const idea = await this.ideaRepository.findOne({
      where: { _id: ideaId },
      relations: [
        'upvotes',
        'downvotes',
        'createdBy',
        'comments',
        'comments.createdBy',
      ],
    });

    const user = await this.userRepository.findOne({ where: { _id: userId } });

    const comment = this.commentRepository.create({
      ...data,
      idea,
      createdBy: user,
    });

    await this.commentRepository.save(comment);

    // const comments = await this.commentRepository.find({
    //   where: { idea: { _id: ideaId } },
    //   relations: ['createdBy', 'idea'],
    // });

    idea.comments = [
      comment,
      ...idea.comments
        .slice()
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    ];

    return this.formatRO(idea);
  }

  async getComment(commentId: string) {
    const comment = await this.commentRepository.findOne({
      where: { _id: commentId },
      relations: ['createdBy', 'idea'],
    });

    return comment;
  }

  async destroyComment(ideaId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { _id: ideaId },
      relations: ['createdBy'],
    });

    if (comment.createdBy._id === userId) {
      await this.commentRepository.remove(comment);

      return { destroyed: true };
    }

    throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
  }
}
