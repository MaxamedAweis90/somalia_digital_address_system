-- CreateTable
CREATE TABLE "login_otps" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_otp_user_consumed_index" ON "login_otps"("user_id", "consumed");

-- AddForeignKey
ALTER TABLE "login_otps" ADD CONSTRAINT "login_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
