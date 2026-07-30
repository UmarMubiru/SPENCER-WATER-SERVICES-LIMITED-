"use client";

interface Props {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, onPrevious, onNext }: Props) {
  return (
    <div className="inventory-pagination flex w-fit items-center justify-end gap-3">
      <button
        onClick={onPrevious}
        disabled={page === 1}
        className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-[13px] font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-white"
      >
        Previous
      </button>

      <span className="text-[13px] text-blue-400">
        Page <span className="font-medium text-blue-700">{page}</span> of {Math.max(totalPages, 1)}
      </span>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-[13px] font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-white"
      >
        Next
      </button>
    </div>
  );
}
