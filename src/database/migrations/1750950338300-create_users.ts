import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUsers1750950338300 implements MigrationInterface {
    name = 'CreateUsers1750950338300'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" (
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE,
            "id" SERIAL NOT NULL,
            "email" character varying(50) NOT NULL,
            "password" character varying(100) NOT NULL,
            "profile_name" character varying(30) NOT NULL,
            "role" character varying NOT NULL DEFAULT 'COMMON',
            "is_active" boolean NOT NULL DEFAULT true,
            CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`)
        await queryRunner.query(`CREATE UNIQUE INDEX "email" ON "users" ("email") `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."email"`)
        await queryRunner.query(`DROP TABLE "users"`)
    }
}
