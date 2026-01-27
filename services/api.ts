import { API_BASE_URL, getAuthHeader } from '@/constants/config';

// Types
export interface WaitingItem {
  text: string;
  tickler_date: string | null;
  project?: string | null;
}

export interface Project {
  name: string;
  actions: string[];
  waiting: WaitingItem[];
}

export interface Note {
  text: string;
  timestamp: number;
}

export interface GTDState {
  standalone_actions: string[];
  projects: Project[];
  waiting: WaitingItem[];
  notes: Note[];
}

export interface UserEntry {
  timestamp: number;
  text: string;
}

export interface NextActionItem {
  text: string;
  is_ugh?: boolean;
}

export interface NextActionGroup {
  name: string;
  items: NextActionItem[];
}

export interface NextActionsData {
  groups: NextActionGroup[];
  waiting: WaitingItem[];
}

export interface DiffLine {
  text: string;
  type: 'equal' | 'delete' | 'insert';
}

export interface StateResponse {
  gtd: GTDState;
  gtd_text: string;
  user_entries: UserEntry[];
  next_actions: NextActionsData;
}

export interface JobResponse {
  job_id: string;
  status_url: string;
  user_text?: string;
  timestamp?: number;
}

export interface TaskStatusResponse {
  status: 'queued' | 'started' | 'finished' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
}

export interface ApplyResponse {
  success: boolean;
  gtd: GTDState;
  gtd_text: string;
  diff_lines: DiffLine[];
  error?: string;
}

// API client
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': getAuthHeader(),
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// API endpoints
export async function getState(): Promise<StateResponse> {
  return fetchAPI<StateResponse>('/api/state');
}

export async function submitEntry(text: string): Promise<JobResponse> {
  return fetchAPI<JobResponse>('/api/entry', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function getTaskStatus(jobId: string): Promise<TaskStatusResponse> {
  return fetchAPI<TaskStatusResponse>(`/api/tasks/${jobId}`);
}

export async function applyCommands(
  commands: string[],
  userText: string,
  timestamp: number
): Promise<ApplyResponse> {
  return fetchAPI<ApplyResponse>('/api/apply', {
    method: 'POST',
    body: JSON.stringify({
      commands,
      user_text: userText,
      timestamp,
    }),
  });
}

export async function refreshNextActions(): Promise<JobResponse> {
  return fetchAPI<JobResponse>('/api/refresh-na', { method: 'POST' });
}

export async function applyNextActions(data: NextActionsData): Promise<{ success: boolean; next_actions: NextActionsData }> {
  return fetchAPI('/api/apply-na', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function undo(): Promise<ApplyResponse & { user_entries: UserEntry[] }> {
  return fetchAPI('/api/undo', { method: 'POST' });
}

export async function getReview(): Promise<JobResponse> {
  return fetchAPI<JobResponse>('/api/review', { method: 'POST' });
}

export async function applyReview(reviewText: string): Promise<ApplyResponse> {
  return fetchAPI<ApplyResponse>('/api/apply-review', {
    method: 'POST',
    body: JSON.stringify({ review_text: reviewText }),
  });
}

export async function getAdvice(): Promise<JobResponse> {
  return fetchAPI<JobResponse>('/api/advice', { method: 'POST' });
}

export async function getCompact(): Promise<JobResponse> {
  return fetchAPI<JobResponse>('/api/compact', { method: 'POST' });
}

export interface CompactSuggestion {
  timestamp: number;
  new_text: string | null;
}

export async function applyCompact(suggestions: CompactSuggestion[]): Promise<{
  success: boolean;
  deleted: number;
  edited: number;
  user_entries: UserEntry[];
}> {
  return fetchAPI('/api/apply-compact', {
    method: 'POST',
    body: JSON.stringify({ suggestions }),
  });
}

// Helper to poll a job until completion
export async function pollJob(
  jobId: string,
  onProgress?: (progress: number | undefined) => void
): Promise<any> {
  while (true) {
    const status = await getTaskStatus(jobId);

    if (onProgress) {
      onProgress(status.progress);
    }

    if (status.status === 'finished') {
      return status.result;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Task failed');
    }

    // Wait 500ms before polling again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
