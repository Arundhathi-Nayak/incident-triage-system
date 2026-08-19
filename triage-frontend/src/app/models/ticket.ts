export interface Ticket {
    id:number;
    title:string,
    description:string,
    submitter:string,
    category:string|null;
    severity:string|null,
    assignedTeam:string|null;
    summary:string|null;
    createdAt:string;
}

export interface CreateTicketRequest{
    title:string;
    description:string;
    submitter:string;
}
