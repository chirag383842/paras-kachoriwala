type Props = {
  open: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function StatusBadge({ open, size = 'md', className = '' }: Props) {
  const sizes = {
    sm: 'text-xs px-3 py-1 gap-1.5',
    md: 'text-sm px-4 py-1.5 gap-2',
    lg: 'text-base px-5 py-2 gap-2.5',
  };
  const dotSize = size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-2.5 w-2.5' : 'h-3 w-3';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold tracking-wide ${
        open ? 'bg-leaf-500/10 text-leaf-700' : 'bg-red-500/10 text-red-700'
      } ${sizes[size]} ${className}`}
    >
      <span className={`relative inline-flex ${dotSize}`}>
        <span className={`absolute inline-flex h-full w-full rounded-full ${open ? 'bg-leaf-500' : 'bg-red-500'} opacity-60 animate-ping`} />
        <span className={`relative inline-flex rounded-full ${dotSize} ${open ? 'bg-leaf-500' : 'bg-red-500'}`} />
      </span>
      {open ? 'OPEN NOW' : 'CLOSED'}
    </span>
  );
}
