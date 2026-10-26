import NewIntegrationConnectionHeader from "./_component/header";
import { NewIntegrationConnectionForm } from "./_component/form";

export default function NewIntegrationConnection() {
  return (
    <div className="overflow-y-auto relative flex flex-col gap-2 p-2">
      <NewIntegrationConnectionHeader />
      <NewIntegrationConnectionForm formId="form-new-integration-connection" />
    </div>
  );
}
