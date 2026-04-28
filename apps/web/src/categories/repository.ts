import { eq } from 'drizzle-orm';
import { categories, db, type Database } from '@dart/db';

export type CategoryOption = {
  id: string;
  name: string;
};

export const SYSTEM_CATEGORY_NAMES = [
  'Groceries',
  'Eating out',
  'Transport',
  'Subscriptions',
  'Utilities',
  'Rent/Mortgage',
  'Shopping',
  'Travel',
  'Health',
  'Insurance',
  'Tax',
  'Transfer',
  'Investment',
  'Income',
  'Other',
] as const;

/**
 * Returns system categories, creating any that are missing.
 * Safe to call on every page load — idempotent.
 */
export async function getOrCreateSystemCategories(
  database: Database = db,
): Promise<CategoryOption[]> {
  const existing = await database
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.isSystem, true));

  const existingNames = new Set(existing.map((c) => c.name));
  const toCreate = SYSTEM_CATEGORY_NAMES.filter((name) => !existingNames.has(name));

  if (toCreate.length > 0) {
    await database.insert(categories).values(
      toCreate.map((name) => ({
        name,
        isSystem: true,
        displayOrder: SYSTEM_CATEGORY_NAMES.indexOf(name),
      })),
    );

    const updated = await database
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.isSystem, true));

    return sortByDisplayOrder(updated);
  }

  return sortByDisplayOrder(existing);
}

function sortByDisplayOrder(items: CategoryOption[]): CategoryOption[] {
  return [...items].sort((a, b) => {
    const ai = SYSTEM_CATEGORY_NAMES.indexOf(a.name as (typeof SYSTEM_CATEGORY_NAMES)[number]);
    const bi = SYSTEM_CATEGORY_NAMES.indexOf(b.name as (typeof SYSTEM_CATEGORY_NAMES)[number]);
    // Unknown names (not in the list) go to the end
    const aOrder = ai === -1 ? 999 : ai;
    const bOrder = bi === -1 ? 999 : bi;
    return aOrder - bOrder;
  });
}
