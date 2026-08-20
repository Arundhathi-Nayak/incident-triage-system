export interface Ticket {
   id: number;
  incidentId: string;
  title: string;
  description: string;
  category: string | null;
  severity: string | null;
  status: string;
  assignedTeam: string | null;
  createdBy: string;
  createdAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  rootCause: string | null;
  summary: string | null;
}

export interface CreateTicketRequest{
    title:string;
    description:string;
    createdBy:string;
}
