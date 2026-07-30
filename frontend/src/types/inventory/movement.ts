export type MovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  inventoryItem: string;
  inventoryItemName?: string;
  inventoryItemSku?: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  performedBy?: string | null;
  performedByName?: string;
  createdAt: string;
}

export type StockMovementInput = {
  inventoryItem: string;
  movementType: MovementType;
  quantity: number;
  reason?: string;
  reference?: string;
};

export type ListMovementsParams = {
  page: number;
  movementType?: string;
  inventoryItem?: string;
};