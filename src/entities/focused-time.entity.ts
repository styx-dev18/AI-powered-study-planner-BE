import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Task } from './task.entity';
  
  @Entity('focused_time')
  export class FocusedTime {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    taskId: string;
  
    @Column({ type: 'int' })
    timeInSeconds: number;
  
    @CreateDateColumn()
    recordedAt: Date;
  }
  