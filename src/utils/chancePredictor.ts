import { ChanceDraw } from "./chanceParser";

interface ChancePrediction {
  clubs: number;
  diamonds: number;
  hearts: number;
  spades: number;
  confidence: number;
  patterns: string[];
  hotCards: number[];
  coldCards: number[];
  seasonalPatterns: string[];
}

const CARD_NAMES: { [key: number]: string } = {
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
};

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

export const generateChancePrediction = (
  draws: ChanceDraw[]
): ChancePrediction => {
  // Get the last 1000 draws, or all draws if less than 1000
  const recentDraws = draws.slice(-1000);
  const patterns: string[] = [];
  const seasonalPatterns: string[] = [];

  // Initialize frequency counters with weighted history
  const suitFrequencies = {
    clubs: {} as { [key: number]: number },
    diamonds: {} as { [key: number]: number },
    hearts: {} as { [key: number]: number },
    spades: {} as { [key: number]: number },
  };

  // Track last appearance of each card
  const lastAppearance = {
    clubs: {} as { [key: number]: number },
    diamonds: {} as { [key: number]: number },
    hearts: {} as { [key: number]: number },
    spades: {} as { [key: number]: number },
  };

  // Track card combinations
  const cardCombinations: { [key: string]: number } = {};
  const cardTriplets: { [key: string]: number } = {};
  const cardQuads: { [key: string]: number } = {};

  // Track monthly and weekly patterns
  const monthlyFrequency: { [key: number]: { [key: number]: number } } = {};
  const weeklyFrequency: { [key: number]: { [key: number]: number } } = {};

  // Track hot and cold cards
  const recentDrawsCount = Math.min(50, recentDraws.length);
  const hotCards = new Set<number>();
  const coldCards = new Set<number>();

  // Count frequencies with weights (more recent = higher weight)
  recentDraws.forEach((draw, index) => {
    const weight = 1 + index / recentDraws.length; // Weight increases for more recent draws
    const date = new Date(draw.date);
    const month = date.getMonth();
    const dayOfWeek = date.getDay();

    // Track monthly and weekly patterns
    const cards = [draw.clubs, draw.diamonds, draw.hearts, draw.spades];
    cards.forEach((card) => {
      if (!monthlyFrequency[month]) monthlyFrequency[month] = {};
      if (!weeklyFrequency[dayOfWeek]) weeklyFrequency[dayOfWeek] = {};

      monthlyFrequency[month][card] = (monthlyFrequency[month][card] || 0) + 1;
      weeklyFrequency[dayOfWeek][card] =
        (weeklyFrequency[dayOfWeek][card] || 0) + 1;
    });

    // Track card combinations (pairs)
    for (let i = 0; i < cards.length; i++) {
      for (let j = i + 1; j < cards.length; j++) {
        const combo = `${cards[i]}-${cards[j]}`;
        cardCombinations[combo] = (cardCombinations[combo] || 0) + weight;
      }
    }
    // Track card triplets
    getCombinations(cards, 3).forEach((triplet) => {
      const key = triplet.sort((a, b) => a - b).join("-");
      cardTriplets[key] = (cardTriplets[key] || 0) + weight;
    });
    // Track card quadruplets
    getCombinations(cards, 4).forEach((quad) => {
      const key = quad.sort((a, b) => a - b).join("-");
      cardQuads[key] = (cardQuads[key] || 0) + weight;
    });

    // Track frequencies with weights
    suitFrequencies.clubs[draw.clubs] =
      (suitFrequencies.clubs[draw.clubs] || 0) + weight;
    suitFrequencies.diamonds[draw.diamonds] =
      (suitFrequencies.diamonds[draw.diamonds] || 0) + weight;
    suitFrequencies.hearts[draw.hearts] =
      (suitFrequencies.hearts[draw.hearts] || 0) + weight;
    suitFrequencies.spades[draw.spades] =
      (suitFrequencies.spades[draw.spades] || 0) + weight;

    // Track last appearance
    lastAppearance.clubs[draw.clubs] = index;
    lastAppearance.diamonds[draw.diamonds] = index;
    lastAppearance.hearts[draw.hearts] = index;
    lastAppearance.spades[draw.spades] = index;

    // Track hot cards (appeared in last 50 draws)
    if (index < recentDrawsCount) {
      cards.forEach((card) => hotCards.add(card));
    }
  });

  // Identify cold cards (haven't appeared in last 100 draws)
  for (let i = 7; i <= 14; i++) {
    if (
      !hotCards.has(i) &&
      (!lastAppearance.clubs[i] || lastAppearance.clubs[i] > 100) &&
      (!lastAppearance.diamonds[i] || lastAppearance.diamonds[i] > 100) &&
      (!lastAppearance.hearts[i] || lastAppearance.hearts[i] > 100) &&
      (!lastAppearance.spades[i] || lastAppearance.spades[i] > 100)
    ) {
      coldCards.add(i);
    }
  }

  // Analyze seasonal patterns
  const currentMonth = new Date().getMonth();
  const currentDayOfWeek = new Date().getDay();

  // Find cards that perform well in current month
  const monthlyPatterns = Object.entries(monthlyFrequency[currentMonth] || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (monthlyPatterns.length > 0) {
    seasonalPatterns.push(
      `Month ${currentMonth + 1} favorites: ${monthlyPatterns
        .map(([card, freq]) => `${getCardName(parseInt(card))} (${freq} times)`)
        .join(", ")}`
    );
  }

  // Find cards that perform well on current day of week
  const weeklyPatterns = Object.entries(weeklyFrequency[currentDayOfWeek] || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (weeklyPatterns.length > 0) {
    seasonalPatterns.push(
      `Day ${currentDayOfWeek} favorites: ${weeklyPatterns
        .map(([card, freq]) => `${getCardName(parseInt(card))} (${freq} times)`)
        .join(", ")}`
    );
  }

  // Calculate total draws for percentage calculation
  const totalDraws = recentDraws.length;

  // Helper function to get most frequent card for a suit
  const getMostFrequentCard = (suit: keyof typeof suitFrequencies) => {
    const frequencies = suitFrequencies[suit];
    const sortedCards = Object.entries(frequencies)
      .map(([card, freq]) => ({
        card: parseInt(card),
        frequency: freq,
        percentage: (freq / totalDraws) * 100,
        lastAppearance: lastAppearance[suit][parseInt(card)],
        isHot: hotCards.has(parseInt(card)),
        isCold: coldCards.has(parseInt(card)),
      }))
      .sort((a, b) => b.frequency - a.frequency);

    return sortedCards[0];
  };

  // Find most common card pairs, triplets, and quads
  const commonCombos = Object.entries(cardCombinations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const commonTriplets = Object.entries(cardTriplets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const commonQuads = Object.entries(cardQuads)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  // Use triplet/quadruplet analysis to influence prediction
  // If a triplet/quad contains a card that is also the most frequent for a suit, prefer it
  const allCandidates = [
    ...commonQuads.flatMap(([quad]) => quad.split("-").map(Number)),
    ...commonTriplets.flatMap(([triplet]) => triplet.split("-").map(Number)),
    ...commonCombos.flatMap(([combo]) => combo.split("-").map(Number)),
  ];

  // Get most frequent card for each suit, but prefer those in common triplets/quads
  function getBestCard(suit: keyof typeof suitFrequencies) {
    const frequencies = suitFrequencies[suit];
    const sortedCards = Object.entries(frequencies)
      .map(([card, freq]) => ({
        card: parseInt(card),
        frequency: freq,
        percentage: (freq / totalDraws) * 100,
        lastAppearance: lastAppearance[suit][parseInt(card)],
        isHot: hotCards.has(parseInt(card)),
        isCold: coldCards.has(parseInt(card)),
      }))
      .sort((a, b) => {
        // Prefer cards in triplets/quads
        const aInCombo = allCandidates.includes(a.card) ? 1 : 0;
        const bInCombo = allCandidates.includes(b.card) ? 1 : 0;
        if (bInCombo !== aInCombo) return bInCombo - aInCombo;
        return b.frequency - a.frequency;
      });
    return sortedCards[0];
  }

  const clubsCard = getBestCard("clubs");
  const diamondsCard = getBestCard("diamonds");
  const heartsCard = getBestCard("hearts");
  const spadesCard = getBestCard("spades");

  // Calculate confidence based on multiple factors
  const suitConfidences = [
    clubsCard.percentage,
    diamondsCard.percentage,
    heartsCard.percentage,
    spadesCard.percentage,
  ];

  // Calculate pattern confidence
  const patternConfidence =
    (commonCombos.reduce((acc, [combo, weight]) => {
      const [card1, card2] = combo.split("-").map(Number);
      const selectedCards = [
        clubsCard.card,
        diamondsCard.card,
        heartsCard.card,
        spadesCard.card,
      ];
      if (selectedCards.includes(card1) && selectedCards.includes(card2)) {
        return acc + (weight / totalDraws) * 100;
      }
      return acc;
    }, 0) /
      commonCombos.length +
      commonTriplets.reduce((acc, [triplet, weight]) => {
        const nums = triplet.split("-").map(Number);
        const selectedCards = [
          clubsCard.card,
          diamondsCard.card,
          heartsCard.card,
          spadesCard.card,
        ];
        if (nums.every((num) => selectedCards.includes(num))) {
          return acc + (weight / totalDraws) * 100;
        }
        return acc;
      }, 0) /
        (commonTriplets.length || 1) +
      commonQuads.reduce((acc, [quad, weight]) => {
        const nums = quad.split("-").map(Number);
        const selectedCards = [
          clubsCard.card,
          diamondsCard.card,
          heartsCard.card,
          spadesCard.card,
        ];
        if (nums.every((num) => selectedCards.includes(num))) {
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
    (suitConfidences.reduce((acc, conf) => acc + conf, 0) / 4) * 0.4 + // Suit frequency weight
    patternConfidence * 0.3 + // Pattern (pair/triplet/quad) weight
    seasonalConfidence * 0.3; // Seasonal weight

  // Add pattern insights
  if (commonCombos.length > 0) {
    patterns.push(
      `Common combinations: ${commonCombos
        .map(([combo]) => {
          const [card1, card2] = combo.split("-").map(Number);
          return `${getCardName(card1)}-${getCardName(card2)}`;
        })
        .join(", ")}`
    );
  }
  if (commonTriplets.length > 0) {
    patterns.push(
      `Common triplets: ${commonTriplets
        .map(([triplet]) => triplet.split("-").map(getCardName).join("-"))
        .join(", ")}`
    );
  }
  if (commonQuads.length > 0) {
    patterns.push(
      `Common quads: ${commonQuads
        .map(([quad]) => quad.split("-").map(getCardName).join("-"))
        .join(", ")}`
    );
  }

  // Add gap analysis
  const recentGaps = [
    `Clubs ${getCardName(clubsCard.card)} last appeared ${
      clubsCard.lastAppearance
    } draws ago`,
    `Diamonds ${getCardName(diamondsCard.card)} last appeared ${
      diamondsCard.lastAppearance
    } draws ago`,
    `Hearts ${getCardName(heartsCard.card)} last appeared ${
      heartsCard.lastAppearance
    } draws ago`,
    `Spades ${getCardName(spadesCard.card)} last appeared ${
      spadesCard.lastAppearance
    } draws ago`,
  ];
  patterns.push(...recentGaps);

  // Add hot/cold card insights
  patterns.push(
    `Hot cards: ${[...hotCards].map((c) => getCardName(Number(c))).join(", ")}`
  );
  patterns.push(
    `Cold cards: ${[...coldCards]
      .map((c) => getCardName(Number(c)))
      .join(", ")}`
  );

  // Log prediction details for analysis
  console.log("Chance Prediction Analysis:");
  console.log("Selected Cards:", {
    clubs: {
      card: getCardName(clubsCard.card),
      frequency: clubsCard.frequency,
      percentage: clubsCard.percentage.toFixed(1) + "%",
      lastAppearance: clubsCard.lastAppearance,
      isHot: clubsCard.isHot,
      isCold: clubsCard.isCold,
    },
    diamonds: {
      card: getCardName(diamondsCard.card),
      frequency: diamondsCard.frequency,
      percentage: diamondsCard.percentage.toFixed(1) + "%",
      lastAppearance: diamondsCard.lastAppearance,
      isHot: diamondsCard.isHot,
      isCold: diamondsCard.isCold,
    },
    hearts: {
      card: getCardName(heartsCard.card),
      frequency: heartsCard.frequency,
      percentage: heartsCard.percentage.toFixed(1) + "%",
      lastAppearance: heartsCard.lastAppearance,
      isHot: heartsCard.isHot,
      isCold: heartsCard.isCold,
    },
    spades: {
      card: getCardName(spadesCard.card),
      frequency: spadesCard.frequency,
      percentage: spadesCard.percentage.toFixed(1) + "%",
      lastAppearance: spadesCard.lastAppearance,
      isHot: spadesCard.isHot,
      isCold: spadesCard.isCold,
    },
  });
  console.log("Patterns:", patterns);
  console.log("Seasonal Patterns:", seasonalPatterns);
  console.log("Overall Confidence:", overallConfidence.toFixed(1) + "%");

  return {
    clubs: clubsCard.card,
    diamonds: diamondsCard.card,
    hearts: heartsCard.card,
    spades: spadesCard.card,
    confidence: Math.min(overallConfidence, 100),
    patterns,
    hotCards: Array.from(hotCards),
    coldCards: Array.from(coldCards),
    seasonalPatterns,
  };
};

export const getCardName = (value: number): string => {
  return CARD_NAMES[value] || value.toString();
};

export type { ChancePrediction };
