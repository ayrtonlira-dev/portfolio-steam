const commonProps = {
  "aria-hidden": "true",
  focusable: "false",
};

export function PinIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" {...commonProps}>
      <path d="M8 14s5-4.35 5-8A5 5 0 0 0 3 6c0 3.65 5 8 5 8Z" />
      <circle cx="8" cy="6" r="1.8" />
    </svg>
  );
}

export function DownloadIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" {...commonProps}>
      <path d="M8 2v8m0 0 3-3M8 10 5 7M3 13h10" />
    </svg>
  );
}

export function ExternalArrowIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="M4 14 14 4M6 4h8v8" />
    </svg>
  );
}

export function ChevronLeftIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m11 4-5 5 5 5" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m7 4 5 5-5 5" />
    </svg>
  );
}

export function CloseIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m4 4 10 10M14 4 4 14" />
    </svg>
  );
}

export function ExpandIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="M7 3H3v4M11 15h4v-4M3 3l5 5m7 7-5-5" />
    </svg>
  );
}

export function GalleryIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <rect x="2.5" y="3.5" width="13" height="11" rx="1" />
      <path d="m3 4 6 5 6-5" />
    </svg>
  );
}

export function LockIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <rect x="4" y="8" width="10" height="7" rx="1" />
      <path d="M6.5 8V6.5a2.5 2.5 0 0 1 5 0V8" />
    </svg>
  );
}

export function MailIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <rect x="2.5" y="4" width="13" height="10" rx="1" />
      <path d="m3 4.7 6 4.7 6-4.7" />
    </svg>
  );
}

export function GitHubIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path
        d="M9 1.7a7.4 7.4 0 0 0-2.3 14.4c.4.1.5-.1.5-.3v-1.2c-2 .5-2.5-.8-2.5-.8-.3-.9-.8-1.1-.8-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.9 2.2.7.1-.5.3-.9.5-1.1-1.6-.2-3.3-.8-3.3-3.6 0-.8.3-1.5.8-2-.1-.2-.3-.9.1-1.9 0 0 .6-.2 2 .8a7 7 0 0 1 3.7 0c1.4-1 2-.8 2-.8.4 1 .2 1.7.1 1.9.5.5.8 1.2.8 2 0 2.8-1.7 3.3-3.3 3.5.3.2.5.7.5 1.5v2.2c0 .2.1.4.5.3A7.4 7.4 0 0 0 9 1.7Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <rect x="2.5" y="2.5" width="13" height="13" rx="1" />
      <path d="M5.4 7.6v5.1M5.4 5.7v.1M8.5 12.7V7.6M8.5 9.4c.3-.9 1-1.3 1.8-1.3 1.2 0 1.8.8 1.8 2.2v2.4" />
    </svg>
  );
}

export function CodeGlyphIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m6.6 5-4 4 4 4M11.4 5l4 4-4 4" />
    </svg>
  );
}

export function ReactTechIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...commonProps}>
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9.2" ry="3.7" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="9.2"
        ry="3.7"
        transform="rotate(-60 12 12)"
      />
    </svg>
  );
}

export function ViteTechIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m2 3 7 13 7-13-7 2Z" />
      <path className="icon-cut" d="m6.5 7.5 2.2 4.2L11 7.4 8.8 7Z" />
    </svg>
  );
}

export function ApiTechIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <circle cx="4" cy="4" r="2" />
      <circle cx="14" cy="9" r="2" />
      <circle cx="4" cy="14" r="2" />
      <path d="m6 4 6 4.5M6 14l6-4.5" />
    </svg>
  );
}

export function GitTechIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <circle cx="5" cy="4" r="1.7" />
      <circle cx="5" cy="14" r="1.7" />
      <circle cx="13" cy="7" r="1.7" />
      <path d="M5 5.7v6.6M13 8.7v.5c0 2.1-2.3 2.7-4.2 2.9" />
    </svg>
  );
}

export function MotionWavesIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="M2 11c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.4-4" />
      <path d="M2 15c2.4 0 2.4-4 4.8-4s2.4 4 4.8 4 2.4-4 4.4-4" />
    </svg>
  );
}

export function CheckIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="m3.5 9.5 3.4 3.4 7.6-8" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 18 18" {...commonProps}>
      <path d="M3 9h11m-4-4 4 4-4 4" />
    </svg>
  );
}

export function TechGlyph({ icon }) {
  if (icon === "react") return <ReactTechIcon />;
  if (icon === "vite") return <ViteTechIcon />;
  if (icon === "api") return <ApiTechIcon />;
  if (icon === "git") return <GitTechIcon />;
  if (icon === "javascript") {
    return (
      <span className="tech-js" aria-hidden="true">
        JS
      </span>
    );
  }
  return (
    <span className="tech-code" aria-hidden="true">
      &lt;/&gt;
    </span>
  );
}
