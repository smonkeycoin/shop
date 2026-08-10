import Link from "next/link";

export function Logo() {
  return (
    <Link className="brand-lockup" href="/" aria-label="Shop NeumoPractice inicio">
      <span className="brand-icon" aria-hidden="true">
        <span className="lungs-mark">
          <span />
          <span />
        </span>
      </span>
      <span className="brand-text">
        <span className="brand-kicker">shop.</span>
        <span className="brand-name">neumopractice</span>
      </span>
    </Link>
  );
}
