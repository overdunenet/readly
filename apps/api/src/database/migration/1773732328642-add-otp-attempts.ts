import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpAttempts1773732328642 implements MigrationInterface {
  name = 'AddOtpAttempts1773732328642';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp_verifications" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp_verifications" DROP COLUMN "attempts"`
    );
  }
}
