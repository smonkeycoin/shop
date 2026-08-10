import { AdminPageHeader } from "@/components/admin/AdminUi";
import { saveSettingsAction } from "@/lib/admin/actions";
import { getSettings } from "@/lib/admin/backoffice";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  const value = (key: string, fallback = "") => {
    const setting = settings.find((item) => item.key === key);
    if (setting?.value == null) return fallback;
    return typeof setting.value === "string" || typeof setting.value === "number" || typeof setting.value === "boolean" ? String(setting.value) : fallback;
  };

  return (
    <>
      <AdminPageHeader title="Configuracion" eyebrow="Sistema / Configuracion" />
      <form className="admin-form-panel settings" action={saveSettingsAction}>
        <label>Shop name<input name="shop_name" defaultValue={value("shop_name", "Shop NeumoPractice")} /></label>
        <label>Support email<input name="support_email" type="email" defaultValue={value("support_email", "ventas@neumopractice.com")} /></label>
        <label>Support WhatsApp<input name="support_whatsapp" defaultValue={value("support_whatsapp")} /></label>
        <label>WhatsApp Business number<input name="whatsapp_business_number" defaultValue={value("whatsapp_business_number")} /></label>
        <label>Free shipping threshold<input name="free_shipping_threshold" type="number" step="0.01" defaultValue={value("free_shipping_threshold", "0")} /></label>
        <label>Default shipping cost<input name="default_shipping_cost" type="number" step="0.01" defaultValue={value("default_shipping_cost", "0")} /></label>
        <label>Currency<input name="currency" defaultValue={value("currency", "MXN")} /></label>
        <label>
          Checkout mode
          <select name="checkout_mode" defaultValue={value("checkout_mode", "demo")}>
            <option value="demo">demo</option>
            <option value="stripe">stripe preparado</option>
          </select>
        </label>
        <label><input type="checkbox" name="storefront_enabled" defaultChecked={value("storefront_enabled", "true") === "true"} /> Storefront enabled</label>
        <label><input type="checkbox" name="checkout_enabled" defaultChecked={value("checkout_enabled", "true") === "true"} /> Checkout enabled</label>
        <label><input type="checkbox" name="orders_enabled" defaultChecked={value("orders_enabled", "true") === "true"} /> Orders enabled</label>
        <button className="admin-primary-button" type="submit">Guardar configuracion</button>
      </form>
    </>
  );
}
