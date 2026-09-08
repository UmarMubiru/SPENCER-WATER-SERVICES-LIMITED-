"use client";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";

import { Supplier } from "@/types/inventory/supplier";

import { SupplierService } from "@/services/inventory/supplier.service";

import StatusBadge from "@/components/inventory/common/StatusBadge";

export default function SupplierDetailsPage() {

  const { id } = useParams();

  const [supplier, setSupplier] =
    useState<Supplier | null>(null);

  useEffect(() => {

    SupplierService.getById(id as string)

      .then((res) =>
        setSupplier(res.data)
      );

  }, [id]);

  if (!supplier) {

    return (
      <div className="p-8">
        Loading...
      </div>
    );

  }

  return (

    <div className="space-y-8 p-8">

      <div className="rounded-xl border bg-white p-8 shadow-sm">

        <div className="grid gap-8 md:grid-cols-2">

          <div>

            <p className="text-sm text-gray-500">
              Contact Person
            </p>

            <p className="font-semibold">
              {supplier.contactPerson}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Email
            </p>

            <p className="font-semibold">
              {supplier.email}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Phone
            </p>

            <p className="font-semibold">
              {supplier.phone}
            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">
              Status
            </p>

            <StatusBadge
              status={supplier.status}
            />

          </div>

          <div className="md:col-span-2">

            <p className="text-sm text-gray-500">
              Address
            </p>

            <p className="mt-1">
              {supplier.address}
            </p>

          </div>

        </div>

      </div>

    </div>

  );

}