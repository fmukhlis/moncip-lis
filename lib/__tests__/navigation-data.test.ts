import {
  generateBreadcrumbData,
  generateSidebarData,
} from "@/lib/navigation-data";

describe("generateSidebarData", () => {
  it("renders Lab Orders as a collapsible group for staff", () => {
    const [group] = generateSidebarData("STAFF");

    expect(group.data).toEqual([
      expect.objectContaining({
        url: "/staff/dashboard",
        title: "Dashboard",
      }),
      expect.objectContaining({
        url: null,
        title: "Lab Orders",
        items: [
          expect.objectContaining({
            url: "/staff/lab-orders",
            title: "All Lab Orders",
          }),
          expect.objectContaining({
            url: "/staff/lab-orders/specimen-assignment",
            title: "Specimen Assignment",
          }),
        ],
      }),
    ]);
  });
});

describe("generateBreadcrumbData", () => {
  it("maps staff lab order routes to breadcrumbs", () => {
    const sidebarData = generateSidebarData("STAFF");
    const breadcrumbData = generateBreadcrumbData(
      sidebarData.map(({ data }) => data).flat(1),
    );

    expect(breadcrumbData.get("/staff/lab-orders")).toEqual([
      { url: null, title: "All Lab Orders" },
    ]);
    expect(breadcrumbData.get("/staff/lab-orders/specimen-assignment")).toEqual(
      [{ url: null, title: "Specimen Assignment" }],
    );
  });
});
