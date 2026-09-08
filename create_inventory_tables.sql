-- Drop existing tables if they exist with wrong schema
DROP TABLE IF EXISTS "inventory_purchaseorder" CASCADE;
DROP TABLE IF EXISTS "inventory_supplierquotation" CASCADE;
DROP TABLE IF EXISTS "inventory_supplier" CASCADE;

-- Create Supplier table
CREATE TABLE "inventory_supplier" (
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "id" uuid NOT NULL PRIMARY KEY,
    "supplier_code" varchar(30) NOT NULL UNIQUE,
    "name" varchar(200) NOT NULL,
    "contact_person" varchar(150) NOT NULL,
    "email" varchar(254) NOT NULL,
    "phone" varchar(20) NOT NULL,
    "address" text NOT NULL,
    "notes" text NOT NULL,
    "is_active" boolean NOT NULL,
    "is_archived" boolean NOT NULL,
    "archived_at" timestamp with time zone NULL
);

-- Create indexes for Supplier
CREATE INDEX IF NOT EXISTS "inventory_supplier_supplier_code_45644c3c_like" ON "inventory_supplier" ("supplier_code" varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS "inventory_s_supplie_ad4a4a_idx" ON "inventory_supplier" ("supplier_code");
CREATE INDEX IF NOT EXISTS "inventory_s_name_d435cf_idx" ON "inventory_supplier" ("name");
CREATE INDEX IF NOT EXISTS "inventory_s_is_acti_3743da_idx" ON "inventory_supplier" ("is_active");

-- Create SupplierQuotation table
CREATE TABLE IF NOT EXISTS "inventory_supplierquotation" (
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "id" uuid NOT NULL PRIMARY KEY,
    "quotation_number" varchar(30) NOT NULL UNIQUE,
    "status" varchar(20) NOT NULL,
    "total_amount" numeric(15, 2) NOT NULL,
    "valid_until" date NULL,
    "notes" text NOT NULL,
    "received_at" timestamp with time zone NULL,
    "material_request_id" uuid NOT NULL,
    "supplier_id" uuid NOT NULL
);

-- Create foreign keys for SupplierQuotation
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_supplierqu_material_request_id_f6139a8f_fk_inventory'
    ) THEN
        ALTER TABLE "inventory_supplierquotation" 
            ADD CONSTRAINT "inventory_supplierqu_material_request_id_f6139a8f_fk_inventory" 
            FOREIGN KEY ("material_request_id") REFERENCES "inventory_materialrequest" ("id") DEFERRABLE INITIALLY DEFERRED;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_supplierqu_supplier_id_7ee1366d_fk_inventory'
    ) THEN
        ALTER TABLE "inventory_supplierquotation" 
            ADD CONSTRAINT "inventory_supplierqu_supplier_id_7ee1366d_fk_inventory" 
            FOREIGN KEY ("supplier_id") REFERENCES "inventory_supplier" ("id") DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

-- Create indexes for SupplierQuotation
CREATE INDEX IF NOT EXISTS "inventory_supplierquotation_quotation_number_04193fb6_like" ON "inventory_supplierquotation" ("quotation_number" varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS "inventory_supplierquotation_material_request_id_f6139a8f" ON "inventory_supplierquotation" ("material_request_id");
CREATE INDEX IF NOT EXISTS "inventory_supplierquotation_supplier_id_7ee1366d" ON "inventory_supplierquotation" ("supplier_id");
CREATE INDEX IF NOT EXISTS "inventory_s_quotati_93c0bd_idx" ON "inventory_supplierquotation" ("quotation_number");
CREATE INDEX IF NOT EXISTS "inventory_s_materia_dabfb0_idx" ON "inventory_supplierquotation" ("material_request_id");
CREATE INDEX IF NOT EXISTS "inventory_s_supplie_ec56e5_idx" ON "inventory_supplierquotation" ("supplier_id");
CREATE INDEX IF NOT EXISTS "inventory_s_status_72b4b6_idx" ON "inventory_supplierquotation" ("status");

-- Create PurchaseOrder table
CREATE TABLE IF NOT EXISTS "inventory_purchaseorder" (
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL,
    "id" uuid NOT NULL PRIMARY KEY,
    "order_number" varchar(30) NOT NULL UNIQUE,
    "status" varchar(20) NOT NULL,
    "total_amount" numeric(15, 2) NOT NULL,
    "expected_delivery_date" date NULL,
    "notes" text NOT NULL,
    "sent_at" timestamp with time zone NULL,
    "acknowledged_at" timestamp with time zone NULL,
    "completed_at" timestamp with time zone NULL,
    "material_request_id" uuid NULL,
    "supplier_id" uuid NOT NULL,
    "supplier_quotation_id" uuid NULL
);

-- Create foreign keys for PurchaseOrder
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_purchaseor_material_request_id_630bb654_fk_inventory'
    ) THEN
        ALTER TABLE "inventory_purchaseorder" 
            ADD CONSTRAINT "inventory_purchaseor_material_request_id_630bb654_fk_inventory" 
            FOREIGN KEY ("material_request_id") REFERENCES "inventory_materialrequest" ("id") DEFERRABLE INITIALLY DEFERRED;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_purchaseor_supplier_id_c6bc28e9_fk_inventory'
    ) THEN
        ALTER TABLE "inventory_purchaseorder" 
            ADD CONSTRAINT "inventory_purchaseor_supplier_id_c6bc28e9_fk_inventory" 
            FOREIGN KEY ("supplier_id") REFERENCES "inventory_supplier" ("id") DEFERRABLE INITIALLY DEFERRED;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inventory_purchaseor_supplier_quotation_i_01330177_fk_inventory'
    ) THEN
        ALTER TABLE "inventory_purchaseorder" 
            ADD CONSTRAINT "inventory_purchaseor_supplier_quotation_i_01330177_fk_inventory" 
            FOREIGN KEY ("supplier_quotation_id") REFERENCES "inventory_supplierquotation" ("id") DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

-- Create indexes for PurchaseOrder
CREATE INDEX IF NOT EXISTS "inventory_purchaseorder_order_number_d539b9a4_like" ON "inventory_purchaseorder" ("order_number" varchar_pattern_ops);
CREATE INDEX IF NOT EXISTS "inventory_purchaseorder_material_request_id_630bb654" ON "inventory_purchaseorder" ("material_request_id");
CREATE INDEX IF NOT EXISTS "inventory_purchaseorder_supplier_id_c6bc28e9" ON "inventory_purchaseorder" ("supplier_id");
CREATE INDEX IF NOT EXISTS "inventory_purchaseorder_supplier_quotation_id_01330177" ON "inventory_purchaseorder" ("supplier_quotation_id");
CREATE INDEX IF NOT EXISTS "inventory_p_order_n_ff9797_idx" ON "inventory_purchaseorder" ("order_number");
CREATE INDEX IF NOT EXISTS "inventory_p_supplie_1bb150_idx" ON "inventory_purchaseorder" ("supplier_id");
CREATE INDEX IF NOT EXISTS "inventory_p_materia_1f07b6_idx" ON "inventory_purchaseorder" ("material_request_id");
CREATE INDEX IF NOT EXISTS "inventory_p_status_43427b_idx" ON "inventory_purchaseorder" ("status");
CREATE INDEX IF NOT EXISTS "inventory_p_created_36002a_idx" ON "inventory_purchaseorder" ("created_at");
