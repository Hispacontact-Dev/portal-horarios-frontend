interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </div>
  );
}
