'use client';

import { useRef, useState } from 'react';
import { formatEUR } from '@dart/core';
import { trackEvent, trackException, trackFirstSeenEvent } from '@/observability/client';

type SupportedBank = 'ING' | 'T212';
type PreviewRow = {
  amountCents: number;
  date: string;
  description: string;
  externalId: string;
  intentHint: string | null;
  reviewStatus: 'pending' | 'needs_attention';
};
type SkippedRow = {
  reason: string;
  rowIndex: number;
  status: 'duplicate' | 'error';
};

const REQUIRED_FIELDS: Record<SupportedBank, string[]> = {
  ING: ['Datum', 'Naam / Omschrijving', 'Bedrag (EUR)', 'Af Bij'],
  T212: ['Action', 'Time', 'Total', 'ID'],
};

const BANK_LABELS: Record<SupportedBank, { label: string; desc: string }> = {
  ING: { label: 'ING', desc: 'Semicolon CSV · nl-NL format' },
  T212: { label: 'Trading 212', desc: 'ISO CSV · action-based' },
};

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bank, setBank] = useState<SupportedBank>('ING');
  const [accountId, setAccountId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [fileName, setFileName] = useState('');
  const [importNotice, setImportNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  async function postImport(mode: 'preview' | 'import', file: File) {
    const formData = new FormData();
    formData.append('accountId', accountId);
    formData.append('bank', bank);
    formData.append('file', file);
    formData.append('mode', mode);
    const response = await fetch('/api/import', { method: 'POST', body: formData });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const errorText =
        payload.code === 'BLOCKED_FORMAT'
          ? `${String(payload.error)} ${typeof payload.detail === 'string' ? payload.detail : ''}`.trim()
          : typeof payload.error === 'string'
          ? payload.error
          : 'Import request failed.';
      throw new Error(errorText);
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
      setSkippedRows((payload.skippedRows as SkippedRow[]) ?? []);
      setRowCount(typeof payload.rowCount === 'number' ? payload.rowCount : 0);
      setFileName(file.name);
    } catch (error) {
      setPreviewRows([]);
      setDuplicateCount(0);
      setErrorCount(0);
      setSkippedRows([]);
      setRowCount(0);
      trackException(error, { bank, context: 'csv_import_preview' });
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
      setSkippedRows((payload.skippedRows as SkippedRow[]) ?? []);
      trackEvent('csv_import_completed', {
        alreadyImported, bank,
        duplicateCount: returnedDuplicateCount,
        errorCount: returnedErrorCount,
        importedCount, rowCount,
      });
      if (!alreadyImported && importedCount > 0) {
        trackFirstSeenEvent('observability:first_import', 'first_import', { bank, importedCount });
      }
      setImportNotice(
        alreadyImported
          ? `File already imported. Reused batch ${String(payload.batchId)}.`
          : `Imported ${importedCount} transactions for review. ${returnedDuplicateCount} duplicates skipped. ${returnedErrorCount} rows failed validation.`,
      );
    } catch (error) {
      setImportNotice('');
      trackException(error, { bank, context: 'csv_import_execute' });
      setErrorMessage(error instanceof Error ? error.message : 'Import failed.');
    } finally {
      setIsImporting(false);
    }
  }

  const sharedInputStyle = {
    width: '100%',
    height: 44,
    padding: '0 14px',
    borderRadius: 8,
    background: 'var(--surface-2)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 15,
    outline: 'none',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div
        style={{
          padding: '18px 32px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'var(--surface-0)',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Import CSV
          </h1>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
            ING + Trading 212 · reviewed before committing
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Bank selector */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Step 1 — Choose source
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['ING', 'T212'] as SupportedBank[]).map((option) => {
              const active = bank === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBank(option)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: `1px solid ${active ? 'var(--accent-500)' : 'var(--border-default)'}`,
                    background: active ? 'var(--accent-tint)' : 'var(--surface-2)',
                    color: active ? 'var(--accent-400)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    textAlign: 'left',
                    minWidth: 140,
                    transition: 'background var(--duration-fast) var(--ease-standard)',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{BANK_LABELS[option].label}</span>
                  <span style={{ fontSize: 11, color: active ? 'var(--accent-400)' : 'var(--text-tertiary)' }}>
                    {BANK_LABELS[option].desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Account ID */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Step 2 — Target account
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}
              htmlFor="accountId"
            >
              Account UUID
            </label>
            <input
              id="accountId"
              style={sharedInputStyle}
              placeholder="Enter the existing account ID to import into"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
            {errorMessage.includes('Account ID') && (
              <span style={{ fontSize: 12, color: 'var(--warning)' }}>{errorMessage}</span>
            )}
          </div>
        </div>

        {/* File upload */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}
          >
            Step 3 — Upload file
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) void handlePreview(file);
            }}
            style={{
              border: `1px dashed ${isDragOver ? 'var(--accent-500)' : 'var(--border-default)'}`,
              borderRadius: 10,
              background: isDragOver ? 'var(--accent-tint)' : 'var(--surface-2)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              textAlign: 'center',
              transition: 'background var(--duration-fast) var(--ease-standard)',
              cursor: 'pointer',
            }}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePreview(file);
              }}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--surface-3)',
                display: 'grid',
                placeItems: 'center',
                fontSize: 18,
              }}
            >
              ↑
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                Drop CSV here or click to choose
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                {isPreviewing
                  ? 'Parsing preview…'
                  : fileName
                  ? fileName
                  : `Phase 1 supports ING and Trading 212 only · Required: ${REQUIRED_FIELDS[bank].join(', ')}`}
              </p>
            </div>
          </div>
        </div>

        {isImporting && (
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Processing import
            </div>
            {['File received', 'Parsing CSV', 'Checking duplicates', 'Preparing review'].map((step) => (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: 'var(--accent-tint)',
                    color: 'var(--accent-400)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                {step}
              </div>
            ))}
          </div>
        )}

        {/* Column mapping + preview — shown after file upload */}
        {(selectedFile || previewRows.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* Column mapping */}
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}
              >
                Column mapping
              </div>
              {REQUIRED_FIELDS[bank].map((field) => (
                <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{field}</span>
                  <div
                    style={{
                      background: 'var(--surface-2)',
                      color: 'var(--positive)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    ✓ Detected via shared parser
                  </div>
                </div>
              ))}
            </div>

            {/* Preview rows */}
            <div
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-tertiary)',
                }}
              >
                Preview (first 5 rows)
              </div>
              {previewRows.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                  Upload a file to preview rows.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Date', 'Description', 'Amount', 'Review'].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: 'left',
                              padding: '6px 8px',
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--text-tertiary)',
                              borderBottom: '1px solid var(--border-subtle)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row, index) => (
                        <tr key={`${row.date}-${row.description}-${index}`}>
                          <td
                            style={{
                              padding: '8px 8px',
                              fontSize: 12,
                              color: 'var(--text-tertiary)',
                              borderBottom: '1px solid var(--border-subtle)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.date}
                          </td>
                          <td
                            style={{
                              padding: '8px 8px',
                              fontSize: 12,
                              color: 'var(--text-primary)',
                              borderBottom: '1px solid var(--border-subtle)',
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.description}
                          </td>
                          <td
                            style={{
                              padding: '8px 8px',
                              fontSize: 12,
                              color: row.amountCents > 0 ? 'var(--positive)' : 'var(--text-primary)',
                              borderBottom: '1px solid var(--border-subtle)',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatEUR(row.amountCents)}
                          </td>
                          <td
                            style={{
                              padding: '8px 8px',
                              fontSize: 12,
                              color:
                                row.reviewStatus === 'needs_attention'
                                  ? 'var(--warning)'
                                  : 'var(--accent-400)',
                              borderBottom: '1px solid var(--border-subtle)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.reviewStatus === 'needs_attention'
                              ? 'Needs review'
                              : row.intentHint ?? 'Ready'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {skippedRows.length > 0 && (
          <div
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
              }}
            >
              Skipped or blocked rows
            </div>
            {skippedRows.slice(0, 8).map((row) => (
              <div
                key={`${row.status}-${row.rowIndex}-${row.reason}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 120px 1fr',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 0',
                  borderTop: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                }}
              >
                <span style={{ color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  Row {row.rowIndex}
                </span>
                <span style={{ color: row.status === 'duplicate' ? 'var(--accent-400)' : 'var(--warning)' }}>
                  {row.status === 'duplicate' ? 'Duplicate' : 'Blocked'}
                </span>
                <span>{row.reason}</span>
              </div>
            ))}
          </div>
        )}

        {/* Import action */}
        <div
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: 2,
              }}
            >
              Step 4 — Execute
            </div>
            {rowCount > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {rowCount} rows in CSV · {duplicateCount} duplicates · {errorCount} errors
              </p>
            )}
            {importNotice && (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--positive)',
                  background: 'var(--positive-tint)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginTop: 4,
                }}
              >
                {importNotice}
                {importNotice.includes('transactions for review') && (
                  <>
                    {' '}
                    <a href="/transactions" style={{ color: 'var(--accent-400)', fontWeight: 600 }}>
                      Review transactions →
                    </a>
                  </>
                )}
              </p>
            )}
            {errorMessage && !errorMessage.includes('Account ID') && (
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--warning)',
                  background: 'var(--warning-tint)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginTop: 4,
                }}
              >
                {errorMessage}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={isImporting || !selectedFile}
            onClick={() => void handleImport()}
            style={{
              height: 44,
              padding: '0 20px',
              background: isImporting || !selectedFile ? 'var(--surface-3)' : 'var(--accent-500)',
              color: isImporting || !selectedFile ? 'var(--text-disabled)' : 'var(--text-inverse)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.005em',
              cursor: isImporting || !selectedFile ? 'not-allowed' : 'pointer',
              transition: 'background var(--duration-fast) var(--ease-standard)',
              whiteSpace: 'nowrap',
            }}
          >
            {isImporting ? 'Importing…' : 'Execute import'}
          </button>
        </div>
      </div>
    </div>
  );
}
