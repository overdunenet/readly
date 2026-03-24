import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryToUsers1774355082921 implements MigrationInterface {
  name = 'AddCountryToUsers1774355082921';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "country" VARCHAR(10) NOT NULL DEFAULT 'KR'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "country"`);
  }
}
