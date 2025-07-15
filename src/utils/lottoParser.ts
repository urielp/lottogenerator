interface LottoDraw {
  id: number;
  date: string;
  numbers: number[];
  strongNumber: number;
}

interface ParsedLottoData {
  draws: LottoDraw[];
  lastDrawId: number;
}

export const parseLottoCSV = (csvContent: string): ParsedLottoData => {
  const lines = csvContent.split("\n");
  const draws: LottoDraw[] = [];
  let lastDrawId = 0;

  // Start from row 1692 (index 1691)
  for (let i = 1691; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(",");
    if (columns.length < 9) continue;

    try {
      const id = parseInt(columns[0], 10);
      if (isNaN(id)) continue;

      const date = columns[1];
      const numbers = columns.slice(2, 8).map((num) => parseInt(num, 10));
      const strongNumber = parseInt(columns[8], 10);

      // Validate the data
      if (
        numbers.length !== 6 ||
        numbers.some(isNaN) ||
        isNaN(strongNumber) ||
        numbers.some((n) => n < 1 || n > 37) ||
        strongNumber < 1 ||
        strongNumber > 7
      ) {
        //console.warn(`Invalid data in draw ${id}, skipping...`);
        continue;
      }

      draws.push({
        id,
        date,
        numbers,
        strongNumber,
      });

      lastDrawId = Math.max(lastDrawId, id);
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`, error);
    }
  }

  return {
    draws,
    lastDrawId,
  };
};

export const analyzeLottoData = (draws: LottoDraw[]) => {
  const numberFrequency: { [key: number]: number } = {};
  const strongNumberFrequency: { [key: number]: number } = {};
  const pairFrequency: { [key: string]: number } = {};

  // Initialize frequency objects
  for (let i = 1; i <= 37; i++) {
    numberFrequency[i] = 0;
  }
  for (let i = 1; i <= 7; i++) {
    strongNumberFrequency[i] = 0;
  }

  // Count frequencies
  draws.forEach((draw) => {
    draw.numbers.forEach((num) => {
      numberFrequency[num]++;
    });
    strongNumberFrequency[draw.strongNumber]++;

    // Count pairs
    for (let i = 0; i < draw.numbers.length; i++) {
      for (let j = i + 1; j < draw.numbers.length; j++) {
        const pair = [draw.numbers[i], draw.numbers[j]].sort().join("-");
        pairFrequency[pair] = (pairFrequency[pair] || 0) + 1;
      }
    }
  });

  // Calculate percentages
  const totalDraws = draws.length;
  const numberPercentages = Object.entries(numberFrequency).map(
    ([num, freq]) => ({
      number: parseInt(num, 10),
      frequency: freq,
      percentage: (freq / totalDraws) * 100,
    })
  );

  const strongNumberPercentages = Object.entries(strongNumberFrequency).map(
    ([num, freq]) => ({
      number: parseInt(num, 10),
      frequency: freq,
      percentage: (freq / totalDraws) * 100,
    })
  );

  // Sort by frequency
  numberPercentages.sort((a, b) => b.frequency - a.frequency);
  strongNumberPercentages.sort((a, b) => b.frequency - a.frequency);

  return {
    numberAnalysis: numberPercentages,
    strongNumberAnalysis: strongNumberPercentages,
    pairFrequency,
    totalDraws,
  };
};

export type { LottoDraw, ParsedLottoData };
