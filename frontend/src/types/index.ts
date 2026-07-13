export interface ATSScoreResult {
  overall_score: number;
  match_percentage: number;
  keyword_score: number;
  formatting_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  matched_skills: string[];
  missing_skills: string[];
}

export interface SkillCategoryDistribution {
  category: string;
  count: number;
  skills: string[];
}

export interface RadarDatum {
  category: string;
  resume_score: number;
  job_score: number;
}

export interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  rewrite_suggestions: string[];
  summary: string;
  source: "gemini" | "heuristic";
}

export interface AnalyzeResponse {
  id: string;
  created_at: string;
  filename: string;
  ats_score: ATSScoreResult;
  skill_distribution: SkillCategoryDistribution[];
  radar_data: RadarDatum[];
  ai_analysis: AIAnalysis;
  resume_text_preview: string;
  resume_text: string;
  job_description: string;
}

export interface CompareResumeInput {
  resume_text: string;
  filename?: string;
}

export interface CompareResponse {
  job_description: string;
  results: AnalyzeResponse[];
  ranking: string[];
}

export interface CoverLetterResponse {
  cover_letter: string;
  source: "gemini" | "heuristic";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  source: "gemini" | "heuristic";
}

export interface ResumeHistoryEntry {
  id: string;
  created_at: string;
  filename: string;
  overall_score: number;
  match_percentage: number;
  matched_skills_count: number;
  missing_skills_count: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
  filename: string;
}

export interface DashboardStats {
  total_uploads: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  recent_analyses: ResumeHistoryEntry[];
  score_trend: ScoreTrendPoint[];
}

export interface UploadResponse {
  filename: string;
  resume_text: string;
}

export type Theme = "light" | "dark";
