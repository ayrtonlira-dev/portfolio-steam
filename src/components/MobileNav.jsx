import { navigationItems } from "../navigation";

export default function MobileNav({ activeSection }) {
  return (
    <nav className="mobile-nav mobile-only" aria-label="Seções do perfil">
      {navigationItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeSection === item.id ? "location" : undefined}
        >
          {item.mobileLabel}
        </a>
      ))}
    </nav>
  );
}
