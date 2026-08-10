"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LockKeyhole, PackageSearch, ShieldCheck } from "lucide-react";
import { commerceConfig } from "@/config/commerce";
import { formatPrice } from "@/data/catalog";
import { getProductAsset } from "@/data/product-assets";
import { calculateShipping } from "@/lib/commerce";
import { isValidEmail, isValidPhone } from "@/lib/orders";
import type { OrderItem, ShippingAddress } from "@/types/orders";
import { useOrders } from "./OrderProvider";
import { useShop } from "./ShopProvider";

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  whatsappOptIn: boolean;
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  neighborhood: string;
  postalCode: string;
  city: string;
  state: string;
  references: string;
  customerNotes: string;
  requiresInvoice: boolean;
  termsAccepted: boolean;
};

const CHECKOUT_STORAGE_KEY = "shop-neumopractice-checkout-draft-v1";

const initialForm: CheckoutFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  whatsappOptIn: true,
  street: "",
  exteriorNumber: "",
  interiorNumber: "",
  neighborhood: "",
  postalCode: "",
  city: "",
  state: "",
  references: "",
  customerNotes: "",
  requiresInvoice: false,
  termsAccepted: false,
};

export function CheckoutClient() {
  const router = useRouter();
  const { cartItems, clearCart, resolveCartBundle, resolveCartProduct, subtotal } = useShop();
  const { createOrder } = useOrders();
  const [form, setForm] = useState<CheckoutFormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summaryOpen, setSummaryOpen] = useState(false);
  const shipping = calculateShipping(subtotal);
  const shippingMethod = shipping.qualifiesForFreeShipping ? "Envío estándar · Gratis" : "Envío estándar";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
        if (stored) {
          setForm({ ...initialForm, ...JSON.parse(stored), termsAccepted: false });
        }
      } catch {
        setForm(initialForm);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const draft: Partial<CheckoutFormState> = { ...form };
    delete draft.termsAccepted;
    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(draft));
  }, [form]);

  const snapshotItems = useMemo<OrderItem[]>(
    () =>
      cartItems.map((item) => {
        const product = resolveCartProduct(item);
        const bundle = resolveCartBundle(item);
        const isBundle = item.type === "bundle";
        const bundleImage = bundle?.productIds.map((productId) => getProductAsset(productId)?.localPath).find(Boolean);
        const productImage = product ? getProductAsset(product.id)?.localPath ?? product.images[0] : undefined;
        const image = isBundle ? bundleImage ?? bundle?.image : productImage;
        const name = isBundle ? bundle?.name : product?.name;

        return {
          id: `${item.productId}-${item.variantId}`,
          productId: isBundle ? undefined : item.productId,
          bundleId: isBundle ? item.bundleId ?? item.productId : undefined,
          sku: item.sku,
          name: name ?? item.slug,
          variant: isBundle ? "Kit" : item.variantName,
          image,
          quantity: item.quantity,
          unitPrice: item.price,
          total: item.price * item.quantity,
        };
      }),
    [cartItems, resolveCartBundle, resolveCartProduct],
  );

  function updateField<T extends keyof CheckoutFormState>(field: T, value: CheckoutFormState[T]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form, cartItems.length);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const shippingAddress: ShippingAddress = {
      street: form.street.trim(),
      exteriorNumber: form.exteriorNumber.trim(),
      interiorNumber: form.interiorNumber.trim() || undefined,
      neighborhood: form.neighborhood.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      references: form.references.trim() || undefined,
    };

    const order = createOrder({
      customer: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
      },
      shippingAddress,
      items: snapshotItems,
      subtotal,
      shipping: shipping.shippingCost,
      total: shipping.total,
      currency: commerceConfig.currency,
      shippingMethod,
      whatsappOptIn: form.whatsappOptIn,
      customerNotes: form.customerNotes.trim() || undefined,
      requiresInvoice: form.requiresInvoice,
    });

    clearCart();
    window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
    router.push(`/pedido/${order.orderNumber}`);
  }

  if (cartItems.length === 0) {
    return (
      <section className="section-shell checkout-empty">
        <div className="checkout-card">
          <span className="checkout-icon" aria-hidden="true">
            <CheckCircle2 size={34} />
          </span>
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos para iniciar una simulación de pedido.</p>
          <Link className="button-primary" href="/productos">
            Ver productos
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell checkout-page">
      <header className="catalog-hero checkout-hero">
        <div>
          <span className="catalog-eyebrow">CHECKOUT DEMO</span>
          <h1>Finaliza tu pedido</h1>
          <p>Esta fase simula la compra completa sin pagos en línea ni cargos reales.</p>
        </div>
      </header>

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-flow">
          <CheckoutStep number="1" title="Información de contacto">
            <div className="checkout-grid two">
              <Field label="Nombre" error={errors.firstName}>
                <input value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} />
              </Field>
              <Field label="Apellidos" error={errors.lastName}>
                <input value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} />
              </Field>
            </div>
            <div className="checkout-grid two">
              <Field label="WhatsApp / teléfono" error={errors.phone} hint="+52 México">
                <input
                  inputMode="tel"
                  placeholder="+52 998 123 4567"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  inputMode="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </Field>
            </div>
            <label className="checkout-check">
              <input
                type="checkbox"
                checked={form.whatsappOptIn}
                onChange={(event) => updateField("whatsappOptIn", event.target.checked)}
              />
              <span>
                Quiero recibir actualizaciones de mi pedido por WhatsApp
                <small>
                  Usaremos este número únicamente para actualizaciones relacionadas con tu compra y soporte del pedido.
                </small>
              </span>
            </label>
          </CheckoutStep>

          <CheckoutStep number="2" title="Dirección de envío">
            <Field label="Calle" error={errors.street}>
              <input value={form.street} onChange={(event) => updateField("street", event.target.value)} />
            </Field>
            <div className="checkout-grid three">
              <Field label="Número exterior" error={errors.exteriorNumber}>
                <input value={form.exteriorNumber} onChange={(event) => updateField("exteriorNumber", event.target.value)} />
              </Field>
              <Field label="Interior opcional">
                <input value={form.interiorNumber} onChange={(event) => updateField("interiorNumber", event.target.value)} />
              </Field>
              <Field label="Colonia" error={errors.neighborhood}>
                <input value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} />
              </Field>
            </div>
            <div className="checkout-grid three">
              <Field label="Código postal" error={errors.postalCode}>
                <input inputMode="numeric" value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} />
              </Field>
              <Field label="Ciudad" error={errors.city}>
                <input value={form.city} onChange={(event) => updateField("city", event.target.value)} />
              </Field>
              <Field label="Estado" error={errors.state}>
                <input value={form.state} onChange={(event) => updateField("state", event.target.value)} />
              </Field>
            </div>
            <Field label="Referencias opcionales">
              <textarea
                rows={2}
                value={form.references}
                onChange={(event) => updateField("references", event.target.value)}
              />
            </Field>
            <Field label="Notas para tu pedido">
              <textarea
                rows={2}
                placeholder="Ej. referencias para entrega"
                value={form.customerNotes}
                onChange={(event) => updateField("customerNotes", event.target.value)}
              />
            </Field>
          </CheckoutStep>

          <CheckoutStep number="3" title="Método de envío">
            <div className="shipping-method-card active">
              <ShieldCheck size={20} aria-hidden="true" />
              <div>
                <strong>{shippingMethod}</strong>
                <span>3-5 días hábiles</span>
              </div>
              <em>{shipping.shippingCost === 0 ? "Gratis" : formatPrice(shipping.shippingCost)}</em>
            </div>
            <label className="checkout-check">
              <input
                type="checkbox"
                checked={form.requiresInvoice}
                onChange={(event) => updateField("requiresInvoice", event.target.checked)}
              />
              <span>
                Necesito factura
                <small>La información fiscal se solicitará después de confirmar tu pedido.</small>
              </span>
            </label>
            <div className="demo-payment-panel">
              <LockKeyhole size={20} aria-hidden="true" />
              <div>
                <span>Pago</span>
                <p>El pago en línea se habilitará en la siguiente fase.</p>
              </div>
              <strong>Modo demo</strong>
            </div>
            <label className="checkout-check terms-check">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(event) => updateField("termsAccepted", event.target.checked)}
              />
              <span>
                Acepto los <Link href="/terminos-y-condiciones">términos</Link> y el{" "}
                <Link href="/aviso-de-privacidad">aviso de privacidad</Link>.
              </span>
            </label>
            {errors.termsAccepted ? <p className="field-error">{errors.termsAccepted}</p> : null}
            {errors.cart ? <p className="field-error" aria-live="polite">{errors.cart}</p> : null}
            <button className="button-primary checkout-submit" type="submit">
              Confirmar pedido demo
            </button>
          </CheckoutStep>
        </div>

        <aside className="checkout-summary-card">
          <button className="summary-mobile-toggle" type="button" onClick={() => setSummaryOpen((current) => !current)}>
            Resumen del pedido
            <strong>{formatPrice(shipping.total)}</strong>
          </button>
          <div className={`summary-content ${summaryOpen ? "open" : ""}`}>
            <CheckoutSummary items={snapshotItems} subtotal={subtotal} shipping={shipping.shippingCost} total={shipping.total} />
          </div>
        </aside>
      </form>
    </section>
  );
}

