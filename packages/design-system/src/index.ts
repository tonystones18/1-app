// Design Tokens — VisioneSoft Platform
// Single source of truth for all visual design decisions

export const colors = {
  // Brand
  brand: {
    50: "#f0f4ff",
    100: "#e0e9ff",
    200: "#c0d3ff",
    300: "#91b3ff",
    400: "#5b8aff",
    500: "#2563eb",
    600: "#1d4ed8",
    700: "#1e40af",
    800: "#1e3a8a",
    900: "#1e3170",
    950: "#172554"
  },
  // Neutral
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617"
  },
  // Semantic
  success: {
    50: "#f0fdf4",
    100: "#dcfce7",
    500: "#22c55e",
    700: "#15803d"
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    700: "#b45309"
  },
  danger: {
    50: "#fff1f2",
    100: "#ffe4e6",
    500: "#ef4444",
    700: "#b91c1c"
  },
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    700: "#1d4ed8"
  }
} as const;

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem"
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700"
  },
  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625"
  }
} as const;

export const spacing = {
  0: "0",
  px: "1px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  9: "2.25rem",
  10: "2.5rem",
  12: "3rem",
  14: "3.5rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
  40: "10rem",
  48: "12rem",
  64: "16rem"
} as const;

export const borderRadius = {
  none: "0",
  sm: "0.25rem",
  base: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px"
} as const;

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  none: "none"
} as const;

export const transitions = {
  fast: "100ms ease",
  base: "150ms ease",
  slow: "300ms ease"
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
} as const;

// CSS custom property generation utilities
export function generateCssVariables(): string {
  const lines: string[] = [":root {"];

  // Brand colors
  for (const [shade, value] of Object.entries(colors.brand)) {
    lines.push(`  --color-brand-${shade}: ${value};`);
  }

  // Neutral colors
  for (const [shade, value] of Object.entries(colors.neutral)) {
    lines.push(`  --color-neutral-${shade}: ${value};`);
  }

  // Semantic colors
  for (const [name, shades] of Object.entries({
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info
  })) {
    for (const [shade, value] of Object.entries(shades)) {
      lines.push(`  --color-${name}-${shade}: ${value};`);
    }
  }

  // Spacing
  for (const [key, value] of Object.entries(spacing)) {
    const cssKey = String(key).replace(".", "_");
    lines.push(`  --spacing-${cssKey}: ${value};`);
  }

  // Border radius
  for (const [key, value] of Object.entries(borderRadius)) {
    lines.push(`  --radius-${key}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(shadows)) {
    lines.push(`  --shadow-${key}: ${value};`);
  }

  lines.push("}");
  return lines.join("\n");
}

// Component variant token maps
export const componentTokens = {
  button: {
    primary: {
      background: colors.brand[600],
      backgroundHover: colors.brand[700],
      text: colors.neutral[0],
      border: "transparent"
    },
    secondary: {
      background: colors.neutral[100],
      backgroundHover: colors.neutral[200],
      text: colors.neutral[800],
      border: colors.neutral[300]
    },
    danger: {
      background: colors.danger[500],
      backgroundHover: colors.danger[700],
      text: colors.neutral[0],
      border: "transparent"
    },
    ghost: {
      background: "transparent",
      backgroundHover: colors.neutral[100],
      text: colors.neutral[700],
      border: "transparent"
    }
  },
  badge: {
    green: { background: colors.success[100], text: colors.success[700] },
    yellow: { background: colors.warning[100], text: colors.warning[700] },
    red: { background: colors.danger[100], text: colors.danger[700] },
    blue: { background: colors.info[100], text: colors.info[700] },
    neutral: { background: colors.neutral[100], text: colors.neutral[700] }
  },
  sidebar: {
    background: colors.neutral[900],
    text: colors.neutral[300],
    textActive: colors.neutral[0],
    itemActiveBackground: colors.neutral[800],
    itemHoverBackground: colors.neutral[800],
    brand: colors.brand[400]
  }
} as const;
