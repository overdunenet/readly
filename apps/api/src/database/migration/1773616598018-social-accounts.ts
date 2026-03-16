import { MigrationInterface, QueryRunner } from 'typeorm';

export class socialAccounts1773616598018 implements MigrationInterface {
  name = 'socialAccounts1773616598018';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "social_accounts"
                                 (
                                     "id"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
                                     "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                                     "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                                     "user_id"    uuid      NOT NULL,
                                     "naver_id"   character varying,
                                     "kakao_id"   character varying,
                                     "google_id"  character varying,
                                     "deleted_at" TIMESTAMP,
                                     CONSTRAINT "PK_social_accounts" PRIMARY KEY ("id"),
                                     CONSTRAINT "UQ_social_accounts_user_id" UNIQUE ("user_id")
                                 )`);
    await queryRunner.query(`ALTER TABLE "social_accounts"
        ADD CONSTRAINT "FK_social_accounts_user"
        FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_naver_id_active" ON "social_accounts" ("naver_id") WHERE "deleted_at" IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_kakao_id_active" ON "social_accounts" ("kakao_id") WHERE "deleted_at" IS NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_social_accounts_google_id_active" ON "social_accounts" ("google_id") WHERE "deleted_at" IS NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_google_id_active"`);
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_kakao_id_active"`);
    await queryRunner.query(`DROP INDEX "UQ_social_accounts_naver_id_active"`);
    await queryRunner.query(`DROP TABLE "social_accounts"`);
  }
}
