export interface TicketComment {
  id: number;
  incidentId: string;
  author: string;
  createdByUserId: string;
  text: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateCommentRequest {
  text: string;
}

export interface UpdateCommentRequest {
  text: string;
}

export interface CommentPage {
  comments: TicketComment[];
  totalCount: number;
  hasMore: boolean;
}