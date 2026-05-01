import { mobileApiFetch, type MobileApiResult } from './client';

export type MobileCategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isSystem: boolean;
};

type CategoriesResponse = {
  categories: MobileCategoryOption[];
};

export async function fetchMobileCategories(): Promise<MobileApiResult<MobileCategoryOption[]>> {
  const result = await mobileApiFetch<CategoriesResponse>('/api/mobile/categories');

  if (result.status !== 'ok') {
    return result;
  }

  return { status: 'ok', data: result.data.categories };
}
