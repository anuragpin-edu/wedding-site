-- Add a category column to registry_items so gift cards can be
-- displayed separately without claim/hold functionality.
ALTER TABLE registry_items
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'gift'
    CHECK (category IN ('gift', 'gift_card'));

-- Backfill: tag existing gift card items by their title.
UPDATE registry_items
  SET category = 'gift_card'
  WHERE LOWER(title) LIKE '%gift card%'
     OR LOWER(title) LIKE '%giftcard%';
