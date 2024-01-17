import * as bcrypt from 'bcrypt'

export const bcryptHashing = async (value: string, saltOrRounds: number = 10) => {
    const salt = await bcrypt.genSalt(saltOrRounds)
    return bcrypt.hash(value, salt)
}
