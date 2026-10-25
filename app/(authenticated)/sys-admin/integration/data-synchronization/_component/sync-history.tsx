import SyncHistoryList from "./sync-history-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SyncHistory() {
  return (
    <Card className="gap-2.5">
      <CardHeader>
        <CardTitle>
          <h2>Sync History</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SyncHistoryList />
      </CardContent>
    </Card>
  );
}
