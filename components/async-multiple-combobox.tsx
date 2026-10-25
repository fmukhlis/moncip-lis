"use client";

import React from "react";
import { Spinner } from "./ui/spinner";
import { FieldLabel } from "./ui/field";
import { useDebouncedCallback } from "use-debounce";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxChip,
  ComboboxList,
  ComboboxItem,
  ComboboxChips,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxValue,
  ComboboxContent,
  useComboboxAnchor,
  ComboboxChipsInput,
  ComboboxCollection,
} from "./ui/combobox";

type BaseItem = {
  id: string;
  type: string;
  label: string;
};

type BaseGroup = {
  items: BaseItem[];
  groupLabel: string;
};

export type AsyncMultipleGroupedComboboxProps<T extends BaseGroup> = {
  label: string;
  value?: T["items"];
  onChange?: (values: T["items"]) => void;
  renderChip?: (item: T["items"][number]) => React.ReactNode;
  renderItem?: (item: T["items"][number]) => React.ReactNode;
  placeholder?: string;
  debounceWait?: number;
  errorMessage?: string;
  getItemsAsyncFn: (searchVal: string) => Promise<T[]>;
  selectedItemGroupConfig?: {
    type: string;
    groupLabel: string;
  }[];
};

export function AsyncMultipleGroupedCombobox<T extends BaseGroup>({
  value,
  label,
  onChange,
  renderChip = ({ label }) => <div>{label}</div>,
  renderItem = ({ label }) => <div>{label}</div>,
  placeholder = "",
  debounceWait = 1000,
  errorMessage,
  getItemsAsyncFn,
  selectedItemGroupConfig,
}: AsyncMultipleGroupedComboboxProps<T>) {
  // Generate unique id for accessibility (label - input)
  const id = React.useId();

  const anchor = useComboboxAnchor(); // Needed for multiple select

  const [showLoading, setShowLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<T[]>([]);
  const [blockStartStatus, setBlockStartStatus] = React.useState(false);
  const [internalSelectedValues, setInternalSelectedValues] = React.useState<
    T["items"]
  >([]);

  // This is used to switch from uncontrolled component to controlled component
  const isControlled = value !== undefined;
  const selectedValues = isControlled ? value : internalSelectedValues;

  // Derrived variable
  const trimmedSearchValue = searchValue.trim();

  const debouncedGetItems = useDebouncedCallback(async (searchVal: string) => {
    const res = await getItemsAsyncFn(searchVal);
    setSearchResults(res);
    setShowLoading(false);
  }, debounceWait);

  const items = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return searchResults;
    }

    const selectedIds = new Set<string>();
    const selectedGroups: T[] = [];
    const selectedValuesByType = new Map<string, T["items"]>();

    for (const item of selectedValues) {
      selectedIds.add(item.id);
      if (!selectedValuesByType.has(item.type)) {
        selectedValuesByType.set(item.type, []);
      }
      selectedValuesByType.get(item.type)!.push(item);
    }

    if (selectedItemGroupConfig && selectedItemGroupConfig.length > 0) {
      for (const { type, groupLabel } of selectedItemGroupConfig) {
        const items = selectedValuesByType.get(type);
        if (items && items.length > 0) {
          selectedGroups.push({
            items,
            groupLabel,
          } as T);
        }
      }
    } else {
      for (const [type, items] of selectedValuesByType) {
        selectedGroups.push({
          groupLabel: `Selected ${type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}s`,
          items,
        } as T);
      }
    }

    const filteredResults = searchResults.map(
      ({ items, groupLabel }) =>
        ({
          items: items.filter(({ id }) => !selectedIds.has(id)),
          groupLabel,
        }) as T,
    );

    return [...selectedGroups, ...filteredResults];
  }, [searchResults, selectedValues, selectedItemGroupConfig]);

  function getStatus() {
    if (showLoading) {
      return (
        <div className="flex items-center gap-2">
          <Spinner className="size-5 mt-px" />
          Searching...
        </div>
      );
    }

    if (errorMessage) {
      return <React.Fragment>{errorMessage}</React.Fragment>;
    }

    if (
      !blockStartStatus &&
      trimmedSearchValue === "" &&
      selectedValues.length === 0
    ) {
      return <React.Fragment>Start typing to search item...</React.Fragment>;
    }

    if (
      !blockStartStatus &&
      searchResults.length === 0 &&
      trimmedSearchValue !== ""
    ) {
      return (
        <React.Fragment>{`No matches for "${trimmedSearchValue}".`}</React.Fragment>
      );
    }

    return null;
  }

  function getEmptyMessage() {
    if (
      showLoading ||
      errorMessage ||
      searchResults.length > 0 ||
      trimmedSearchValue === ""
    ) {
      return null;
    }

    return <React.Fragment>Try a different search term.</React.Fragment>;
  }

  React.useEffect(() => {
    return () => {
      debouncedGetItems.cancel();
    };
  }, [debouncedGetItems]);

  return (
    <>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox<T["items"][number], true>
        value={selectedValues}
        items={items}
        filter={null}
        multiple
        autoHighlight
        onValueChange={(nextSelectedValues) => {
          if (!isControlled) {
            setInternalSelectedValues(nextSelectedValues);
          }
          onChange?.(nextSelectedValues);
          setSearchValue("");

          if (nextSelectedValues.length === 0) {
            setSearchResults([]);
            setBlockStartStatus(false);
          } else {
            setBlockStartStatus(true);
          }
        }}
        onInputValueChange={(nextSearchValue, { reason }) => {
          setShowLoading(true);
          setSearchValue(nextSearchValue);

          if (nextSearchValue.trim() === "") {
            setShowLoading(false);
            setSearchResults([]);
            debouncedGetItems.cancel();
            setBlockStartStatus(false);
            return;
          }

          if (reason === "item-press") {
            return;
          }

          debouncedGetItems(nextSearchValue);
        }}
        isItemEqualToValue={(itemValue, selectedValue) =>
          itemValue.id === selectedValue.id
        }
        onOpenChangeComplete={(open) => {
          if (!open) {
            setBlockStartStatus(false);
          }
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(items: T["items"]) => (
              <React.Fragment>
                {items.map((item) => (
                  <ComboboxChip key={item.id} aria-label={item.label}>
                    {renderChip(item)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={items.length > 0 ? "" : placeholder}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxPrimitive.Status className="flex justify-center items-center gap-2 px-3 pt-1.5 pb-2 [:empty]:hidden border-b">
            {getStatus()}
          </ComboboxPrimitive.Status>
          <ComboboxEmpty className={"[:empty]:hidden pt-1.5 pb-2"}>
            {getEmptyMessage()}
          </ComboboxEmpty>
          <ComboboxList>
            {({ groupLabel, items }: T) => (
              <ComboboxGroup key={groupLabel} items={items}>
                <ComboboxLabel>{groupLabel}</ComboboxLabel>
                <ComboboxCollection>
                  {(item: T["items"][number]) => (
                    <ComboboxItem key={item.id} value={item}>
                      {renderItem(item)}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}

export type AsyncMultipleComboboxProps<T extends Omit<BaseItem, "type">> = {
  label: string;
  value?: T[];
  onChange?: (values: T[]) => void;
  renderChip?: (item: T) => React.ReactNode;
  renderItem?: (item: T) => React.ReactNode;
  placeholder?: string;
  debounceWait?: number;
  errorMessage?: string;
  getItemsAsyncFn: (searchVal: string) => Promise<T[]>;
};

export function AsyncMultipleCombobox<T extends Omit<BaseItem, "type">>({
  value,
  label,
  onChange,
  renderChip = ({ label }) => <div>{label}</div>,
  renderItem = ({ label }) => <div>{label}</div>,
  placeholder = "",
  debounceWait = 1000,
  errorMessage,
  getItemsAsyncFn,
}: AsyncMultipleComboboxProps<T>) {
  // Generate unique id for accessibility (label - input)
  const id = React.useId();

  const anchor = useComboboxAnchor(); // Needed for multiple select

  const [showLoading, setShowLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<T[]>([]);
  const [blockStartStatus, setBlockStartStatus] = React.useState(false);
  const [internalSelectedValues, setInternalSelectedValues] = React.useState<
    T[]
  >([]);

  // This is used to switch from uncontrolled component to controlled component
  const isControlled = value !== undefined;
  const selectedValues = isControlled ? value : internalSelectedValues;

  // Derrived variable
  const trimmedSearchValue = searchValue.trim();

  const debouncedGetItems = useDebouncedCallback(async (searchVal: string) => {
    const res = await getItemsAsyncFn(searchVal);
    setSearchResults(res);
    setShowLoading(false);
  }, debounceWait);

  const items = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return searchResults;
    }

    const selectedIds = new Set<string>();
    const selectedItems: T[] = [];

    for (const item of selectedValues) {
      selectedIds.add(item.id);
      selectedItems.push(item);
    }

    const filteredResults = searchResults.filter(
      ({ id }) => !selectedIds.has(id),
    );

    return [...selectedItems, ...filteredResults];
  }, [searchResults, selectedValues]);

  function getStatus() {
    if (showLoading) {
      return (
        <div className="flex items-center gap-2">
          <Spinner className="size-5 mt-px" />
          Searching...
        </div>
      );
    }

    if (errorMessage) {
      return <React.Fragment>{errorMessage}</React.Fragment>;
    }

    if (
      !blockStartStatus &&
      trimmedSearchValue === "" &&
      selectedValues.length === 0
    ) {
      return <React.Fragment>Start typing to search item...</React.Fragment>;
    }

    if (
      !blockStartStatus &&
      searchResults.length === 0 &&
      trimmedSearchValue !== ""
    ) {
      return (
        <React.Fragment>{`No matches for "${trimmedSearchValue}".`}</React.Fragment>
      );
    }

    return null;
  }

  function getEmptyMessage() {
    if (
      showLoading ||
      errorMessage ||
      searchResults.length > 0 ||
      trimmedSearchValue === ""
    ) {
      return null;
    }

    return <React.Fragment>Try a different search term.</React.Fragment>;
  }

  React.useEffect(() => {
    return () => {
      debouncedGetItems.cancel();
    };
  }, [debouncedGetItems]);

  return (
    <>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox<T, true>
        value={selectedValues}
        items={items}
        filter={null}
        multiple
        autoHighlight
        onValueChange={(nextSelectedValues) => {
          if (!isControlled) {
            setInternalSelectedValues(nextSelectedValues);
          }
          onChange?.(nextSelectedValues);
          setSearchValue("");

          if (nextSelectedValues.length === 0) {
            setSearchResults([]);
            setBlockStartStatus(false);
          } else {
            setBlockStartStatus(true);
          }
        }}
        onInputValueChange={(nextSearchValue, { reason }) => {
          setShowLoading(true);
          setSearchValue(nextSearchValue);

          if (nextSearchValue.trim() === "") {
            setShowLoading(false);
            setSearchResults([]);
            debouncedGetItems.cancel();
            setBlockStartStatus(false);
            return;
          }

          if (reason === "item-press") {
            return;
          }

          debouncedGetItems(nextSearchValue);
        }}
        isItemEqualToValue={(itemValue, selectedValue) =>
          itemValue.id === selectedValue.id
        }
        onOpenChangeComplete={(open) => {
          if (!open) {
            setBlockStartStatus(false);
          }
        }}
      >
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(items: T[]) => (
              <React.Fragment>
                {items.map((item) => (
                  <ComboboxChip key={item.id} aria-label={item.label}>
                    {renderChip(item)}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={items.length > 0 ? "" : placeholder}
                />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxPrimitive.Status className="flex justify-center items-center gap-2 px-3 pt-1.5 pb-2 [:empty]:hidden border-b">
            {getStatus()}
          </ComboboxPrimitive.Status>
          <ComboboxEmpty className={"[:empty]:hidden pt-1.5 pb-2"}>
            {getEmptyMessage()}
          </ComboboxEmpty>
          <ComboboxList>
            {(item: T) => (
              <ComboboxItem key={item.id} value={item}>
                {renderItem(item)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </>
  );
}
