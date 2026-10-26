import TokensTabContent from "./_component/tokens-tab-content/table";
import CredentialsTabContent from "./_component/credentials-tab-content/table";
import IntegrationConnectionOverview from "./_component/overview/card";
import IntegrationConnectionDetailStats from "./_component/stats";
import IntegrationConnectionDetailHeader from "./_component/header";
import IntegrationConnectionDetailMetadata from "./_component/metadata";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { getIntegrationConnectionAction } from "@/features/integration-connection/integration-connection.action";
import { BookKey, BookLock, CalendarCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function IntegrationConnectionDetail({
  params,
}: {
  params: Promise<{ connectionId: string }>;
}) {
  const { connectionId: id } = await params;

  const connection = await getIntegrationConnectionAction({ id });

  if (!connection.data) {
    notFound();
  }

  return (
    <div className="overflow-y-auto relative flex flex-col gap-2 p-2">
      <IntegrationConnectionDetailHeader />
      <IntegrationConnectionOverview id={id} />
      <IntegrationConnectionDetailStats id={id} />
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_300px] items-start">
        <Card className="min-w-0">
          <CardContent>
            <Tabs defaultValue="tokens">
              <TabsList className="w-full" variant={"line"}>
                <TabsTrigger value="tokens" className="gap-2">
                  <BookLock className="h-4 w-4" />
                  Tokens
                </TabsTrigger>
                <TabsTrigger value="credentials" className="gap-2">
                  <BookKey className="h-4 w-4" />
                  Credentials
                </TabsTrigger>
                <TabsTrigger value="events" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Inbound Events
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tokens">
                <TokensTabContent id={id} />
              </TabsContent>
              <TabsContent value="credentials">
                <CredentialsTabContent id={id} />
              </TabsContent>
              <TabsContent value="events">
                <div className="text-muted-foreground text-sm text-center mt-1.5">
                  Feature coming soon. Please check back later.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <IntegrationConnectionDetailMetadata id={id} />
      </div>
    </div>
  );
}
