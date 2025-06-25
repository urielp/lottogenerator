interface ChanceDraw {
  id: number;
  date: string;
  clubs: number;
  diamonds: number;
  hearts: number;
  spades: number;
}

interface ParsedChanceData {
  draws: ChanceDraw[];
  lastDrawId: number;
}

export const parseChanceCSV = (csvContent: string): ParsedChanceData => {
  const lines = csvContent.split("\n");
  const draws: ChanceDraw[] = [];
  let lastDrawId = 0;
  let invalidLines = 0;
  let totalLines = 0;

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    totalLines++;
    const columns = line.split(",").map((col) => col.trim());

    if (columns.length < 6) {
      console.warn(`Line ${i + 1}: Not enough columns (${columns.length})`);
      invalidLines++;
      continue;
    }

    try {
      const date = columns[0];
      const id = parseInt(columns[1], 10);

      if (isNaN(id)) {
        console.warn(`Line ${i + 1}: Invalid ID: ${columns[1]}`);
        invalidLines++;
        continue;
      }

      // Parse card values, handling potential non-numeric values
      const parseCardValue = (value: string): number | null => {
        if (!value) return null;

        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          if (num >= 7 && num <= 14) return num;
          return null;
        }

        // Try to handle special cases (J, Q, K, A)
        switch (value.toUpperCase()) {
          case "J":
            return 11;
          case "Q":
            return 12;
          case "K":
            return 13;
          case "A":
            return 14;
          default:
            return null;
        }
      };

      const clubs = parseCardValue(columns[2]);
      const diamonds = parseCardValue(columns[3]);
      const hearts = parseCardValue(columns[4]);
      const spades = parseCardValue(columns[5]);

      // Validate the data
      if (
        clubs === null ||
        diamonds === null ||
        hearts === null ||
        spades === null
      ) {
        console.warn(
          `Line ${i + 1}: Invalid card values - Clubs: ${
            columns[2]
          }, Diamonds: ${columns[3]}, Hearts: ${columns[4]}, Spades: ${
            columns[5]
          }`
        );
        invalidLines++;
        continue;
      }

      draws.push({
        id,
        date,
        clubs,
        diamonds,
        hearts,
        spades,
      });

      lastDrawId = Math.max(lastDrawId, id);
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`, error);
      invalidLines++;
    }
  }

  // Log parsing statistics
  console.log(`Parsing complete:
    Total lines processed: ${totalLines}
    Valid draws: ${draws.length}
    Invalid lines: ${invalidLines}
    Success rate: ${((draws.length / totalLines) * 100).toFixed(1)}%`);

  if (draws.length === 0) {
    throw new Error("No valid draws found in the CSV data");
  }

  return {
    draws,
    lastDrawId,
  };
};

export type { ChanceDraw, ParsedChanceData };
