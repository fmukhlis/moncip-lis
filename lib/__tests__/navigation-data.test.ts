import {
  generateBreadcrumbData,
  generateSidebarData,
} from "@/lib/navigation-data";

describe("generateSidebarData", () => {
  it("renders the staff lab order and specimen groups", () => {
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
      expect.objectContaining({
        url: null,
        title: "Specimens",
        items: [
          expect.objectContaining({
            url: "/staff/specimens",
            title: "All Specimens",
          }),
          expect.objectContaining({
            url: "/staff/specimens/collection",
            title: "Specimen Collection",
          }),
          expect.objectContaining({
            url: "/staff/specimens/receipt",
            title: "Specimen Receipt",
          }),
          expect.objectContaining({
            url: "/staff/specimens/exception-management",
            title: "Exception Management",
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

  it("maps staff specimen routes to breadcrumbs", () => {
    const sidebarData = generateSidebarData("STAFF");
    const breadcrumbData = generateBreadcrumbData(
      sidebarData.map(({ data }) => data).flat(1),
    );

    expect(breadcrumbData.get("/staff/specimens")).toEqual([
      { url: null, title: "All Specimens" },
    ]);
    expect(breadcrumbData.get("/staff/specimens/collection")).toEqual([
      { url: null, title: "Specimen Collection" },
    ]);
    expect(breadcrumbData.get("/staff/specimens/receipt")).toEqual([
      { url: null, title: "Specimen Receipt" },
    ]);
    expect(breadcrumbData.get("/staff/specimens/exception-management")).toEqual(
      [{ url: null, title: "Exception Management" }],
    );
  });
});

describe("generateSidebarData (lab admin)", () => {
  it("renders the lab admin lab order and specimen groups", () => {
    const [group] = generateSidebarData("LAB_ADMIN");

    expect(group.data).toEqual([
      expect.objectContaining({
        url: "/lab-admin/dashboard",
        title: "Dashboard",
      }),
      expect.objectContaining({
        url: null,
        title: "Lab Orders",
        items: [
          expect.objectContaining({
            url: "/lab-admin/lab-orders",
            title: "All Lab Orders",
          }),
          expect.objectContaining({
            url: "/lab-admin/lab-orders/specimen-assignment",
            title: "Specimen Assignment",
          }),
        ],
      }),
      expect.objectContaining({
        url: null,
        title: "Specimens",
        items: [
          expect.objectContaining({
            url: "/lab-admin/specimens",
            title: "All Specimens",
          }),
          expect.objectContaining({
            url: "/lab-admin/specimens/collection",
            title: "Specimen Collection",
          }),
          expect.objectContaining({
            url: "/lab-admin/specimens/receipt",
            title: "Specimen Receipt",
          }),
          expect.objectContaining({
            url: "/lab-admin/specimens/exception-management",
            title: "Exception Management",
          }),
        ],
      }),
    ]);
  });
});

describe("generateBreadcrumbData (lab admin)", () => {
  function labAdminBreadcrumbs() {
    const sidebarData = generateSidebarData("LAB_ADMIN");

    return generateBreadcrumbData(sidebarData.map(({ data }) => data).flat(1));
  }

  it("maps lab admin lab order routes to breadcrumbs", () => {
    const breadcrumbData = labAdminBreadcrumbs();

    expect(breadcrumbData.get("/lab-admin/lab-orders")).toEqual([
      { url: null, title: "All Lab Orders" },
    ]);
    expect(
      breadcrumbData.get("/lab-admin/lab-orders/specimen-assignment"),
    ).toEqual([{ url: null, title: "Specimen Assignment" }]);
  });

  it("maps lab admin specimen routes to breadcrumbs", () => {
    const breadcrumbData = labAdminBreadcrumbs();

    expect(breadcrumbData.get("/lab-admin/specimens")).toEqual([
      { url: null, title: "All Specimens" },
    ]);
    expect(breadcrumbData.get("/lab-admin/specimens/collection")).toEqual([
      { url: null, title: "Specimen Collection" },
    ]);
    expect(breadcrumbData.get("/lab-admin/specimens/receipt")).toEqual([
      { url: null, title: "Specimen Receipt" },
    ]);
    expect(
      breadcrumbData.get("/lab-admin/specimens/exception-management"),
    ).toEqual([{ url: null, title: "Exception Management" }]);
  });
});
