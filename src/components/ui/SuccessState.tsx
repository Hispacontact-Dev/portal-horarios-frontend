interface SuccessStateProps {
  message: string;
}

export function SuccessState({ message }: SuccessStateProps) {
  return (
    <div role="status" className="rounded border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
      <p>{message}</p>
    </div>
  );
}
