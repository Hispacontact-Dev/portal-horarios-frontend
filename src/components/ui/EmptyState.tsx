interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
      {message}
    </div>
  );
}
