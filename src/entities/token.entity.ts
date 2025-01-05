import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum TokenPurpose {
  RESET_PASSWORD = 'reset_password',
  VERIFY_EMAIL = 'verify_email'
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  token: string;

  @Column({
    type: 'enum',
    enum: TokenPurpose
  })
  purpose: TokenPurpose;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
} 