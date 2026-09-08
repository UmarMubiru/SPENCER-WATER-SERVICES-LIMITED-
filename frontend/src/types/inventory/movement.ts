export type MovementType = "IN" | "OUT";

export type MovementReason =
  | "PURCHASE"
  | "RETURN"
  | "REQUEST_ISSUE"
  | "ADJUSTMENT"
  | "DAMAGED"
  | "OTHER";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface StockMovement {
  id: string;
  inventoryItem: string;
  inventoryItemName?: string;
  inventoryItemSku?: string;
  categoryName?: string;
  movementType: MovementType;
  reason: MovementReason;
  notes?: string;
  reference?: string;
  quantity: number;
  quantityBefore: number;
  quantityAfter: number;
  reorderLevel: number;
  statusAfter: StockStatus;
  transactionDate: string;
  supplier?: string | null;
  supplierName?: string;
  performedBy?: string | null;
  performedByName?: string;
  createdAt: string;
}

export type StockMovementInput = {
  inventoryItem: string;
  movementType: MovementType;
  reason: MovementReason;
  notes?: string;
  reference?: string;
  quantity: number;
  transactionDate?: string | null;
  supplier?: string | null;
};

export type ListMovementsParams = {
  page: number;
  movementType?: string;
  inventoryItem?: string;
  reason?: string;
};
