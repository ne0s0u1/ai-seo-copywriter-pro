export interface SectionConfig {
  id: string;
  label: string;
  hasCount: boolean; // Does this section need a quantity input (e.g. number of features)?
  defaultCount?: number;
  countLabel?: string;
  basePrompt: string;
}

export interface GeneratedContent {
  sectionId: string;
  english: string;
  chinese: string;
  wordCount: number;
  charCount: number;
  timestamp: number;
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: string; // percentage string
  isMandatory: boolean;
}

export interface AppState {
  apiKey: string;
  mandatoryKeywords: string;
  optionalKeywords: string;
  mandatoryTargetDensity: number;
  optionalTargetDensity: number;
  customPrompt: string;
  selectedSections: string[];
  sectionCounts: Record<string, number>;
  generatedResults: Record<string, GeneratedContent>;
  isGenerating: boolean;
  generatingSectionId: string | null;
}