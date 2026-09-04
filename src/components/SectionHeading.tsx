type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
};

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className = '' }: Props) {
  return (
    <div className={`${align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl text-left'} ${className}`}>
      {eyebrow && (
        <div className={`eyebrow mb-3 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className="h-px w-8 bg-spice-400" />
          {eyebrow}
          <span className="h-px w-8 bg-spice-400" />
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-charcoal-900 text-balance leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-charcoal-600 leading-relaxed text-balance">
          {subtitle}
        </p>
      )}
    </div>
  );
}
