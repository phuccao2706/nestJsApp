import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Body,
  Delete,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentEntity } from './comment.entity';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';
import { CommentDTO } from './comment.dto';

@Controller('api/comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get('idea/:_id')
  getCommentsByIdea(@Param('_id') ideaId: string) {
    return this.commentService.getCommentsByIdea(ideaId);
  }

  @Get('user/:_id')
  getCommentsByUser(@Param('_id') userId: string) {
    return this.commentService.getCommentsByUser(userId);
  }

  @Post('idea/:_id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  comment(
    @Param('_id') ideaId: string,
    @User('_id') userId: string,
    @Body() data: CommentDTO,
  ) {
    return this.commentService.comment(ideaId, userId, data);
  }

  @Get(':_id')
  @UseGuards(new AuthGuard())
  getComment(@Param('_id') commentId: string) {
    return this.commentService.getComment(commentId);
  }

  @Delete(':_id')
  @UseGuards(new AuthGuard())
  destroyComment(@Param('_id') ideaId: string, @User('_id') userId: string) {
    return this.commentService.destroyComment(ideaId, userId);
  }
}
