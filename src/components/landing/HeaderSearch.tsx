import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { PRODUCT_SEARCH_EVENT } from "./HomeSearch";

export function HeaderSearch({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (window.location.pathname !== "/tienda") {
      window.location.href = `/tienda?q=${encodeURIComponent(q)}#productos`;
      return;
    }
    window.dispatchEvent(new CustomEvent(PRODUCT_SEARCH_EVENT, { detail: q }));
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <form onSubmit={submit} role="search" className={className}>
      <label className="flex h-9 items-center gap-2 rounded-full bg-secondary px-3 ring-1 ring-border focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/30 md:h-10">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="sr-only">Buscar productos</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="¿Qué querés hoy?"
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
        />
      </label>
    </form>
  );
}
