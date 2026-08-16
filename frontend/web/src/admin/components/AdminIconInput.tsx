import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type AdminIconInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  id: string;
  icon: ReactNode;
  className?: string;
  inputClassName?: string;
  trailing?: ReactNode;
};

/** Touch-friendly input with left icon and optional trailing control (e.g. show password). */
export function AdminIconInput({
  id,
  icon,
  className,
  inputClassName,
  trailing,
  ...inputProps
}: AdminIconInputProps) {
  return (
    <div className={cn('relative min-w-0', className)}>
      <span
        className="pointer-events-none absolute left-3 top-1/2 z-[1] flex h-5 w-5 -translate-y-1/2 items-center justify-center text-muted sm:left-3.5"
        aria-hidden
      >
        {icon}
      </span>
      <input
        id={id}
        className={cn(
          'admin-input admin-input-with-icon',
          trailing ? 'admin-input-with-trailing' : null,
          inputClassName,
        )}
        {...inputProps}
      />
      {trailing ? (
        <div className="absolute right-1 top-1/2 z-[1] flex -translate-y-1/2 items-center sm:right-1.5">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

export function AdminPasswordToggle({
  visible,
  onToggle,
  inputId,
}: {
  visible: boolean;
  onToggle: () => void;
  inputId: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="admin-input-toggle"
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
      aria-controls={inputId}
    >
      <span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
      {visible ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
    </button>
  );
}
