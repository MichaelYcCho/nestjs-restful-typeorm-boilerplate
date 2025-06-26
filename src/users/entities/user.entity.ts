import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator'
import { Column, Entity, Index, OneToOne, Relation } from 'typeorm'
import { DB_SCHEMA, USER_PREFIX, UserRole } from '@core/utils/constant'
import { JwtStorage } from '@auth/entities/jwt-storage.entity'
import { CoreEntity } from '@core/entities/base.entity'

@Index('email', ['email'], { unique: true })
@Entity({ schema: DB_SCHEMA, name: `${USER_PREFIX}_users` })
export class User extends CoreEntity {
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

    // @OneToOne(() => JwtStorage, (jwtStorage) => jwtStorage.user)
    // jwtStorage: Relation<JwtStorage>
}
