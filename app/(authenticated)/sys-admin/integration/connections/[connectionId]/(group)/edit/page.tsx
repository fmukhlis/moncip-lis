import EditIntegrationConnectionHeader from "./_component/header";
import { EditIntegrationConnectionForm } from "./_component/form";

export default async function EditIntegrationConnection({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId: id } = await params;

  return (
    <div className="overflow-y-auto relative flex flex-col gap-2 p-2">
      <EditIntegrationConnectionHeader id={id} />
      <EditIntegrationConnectionForm id={id} />
    </div>
  );
}
