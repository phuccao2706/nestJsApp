import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Delete,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDTO, UserInputDTO, UserRO } from './user.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guard';
import { User } from './user.decorator';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('api/users')
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('api/currentUser')
  @UseGuards(new AuthGuard())
  getCurrentUser(@User('_id') userId: string) {
    return this.userService.getCurrentUser(userId);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(@Body() data: UserDTO) {
    return this.userService.register(data);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() data: UserInputDTO) {
    return this.userService.login(data);
  }

  @Delete('api/users/:_id')
  @UseGuards(new AuthGuard())
  destroyUser(@Param('_id') _id: string) {
    return this.userService.destroyUser(_id);
  }
}
