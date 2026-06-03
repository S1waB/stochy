export default function LoadingSpinner({ size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-10 w-10', lg: 'h-16 w-16' };
  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-4 border-[var(--surface-border)] border-t-accent ${sizes[size]}`}></div>
    </div>
  );
}
