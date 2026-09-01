import { Star } from 'lucide-react';

type Props = {
  value: number;
  size?: number;
  className?: string;
  interactive?: boolean;
  onChange?: (value: number) => void;
};

export default function StarRating({ value, size = 20, className = '', interactive = false, onChange }: Props) {
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`} role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const Tag = interactive ? 'button' : 'span';
        return (
          <Tag
            key={n}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(n) : undefined}
            className={interactive ? 'transition-transform hover:scale-110 active:scale-95 cursor-pointer' : ''}
            aria-label={interactive ? `${n} star${n > 1 ? 's' : ''}` : undefined}
          >
            <Star
              size={size}
              className={filled ? 'fill-marigold-400 text-marigold-400' : 'fill-spice-100 text-spice-200'}
              strokeWidth={1.5}
            />
          </Tag>
        );
      })}
    </div>
  );
}
