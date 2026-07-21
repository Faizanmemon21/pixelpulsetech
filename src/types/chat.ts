export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  status: "pending" | "completed" | "error";
};

export type ChatStreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; remaining: number }
  | { type: "error"; message: string; remaining: number };
