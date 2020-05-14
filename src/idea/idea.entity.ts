import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('idea')
export class IdeaEntity {
  @PrimaryGeneratedColumn('uuid') _id: string;

  @CreateDateColumn() createdAt: Date;

  @Column('text') idea: string;

  @Column('text') description: string;
}
