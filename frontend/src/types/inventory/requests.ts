export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "INVALID";
export type FulfillmentStatus = "NOT_ISSUED" | "PARTIALLY_ISSUED" | "COMPLETED";

export interface MaterialRequestItem {
  id: string;
  inventoryItem: string;
  inventoryItemName?: string;
  inventoryItemSku?: string;
  inventoryItemType?: string;
  quantityRequested: number;
  quantityApproved?: number | null;
  quantityIssued: number;
  quantityRemaining: number;
  responsiblePerson?: string | null;
  responsiblePersonName?: string;
  expectedReturnDate?: string | null;
  actualReturnDate?: string | null;
  conditionAtIssue?: string;
  conditionAtReturn?: string;
  returnNotes?: string;
}

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  projectId?: string | null;
  projectName?: string;
  department?: string;
  requestedBy?: string | null;
  requestedByName?: string;
  status: RequestStatus;
  notes?: string;
  reviewedBy?: string | null;
  reviewedByName?: string;
  reviewedAt?: string | null;
  reviewNotes?: string;
  issuedBy?: string | null;
  issuedByName?: string;
  issuedAt?: string | null;
  fulfillmentStatus: FulfillmentStatus;
  items: MaterialRequestItem[];
  createdAt: string;
  updatedAt: string;
}

export type MaterialRequestInput = {
  projectId: string;
  projectName: string;
  department?: string;
  notes?: string;
  items: {
    inventoryItem: string;
    quantityRequested: number;
    responsiblePerson?: string;
    expectedReturnDate?: string;
  }[];
};

export type ListRequestsParams = { page: number; status?: string; department?: string };
