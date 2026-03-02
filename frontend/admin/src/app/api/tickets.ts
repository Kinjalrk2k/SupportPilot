import instance from "./instance";

export type TicketCategoryType = "billing" | "technical" | "login" | "general";
export type TicketPriorityType = "low" | "medium" | "high" | "urgent";
export type TicketStatusType =
  | "ai_handling"
  | "escalated_to_human"
  | "human_handling"
  | "closed";

export interface ITicketCreate {
  order_id: string;
  category?: TicketCategoryType | null;
  priority?: TicketPriorityType | null;
  status: TicketStatusType;
}

export interface ITicketResponse {
  id: string;
  order_id: string;
  category?: TicketCategoryType | null;
  priority?: TicketPriorityType | null;
  status: TicketStatusType;
  created_at: string;
  updated_at: string;
}

export interface ITicketUpdate {
  category?: TicketCategoryType | null;
  priority?: TicketPriorityType | null;
  status?: TicketStatusType | null;
}

export interface IPaginatedTicketResponse {
  items: ITicketResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type MessageRole = "user" | "assistant" | "human";

export interface IMessageResponse {
  id: string;
  role: MessageRole;
  content: string;
  sent_at: string;
}

export const getTickets = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<IPaginatedTicketResponse> => {
  const response = await instance.get(
    `/tickets/?page=${page}&page_size=${pageSize}`,
  );
  return response.data;
};

export const createTicket = async (
  ticket: ITicketCreate,
): Promise<ITicketResponse> => {
  const response = await instance.post(`/tickets/`, ticket);
  return response.data;
};

export const getTicket = async (ticketId: string): Promise<ITicketResponse> => {
  const response = await instance.get(`/tickets/${ticketId}`);
  return response.data;
};

export const updateTicket = async (
  ticketId: string,
  ticket: ITicketUpdate,
): Promise<ITicketResponse> => {
  const response = await instance.put(`/tickets/${ticketId}`, ticket);
  return response.data;
};

export const deleteTicket = async (ticketId: string): Promise<void> => {
  await instance.delete(`/tickets/${ticketId}`);
};

export const getTicketMessages = async (
  threadId: string,
): Promise<IMessageResponse[]> => {
  const response = await instance.get(`/messages/${threadId}`);
  return response.data;
};
