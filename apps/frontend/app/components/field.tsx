import { useId, type ReactNode } from 'react';

interface ControlProps {
  id: string;
  name: string;
  'aria-invalid': boolean;
  'aria-describedby'?: string;
}

interface FieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  /** Render the control with the id/aria wiring already applied. */
  children: (props: ControlProps) => ReactNode;
}

export function Field({ label, name, error, hint, className, children }: FieldProps) {
  const id = useId(); // unique even when two forms on a page share field names
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children({
        id,
        name,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy || undefined,
      })}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
      {message}
    </p>
  );
}
