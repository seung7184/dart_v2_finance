'use client';

import { useRef, useState } from 'react';
import { formatEUR } from '@dart/core';
import { Badge, Button, Card, Input } from '@dart/ui';
import { trackEvent, trackException, trackFirstSeenEvent } from '@/observability/client';

type SupportedBank = 'ING' | 'T212';
type PreviewRow = {
  amountCents: number;
  date: string;
  description: string;
  externalId: string;
};

const REQUIRED_FIELDS: Record<SupportedBank, string[]> = {
  ING: ['Datum', 'Naam / Omschrijving', 'Bedrag (EUR)', 'Af Bij'],
  T212: ['Action', 'Time', 'Total', 'ID'],
};

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bank, setBank] = useState<SupportedBank>('ING');
  const [accountId, setAccountId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const [fileName, setFileName] = useState('No file selected');
  const [importNotice, setImportNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  async function postImport(mode: 'preview' | 'import', file: File) {
    const formData = new FormData();
    formData.append('accountId', accountId);
    formData.append('bank', bank);
    formData.append('file', file);
    formData.append('mode', mode);

    const response = await fetch('/api/import', {
      method: 'POST',
      body: formData,
    });

    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      throw new Error(typeof payload.error === 'string' ? payload.error : 'Import request failed.');
    }

    return payload;
  }

  async function handlePreview(file: File) {
    if (accountId.trim().length === 0) {
      setErrorMessage('Account ID is required before previewing a CSV.');
      return;
    }

    setIsPreviewing(true);
    setErrorMessage('');
    setImportNotice('');

    try {
      const payload = await postImport('preview', file);
      setSelectedFile(file);
      setPreviewRows((payload.previewRows as PreviewRow[]) ?? []);
      setDuplicateCount(typeof payload.duplicateCount === 'number' ? payload.duplicateCount : 0);
      setErrorCount(typeof payload.errorCount === 'number' ? payload.errorCount : 0);
      setRowCount(typeof payload.rowCount === 'number' ? payload.rowCount : 0);
      setFileName(file.name);
    } catch (error) {
      setPreviewRows([]);
      setDuplicateCount(0);
      setErrorCount(0);
      setRowCount(0);
      trackException(error, {
        bank,
        context: 'csv_import_preview',
      });
      setErrorMessage(error instanceof Error ? error.message : 'Preview failed.');
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!selectedFile) {
      setErrorMessage('Upload and preview a CSV before running the import.');
      return;
    }

    setIsImporting(true);
    setErrorMessage('');

    try {
      const payload = await postImport('import', selectedFile);
      const importedCount = typeof payload.importedCount === 'number' ? payload.importedCount : 0;
      const returnedDuplicateCount =
        typeof payload.duplicateCount === 'number' ? payload.duplicateCount : 0;
      const returnedErrorCount = typeof payload.errorCount === 'number' ? payload.errorCount : 0;
      const alreadyImported = payload.alreadyImported === true;

      setDuplicateCount(returnedDuplicateCount);
      setErrorCount(returnedErrorCount);
      trackEvent('csv_import_completed', {
        alreadyImported,
        bank,
        duplicateCount: returnedDuplicateCount,
        errorCount: returnedErrorCount,
        importedCount,
        rowCount,
      });
      if (!alreadyImported && importedCount > 0) {
        trackFirstSeenEvent('observability:first_import', 'first_import', {
          bank,
          importedCount,
        });
      }
      setImportNotice(
        alreadyImported
          ? `File already imported. Reused batch ${String(payload.batchId)}.`
          : `Imported ${importedCount} transactions. ${returnedDuplicateCount} duplicates skipped. ${returnedErrorCount} rows failed validation.`,
      );
    } catch (error) {
      setImportNotice('');
      trackException(error, {
        bank,
        context: 'csv_import_execute',
      });
      setErrorMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div
      style={{
        padding: '32px',
        display: 'grid',
        gap: '20px',
      }}
    >
      <div style={{ display: 'grid', gap: '8px' }}>
        <h1 style={{ fontSize: 'var(--text-3xl)' }}>Import transactions</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '720px' }}>
          Upload an ING or Trading 212 CSV, confirm the column mapping, preview the first
          five rows, and execute the import review flow.
        </p>
      </div>

      <Card style={{ display: 'grid', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {(['ING', 'T212'] as SupportedBank[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBank(option)}
              style={{
                borderRadius: '999px',
                border: `1px solid ${
                  bank === option ? 'var(--color-safe)' : 'var(--color-border)'
                }`,
                background: bank === option ? 'var(--color-accent-muted)' : 'var(--color-bg)',
                color: 'var(--color-text)',
                padding: '10px 16px',
                cursor: 'pointer',
              }}
            >
              {option}
            </button>
          ))}
        </div>

        <Input
          label="Target account UUID"
          placeholder="Enter the existing account ID to import into"
          value={accountId}
          onChange={(event) => setAccountId(event.target.value)}
          {...(errorMessage.includes('Account ID') ? { error: errorMessage } : {})}
        />

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) {
              void handlePreview(file);
            }
          }}
          style={{
            border: '1px dashed var(--color-border)',
            borderRadius: '18px',
            background: 'var(--color-bg)',
            padding: '28px',
            display: 'grid',
            gap: '12px',
            justifyItems: 'start',
          }}
        >
          <Badge variant="protected">Step 1</Badge>
          <h2 style={{ fontSize: 'var(--text-xl)' }}>Upload CSV</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Drag and drop your file here, or pick it from disk.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handlePreview(file);
              }
            }}
            style={{ display: 'none' }}
          />
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={isPreviewing}>
            Choose file
          </Button>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            {isPreviewing ? 'Parsing preview…' : fileName}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '16px',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          }}
        >
          <Card style={{ display: 'grid', gap: '12px', background: 'var(--color-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Badge variant="warning">Step 2</Badge>
                <h2 style={{ fontSize: 'var(--text-xl)', marginTop: '10px' }}>Column mapping</h2>
              </div>
            </div>

            {REQUIRED_FIELDS[bank].map((field) => (
              <div
                key={field}
                style={{ display: 'grid', gap: '6px', color: 'var(--color-text-muted)' }}
              >
                <span>{field}</span>
                <div
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                  }}
                >
                  {selectedFile ? 'Detected via shared parser' : 'Upload a file first'}
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ display: 'grid', gap: '12px', background: 'var(--color-bg)' }}>
            <div>
              <Badge variant="living">Step 3</Badge>
              <h2 style={{ fontSize: 'var(--text-xl)', marginTop: '10px' }}>Import preview</h2>
            </div>

            {previewRows.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>
                Upload a file to preview the first five rows.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Date', 'Description', 'Amount', 'External ID'].map((heading) => (
                        <th
                          key={heading}
                          style={{
                            textAlign: 'left',
                            padding: '10px',
                            borderBottom: '1px solid var(--color-border)',
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, index) => (
                      <tr key={`${row.date}-${row.description}-${index}`}>
                        <td style={{ padding: '10px', borderBottom: '1px solid var(--color-border)' }}>
                          {row.date}
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid var(--color-border)' }}>
                          {row.description}
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid var(--color-border)' }}>
                          {formatEUR(row.amountCents)}
                        </td>
                        <td style={{ padding: '10px', borderBottom: '1px solid var(--color-border)' }}>
                          {row.externalId || 'Fallback hash'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'grid', gap: '4px' }}>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Step 4
            </p>
            <p>{rowCount} CSV rows processed in preview.</p>
            <p>N duplicates skipped: {duplicateCount}</p>
            <p>N validation errors: {errorCount}</p>
            {importNotice ? (
              <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
                {importNotice}
              </p>
            ) : null}
            {errorMessage && !errorMessage.includes('Account ID') ? (
              <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-sm)' }}>
                {errorMessage}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            disabled={isImporting}
            onClick={() => void handleImport()}
          >
            {isImporting ? 'Executing import…' : 'Execute import'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
