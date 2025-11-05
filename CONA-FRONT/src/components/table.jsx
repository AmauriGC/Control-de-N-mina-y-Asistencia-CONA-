import { useMemo, useState } from "react";

export default function Table({
  columns = [],
  data = [],
  className = "",
  pagination = false,
  pageSize = 10,
  page: controlledPage,
  onPageChange,
  showSummary = true,
}) {
  const [internalPage, setInternalPage] = useState(1);
  const page = controlledPage ?? internalPage;
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const pageData = useMemo(() => {
    if (!pagination) return data;
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize, pagination]);

  const goTo = (p) => {
    const next = Math.min(totalPages, Math.max(1, p));
    if (controlledPage === undefined) setInternalPage(next);
    onPageChange?.(next);
  };

  const range = useMemo(() => {
    const size = 5;
    const start = Math.max(1, page - Math.floor(size / 2));
    const end = Math.min(totalPages, start + size - 1);
    const realStart = Math.max(1, end - size + 1);
    return Array.from({ length: end - realStart + 1 }, (_, i) => realStart + i);
  }, [page, totalPages]);

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
            {columns.map((col) => (
              <th key={col.key || col.accessor} className="px-3 py-2 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageData.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-center text-gray-500" colSpan={columns.length}>
                Sin datos
              </td>
            </tr>
          ) : (
            pageData.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                {columns.map((col) => {
                  const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
                  return (
                    <td key={col.key || col.accessor} className="px-3 py-2 text-gray-800">
                      {col.cell ? col.cell(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 p-3 text-xs text-gray-600 sm:flex-row">
          {showSummary ? (
            <div className="order-2 sm:order-1">
              Mostrando <span className="font-medium text-gray-900">{startIdx}</span>–
              <span className="font-medium text-gray-900">{endIdx}</span> de
              <span className="ml-1 font-medium text-gray-900">{total}</span>
            </div>
          ) : (
            <div />
          )}
          <div className="order-1 flex items-center gap-1 sm:order-2">
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => goTo(page - 1)}
              disabled={page <= 1}
            >
              Anterior
            </button>
            {range.map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`rounded-md px-2 py-1 ${
                  p === page ? "bg-gray-900 text-white" : "border border-gray-200 bg-white hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              className="rounded-md border border-gray-200 bg-white px-2 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
