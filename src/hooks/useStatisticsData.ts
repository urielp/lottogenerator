import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";
import { URLs } from "../config/urls";

export interface NumberFrequency {
  number: number;
  count: number;
  percentage: number;
  face?: string;
}

export interface StatisticsData {
  lottoNumbers: {
    regular: NumberFrequency[];
    strong: NumberFrequency[];
  };
  chanceNumbers: {
    regular: NumberFrequency[];
    strong: NumberFrequency[];
  };
}

const STATS_KEY = "statistics_data";
const STATS_DATE_KEY = "statistics_last_updated";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

export function useStatisticsData() {
  const [statistics, setStatistics] = useState<StatisticsData>({
    lottoNumbers: { regular: [], strong: [] },
    chanceNumbers: { regular: [], strong: [] },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStatistics = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1️⃣ Check AsyncStorage for cached stats and last update date
      const [cachedStats, cachedDate] = await Promise.all([
        AsyncStorage.getItem(STATS_KEY),
        AsyncStorage.getItem(STATS_DATE_KEY),
      ]);

      if (cachedStats && cachedDate) {
        const lastUpdated = new Date(cachedDate);
        const now = new Date();
        if (now.getTime() - lastUpdated.getTime() < ONE_MONTH_MS) {
          setStatistics(JSON.parse(cachedStats));
          setIsLoading(false);
          return;
        }
      }

      // 3️⃣ Otherwise, fetch and parse CSVs as before
      const lottoResponse = await axios.get(URLs.lotto.resultsDownload, {
        timeout: 15000,
        headers: {
          Accept: "text/plain,text/csv,application/csv,*/*",
          "Content-Type": "text/plain",
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "he-IL",
          Referer: "https://www.pais.co.il/",
        },
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const lottoCsvContent = lottoResponse.data;
      if (!lottoCsvContent || typeof lottoCsvContent !== "string") {
        throw new Error("Invalid Lotto CSV content received");
      }

      const chanceResponse = await axios.get(URLs.chance.resultsDownload, {
        timeout: 15000,
        headers: {
          Accept: "text/plain,text/csv,application/csv,*/*",
          "Content-Type": "text/plain",
          "User-Agent": "Mozilla/5.0",
          "Accept-Language": "he-IL",
          Referer: "https://www.pais.co.il/",
        },
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const chanceCsvContent = chanceResponse.data;
      if (!chanceCsvContent || typeof chanceCsvContent !== "string") {
        throw new Error("Invalid Chance CSV content received");
      }

      // Process Lotto numbers
      const lottoData = processLottoData(lottoCsvContent);
      // Process Chance numbers
      const chanceData = processChanceData(chanceCsvContent);

      const newStats = {
        lottoNumbers: lottoData,
        chanceNumbers: chanceData,
      };

      setStatistics(newStats);
      await Promise.all([
        AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats)),
        AsyncStorage.setItem(STATS_DATE_KEY, new Date().toISOString()),
      ]);
    } catch (error) {
      setStatistics({
        lottoNumbers: { regular: [], strong: [] },
        chanceNumbers: { regular: [], strong: [] },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadStatistics();
    setIsRefreshing(false);
  };

  // Utility functions (move to helpers later if needed)
  function processLottoData(csvContent: string) {
    const regularCounts = new Map<number, number>();
    const strongCounts = new Map<number, number>();
    const lines = csvContent.split("\n").slice(1);
    const limitedLines = lines.slice(0, 2000);
    const totalDraws = limitedLines.length;
    if (totalDraws === 0) {
      return { regular: [], strong: [] };
    }
    limitedLines.forEach((line) => {
      if (!line.trim()) return;
      const columns = line.split(",").map((col) => col.trim());
      if (columns.length < 9) return;
      const drawId = parseInt(columns[0], 10);
      if (isNaN(drawId)) return;
      const regularNumbers = columns
        .slice(2, 8)
        .map((num) => {
          const cleanNum = num.replace(/[^0-9.]/g, "");
          const parsedNum = parseInt(cleanNum, 10);
          return parsedNum >= 1 && parsedNum <= 37 ? parsedNum : NaN;
        })
        .filter((num) => !isNaN(num));
      if (regularNumbers.length !== 6) return;
      if (columns.slice(2, 9).some((col) => /[AJQK]/.test(col.toUpperCase())))
        return;
      regularNumbers.forEach((num) => {
        regularCounts.set(num, (regularCounts.get(num) || 0) + 1);
      });
      const strongNum = columns[8].trim();
      const strongNumber = parseInt(strongNum.replace(/[^0-9.]/g, ""), 10);
      if (!isNaN(strongNumber) && strongNumber >= 1 && strongNumber <= 7) {
        strongCounts.set(
          strongNumber,
          (strongCounts.get(strongNumber) || 0) + 1
        );
      }
    });
    const regularFreq = Array.from(regularCounts.entries())
      .map(([number, count]) => ({
        number,
        count,
        percentage: Math.floor((count * 100) / totalDraws),
      }))
      .sort((a, b) => b.count - a.count);
    const strongFreq = Array.from(strongCounts.entries())
      .map(([number, count]) => ({
        number,
        count,
        percentage: Math.floor((count * 100) / totalDraws),
      }))
      .sort((a, b) => b.count - a.count);
    return { regular: regularFreq, strong: strongFreq };
  }

  function processChanceData(csvContent: string) {
    const regularCounts = new Map<string, { count: number; face: string }>();
    let validDraws = 0;
    const lines = csvContent.split("\n").slice(1);
    const limitedLines = lines.slice(0, 2000);
    const totalDraws = limitedLines.length;
    if (totalDraws === 0) {
      return { regular: [], strong: [] };
    }
    limitedLines.forEach((line) => {
      if (!line.trim()) return;
      const columns = line.split(",").map((col) => col.trim());
      if (columns.length < 6) return;
      const drawId = parseInt(columns[1], 10);
      if (isNaN(drawId)) return;
      const cardData = columns
        .slice(2, 6)
        .map((value, idx) => {
          const cleanValue = value.trim().toUpperCase();
          const faces = ["♣", "♦", "♥", "♠"];
          let number;
          if (cleanValue === "A") number = 1;
          else if (cleanValue === "J") number = 11;
          else if (cleanValue === "Q") number = 12;
          else if (cleanValue === "K") number = 13;
          else number = parseInt(cleanValue.replace(/[^0-9.]/g, ""), 10);
          return {
            number,
            face: faces[idx],
          };
        })
        .filter((data) => !isNaN(data.number));
      if (cardData.length === 4) {
        validDraws++;
      }
      cardData.forEach(({ number, face }) => {
        if (number >= 1 && number <= 13) {
          const key = `${number}-${face}`;
          const current = regularCounts.get(key) || { count: 0, face };
          regularCounts.set(key, { count: current.count + 1, face });
        }
      });
    });
    const regularFreq = Array.from(regularCounts.entries())
      .map(([key, { count, face }]) => {
        const [numberStr] = key.split("-");
        const number = parseInt(numberStr, 10);
        const percentage = Math.floor((count * 100) / (validDraws * 4));
        return {
          number,
          count,
          percentage,
          face,
        };
      })
      .sort((a, b) => b.count - a.count);
    return { regular: regularFreq, strong: [] };
  }

  return {
    statistics,
    isLoading,
    isRefreshing,
    handleRefresh,
    loadStatistics, // expose for useEffect if needed
  };
} 