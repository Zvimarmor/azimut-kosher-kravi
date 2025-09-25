export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system' | 'error';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface ChatTexts {
  militaryChat: string;
  questionsLeft: string;
  questionsToday: string;
  chatHistory: string;
  newChat: string;
  noChats: string;
  editName: string;
  deleteChat: string;
  preparing: string;
  quotaFinished: string;
  comeBackTomorrow: string;
  typeQuestion: string;
  deleteChatConfirmTitle: string;
  deleteChatConfirmMessage: string;
  deleteChatConfirmSettings: string;
  cancel: string;
  delete: string;
}