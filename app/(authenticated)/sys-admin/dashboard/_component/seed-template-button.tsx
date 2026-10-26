"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useCreateUserActionMutation } from "@/features/user/user.api";
import { useCreateDepartmentActionMutation } from "@/features/department/department.api";
import { useCreateIntegrationTokenActionMutation } from "@/features/integration-token/integration-token.api";
import { useCreateIntegrationConnectionActionMutation } from "@/features/integration-connection/integration-connection.api";
import { useCreateIntegrationCredentialActionMutation } from "@/features/integration-credential/integration-credential.api";

export default function SeedTemplateButton() {
  // Server state
  const [createUserAction] = useCreateUserActionMutation();
  const [createDepartmentAction] = useCreateDepartmentActionMutation();
  const [createIntegrationConnection] =
    useCreateIntegrationConnectionActionMutation();
  const [createIntegrationTokenAction] =
    useCreateIntegrationTokenActionMutation();
  const [createIntegrationCredentialAction] =
    useCreateIntegrationCredentialActionMutation();

  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    try {
      setLoading(true);

      const integrationConnection = await createIntegrationConnection({
        name: "Moncip HIS",
        type: "BEARER_TOKEN",
        baseUrl: "http://moncip-his:3000",
        isActive: true,
        sourceSystem: "MONCIP_HIS",
      }).unwrap();
      toast.success(`Connection "${integrationConnection.data.name}" created`);

      const integrationToken = await createIntegrationTokenAction({
        name: "Lab Order",
        connectionId: integrationConnection.data.id,
      }).unwrap();
      console.log(integrationToken.data.plaintext);
      toast.success(
        `Token "${integrationToken.data.integrationToken.name}" created`,
      );

      const integrationCredential = await createIntegrationCredentialAction({
        name: "Catalogue Sync",
        secret: "12345678",
        connectionId: integrationConnection.data.id,
      }).unwrap();
      toast.success(`Credential "${integrationCredential.data.name}" created`);

      const departmentData = await createDepartmentAction({
        code: "MAIN",
        color: "#0000ff",
        isActive: true,
        description: "",
        displayName: "Main Lab",
      }).unwrap();
      toast.success(`Department "${departmentData.data.displayName}" created`);

      const userData = await createUserAction({
        name: "Awan Gemes",
        role: "STAFF",
        password: "12345678",
        username: "wgms",
        departmentId: departmentData.data.id,
      }).unwrap();
      toast.success(`User "${userData?.data?.name}" created`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={handleSimulate}>
      {loading ? (
        <>
          <Spinner /> Loading...
        </>
      ) : (
        <>Seed Template !</>
      )}
    </Button>
  );
}
