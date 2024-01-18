import { IsBoolean, IsEmail, IsEnum, IsNumber, IsString } from 'class-validator'

import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm'
import { DB_SCHEMA, USER_PREFIX, UserRole } from '@core/utils/constant'
import { TimeStamp } from '@core/entities/time-stamp.entity'

@Index('email', ['email'], { unique: true })
@Entity({ schema: DB_SCHEMA, name: `${USER_PREFIX}_user` })
export class User extends TimeStamp {
    @IsNumber()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number

    @IsEmail()
    @Column('varchar', { name: 'email', length: 50, unique: true })
    email: string

    @IsString()
    @Column('varchar', { name: 'password', length: 100, select: false })
    password: string

    @IsString()
    @Column('varchar', { name: 'profile_name', length: 30 })
    profileName: string

    @Column({ type: 'enum', enum: UserRole, default: UserRole.COMMON })
    @IsEnum(UserRole)
    role: UserRole

    @IsBoolean()
    @Column('boolean', { name: 'is_active', default: true })
    isActive: boolean
}
