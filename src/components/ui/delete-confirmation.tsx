import { Button } from './button';

type DeleteConfirmationProps = {
  confirmLabel: string;
  description: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
};

export function DeleteConfirmation({
  confirmLabel,
  description,
  isDeleting,
  onCancel,
  onConfirm,
  title,
}: DeleteConfirmationProps) {
  return (
    <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
      <h2 className="font-semibold text-xl">{title}</h2>
      <p className="mt-2 text-red-800 text-sm">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          className="border-red-300 text-red-900 hover:border-red-900 disabled:opacity-60"
          disabled={isDeleting}
          onClick={onCancel}
          size="sm"
          type="button"
          variant="secondary"
        >
          Cancel
        </Button>
        <Button
          disabled={isDeleting}
          onClick={() => void onConfirm()}
          size="sm"
          type="button"
          variant="danger"
        >
          {isDeleting ? 'Deleting...' : confirmLabel}
        </Button>
      </div>
    </section>
  );
}
