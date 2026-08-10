import Link from "next/link";

export function AdminPageHeader({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="admin-topbar">
      <div>
        {eyebrow ? <p className="admin-breadcrumb">{eyebrow}</p> : null}
        <h1>{title}</h1>
      </div>
      {children ? <div className="admin-topbar-actions">{children}</div> : null}
    </header>
  );
}

export function AdminStat({ label, value, tone }: { label: string; value: string | number; tone?: "warning" | "success" }) {
  return (
    <article className={`admin-kpi-card ${tone ? `tone-${tone}` : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function EmptyState({ title, text, href, action }: { title: string; text: string; href?: string; action?: string }) {
  return (
    <div className="admin-empty-state">
      <strong>{title}</strong>
      <span>{text}</span>
      {href && action ? (
        <Link className="admin-primary-button" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  return <span className={`admin-badge tone-${tone}`}>{children}</span>;
}
