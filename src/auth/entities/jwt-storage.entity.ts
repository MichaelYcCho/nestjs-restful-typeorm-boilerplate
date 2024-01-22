import { TimeStamp } from '@core/entities/time-stamp.entity'
import { JWT_PREFIX } from '@core/utils/constant'
import { User } from '@users/entities/user.entity'
import { IsNumber, IsString } from 'class-validator'
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ schema: 'public', name: `${JWT_PREFIX}_storage` })
export class JwtStorage extends TimeStamp {
    @IsNumber()
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number

    @IsString()
    @Column('varchar', { name: 'refresh_token', length: 255, nullable: true })
    refreshToken: string

    @IsNumber()
    @Column('int', { name: 'refresh_token_expired_at', nullable: true })
    refreshTokenExpiredAt: number

    @OneToOne(() => User, (user) => user.jwtStorage, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
    user: User
}
