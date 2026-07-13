import type {
  AnalyzeResponse,
  ChatMessage,
  ChatResponse,
  CompareResponse,
  CompareResumeInput,
  CoverLetterResponse,
  DashboardStats,
  ResumeHistoryEntry,
  UploadResponse,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<UploadResponse>(res);
}

export async function analyzeResume(params: {
  resume_text: string;
  job_description?: string;
  filename?: string;
}): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<AnalyzeResponse>(res);
}

export async function fetchHistory(): Promise<ResumeHistoryEntry[]> {
  const res = await fetch(`${API_BASE_URL}/history`);
  return handleResponse<ResumeHistoryEntry[]>(res);
}

export async function fetchHistoryDetail(id: string): Promise<AnalyzeResponse> {
  const res = await fetch(`${API_BASE_URL}/history/${id}`);
  return handleResponse<AnalyzeResponse>(res);
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/history/${id}`, { method: "DELETE" });
  await handleResponse<{ deleted: boolean }>(res);
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard`);
  return handleResponse<DashboardStats>(res);
}

export async function compareResumes(params: {
  resumes: CompareResumeInput[];
  job_description?: string;
}): Promise<CompareResponse> {
  const res = await fetch(`${API_BASE_URL}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<CompareResponse>(res);
}

export async function generateCoverLetter(params: {
  resume_text: string;
  job_description?: string;
  company_name?: string;
  tone?: string;
}): Promise<CoverLetterResponse> {
  const res = await fetch(`${API_BASE_URL}/cover-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<CoverLetterResponse>(res);
}

export async function sendChatMessage(params: {
  resume_text: string;
  job_description?: string;
  messages: ChatMessage[];
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return handleResponse<ChatResponse>(res);
}
