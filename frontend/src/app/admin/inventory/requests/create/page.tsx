"use client";

import { useRouter } from "next/navigation";

import RequestForm from "@/components/inventory/requests/RequestForm";

import { RequestService } from "@/services/inventory/requests.service";
import { MaterialRequestInput } from "@/types/inventory/requests";

export default function CreateRequestPage() {
  const router = useRouter();

  async function submit(data: MaterialRequestInput) {
    await RequestService.create(data);
    router.push("/admin/inventory/requests");
  }

  return (
    <div className="space-y-8 p-8">
      <div className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <RequestForm onSubmit={submit} />
      </div>
    </div>
  );
}