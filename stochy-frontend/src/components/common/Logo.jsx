export default function Logo({ size = 36, alt = 'STOCHY' }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
