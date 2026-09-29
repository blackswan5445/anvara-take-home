'use client';

import { useId, useState, type ReactNode } from 'react';

interface DialogButtonProps {
  label: ReactNode;
  title: string;
  className?: string;
  /** Rendered fresh on every open, so form state never leaks between openings. */
  children: (close: () => void) => ReactNode;
}

/** A button that opens a native <dialog> (focus trap, Esc to close, top layer for free). */
export function DialogButton({
  label,
  title,
  className = 'btn-primary',
  children,
}: DialogButtonProps) {
  // Callback ref into state (not useRef) so `close` can be handed to children during render
  const [dialog, setDialog] = useState<HTMLDialogElement | null>(null);
  const [openCount, setOpenCount] = useState(0);
  const titleId = useId();

  const open = () => {
    setOpenCount((count) => count + 1);
    dialog?.showModal();
  };
  const close = () => dialog?.close();

  return (
    <>
      <button type="button" className={className} onClick={open}>
        {label}
      </button>
      <dialog
        ref={setDialog}
        aria-labelledby={titleId}
        // Click on the backdrop (the dialog element itself, outside the panel) closes it
        onClick={(event) => event.target === event.currentTarget && close()}
        className="m-0 mt-auto w-full max-w-none rounded-t-2xl bg-background p-0 text-left text-foreground shadow-2xl backdrop:bg-slate-950/60 sm:m-auto sm:max-w-lg sm:rounded-2xl"
      >
        <div className="max-h-[85dvh] overflow-y-auto p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-2 flex size-11 items-center justify-center rounded-lg text-2xl leading-none text-muted hover:bg-surface"
            >
              ×
            </button>
          </div>
          {openCount > 0 && <div key={openCount}>{children(close)}</div>}
        </div>
      </dialog>
    </>
  );
}
