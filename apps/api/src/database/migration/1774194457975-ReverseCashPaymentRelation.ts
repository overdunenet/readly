import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReverseCashPaymentRelation1774194457975
  implements MigrationInterface
{
  name = 'ReverseCashPaymentRelation1774194457975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cash" DROP CONSTRAINT IF EXISTS "FK_cash_payment_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" DROP CONSTRAINT IF EXISTS "UQ_cash_payment_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" DROP COLUMN IF EXISTS "payment_id"`
    );
    await queryRunner.query(`ALTER TABLE "payments" ADD COLUMN "cash_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "payments" ADD CONSTRAINT "FK_payments_cash_id" FOREIGN KEY ("cash_id") REFERENCES "cash"("id") ON DELETE SET NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "FK_payments_cash_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "cash_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" ADD COLUMN "payment_id" uuid UNIQUE`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" ADD CONSTRAINT "FK_cash_payment_id" FOREIGN KEY ("payment_id") REFERENCES "payments"("id")`
    );
  }
}
