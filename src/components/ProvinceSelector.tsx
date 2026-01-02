import { useState, useMemo } from "react";

interface ProvinceSelectorProps {
  provinces: string[];
  onSelect: (province: string) => void;
  selectedProvince: string | null;
  placeholder?: string;
}

export default function ProvinceSelector({
  provinces,
  onSelect,
  selectedProvince,
  placeholder = "พิมพ์ค้นหาหรือเลือกจังหวัด",
}: ProvinceSelectorProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredProvinces = useMemo(() => {
    if (!search) return provinces;
    return provinces.filter((p) =>
      p.toLowerCase().includes(search.toLowerCase())
    );
  }, [provinces, search]);

  const handleSelect = (province: string) => {
    setSearch("");
    setIsOpen(false);
    onSelect(province);
  };

  return (
    <div className="relative">
      <div className="relative">
        <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-election-secondary focus:ring-2 focus:ring-election-secondary/30 transition-all text-lg"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-xl bg-election-dark/95 backdrop-blur-md border border-white/20 shadow-2xl">
          {filteredProvinces.length === 0 ? (
            <div className="p-4 text-white/70 text-center text-base">
              ไม่พบจังหวัด
            </div>
          ) : (
            filteredProvinces.map((province) => (
              <button
                key={province}
                onClick={() => handleSelect(province)}
                className={`w-full px-4 py-4 text-left text-white hover:bg-election-secondary/30 transition-colors first:rounded-t-xl last:rounded-b-xl text-lg ${
                  selectedProvince === province ? "bg-election-secondary/20" : ""
                }`}
              >
                {province}
              </button>
            ))
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
