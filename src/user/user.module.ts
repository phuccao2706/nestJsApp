import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { IdeaEntity } from 'src/idea/idea.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, IdeaEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
