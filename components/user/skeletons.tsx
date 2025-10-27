import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  X,
  ArrowDownUp,
  ArrowBigLeft,
  ArrowBigRight,
  EllipsisVertical,
} from "lucide-react";
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "../ui/table";

export default function LabMemberSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Create, update, and remove user accounts. Control roles and manage
          system access for all team members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center pb-5 gap-3">
          <Input placeholder="Search user's name..." className="" disabled />
          <Button size={"icon"} variant={"outline"} disabled>
            <X />
          </Button>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow className="pointer-events-none">
                <TableHead className="font-semibold">
                  <div className="pl-1.5 w-52 opacity-50">Name</div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="w-24 opacity-50">Role</div>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button size={"icon-sm"} variant={"ghost"} disabled>
                    <ArrowDownUp className="size-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-background">
              {Array.from({ length: 5 }, (_, i) => (
                <TableRow key={`${i}`} className="pointer-events-none">
                  <TableCell>
                    <Skeleton className="ml-1.5 h-5 w-[186px] rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" disabled className="size-8 flex">
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center pt-5 gap-3">
          <Button
            variant="default"
            type="button"
            className="font-semibold"
            disabled
          >
            Add New User
          </Button>
          <Button variant={"secondary"} className="w-[90px] ml-auto" disabled>
            <ArrowBigLeft />
            Prev
          </Button>
          <Button variant={"secondary"} className="w-[90px] -auto" disabled>
            Next
            <ArrowBigRight />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
