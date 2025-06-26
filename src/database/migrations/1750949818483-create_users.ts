import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUsers1750949818483 implements MigrationInterface {
    name = 'CreateUsers1750949818483'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_users_role_enum" AS ENUM('0', '1', '2')`)
        await queryRunner.query(
            `CREATE TABLE "users_users" (
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
            "deleted_at" TIMESTAMP WITH TIME ZONE, 
            "id" SERIAL NOT NULL, 
            "email" character varying(50) NOT NULL, 
            "password" character varying(100) NOT NULL, 
            "profile_name" character varying(30) NOT NULL, 
            "role" "public"."users_users_role_enum" NOT NULL DEFAULT '2', 
            "is_active" boolean NOT NULL DEFAULT true, 
            CONSTRAINT "UQ_fe62a84d8ea7e438d0f322c0815" UNIQUE ("email"), 
            CONSTRAINT "PK_bf37f721367dad55e75b5730b08" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(`CREATE UNIQUE INDEX "email" ON "users_users" ("email") `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."email"`)
        await queryRunner.query(`DROP TABLE "users_users"`)
        await queryRunner.query(`DROP TYPE "public"."users_users_role_enum"`)
    }
}
