import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ type: 'enum', enum: ['High', 'Medium', 'Low'] })
    priority: string;

    @Column({ type: 'enum', enum: ['Todo', 'In Progress', 'Completed', 'Expired']})
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    opened_at?: Date;

    @Column({ nullable: true })
    dued_at?: Date;

    @Column()
    createdBy: string;
}
