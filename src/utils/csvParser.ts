export interface Book {
  rank: number;
  title: string;
  subtitle: string;
  link: string;
  author: string;
  publisher: string;
  pubDate: string;
  price: number;
  cost: number;
  salesIndex: number;
}

export function parseBooksCsv(csvText: string): Book[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const books: Book[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim());

    // Clean quotes from values
    const cleanRow = row.map(val => {
      let cleaned = val;
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
      }
      return cleaned.replace(/""/g, '"');
    });

    if (cleanRow.length >= 10) {
      const rank = parseInt(cleanRow[0], 10) || i;
      const title = cleanRow[1] || '';
      const subtitle = cleanRow[2] || '';
      const link = cleanRow[3] || '';
      const author = cleanRow[4] || '';
      const publisher = cleanRow[5] || '';
      const pubDate = cleanRow[6] || '';
      
      // Clean price, cost, and sales index
      const price = parseInt(cleanRow[7].replace(/[^0-9]/g, ''), 10) || 0;
      const cost = parseInt(cleanRow[8].replace(/[^0-9]/g, ''), 10) || 0;
      const salesIndex = parseInt(cleanRow[9].replace(/[^0-9]/g, ''), 10) || 0;

      books.push({
        rank,
        title,
        subtitle,
        link,
        author,
        publisher,
        pubDate,
        price,
        cost,
        salesIndex
      });
    }
  }

  return books;
}
