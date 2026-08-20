export interface TicketComment  {
  id: number;
  incidentId: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  author: string;
  text: string;
}
