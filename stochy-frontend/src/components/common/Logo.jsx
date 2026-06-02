export default function Logo({ size = 36, alt = 'STOCHY' }) {
  // Prefer a deployment-provided logo at /logo.png; fallback to inline SVG
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      onError={(e) => {
        // If /logo.png not found, replace the image with an inline SVG
        const img = e.currentTarget;
        img.style.display = 'none';
        const span = document.createElement('span');
        span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <rect x=\"2\" y=\"10\" width=\"56\" height=\"40\" rx=\"6\" fill=\"#1A73E8\" />
          <path d=\"M16 28c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12S16 34.627 16 28z\" fill=\"#fff\"/>
          <path d=\"M34 20c-0.667 0-1.333 0.333-2 0.667-2 1.333-6 2.333-8 4-1 1-1 2.333 0 3.333 1.333 1.333 4 1.333 6 1.333 1.333 0 4-0.667 5.333-2 1-1 1.333-2.333 1.333-3.667 0-1.333-0.667-3-2-3.667-0.333-0.333-0.667-0.667-0.667-0.667z\" fill=\"#1A73E8\"/>
        </svg>`;
        img.parentNode?.insertBefore(span, img.nextSibling);
      }}
    />
  );
}
