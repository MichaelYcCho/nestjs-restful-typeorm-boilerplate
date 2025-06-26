import { IsNumber } from 'class-validator'
import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class CoreEntity {
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt: Date

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
    deletedAt?: Date

    @IsNumber()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number
}
