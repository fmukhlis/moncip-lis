"use client";

import React from "react";
import { Spinner } from "./ui/spinner";
import { FieldLabel } from "./ui/field";
import { useDebouncedCallback } from "use-debounce";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxInput,
  ComboboxContent,
  useComboboxAnchor,
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

export type AsyncSingleGroupedComboboxProps<T extends BaseGroup> = {
  label: string;
  value?: T["items"][number] | null;
  inputGroup?: () => React.JSX.Element;
  onChange?: (value: T["items"][number] | null) => void;
  renderItem?: (item: T["items"][number]) => React.ReactNode;
  placeholder?: string;
  debounceWait?: number;
  errorMessage?: string;
  getItemsAsyncFn: (searchVal: string) => Promise<T[]>;
  selectedItemGroupConfig?: {
    type: string;
    groupLabel: string;
  };
} & Pick<
  React.ComponentProps<typeof ComboboxInput>,
  "showTrigger" | "showClear"
>;

export function AsyncSingleGroupedCombobox<T extends BaseGroup>({
  value,
  label,
  onChange,
  showClear,
  inputGroup = () => <></>,
  renderItem = ({ label }) => <div>{label}</div>,
  showTrigger,
  placeholder = "",
  debounceWait = 1000,
  errorMessage,
  getItemsAsyncFn,
  selectedItemGroupConfig,
}: AsyncSingleGroupedComboboxProps<T>) {
  // Generate unique id for accessibility (label - input)
  const id = React.useId();

  const anchor = useComboboxAnchor(); // Needed for multiple select

  const [showLoading, setShowLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<T[]>([]);
  const [internalSelectedValue, setInternalSelectedValue] = React.useState<
    T["items"][number] | null
  >(null);

  // This is used to switch from uncontrolled component to controlled component
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalSelectedValue;

  // Derrived variable
  const trimmedSearchValue = searchValue.trim();

  const debouncedGetItems = useDebouncedCallback(async (searchVal: string) => {
    const res = await getItemsAsyncFn(searchVal);
    setSearchResults(res);
    setShowLoading(false);
  }, debounceWait);

  const items = React.useMemo(() => {
    if (!selectedValue) {
      return searchResults;
    }

    const selectedGroups: T[] = [];

    if (selectedItemGroupConfig) {
      const { groupLabel } = selectedItemGroupConfig;
      selectedGroups.push({
        items: [selectedValue],
        groupLabel,
      } as T);
    } else {
      selectedGroups.push({
        items: [selectedValue],
        groupLabel: `Selected ${selectedValue.type.charAt(0).toUpperCase() + selectedValue.type.slice(1).toLowerCase()}s`,
      } as T);
    }

    const filteredResults = searchResults.map(
      ({ items, groupLabel }) =>
        ({
          items: items.filter(({ id }) => id !== selectedValue.id),
          groupLabel,
        }) as T,
    );

    return [...selectedGroups, ...filteredResults];
  }, [searchResults, selectedValue, selectedItemGroupConfig]);

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

    if (trimmedSearchValue === "") {
      return <React.Fragment>Start typing to search item...</React.Fragment>;
    }

    if (searchResults.length === 0) {
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
      <Combobox<T["items"][number]>
        value={selectedValue}
        items={items}
        filter={null}
        autoHighlight
        onValueChange={(nextSelectedValue) => {
          if (!isControlled) {
            setInternalSelectedValue(nextSelectedValue);
          }
          onChange?.(nextSelectedValue);
          setSearchValue("");

          if (!nextSelectedValue) {
            setSearchResults([]);
          }
        }}
        onInputValueChange={(nextSearchValue, { reason }) => {
          setSearchValue(nextSearchValue);

          if (nextSearchValue.trim() === "") {
            setShowLoading(false);
            setSearchResults([]);
            debouncedGetItems.cancel();
            return;
          }

          if (reason === "item-press") {
            return;
          }

          setShowLoading(true);
          debouncedGetItems(nextSearchValue);
        }}
        isItemEqualToValue={(itemValue, selectedValue) =>
          itemValue.id === selectedValue.id
        }
      >
        <ComboboxInput
          id={id}
          showClear={showClear}
          placeholder={placeholder}
          showTrigger={showTrigger}
        >
          {inputGroup()}
        </ComboboxInput>
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

export type AsyncSingleComboboxProps<T extends Omit<BaseItem, "type">> = {
  label: string;
  value?: T | null;
  onChange?: (value: T | null) => void;
  inputGroup?: () => React.JSX.Element;
  renderItem?: (item: T) => React.ReactNode;
  placeholder?: string;
  debounceWait?: number;
  errorMessage?: string;
  getItemsAsyncFn: (searchVal: string) => Promise<T[]>;
} & Pick<
  React.ComponentProps<typeof ComboboxInput>,
  "showTrigger" | "showClear"
>;

export function AsyncSingleCombobox<T extends Omit<BaseItem, "type">>({
  value,
  label,
  onChange,
  showClear,
  inputGroup = () => <></>,
  renderItem = ({ label }) => <div>{label}</div>,
  showTrigger,
  placeholder = "",
  debounceWait = 1000,
  errorMessage,
  getItemsAsyncFn,
}: AsyncSingleComboboxProps<T>) {
  // Generate unique id for accessibility (label - input)
  const id = React.useId();

  const [showLoading, setShowLoading] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<T[]>([]);
  const [internalSelectedValue, setInternalSelectedValue] =
    React.useState<T | null>(null);

  // This is used to switch from uncontrolled component to controlled component
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalSelectedValue;

  // Derrived variable
  const trimmedSearchValue = searchValue.trim();

  const debouncedGetItems = useDebouncedCallback(async (searchVal: string) => {
    const res = await getItemsAsyncFn(searchVal);
    setSearchResults(res);
    setShowLoading(false);
  }, debounceWait);

  const items = React.useMemo(() => {
    if (!selectedValue) {
      return searchResults;
    }

    const selectedItems: T[] = [];

    selectedItems.push(selectedValue);

    const filteredResults = searchResults.filter(
      ({ id }) => id !== selectedValue.id,
    );

    return [...selectedItems, ...filteredResults];
  }, [searchResults, selectedValue]);

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

    if (trimmedSearchValue === "") {
      return <React.Fragment>Start typing to search item...</React.Fragment>;
    }

    if (searchResults.length === 0) {
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
      <Combobox<T>
        value={selectedValue}
        items={items}
        filter={null}
        autoHighlight
        onValueChange={(nextSelectedValue) => {
          if (!isControlled) {
            setInternalSelectedValue(nextSelectedValue);
          }

          onChange?.(nextSelectedValue);
          setSearchValue("");

          if (!nextSelectedValue) {
            setSearchResults([]);
          }
        }}
        onInputValueChange={(nextSearchValue, { reason }) => {
          setSearchValue(nextSearchValue);

          if (nextSearchValue.trim() === "") {
            setShowLoading(false);
            setSearchResults([]);
            debouncedGetItems.cancel();
            return;
          }

          if (reason === "item-press") {
            return;
          }

          setShowLoading(true);
          debouncedGetItems(nextSearchValue);
        }}
        isItemEqualToValue={(itemValue, selectedValue) =>
          itemValue.id === selectedValue.id
        }
      >
        <ComboboxInput
          id={id}
          showClear={showClear}
          placeholder={placeholder}
          showTrigger={showTrigger}
        >
          {inputGroup()}
        </ComboboxInput>
        <ComboboxContent align="center">
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
