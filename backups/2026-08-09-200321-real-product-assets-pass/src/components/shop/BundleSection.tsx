import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "./BundleCard";
import type { Bundle } from "@/data/catalog";

export function BundleSection({ bundles }: { bundles: Bundle[] }) {
  return (
    <section className="section-shell bundles-section">
      <div className="section-heading-row">
        <div>
          <h2>Kits para hacerlo más simple</h2>
        </div>
        <Link className="section-link" href="/kits">
          Ver todos los kits
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="bundle-grid">
        {bundles.map((bundle) => (
          <BundleCard bundle={bundle} compact key={bundle.id} />
        ))}
      </div>
    </section>
  );
}
