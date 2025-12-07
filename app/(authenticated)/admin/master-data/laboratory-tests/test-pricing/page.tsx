import { Separator } from "@/components/ui/separator";

export default function TestPricing() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="px-3 py-1">
        <h1 className="text-2xl font-semibold mb-2">Test Pricing</h1>
        <div className="">
          Manage pricing for laboratory tests across different tariff groups.
        </div>
      </div>
      <Separator />
    </div>
  );
}
