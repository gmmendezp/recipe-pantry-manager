import { clsx } from 'clsx';

import { Button } from './button';

type ConfirmationPanelTone = 'danger' | 'neutral';

type ConfirmationPanelProps = {
  cancelLabel?: string;
  confirmLabel: string;
  description: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  pendingLabel: string;
  title: string;
  tone?: ConfirmationPanelTone;
};

const panelClasses: Record<ConfirmationPanelTone, string> = {
  danger: 'border-red-200 bg-red-50 text-red-900',
  neutral: 'border-primary-soft bg-primary-soft/40 text-foreground',
};

const descriptionClasses: Record<ConfirmationPanelTone, string> = {
  danger: 'text-red-800',
  neutral: 'text-muted',
};

const cancelClasses: Partial<Record<ConfirmationPanelTone, string>> = {
  danger:
    'border-red-300 text-red-900 hover:border-red-900 disabled:opacity-60',
};

export function ConfirmationPanel({
  cancelLabel = 'Cancel',
  confirmLabel,
  description,
  isPending,
  onCancel,
  onConfirm,
  pendingLabel,
  title,
  tone = 'neutral',
}: ConfirmationPanelProps) {
  return (
    <section
      className={clsx('rounded-xl border p-5 shadow-sm', panelClasses[tone])}
    >
      <h2 className="font-semibold text-xl">{title}</h2>
      <p className={clsx('mt-2 text-sm', descriptionClasses[tone])}>
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className={cancelClasses[tone]}
          disabled={isPending}
          onClick={onCancel}
          size="sm"
          type="button"
          variant="secondary"
        >
          {cancelLabel}
        </Button>
        <Button
          disabled={isPending}
          onClick={() => void onConfirm()}
          size="sm"
          type="button"
          variant={tone === 'danger' ? 'danger' : 'primary'}
        >
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </section>
  );
}
