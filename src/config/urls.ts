export const URLs = {
  // Lotto URLs
  lotto: {
    resultsDownload: "https://pais.co.il/Lotto/lotto_resultsDownload.aspx",
    archive: "https://www.pais.co.il/lotto/archive.aspx",
  },
  // Chance URLs
  chance: {
    resultsDownload: "https://pais.co.il/chance/chance_resultsDownload.aspx",
    archive: "https://www.pais.co.il/chance/archive.aspx",
  },
} as const;

// Type for the URLs configuration
export type URLConfig = typeof URLs;

// Helper function to get a URL
export const getURL = (
  key: keyof URLConfig,
  subKey: keyof URLConfig[keyof URLConfig]
): string => {
  return URLs[key][subKey];
};
