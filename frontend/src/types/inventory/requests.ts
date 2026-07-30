export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "ISSUED";

export interface MaterialRequestItem {
  id: string;
  inventoryItem: string;
  inventoryItemName?: string;
  inventoryItemSku?: string;
  quantityRequested: number;
  quantityApproved?: number | null;
}

export interface MaterialRequest {
  id: string;
  projectId?: string | null;
  projectName?: string;
  department?: string;
  requestedBy?: string | null;
  requestedByName?: string;
  status: RequestStatus;
  notes?: string;
  items: MaterialRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export type MaterialRequestInput = {
  projectId?: string | null;
  projectName?: string;
  department?: string;
  notes?: string;
  items: { inventoryItem: string; quantityRequested: number }[];
};

export type ListRequestsParams = { page: number; status?: string; department?: string };
