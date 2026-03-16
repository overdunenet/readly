import { MigrationInterface, QueryRunner } from 'typeorm';

export class alterUserNullablePassword1773700000000
  implements MigrationInterface
{
  name = 'alterUserNullablePassword1773700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`
    );
  }
}
