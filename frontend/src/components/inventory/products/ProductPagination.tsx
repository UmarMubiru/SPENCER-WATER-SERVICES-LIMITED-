"use client";

interface Props {
  page: number;

  totalPages: number;

  onPrevious: () => void;

  onNext: () => void;
}

export default function ProductPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-end gap-4">

      <button
        onClick={onPrevious}
        disabled={page === 1}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Previous
      </button>

      <span>
        Page {page} of {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="rounded-lg border px-4 py-2 disabled:opacity-40"
      >
        Next
      </button>

    </div>
  );
}