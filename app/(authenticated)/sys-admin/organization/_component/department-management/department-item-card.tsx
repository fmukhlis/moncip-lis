"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Department } from "@/features/department/department.type";
import { FlaskConical, MoreHorizontal, Pencil, Power } from "lucide-react";
import {
  Card,
  CardTitle,
  CardFooter,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function DepartmentItemCard({
  onEdit,
  department,
  onOpenMenu,
  onToggleActive,
}: {
  onEdit: () => void;
  department: Department;
  onOpenMenu?: () => void;
  onToggleActive: () => Promise<void>;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToggleActiveLoading, setIsToggleActiveLoading] = useState(false);

  const toggleActiveIcon = isToggleActiveLoading ? (
    <Spinner className="size-3.5" />
  ) : (
    <Power className="size-3.5" />
  );

  const toggleActiveText = department.isActive
    ? isToggleActiveLoading
      ? "Deactivating..."
      : "Deactivate"
    : isToggleActiveLoading
      ? "Activating..."
      : "Activate";

  return (
    <Card
      className="border-t-4 rounded-md py-3"
      style={{ borderTopColor: department.color }}
    >
      <CardHeader className="gap-1 px-3">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="inline-block size-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: department.color }}
            />
            <span className="font-mono text-xs text-muted-foreground font-bold tracking-widest truncate">
              {department.code}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <Badge
              variant="outline"
              className={
                department.isActive
                  ? "bg-info/15 text-info border-info/30"
                  : "bg-warning/15 text-warning border-warning/30"
              }
            >
              {department.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu
              open={isMenuOpen}
              onOpenChange={(open) => {
                onOpenMenu?.();
                setIsMenuOpen(open);
              }}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="outline"
                  className="size-6 rounded-full"
                >
                  <MoreHorizontal className="size-3.5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() => {
                    onEdit();
                  }}
                >
                  <Pencil className="size-3.5" />
                  Edit department
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant={department.isActive ? "destructive" : "default"}
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsToggleActiveLoading(true);
                    await onToggleActive();
                    setIsToggleActiveLoading(false);
                    setIsMenuOpen(false);
                  }}
                >
                  {toggleActiveIcon}
                  {toggleActiveText}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <CardTitle className="text-sm">{department.displayName}</CardTitle>
        <CardDescription className="text-xs">
          {department.description ?? "No description provided."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between mt-auto">
        <div className="flex items-center gap-2 min-w-0 text-muted-foreground">
          <FlaskConical className="size-3 shrink-0" />
          <span className="text-xs truncate">
            {department._count.performables}{" "}
            {department._count.performables === 1
              ? "performable"
              : "performables"}
          </span>
        </div>
        <Badge
          className="font-mono"
          variant={"secondary"}
          style={{ color: department.color }}
        >
          {department.color.toUpperCase()}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export function DepartmentItemCardSkeleton() {
  return (
    <Card className="border-t-4 rounded-md py-3">
      <CardHeader className="gap-1 px-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="size-4" />
            <Skeleton className="h-6 w-3/5" />
          </div>
          <div className="flex gap-2 justify-end items-center flex-1">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="size-6" />
          </div>
        </div>
        <CardTitle>
          <Skeleton className="h-5 w-3/5" />
        </CardTitle>
        <CardDescription className="flex flex-col gap-1">
          <Skeleton className="h-4 w-4/5" />
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-between">
        <div className="flex items-center gap-2 min-w-0 text-muted-foreground flex-1">
          <FlaskConical className="size-3 shrink-0 opacity-50" />
          <Skeleton className="h-4 w-3/5" />
        </div>
        <Skeleton className="h-4 w-1/5" />
      </CardFooter>
    </Card>
  );
}
