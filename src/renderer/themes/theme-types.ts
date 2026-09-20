export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; accent: string; text: string };
  cssVariables: Record<string, string>;
  /** Extra CSS injected when this theme is active (animations, gradients, structural overrides) */
  customCSS: string;
}
