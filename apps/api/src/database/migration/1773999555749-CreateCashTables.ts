import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCashTables1773999555749 implements MigrationInterface {
  name = 'CreateCashTables1773999555749';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. payments 테이블
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "pg_tid" varchar(64) NULL,
        "pg_provider" varchar(20) NOT NULL DEFAULT 'nicepay',
        "method" varchar(20) NULL,
        "amount" integer NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "fail_reason" text NULL,
        -- paid_at, cancelled_at: 결제/취소 시점은 시간대 정보가 중요하므로 TIMESTAMPTZ 사용
        "paid_at" TIMESTAMPTZ NULL,
        "cancelled_at" TIMESTAMPTZ NULL,
        -- created_at, updated_at: BaseEntity 기본 TIMESTAMP 패턴 유지
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."user_id" IS '결제한 사용자 ID'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."pg_tid" IS 'PG 거래 ID'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."pg_provider" IS 'PG 제공사'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."method" IS '결제수단'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."amount" IS '결제 금액'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."status" IS '결제 상태 (PENDING/PAID/FAILED/CANCELLED)'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."fail_reason" IS '실패 사유'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."paid_at" IS '결제 승인 일시'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "payments"."cancelled_at" IS '결제 취소 일시'`
    );

    // 2. cash_balances 테이블
    await queryRunner.query(`
      CREATE TABLE "cash_balances" (
        "user_id" uuid NOT NULL,
        "amount" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash_balances" PRIMARY KEY ("user_id")
      )
    `);

    await queryRunner.query(
      `COMMENT ON COLUMN "cash_balances"."user_id" IS '사용자 ID (PK이자 FK)'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_balances"."amount" IS '현재 잔액'`
    );

    // 3. cash 테이블
    await queryRunner.query(`
      CREATE TABLE "cash" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "initial_amount" integer NOT NULL,
        "current_amount" integer NOT NULL,
        "payment_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_cash_payment_id" UNIQUE ("payment_id"),
        CONSTRAINT "CHK_cash_current_amount" CHECK ("current_amount" >= 0)
      )
    `);

    await queryRunner.query(
      `COMMENT ON COLUMN "cash"."user_id" IS '캐시 소유 사용자 ID'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash"."initial_amount" IS '최초 충전 금액'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash"."current_amount" IS '잔여 금액'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash"."payment_id" IS '결제 ID'`
    );

    // 4. cash_history 테이블
    await queryRunner.query(`
      CREATE TABLE "cash_history" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cash_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "type" varchar(20) NOT NULL,
        "amount" integer NOT NULL,
        "balance_after" integer NOT NULL,
        "description" varchar(200) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cash_history" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."cash_id" IS '캐시 ID'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."user_id" IS '사용자 ID'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."type" IS '변동 유형 (CHARGE/PURCHASE/REFUND)'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."amount" IS '변동 금액'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."balance_after" IS '변동 후 잔액'`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "cash_history"."description" IS '설명'`
    );

    // 5. Foreign Keys
    await queryRunner.query(`
      ALTER TABLE "payments"
        ADD CONSTRAINT "FK_payments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cash_balances"
        ADD CONSTRAINT "FK_cash_balances_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cash"
        ADD CONSTRAINT "FK_cash_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "cash"
        ADD CONSTRAINT "FK_cash_payment" FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
    `);

    await queryRunner.query(`
      ALTER TABLE "cash_history"
        ADD CONSTRAINT "FK_cash_history_cash" FOREIGN KEY ("cash_id") REFERENCES "cash"("id")
    `);

    await queryRunner.query(`
      ALTER TABLE "cash_history"
        ADD CONSTRAINT "FK_cash_history_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // 6. Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_user_id" ON "cash" ("user_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_history_cash_id" ON "cash_history" ("cash_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cash_history_user_id_created_at" ON "cash_history" ("user_id", "created_at" DESC)`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_user_id" ON "payments" ("user_id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Indexes
    await queryRunner.query(`DROP INDEX "IDX_payments_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_cash_history_user_id_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_cash_history_cash_id"`);
    await queryRunner.query(`DROP INDEX "IDX_cash_user_id"`);

    // Foreign Keys
    await queryRunner.query(
      `ALTER TABLE "cash_history" DROP CONSTRAINT "FK_cash_history_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash_history" DROP CONSTRAINT "FK_cash_history_cash"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" DROP CONSTRAINT "FK_cash_payment"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash" DROP CONSTRAINT "FK_cash_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "cash_balances" DROP CONSTRAINT "FK_cash_balances_user"`
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT "FK_payments_user"`
    );

    // Tables (역순)
    await queryRunner.query(`DROP TABLE "cash_history"`);
    await queryRunner.query(`DROP TABLE "cash"`);
    await queryRunner.query(`DROP TABLE "cash_balances"`);
    await queryRunner.query(`DROP TABLE "payments"`);
  }
}
