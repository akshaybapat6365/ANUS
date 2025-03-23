// Task and conversation types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
  createdAt: Date;
  updatedAt: Date;
  parentTaskId?: string;
  subtasks: Task[];
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  filePath?: string;
  taskId: string;
}

// Agent types
export interface AgentState {
  status: 'idle' | 'thinking' | 'executing' | 'error';
  currentTask?: Task;
  history: Task[];
  error?: string;
}

export interface AgentAction {
  type: string;
  payload?: unknown;
}

// Editor types
export interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  path: string;
  isModified: boolean;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark';
  fontSize: number;
  editorLayout: 'side-by-side' | 'stacked';
  codeHighlighting: boolean;
}

// API types
export interface CompletionResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

export interface StreamingCompletionResponse {
  id: string;
  choices: {
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
} 