import logo from "@/assets/logo-vera.png";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-10 pb-28 md:pb-10">
      <div className="mx-auto max-w-6xl px-4 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Vera Deportes" className="h-12 w-auto" width={80} height={80} />
          <div>
            <p className="font-display font-bold">Vera Deportes</p>
            <p className="text-xs text-muted-foreground">{SITE.city}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vera Deportes · Tienda deportiva local
        </p>
      </div>
    </footer>
  );
}
