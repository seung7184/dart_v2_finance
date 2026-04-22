'use client';

import { useRef, useState } from 'react';
import { Badge, Button, Card } from '@dart/ui';

type SupportedBank = 'ING' | 'T212';

type PreviewRow = {
  date: string;
  description: string;
  amount: string;
  externalId: string;
};

const REQUIRED_FIELDS: Record<SupportedBank, string[]> = {
  ING: ['Datum', 'Naam / Omschrijving', 'Bedrag (EUR)', 'Af Bij'],
  T212: ['Action', 'Time', 'Total', 'ID'],
};

function splitCsvLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function parsePreview(
  bank: SupportedBank,
  text: string,
): {
  headers: string[];
  previewRows: PreviewRow[];
  duplicateCount: number;
} {
  const delimiter = bank === 'ING' ? ';' : ',';
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], previewRows: [], duplicateCount: 0 };
  }

  const headers = splitCsvLine(lines[0] ?? '', delimiter);
  const dataLines = lines.slice(1);
  const seen = new Set<string>();
  let duplicateCount = 0;

  const previewRows = dataLines.slice(0, 5).map((line) => {
    const values = splitCsvLine(line, delimiter);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));

    const date = bank === 'ING' ? row['Datum'] ?? '' : row['Time'] ?? '';
    const description =
      bank === 'ING'
        ? row['Naam / Omschrijving'] ?? ''
        : row['Name'] || row['Ticker'] || row['Action'] || '';
    const amount = bank === 'ING' ? row['Bedrag (EUR)'] ?? '' : row['Total'] ?? '';
    const externalId = bank === 'ING' ? '' : row['ID'] ?? '';
    const dedupKey =
      bank === 'ING'
        ? `${date}|${amount}|${description}`
        : `${row['ID'] ?? ''}|${row['Time'] ?? ''}|${amount}`;

    if (seen.has(dedupKey)) {
      duplicateCount += 1;
    } else {
      seen.add(dedupKey);
    }

    return { date, description, amount, externalId };
  });

  return { headers, previewRows, duplicateCount };
}

export default function ImportPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [bank, setBank] = useState<SupportedBank>('ING');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [fileName, setFileName] = useState('No file selected');
  const [importNotice, setImportNotice] = useState('');

  async function handleFile(file: File) {
    const text = await file.text();
    const parsed = parsePreview(bank, text);
    setHeaders(parsed.headers);
    setPreviewRows(parsed.previewRows);
    setDuplicateCount(parsed.duplicateCount);
    setFileName(file.name);
    setImportNotice('');
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

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (file) {
              void handleFile(file);
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
                void handleFile(file);
              }
            }}
            style={{ display: 'none' }}
          />
          <Button type="button" onClick={() => inputRef.current?.click()}>
            Choose file
          </Button>
          <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
            {fileName}
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
              <label
                key={field}
                style={{ display: 'grid', gap: '6px', color: 'var(--color-text-muted)' }}
              >
                <span>{field}</span>
                <select
                  defaultValue={headers.includes(field) ? field : headers[0] ?? ''}
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                  }}
                >
                  {headers.length === 0 ? (
                    <option value="">Upload a file first</option>
                  ) : (
                    headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))
                  )}
                </select>
              </label>
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
                          {row.amount}
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
            <p>N duplicates skipped: {duplicateCount}</p>
            {importNotice ? (
              <p style={{ color: 'var(--color-safe)', fontSize: 'var(--text-sm)' }}>
                {importNotice}
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => {
              setImportNotice(
                previewRows.length === 0
                  ? 'Upload a CSV before running the import.'
                  : `Imported ${previewRows.length} preview rows. ${duplicateCount} duplicates skipped.`,
              );
            }}
          >
            Execute import
          </Button>
        </div>
      </Card>
    </div>
  );
}