function CheckoutStep({ children, number, title }: { children: ReactNode; number: string; title: string }) {
  return (
    <section className="checkout-step">
      <div className="checkout-step-heading">
        <span>{number}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({
  children,
  error,
  hint,
  label,
}: {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
}) {
  return (
    <label className="checkout-field">
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
      {error ? <em className="field-error">{error}</em> : null}
    </label>
  );
}

function CheckoutSummary({
  items,
  shipping,
  subtotal,
  total,
}: {
  items: OrderItem[];
  shipping: number;
  subtotal: number;
  total: number;
}) {
  return (
    <>
      <h2>Resumen del pedido</h2>
      <div className="checkout-summary-items">
        {items.map((item) => (
          <article className="checkout-summary-item" key={item.id}>
            <span className="checkout-summary-image">
              {item.image ? <Image src={item.image} alt="" fill sizes="54px" /> : <PackageSearch size={18} aria-hidden="true" />}
            </span>
            <div>
              <strong>{item.name}</strong>
              <small>
                {item.variant} · Cant. {item.quantity}
              </small>
            </div>
            <em>{formatPrice(item.total)}</em>
          </article>
        ))}
      </div>
      <div className="checkout-summary-totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatPrice(subtotal)}</strong>
        </div>
        <div>
          <span>Envío</span>
          <strong>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</strong>
        </div>
        <div className="checkout-summary-total">
          <span>Total</span>
          <strong>{formatPrice(total)} MXN</strong>
        </div>
      </div>
    </>
  );
}

function validateForm(form: CheckoutFormState, itemCount: number) {
  const errors: Record<string, string> = {};

  if (itemCount === 0) errors.cart = "Tu carrito está vacío.";
  if (!form.firstName.trim()) errors.firstName = "Escribe tu nombre.";
  if (!form.lastName.trim()) errors.lastName = "Escribe tus apellidos.";
  if (!isValidPhone(form.phone)) errors.phone = "Escribe un teléfono válido.";
  if (!isValidEmail(form.email)) errors.email = "Escribe un email válido.";
  if (!form.street.trim()) errors.street = "Escribe la calle.";
  if (!form.exteriorNumber.trim()) errors.exteriorNumber = "Escribe el número exterior.";
  if (!form.neighborhood.trim()) errors.neighborhood = "Escribe la colonia.";
  if (!form.postalCode.trim()) errors.postalCode = "Escribe el código postal.";
  if (!form.city.trim()) errors.city = "Escribe la ciudad.";
  if (!form.state.trim()) errors.state = "Escribe el estado.";
  if (!form.termsAccepted) errors.termsAccepted = "Debes aceptar términos y aviso de privacidad.";

  return errors;
}
