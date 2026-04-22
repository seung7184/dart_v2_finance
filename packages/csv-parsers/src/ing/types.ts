/** Raw ING CSV row — Dutch ING format, semicolon-delimited */
export interface INGRawRow {
  Datum: string;                      // 'DD-MM-YYYY'
  'Naam / Omschrijving': string;
  Rekening: string;
  Tegenrekening: string;
  Code: string;
  'Af Bij': 'Af' | 'Bij';
  'Bedrag (EUR)': string;             // '28,40' (comma decimal)
  Mutatiesoort: string;
  Mededelingen: string;
}

export const ING_REQUIRED_COLUMNS: string[] = [
  'Datum',
  'Naam / Omschrijving',
  'Rekening',
  'Af Bij',
  'Bedrag (EUR)',
];
