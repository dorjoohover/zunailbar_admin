import { X } from "lucide-react";

interface TimeSlotPillProps {
  time: string;
  onRemove: () => void;
  /** Амарсан өдөр дээр цаг хадгалагдсан хэвээр байгаа боловч захиалгад
   * харагдахгүй тул идэвхтэй биш маягаар (саарал) харуулна. */
  muted?: boolean;
}

export function TimeSlotPill({ time, onRemove, muted = false }: TimeSlotPillProps) {
  return (
    <div
      className={`group flex items-center justify-between px-3 py-2 rounded-lg shadow-sm transition-all ${
        muted
          ? "bg-slate-100 text-slate-400 border border-dashed border-slate-300"
          : "bg-teal-500 hover:bg-teal-600 text-white hover:shadow-md"
      }`}
    >
      <span className="text-sm">{time}</span>
      {/* <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-teal-700 rounded p-0.5"
        title="Устгах"
      >
        <X size={14} />
      </button> */}
    </div>
  );
}
