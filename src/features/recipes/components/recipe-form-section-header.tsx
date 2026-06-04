import { Button } from '../../../components/ui/button';

type RecipeFormSectionHeaderProps = {
  actionLabel: string;
  onAction: () => void;
  title: string;
};

export function RecipeFormSectionHeader({
  actionLabel,
  onAction,
  title,
}: RecipeFormSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-semibold text-2xl">{title}</h2>
      <Button
        className="text-primary hover:border-primary"
        onClick={onAction}
        size="sm"
        type="button"
        variant="secondary"
      >
        {actionLabel}
      </Button>
    </div>
  );
}
