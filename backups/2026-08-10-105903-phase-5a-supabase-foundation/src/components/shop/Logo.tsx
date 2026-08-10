import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link className="brand-lockup" href="/" aria-label="Shop NeumoPractice">
      <span className="brand-icon" aria-hidden="true">
        <Image className="brand-mark-image" src="/brand/shop-neumopractice-mark.svg" alt="" width={44} height={44} priority />
      </span>
      <span className="brand-text">
        <span className="brand-kicker">shop.</span>
        <span className="brand-name">neumopractice</span>
      </span>
    </Link>
  );
}
