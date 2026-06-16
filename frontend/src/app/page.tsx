"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Navigation2, Star, Clock, Info } from "lucide-react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allWisata, setAllWisata] = useState([]);

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Fetch all wisata initially
    fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/wisata`)
      .then((res) => res.json())
      .then((data) => setAllWisata(data))
      .catch((err) => console.error("Failed to load wisata", err));
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Search failed", err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = hasSearched ? results : allWisata;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-5xl mx-auto text-center z-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-sm font-medium text-primary-500 border border-primary-500/20">
          ✨ NLP Powered Smart Search
        </div>
        <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 tracking-tight">
          LUMIARA
          <span className="block text-3xl md:text-4xl mt-2 text-slate-400 font-medium">
            Smart Tourism Village Lampung
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Temukan destinasi wisata impianmu menggunakan bahasa sehari-hari. Coba
          cari "tempat healing di Lampung" atau "wisata murah dekat pantai".
        </p>

        {/* Search Box */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto relative group"
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik apa yang ingin kamu cari..."
            className="w-full pl-14 pr-32 py-5 bg-slate-900/50 border border-slate-800 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all shadow-xl glass placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-3 top-3 bottom-3 px-6 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? "Mencari..." : "Cari"}
          </button>
        </form>
      </section>

      {/* Results Section */}
      <section className="max-w-6xl mx-auto px-6 pb-32 relative z-10">
        {hasSearched && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-heading font-semibold">
              {results.length > 0 ? "Rekomendasi untukmu" : "Hasil Pencarian"}
            </h2>
            <button
              onClick={() => {
                setResults([]);
                setQuery("");
                setHasSearched(false);
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Hapus Pencarian
            </button>
          </div>
        )}

        {!hasSearched && allWisata.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-semibold">
              Jelajahi Semua Wisata
            </h2>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData.map((item: any) => (
            <div
              key={item.id}
              id={`wisata-${item.id}`}
              className="group glass rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1 flex flex-col"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-medium border border-slate-700 text-slate-300">
                    {item.kategori_wisata}
                  </span>
                  {item.similarity_score && (
                    <div className="bg-primary-500/20 px-3 py-1 rounded-full text-xs font-medium text-primary-400 flex items-center gap-1 border border-primary-500/30">
                      <Star className="w-3 h-3 fill-primary-400" />
                      {Math.round(item.similarity_score * 100)}% Match
                    </div>
                  )}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-heading font-semibold group-hover:text-primary-500 transition-colors">
                    {item.nama_wisata}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <MapPin className="w-4 h-4" />
                  {item.lokasi}
                </div>
                <p className="text-sm text-slate-300 line-clamp-3 mb-6">
                  {item.deskripsi}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {item.fasilitas?.split(",").map((fac: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-800/50 rounded-md text-xs text-slate-300 border border-slate-700/50"
                    >
                      {fac.trim()}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">Harga Tiket</span>
                    <span className="font-semibold text-primary-400">
                      {item.harga_tiket === 0
                        ? "Gratis"
                        : `Rp ${item.harga_tiket?.toLocaleString("id-ID")}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                    <Clock className="w-3 h-3" />
                    {item.jam_buka}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && displayData.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Info className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Tidak ada wisata yang ditemukan.</p>
            <p className="text-sm">Coba gunakan kata kunci yang berbeda.</p>
          </div>
        )}
      </section>
    </main>
  );
}
