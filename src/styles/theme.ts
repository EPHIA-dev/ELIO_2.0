export const theme = {
  colors: {
    primary: "#4B0AA5",
    white: "#FFFFFF",
    black: "#000000",
    background: "#F5F5F5",
    error: "#DC2626",
    shadow: "#000000",
    border: "#E5E5EA",
    text: {
      primary: "#1C1C1E",
      secondary: "#8E8E93",
    },
    gray: {
      100: "#F5F5F5",
      200: "#E5E5EA",
      300: "#D1D1D6",
      400: "#C7C7CC",
      500: "#8E8E93",
      900: "#1C1C1E",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
} as const;
