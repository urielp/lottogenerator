import { LottoDraw } from "./lottoParser";

interface Prediction {
  numbers: number[];
  strongNumber: number;
  confidence: number;
  patterns: string[];
  hotNumbers: number[];
  coldNumbers: number[];
  seasonalPatterns: string[];
}

function getCombinations(arr: number[], k: number): number[][] {
  const results: number[][] = [];
  function helper(start: number, combo: number[]) {
    if (combo.length === k) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return results;
}

export const generatePrediction = (draws: LottoDraw[]): Prediction => {
  // Get the last 1000 draws, or all draws if less than 1000
  const recentDraws = draws.slice(-1000);
  const patterns: string[] = [];
  const seasonalPatterns: string[] = [];

  // Initialize frequency counters with weighted history
  const numberFrequency: { [key: number]: number } = {};
  const strongNumberFrequency: { [key: number]: number } = {};
  const numberPairs: { [key: string]: number } = {};
  const numberTriplets: { [key: string]: number } = {};
  const numberQuads: { [key: string]: number } = {};
  const lastAppearance: { [key: number]: number } = {};

  // Track monthly and weekly patterns
  const monthlyFrequency: { [key: number]: { [key: number]: number } } = {};
  const weeklyFrequency: { [key: number]: { [key: number]: number } } = {};

  // Track hot and cold numbers
  const recentDrawsCount = Math.min(50, recentDraws.length);
  const hotNumbers = new Set<number>();
  const coldNumbers = new Set<number>();

  // Count frequencies with weights (more recent = higher weight)
  recentDraws.forEach((draw, index) => {
    const weight = 1 + index / recentDraws.length; // Weight increases for more recent draws
    const date = new Date(draw.date);
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    // Track monthly and weekly patterns
    draw.numbers.forEach((num) => {
      if (!monthlyFrequency[month]) monthlyFrequency[month] = {};
      if (!weeklyFrequency[dayOfWeek]) weeklyFrequency[dayOfWeek] = {};

      monthlyFrequency[month][num] = (monthlyFrequency[month][num] || 0) + 1;
      weeklyFrequency[dayOfWeek][num] =
        (weeklyFrequency[dayOfWeek][num] || 0) + 1;
    });

    // Track number pairs
    for (let i = 0; i < draw.numbers.length; i++) {
      for (let j = i + 1; j < draw.numbers.length; j++) {
        const pair = `${draw.numbers[i]}-${draw.numbers[j]}`;
        numberPairs[pair] = (numberPairs[pair] || 0) + weight;
      }
    }

    // Track number triplets
    getCombinations(draw.numbers, 3).forEach((triplet) => {
      const key = triplet.sort((a, b) => a - b).join("-");
      numberTriplets[key] = (numberTriplets[key] || 0) + weight;
    });

    // Track number quadruplets
    getCombinations(draw.numbers, 4).forEach((quad) => {
      const key = quad.sort((a, b) => a - b).join("-");
      numberQuads[key] = (numberQuads[key] || 0) + weight;
    });

    // Track frequencies with weights
    draw.numbers.forEach((num) => {
      numberFrequency[num] = (numberFrequency[num] || 0) + weight;
      lastAppearance[num] = index;
    });
    strongNumberFrequency[draw.strongNumber] =
      (strongNumberFrequency[draw.strongNumber] || 0) + weight;

    // Track hot numbers (appeared in last 50 draws)
    if (index < recentDrawsCount) {
      draw.numbers.forEach((num) => hotNumbers.add(num));
    }
  });

  // Identify cold numbers (haven't appeared in last 100 draws)
  for (let i = 1; i <= 37; i++) {
    if (!hotNumbers.has(i) && (!lastAppearance[i] || lastAppearance[i] > 100)) {
      coldNumbers.add(i);
    }
  }

  // Analyze seasonal patterns
  const currentMonth = new Date().getMonth();
  const currentDayOfWeek = new Date().getDay();

  // Find numbers that perform well in current month
  const monthlyPatterns = Object.entries(monthlyFrequency[currentMonth] || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (monthlyPatterns.length > 0) {
    seasonalPatterns.push(
      `Month ${currentMonth + 1} favorites: ${monthlyPatterns
        .map(([num, freq]) => `#${num} (${freq} times)`)
        .join(", ")}`
    );
  }

  // Find numbers that perform well on current day of week
  const weeklyPatterns = Object.entries(weeklyFrequency[currentDayOfWeek] || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (weeklyPatterns.length > 0) {
    seasonalPatterns.push(
      `Day ${currentDayOfWeek} favorites: ${weeklyPatterns
        .map(([num, freq]) => `#${num} (${freq} times)`)
        .join(", ")}`
    );
  }

  // Calculate total draws for percentage calculation
  const totalDraws = recentDraws.length;

  // Sort numbers by weighted frequency and calculate their percentages
  const sortedNumbers = Object.entries(numberFrequency)
    .map(([num, freq]) => ({
      number: parseInt(num),
      frequency: freq,
      percentage: (freq / totalDraws) * 100,
      lastAppearance: lastAppearance[parseInt(num)],
      isHot: hotNumbers.has(parseInt(num)),
      isCold: coldNumbers.has(parseInt(num)),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  // Sort strong numbers by weighted frequency
  const sortedStrongNumbers = Object.entries(strongNumberFrequency)
    .map(([num, freq]) => ({
      number: parseInt(num),
      frequency: freq,
      percentage: (freq / totalDraws) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  // Find most common number pairs, triplets, and quads
  const commonPairs = Object.entries(numberPairs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const commonTriplets = Object.entries(numberTriplets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const commonQuads = Object.entries(numberQuads)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  // Select numbers based on frequency, pair/triplet/quad analysis, and seasonal patterns
  let selectedNumbers: number[] = [];
  const usedNumbers = new Set<number>();

  // Add numbers from most common quadruplets
  commonQuads.forEach(([quad]) => {
    quad
      .split("-")
      .map(Number)
      .forEach((num) => {
        if (!usedNumbers.has(num) && selectedNumbers.length < 6) {
          selectedNumbers.push(num);
          usedNumbers.add(num);
        }
      });
  });

  // Add numbers from most common triplets
  commonTriplets.forEach(([triplet]) => {
    triplet
      .split("-")
      .map(Number)
      .forEach((num) => {
        if (!usedNumbers.has(num) && selectedNumbers.length < 6) {
          selectedNumbers.push(num);
          usedNumbers.add(num);
        }
      });
  });

  // Add numbers from most common pairs
  commonPairs.forEach(([pair]) => {
    pair
      .split("-")
      .map(Number)
      .forEach((num) => {
        if (!usedNumbers.has(num) && selectedNumbers.length < 6) {
          selectedNumbers.push(num);
          usedNumbers.add(num);
        }
      });
  });

  // Add some hot numbers if we don't have enough
  if (selectedNumbers.length < 6) {
    const hotNumbersArray = Array.from(hotNumbers);
    for (const num of hotNumbersArray) {
      if (selectedNumbers.length >= 6) break;
      if (!usedNumbers.has(num)) {
        selectedNumbers.push(num);
        usedNumbers.add(num);
      }
    }
  }

  // Add some cold numbers if we still don't have enough
  if (selectedNumbers.length < 6) {
    const coldNumbersArray = Array.from(coldNumbers);
    for (const num of coldNumbersArray) {
      if (selectedNumbers.length >= 6) break;
      if (!usedNumbers.has(num)) {
        selectedNumbers.push(num);
        usedNumbers.add(num);
      }
    }
  }

  // Fill remaining slots with most frequent numbers
  for (const { number } of sortedNumbers) {
    if (selectedNumbers.length >= 6) break;
    if (!usedNumbers.has(number)) {
      selectedNumbers.push(number);
      usedNumbers.add(number);
    }
  }

  // Sort selected numbers
  selectedNumbers.sort((a, b) => a - b);

  const selectedStrongNumber = sortedStrongNumbers[0].number;

  // Calculate confidence based on multiple factors
  const numberConfidence =
    selectedNumbers.reduce((acc, num) => {
      const numberData = sortedNumbers.find((n) => n.number === num);
      return acc + (numberData?.percentage || 0);
    }, 0) / 6;

  const strongNumberConfidence = sortedStrongNumbers[0].percentage;

  // Calculate pattern confidence
  const patternConfidence =
    (commonPairs.reduce((acc, [pair, weight]) => {
      const [num1, num2] = pair.split("-").map(Number);
      if (selectedNumbers.includes(num1) && selectedNumbers.includes(num2)) {
        return acc + (weight / totalDraws) * 100;
      }
      return acc;
    }, 0) /
      commonPairs.length +
      commonTriplets.reduce((acc, [triplet, weight]) => {
        const nums = triplet.split("-").map(Number);
        if (nums.every((num) => selectedNumbers.includes(num))) {
          return acc + (weight / totalDraws) * 100;
        }
        return acc;
      }, 0) /
        (commonTriplets.length || 1) +
      commonQuads.reduce((acc, [quad, weight]) => {
        const nums = quad.split("-").map(Number);
        if (nums.every((num) => selectedNumbers.includes(num))) {
          return acc + (weight / totalDraws) * 100;
        }
        return acc;
      }, 0) /
        (commonQuads.length || 1)) /
    3;

  // Calculate seasonal confidence
  const seasonalConfidence =
    (monthlyPatterns.length + weeklyPatterns.length) * 10;

  // Overall confidence is weighted average of all factors
  const overallConfidence =
    numberConfidence * 0.4 + // Number frequency weight
    strongNumberConfidence * 0.2 + // Strong number weight
    patternConfidence * 0.3 + // Pattern (pair/triplet/quad) weight
    seasonalConfidence * 0.1; // Seasonal weight

  // Add pattern insights
  if (commonPairs.length > 0) {
    patterns.push(
      `Common pairs: ${commonPairs.map(([pair]) => pair).join(", ")}`
    );
  }
  if (commonTriplets.length > 0) {
    patterns.push(
      `Common triplets: ${commonTriplets
        .map(([triplet]) => triplet)
        .join(", ")}`
    );
  }
  if (commonQuads.length > 0) {
    patterns.push(
      `Common quads: ${commonQuads.map(([quad]) => quad).join(", ")}`
    );
  }

  // Add gap analysis
  const recentGaps = selectedNumbers.map((num) => {
    const lastSeen = lastAppearance[num];
    return `Number ${num} last appeared ${lastSeen} draws ago`;
  });
  patterns.push(...recentGaps);

  // Add hot/cold number insights
  patterns.push(`Hot numbers: ${Array.from(hotNumbers).join(", ")}`);
  patterns.push(`Cold numbers: ${Array.from(coldNumbers).join(", ")}`);

  // Log prediction details for analysis
  console.log("Prediction Analysis:");
  console.log("Selected Numbers:", selectedNumbers);
  console.log(
    "Number Frequencies:",
    selectedNumbers.map((num) => ({
      number: num,
      frequency: numberFrequency[num],
      percentage: ((numberFrequency[num] / totalDraws) * 100).toFixed(1) + "%",
      lastAppearance: lastAppearance[num],
      isHot: hotNumbers.has(num),
      isCold: coldNumbers.has(num),
    }))
  );
  console.log("Strong Number:", selectedStrongNumber);
  console.log("Strong Number Frequency:", {
    number: selectedStrongNumber,
    frequency: strongNumberFrequency[selectedStrongNumber],
    percentage:
      (
        (strongNumberFrequency[selectedStrongNumber] / totalDraws) *
        100
      ).toFixed(1) + "%",
  });
  console.log("Patterns:", patterns);
  console.log("Seasonal Patterns:", seasonalPatterns);
  console.log("Overall Confidence:", overallConfidence.toFixed(1) + "%");

  return {
    numbers: selectedNumbers,
    strongNumber: selectedStrongNumber,
    confidence: Math.min(overallConfidence, 100),
    patterns,
    hotNumbers: Array.from(hotNumbers),
    coldNumbers: Array.from(coldNumbers),
    seasonalPatterns,
  };
};
