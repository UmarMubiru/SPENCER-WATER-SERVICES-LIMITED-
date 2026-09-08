"use client";

import { Product } from "@/types/inventory/products";

interface Props {

    product: Product;

}

export default function ProductInformation({

    product,

}: Props) {

    return (

        <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b p-6">

                <h3 className="font-semibold">

                    Product Information

                </h3>

            </div>

            <div className="grid gap-6 p-6 md:grid-cols-2">

                <Info
                    label="SKU"
                    value={product.sku}
                />

                <Info
                    label="Category"
                    value={product.category}
                />

                <Info
                    label="Supplier"
                    value={product.supplierName ?? "-"}
                />
                <Info
                    label="Unit"
                    value={product.unit}
                />

                <Info
                    label="Reorder Level"
                    value={product.reorderLevel}
                />

                <Info
                    label="Barcode"
                    value={product.barcode ?? "-"}
                />

            </div>

            <div className="border-t p-6">

                <h4 className="mb-2 font-semibold">

                    Description

                </h4>

                <p className="text-gray-600">

                    {product.description || "No description"}

                </p>

            </div>

        </div>

    );

}

function Info({

    label,

    value,

}: {

    label: string;

    value: any;

}) {

    return (

        <div>

            <p className="text-sm text-gray-500">

                {label}

            </p>

            <p className="mt-1 font-semibold">

                {value}

            </p>

        </div>

    );

}