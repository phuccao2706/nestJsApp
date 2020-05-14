import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { IdeaService } from './idea.service';
import { IdeaDTO } from './idea.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';

@Controller('api/idea')
export class IdeaController {
  constructor(private ideaService: IdeaService) {}

  @Get()
  getIdeas() {
    return this.ideaService.getIdeas();
  }

  @Post()
  @UsePipes(new ValidationPipe())
  createIdea(@Body() data: IdeaDTO) {
    return this.ideaService.createIdea(data);
  }

  @Get(':_id')
  getIdea(@Param('_id') _id: string) {
    return this.ideaService.getIdea(_id);
  }

  @Put(':_id')
  @UsePipes(new ValidationPipe())
  updateIdea(@Param('_id') _id: string, @Body() data: Partial<IdeaDTO>) {
    return this.ideaService.updateIdea(_id, data);
  }

  @Delete(':_id')
  destroyIdea(@Param('_id') _id: string) {
    return this.ideaService.destroyIdea(_id);
  }
}
