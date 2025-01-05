import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Task } from './task.entity';

@Entity('users')
export class User {
  /**
   * This decorator will help to auto-generate an ID for the table.
   */
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 30 })
  username: string;

  @Column({ type: 'varchar', length: 40, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({type: 'varchar', nullable: true})
  imageUrl: string;

  @Column({type: 'boolean', default: false})
  isVerified: boolean;

  @Column({ nullable: true })
  resetPasswordToken: string;
}
