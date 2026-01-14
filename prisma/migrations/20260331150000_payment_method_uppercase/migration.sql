DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'PaymentMethod' AND e.enumlabel = 'credit_card'
  ) THEN
    ALTER TYPE "PaymentMethod" RENAME VALUE 'credit_card' TO 'CREDIT_CARD';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'PaymentMethod' AND e.enumlabel = 'bank_slip'
  ) THEN
    ALTER TYPE "PaymentMethod" RENAME VALUE 'bank_slip' TO 'BANK_SLIP';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'PaymentMethod' AND e.enumlabel = 'pix'
  ) THEN
    ALTER TYPE "PaymentMethod" RENAME VALUE 'pix' TO 'PIX';
  END IF;
END$$;
