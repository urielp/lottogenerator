 export function generateNumbers2(){
    const numbers = new Set<number>();
    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 37) + 1);
    }
    const strongNumber = Math.floor(Math.random() * 7) + 1;
    return {numbers, strongNumber}
  };
  const CARD_VALUES = [
    "7", "8", "9", "10", "J", "Q", "K", "A"
  ];
  
  export function generateChanceDraw(): {
    hearts: string;
    diamonds: string;
    clubs: string;
    spades: string;
    date: string;
  } {
    return {
      hearts: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      diamonds: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      clubs: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      spades: CARD_VALUES[Math.floor(Math.random() * CARD_VALUES.length)],
      date: new Date().toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }