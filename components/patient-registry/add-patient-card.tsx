import AddPatientManualForm from "./add-patient-manual-form";
import AddPatientAutomaticForm from "./add-patient-automatic-form";

import { NotebookPen, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "../ui/card";

export default function AddPatientCard() {
  return (
    <Card className="w-full relative border shadow rounded-sm py-4">
      <CardHeader className="sm:max-w-[calc(100%-250px)] px-4">
        <CardTitle>Add New Patient</CardTitle>
        <CardDescription>
          Add a patient automatically from the HIS or register a new patient
          manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <Tabs defaultValue="automatic">
          <TabsList className="sm:absolute top-2 right-2 w-full sm:w-[200px]">
            <TabsTrigger value="automatic">
              <Sparkles />
              Automatic
            </TabsTrigger>
            <TabsTrigger value="manual">
              <NotebookPen />
              Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="automatic">
            <AddPatientAutomaticForm />
          </TabsContent>
          <TabsContent value="manual">
            <AddPatientManualForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
