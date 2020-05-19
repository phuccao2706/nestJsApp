import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  UseGuards,
  Logger,
  Query,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from 'src/user/user.decorator';

@Controller('api/idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}
  private logger = new Logger('IdeaController');

  private logData(options: any) {
    options.userId &&
      this.logger.log('USER_ID ' + JSON.stringify(options.userId));
    options.data && this.logger.log('BODY ' + JSON.stringify(options.data));
    options._id && this.logger.log('IDEA ' + JSON.stringify(options._id));
  }

  @Get()
  getIdeas(@Query('page') page: number) {
    return this.ideaService.getIdeas(page);
  }

  @Post()
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createIdea(@User('_id') userId, @Body() data: IdeaDTO) {
    this.logData({ data, userId });
    return this.ideaService.createIdea(userId, data);
  }

  @Get(':_id')
  getIdea(@Param('_id') _id: string) {
    this.logData({ _id });
    return this.ideaService.getIdea(_id);
  }

  @Put(':_id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateIdea(
    @Param('_id') _id: string,
    @Body() data: Partial<IdeaDTO>,
    @User('_id') userId: string,
  ) {
    this.logData({ _id, userId, data });
    return this.ideaService.updateIdea(_id, data, userId);
  }

  @Delete(':_id')
  @UseGuards(new AuthGuard())
  destroyIdea(@Param('_id') _id: string, @User('_id') userId: string) {
    this.logData({ _id, userId });
    return this.ideaService.destroyIdea(_id, userId);
  }

  @Post(':_id/bookmark')
  @UseGuards(new AuthGuard())
  bookmarkIdea(@Param('_id') _id: string, @User('_id') userId: string) {
    this.logData({ _id, userId });
    return this.ideaService.bookmarkIdea(_id, userId);
  }

  @Delete(':_id/bookmark')
  @UseGuards(new AuthGuard())
  unbookmarkIdea(@Param('_id') _id: string, @User('_id') userId: string) {
    this.logData({ _id, userId });
    return this.ideaService.unbookmarkIdea(_id, userId);
  }

  @Post(':_id/upvote')
  @UseGuards(new AuthGuard())
  upvoteIdea(
    @Param('_id') _id: string,
    @User('_id') userId: string,
    @User('username') username: string,
  ) {
    this.logData({ _id, userId });
    return this.ideaService.upvoteIdea(_id, userId);
  }

  @Post(':_id/downvote')
  @UseGuards(new AuthGuard())
  downVoteIdea(@Param('_id') _id: string, @User('_id') userId: string) {
    this.logData({ _id, userId });
    return this.ideaService.downvoteIdea(_id, userId);
  }
}
