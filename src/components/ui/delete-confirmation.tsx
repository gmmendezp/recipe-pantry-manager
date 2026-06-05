import { ConfirmationPanel } from './confirmation-panel';

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
    <ConfirmationPanel
      confirmLabel={confirmLabel}
      description={description}
      isPending={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
      pendingLabel="Deleting..."
      title={title}
      tone="danger"
    />
  );
}
