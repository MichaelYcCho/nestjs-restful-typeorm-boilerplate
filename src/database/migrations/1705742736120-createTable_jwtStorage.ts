import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTableJwtStorage1705884469269 implements MigrationInterface {
    name = 'CreateTableJwtStorage1705884469269'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "jwt_storage" (
                "id" SERIAL NOT NULL, 
                "refresh_token" character varying(255), 
                "refresh_token_expired_at" integer, 
                "user_id" integer, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                CONSTRAINT "REL_9e6ca3f9e8308b685ebe12e159" UNIQUE ("user_id"), 
                CONSTRAINT "PK_b7b58142dd5df9a9c34b6f45c5a" PRIMARY KEY ("id")
                )`,
        )
        await queryRunner.query(
            `ALTER TABLE "jwt_storage" ADD CONSTRAINT "FK_9e6ca3f9e8308b685ebe12e1593" FOREIGN KEY ("user_id") REFERENCES "users_user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jwt_storage" DROP CONSTRAINT "FK_9e6ca3f9e8308b685ebe12e1593"`)
        await queryRunner.query(`DROP TABLE "jwt_storage"`)
    }
}
