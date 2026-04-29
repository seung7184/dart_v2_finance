'use client';

import { useRouter } from 'next/navigation';

type MonthOption = {
  year: number;
  month: number;
  label: string;
};

type MonthSelectorProps = {
  options: MonthOption[];
  selectedYear: number;
  selectedMonth: number;
  basePath?: string;
};

export default function MonthSelector({ options, selectedYear, selectedMonth, basePath = '/dashboard' }: MonthSelectorProps) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const [year, month] = e.target.value.split('-').map(Number);
    if (year && month) {
      router.push(`${basePath}?year=${year}&month=${month}`);
    }
  }

  return (
    <select
      value={`${selectedYear}-${selectedMonth}`}
      onChange={handleChange}
      style={{
        height: 34,
        padding: '0 10px',
        borderRadius: 8,
        border: '1px solid var(--border-default)',
        background: 'var(--surface-2)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {options.map((m) => (
        <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
