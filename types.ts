
export interface IDEFile {
  path: string;
  content: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Project {
  id: string;
  name: string;
  files: IDEFile[];
}
