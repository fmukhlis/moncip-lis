import ConnectionsCount from "./_component/connections-count";
import TokensTabContent from "./_component/tokens-tab-content";
import ConnectionsTabContent from "./_component/connections-tab-content";
import CredentialsTabContent from "./_component/credentials-tab-content";
import ConnectionSettingsHeader from "./_component/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  Info,
  Cable,
  BookKey,
  BookLock,
  FileClock,
  TriangleAlert,
} from "lucide-react";

export default function ConnectionSettings() {
  return (
    <div className="relative flex flex-col gap-2 p-2">
      <ConnectionSettingsHeader />
      <ConnectionsCount />
      <Tabs defaultValue="connections" className="gap-2">
        <TabsList className="w-full">
          <TabsTrigger value="connections">
            <Cable />
            Connections
          </TabsTrigger>
          <TabsTrigger value="tokens">
            <BookLock />
            Tokens
          </TabsTrigger>
          <TabsTrigger value="credentials">
            <BookKey />
            Credentials
          </TabsTrigger>
          <TabsTrigger value="events">
            <FileClock />
            Events
          </TabsTrigger>
        </TabsList>
        <TabsContent value="connections">
          <ConnectionsTabContent />
        </TabsContent>
        <TabsContent value="tokens">
          <TokensTabContent />
        </TabsContent>
        <TabsContent value="credentials">
          <CredentialsTabContent />
        </TabsContent>
        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Integration Events</CardTitle>
              <CardDescription>
                Recent inbound integration activities and synchronization logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Item variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <Info />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Catalog synchronization completed</ItemTitle>
                    <ItemDescription>
                      24 orderables were synchronized successfully from HIS Mini
                      Production.
                    </ItemDescription>
                  </ItemContent>
                  <ItemContent className="flex-none text-center">
                    <ItemDescription>17.55</ItemDescription>
                  </ItemContent>
                </Item>
                <Item variant="outline" size="sm">
                  <ItemMedia variant="icon">
                    <TriangleAlert />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>Validation warning</ItemTitle>
                    <ItemDescription>
                      One external orderable was skipped because of an invalid
                      category code.
                    </ItemDescription>
                  </ItemContent>
                  <ItemContent className="flex-none text-center">
                    <ItemDescription>17.55</ItemDescription>
                  </ItemContent>
                </Item>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
