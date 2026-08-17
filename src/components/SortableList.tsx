import React, { useEffect, useMemo, useState } from "react";
import { GripVertical, ChevronUp, ChevronDown, Check, ListOrdered } from "lucide-react";

type Item = { id: string | number };
type Props<T extends Item> = {
  items: T[];
  storageKey: string;
  renderItem: (item: T, index: number, arranging: boolean) => React.ReactNode;
  className?: string;
};

const keyFor = (key: string) => `rpf-order:${key}`;
const readOrder = (key: string): string[] => {
  try {
    const value = JSON.parse(localStorage.getItem(keyFor(key)) || "[]");
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
};

export default function SortableList<T extends Item>({
  items,
  storageKey,
  renderItem,
  className = "space-y-2",
}: Props<T>) {
  const [arranging, setArranging] = useState(false);
  const [order, setOrder] = useState<string[]>(() => readOrder(storageKey));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    setOrder(readOrder(storageKey));
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(keyFor(storageKey), JSON.stringify(order));
    } catch {}
  }, [order, storageKey]);

  const ordered = useMemo(() => {
    const rank = new Map(order.map((id, index) => [id, index]));
    return [...items].sort(
      (a, b) =>
        (rank.get(String(a.id)) ?? 999999) -
        (rank.get(String(b.id)) ?? 999999),
    );
  }, [items, order]);

  // Preserve the complete list order when the visible list is filtered.
  const persistVisibleOrder = (nextVisible: T[]) => {
    const visibleIds = new Set(nextVisible.map((item) => String(item.id)));
    const hiddenIds = order.filter((id) => !visibleIds.has(id));
    setOrder([...hiddenIds, ...nextVisible.map((item) => String(item.id))]);
  };

  const move = (index: number, direction: -1 | 1) => {
    const next = [...ordered];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    persistVisibleOrder(next);
  };

  const moveToId = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const next = [...ordered];
    const from = next.findIndex((item) => String(item.id) === fromId);
    const to = next.findIndex((item) => String(item.id) === toId);
    if (from < 0 || to < 0) return;
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    persistVisibleOrder(next);
  };

  const reset = () => {
    try {
      localStorage.removeItem(keyFor(storageKey));
    } catch {}
    setOrder([]);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          {arranging && (
            <>
              <ListOrdered className="h-3.5 w-3.5" />
              Arrange order
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {arranging && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-100"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setArranging((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm ${
              arranging
                ? "bg-[#000080] text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {arranging ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <GripVertical className="h-3.5 w-3.5" />
            )}
            {arranging ? "Done" : "Arrange"}
          </button>
        </div>
      </div>

      {arranging && (
        <p className="pb-1 text-[10px] text-slate-400">
          Finger se ☰ handle pakadkar upar ya neeche drag karein. ↑ ↓ bhi use kar sakte hain.
        </p>
      )}

      {ordered.map((item, index) => {
        const id = String(item.id);
        return (
          <div
            key={id}
            data-sortable-id={id}
            className={arranging ? "rounded-2xl ring-1 ring-slate-100" : ""}
          >
            <div className="relative">
              {arranging && (
                <div className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center gap-1 rounded-xl bg-white/95 p-1 shadow-md ring-1 ring-slate-200">
                  <button
                    type="button"
                    aria-label="Drag to reorder"
                    className="flex h-8 w-8 touch-none items-center justify-center rounded-lg text-slate-500 active:bg-slate-100"
                    style={{ touchAction: "none" }}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture?.(event.pointerId);
                      setDraggingId(id);
                    }}
                    onPointerMove={(event) => {
                      if (draggingId !== id) return;
                      event.preventDefault();
                      const target = document.elementFromPoint(
                        event.clientX,
                        event.clientY,
                      )?.closest<HTMLElement>("[data-sortable-id]");
                      const targetId = target?.dataset.sortableId;
                      if (targetId && targetId !== id) moveToId(id, targetId);
                    }}
                    onPointerUp={() => setDraggingId(null)}
                    onPointerCancel={() => setDraggingId(null)}
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, -1);
                      }}
                      aria-label="Move up"
                      className="flex h-5 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === ordered.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        move(index, 1);
                      }}
                      aria-label="Move down"
                      className="flex h-5 w-7 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
              <div className={arranging ? "pl-12" : ""}>
                {renderItem(item, index, arranging)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
