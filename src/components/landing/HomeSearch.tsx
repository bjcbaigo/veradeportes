import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export const PRODUCT_SEARCH_EVENT = "vera:product-search";

export function HomeSearch() {
  const [query, setQuery] = useState("");

  function submitSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    window.dispatchEvent(new CustomEvent(PRODUCT_SEARCH_EVENT, { detail: query.trim() }));
    if (window.location.pathname === "/tienda") {
      window.history.replaceState(null, "", "/tienda#buscar");
    }
  }

  return (
    <section className="bg-white pb-1 pt-3">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <form onSubmit={submitSearch} className="relative">
          <label className="sr-only" htmlFor="home-search">
            Buscar productos
          </label>
          <div className="flex h-11 items-center gap-2 rounded-2xl bg-secondary px-3 text-foreground shadow-[0_1px_4px_rgba(7,27,59,0.04)] ring-1 ring-border/80 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Que queres hoy?"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-ink px-3.5 text-[11px] font-black uppercase text-ink-foreground"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
