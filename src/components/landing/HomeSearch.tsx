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
    <section className="relative z-30 -mt-3 bg-transparent pb-0 sm:-mt-7 sm:pb-1">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <form onSubmit={submitSearch} className="relative rounded-lg bg-background p-2 shadow-lg ring-1 ring-border/70 sm:p-3">
          <label className="sr-only" htmlFor="home-search">
            Buscar productos
          </label>
          <div className="flex h-11 items-center gap-2 rounded-md bg-secondary px-3 text-foreground ring-1 ring-border/80 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 sm:h-14 sm:px-4">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Que queres hoy?"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground sm:text-base"
            />
            <button
              type="submit"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-ink px-4 text-xs font-black uppercase text-ink-foreground sm:h-11 sm:px-7"
            >
              Buscar
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
