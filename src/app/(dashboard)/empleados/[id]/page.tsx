interface EmpleadoDetallePageProps {
  params: { id: string };
}

// TODO: cargar empleado vía getEmployee(params.id) y permitir edición + cambio de estado.
export default function EmpleadoDetallePage({ params }: EmpleadoDetallePageProps) {
  return (
    <div>
      <h1 className="text-lg font-semibold">Empleado {params.id}</h1>
    </div>
  );
}
