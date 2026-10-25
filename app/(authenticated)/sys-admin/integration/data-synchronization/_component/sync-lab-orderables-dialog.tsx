"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Info, Key, RefreshCcw } from "lucide-react";
import { useGetIntegrationCredentialsActionQuery } from "@/features/integration-credential/integration-credential.api";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import {
  Item,
  ItemMedia,
  ItemTitle,
  ItemContent,
  ItemDescription,
} from "@/components/ui/item";
import {
  Combobox,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxContent,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

export default function SyncLabOrderablesDialog({
  onConfirm,
}: {
  onConfirm: (credentialId: string) => Promise<void>;
}) {
  // Server state
  const { data, isFetching, isError } = useGetIntegrationCredentialsActionQuery(
    { status: "ACTIVE" },
  );

  const [selectedCredential, setSelectedCredential] = useState<
    NonNullable<typeof data>["data"][number] | null
  >(null);

  return (
    <Dialog modal={false}>
      <DialogTrigger asChild>
        <Button className="w-full" variant={"outline"}>
          <RefreshCcw />
          Synchronize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Synchronize Lab Orderables?</DialogTitle>
          <DialogDescription>
            Select the integration credential to use for retrieving lab
            orderables from an external system.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="credential" className="mb-0.5">
              Credential
            </FieldLabel>
            <Combobox
              items={data?.data ?? []}
              value={selectedCredential}
              autoHighlight
              onValueChange={(value) => setSelectedCredential(value)}
              itemToStringLabel={(
                credential: NonNullable<typeof data>["data"][number],
              ) => `${credential.name}, Prefix: ${credential.secretPrefix}••••`}
              itemToStringValue={(
                credential: NonNullable<typeof data>["data"][number],
              ) => credential.id}
            >
              <ComboboxInput id="credential" placeholder="Select a credential">
                <InputGroupAddon>
                  <Key />
                </InputGroupAddon>
              </ComboboxInput>
              <ComboboxContent alignOffset={-28} className="w-60">
                <ComboboxEmpty>
                  {isFetching ? (
                    <span className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                      <Spinner />
                      Loading...
                    </span>
                  ) : isError ? (
                    <span className="block py-1 text-sm">
                      Failed to load data. Plase try again.
                    </span>
                  ) : (
                    <span className="block py-1 text-sm text-muted-foreground">
                      The credential could not be found.
                    </span>
                  )}
                </ComboboxEmpty>
                <ComboboxList>
                  {(item: NonNullable<typeof data>["data"][number]) => (
                    <ComboboxItem key={item.id} value={item}>
                      <Item size="xs" className="p-0">
                        <ItemContent className="group-data-[size=xs]/item:gap-1">
                          <ItemTitle className="whitespace-nowrap">
                            {item.name},
                            <span className="text-sm text-muted-foreground">
                              Prefix: {item.secretPrefix}••••
                            </span>
                          </ItemTitle>
                          <ItemDescription>
                            Conn.{" "}
                            <span className="font-semibold">
                              {item.connection.name}
                            </span>
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <FieldDescription>
              Only usable credentials are listed.
            </FieldDescription>
          </Field>
        </FieldGroup>
        <Item
          className="gap-2 bg-info/15 border-info/30 text-info mt-2"
          variant={"outline"}
        >
          <ItemMedia variant={"icon"} className="!translate-y-0.5 self-start">
            <Info strokeWidth={1.5} />
          </ItemMedia>
          <ItemContent>
            <ItemTitle className="text-start text-xs">
              Existing orderables will be updated based on the latest data
              received. New orderables may be added, while orderables that no
              longer exist in the external system will not be removed
              automatically.
            </ItemTitle>
          </ItemContent>
        </Item>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={"outline"}>
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={() => {
                onConfirm(selectedCredential?.id ?? "");
              }}
              disabled={false}
            >
              Sync Now
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
