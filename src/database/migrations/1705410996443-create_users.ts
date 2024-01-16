import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1705410996443 implements MigrationInterface {
  name = 'CreateUsers1705410996443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_user_role_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_user" (
        "id" SERIAL NOT NULL, 
        "email" character varying(50) NOT NULL, 
        "password" character varying(100) NOT NULL, 
        "profile_name" character varying(30) NOT NULL, 
        "role" "public"."users_user_role_enum" NOT NULL DEFAULT '2', 
        "is_active" boolean NOT NULL DEFAULT true, 
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
        CONSTRAINT "UQ_643a0bfb9391001cf11e581bdd6" UNIQUE ("email"), 
        CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "email" ON "users_user" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."email"`);
    await queryRunner.query(`DROP TABLE "users_user"`);
    await queryRunner.query(`DROP TYPE "public"."users_user_role_enum"`);
  }
}
