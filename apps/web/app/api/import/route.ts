import { NextResponse } from 'next/server';
import { getAuthenticatedUserIdFromCookieHeader } from '@/auth/session';
import { createImportRepository } from '@/imports/repository';
import { captureServerException } from '@/observability/server';
import {
  executeImport,
  getImportPreviewForUser,
  isSupportedBank,
} from '@/imports/service';

function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const authenticatedUserId = getAuthenticatedUserIdFromCookieHeader(
      request.headers.get('cookie'),
    );

    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const formData = await request.formData();
    const mode = getStringField(formData, 'mode');
    const bank = getStringField(formData, 'bank');
    const accountId = getStringField(formData, 'accountId');
    const file = formData.get('file');

    if (!isSupportedBank(bank)) {
      return NextResponse.json({ error: 'Unsupported bank selection.' }, { status: 400 });
    }

    if (accountId.length === 0) {
      return NextResponse.json({ error: 'Account ID is required.' }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'CSV file is required.' }, { status: 400 });
    }

    const csvContent = await file.text();
    if (csvContent.trim().length === 0) {
      return NextResponse.json({ error: 'CSV file is empty.' }, { status: 400 });
    }

    if (mode === 'preview') {
      const preview = await getImportPreviewForUser({
        accountId,
        authenticatedUserId,
        bank,
        csvContent,
      }, createImportRepository());

      return NextResponse.json(preview);
    }

    if (mode === 'import') {
      const result = await executeImport(
        {
          accountId,
          authenticatedUserId,
          bank,
          csvContent,
          originalFilename: file.name,
        },
        createImportRepository(),
      );

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid import mode.' }, { status: 400 });
  } catch (error) {
    captureServerException(error, {
      context: 'api_import',
    });
    const message = error instanceof Error ? error.message : 'Unknown import error';
    const status =
      message === 'ACCOUNT_NOT_FOUND' ? 404 : message === 'ACCOUNT_ACCESS_DENIED' ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
