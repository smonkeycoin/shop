"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { brands, categories, makeCatalogCsv, products } from "@/data/catalog";
import { getAssetStatusLabel, getAssetWarnings, getProductAsset } from "@/data/product-assets";
import { calculateMargin, formatPrice, getStockStatus } from "@/lib/commerce";
import type { Product, StockStatus } from "@/types/commerce";

const stockOptions: { id: StockStatus; label: string }[] = [
  { id: "in_stock", label: "Disponible" },
  { id: "low_stock", label: "Pocas piezas" },
  { id: "out_of_stock", label: "Agotado" },
  { id: "preorder", label: "Sobre pedido" },
];

export function DevCatalogClient() {
  const [brand, setBrand] = useState("todos");
  const [category, setCategory] = useState("todos");
  const [stock, setStock] = useState("todos");
  const [missingCosts, setMissingCosts] = useState(false);
  const [placeholderPrices, setPlaceholderPrices] = useState(false);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const brandMatches = brand === "todos" || product.brandSlug === brand;
        const categoryMatches = category === "todos" || product.categorySlug === category;
        const stockMatches = stock === "todos" || getStockStatus(product) === stock;
        const costMatches = !missingCosts || product.cost == null;
        const priceMatches = !placeholderPrices || product.priceIsPlaceholder;

        return brandMatches && categoryMatches && stockMatches && costMatches && priceMatches;
      }),
    [brand, category, missingCosts, placeholderPrices, stock],
  );

  function exportCsv() {
    const blob = new Blob([makeCatalogCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "shop-neumopractice-catalog.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="section-shell dev-catalog-page">
      <header className="catalog-hero">
        <div>
          <span className="catalog-eyebrow">DEV</span>
          <h1>Catálogo comercial</h1>
          <p>Vista local para revisar datos comerciales sin exponer costos ni advertencias al cliente.</p>
        </div>
        <div className="dev-header-actions">
          <Link className="button-secondary" href="/dev/assets">
            Auditar assets
          </Link>
          <button className="button-primary" type="button" onClick={exportCsv}>
            <Download size={17} aria-hidden="true" />
            Exportar CSV
          </button>
        </div>
      </header>

      <div className="dev-filters">
        <label>
          Marca
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="todos">Todas</option>
            {brands.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Categoría
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="todos">Todas</option>
            {categories.map((item) => (
              <option value={item.slug} key={item.slug}>
                {item.shortName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stock
          <select value={stock} onChange={(event) => setStock(event.target.value)}>
            <option value="todos">Todos</option>
            {stockOptions.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="dev-check">
          <input type="checkbox" checked={missingCosts} onChange={(event) => setMissingCosts(event.target.checked)} />
          Faltan costos
        </label>
        <label className="dev-check">
          <input type="checkbox" checked={placeholderPrices} onChange={(event) => setPlaceholderPrices(event.target.checked)} />
          Precio placeholder
        </label>
      </div>

      <div className="dev-table-wrap">
        <table className="dev-catalog-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Costo</th>
              <th>Margen</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Asset</th>
              <th>Placeholder price</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => {
              const asset = getProductAsset(product.id);

              return (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="warning-row">
                      {[...warningsFor(product), ...getAssetWarnings(asset)].map((warning) => (
                        <span key={warning}>{warning}</span>
                      ))}
                    </div>
                  </td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>{formatPrice(product.retailPrice)}</td>
                  <td>{product.cost == null ? "Pendiente" : formatPrice(product.cost)}</td>
                  <td>{formatPercent(calculateMargin(product.retailPrice, product.cost))}</td>
                  <td>{product.stockQuantity ?? "Sin definir"}</td>
                  <td>{product.stockStatus}</td>
                  <td>{asset ? getAssetStatusLabel(asset.status) : "Placeholder"}</td>
                  <td>{product.priceIsPlaceholder ? "Sí" : "No"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function warningsFor(product: Product) {
  const warnings: string[] = [];

  if (product.cost == null) warnings.push("FALTA COSTO");
  if (product.priceIsPlaceholder) warnings.push("PRECIO DEMO");
  if (product.imageSource === "placeholder" || product.imageSource === "pending") warnings.push("SIN IMAGEN REAL");
  if (typeof product.stockQuantity !== "number") warnings.push("SIN STOCK DEFINIDO");
  if (product.skuIsTemporary) warnings.push("SKU TEMPORAL");

  return warnings;
}

function formatPercent(value: number | null) {
  if (value == null) {
    return "Pendiente";
  }

  return `${value.toFixed(1)}%`;
}
