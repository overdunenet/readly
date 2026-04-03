import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgeRatingToPosts1775209579158 implements MigrationInterface {
  name = 'AddAgeRatingToPosts1775209579158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD COLUMN "age_rating" VARCHAR NOT NULL DEFAULT 'all'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "age_rating"`);
  }
}
