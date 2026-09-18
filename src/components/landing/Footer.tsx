import { Facebook, Instagram, MapPin } from "lucide-react";
import logoAsset from "@/assets/logo-vera.png.asset.json";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-ink/70 bg-ink pb-28 pt-9 text-ink-foreground md:pb-9">
      <div className="mx-auto grid max-w-6xl gap-7 px-4 sm:grid-cols-[1fr_auto_auto] sm:items-center xl:max-w-7xl xl:px-6">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-background p-1.5">
            <img src={logoAsset.url} alt="Vera Deportes" className="h-11 w-auto" width={80} height={80} />
          </span>
          <div>
            <p className="font-display font-black uppercase">Vera Deportes</p>
            <p className="text-xs text-ink-foreground/65">Movimiento que te acompaña.</p>
          </div>
        </div>
        <a href={SITE.maps} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-ink-foreground/80 hover:text-primary">
          <MapPin className="h-4 w-4 text-primary" /> {SITE.address} · {SITE.city}
        </a>
        <div className="flex items-center gap-4">
          <a href={SITE.instagram} target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-primary"><Instagram className="h-5 w-5" /></a>
          <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook className="h-5 w-5" /></a>
          <span className="text-xs text-ink-foreground/55">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
