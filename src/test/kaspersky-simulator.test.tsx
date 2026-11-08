import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { KasperskySimulator } from "@/components/kaspersky-simulator";

describe("Kaspersky Rescue Disk ISO Simulator", () => {
  it("renders the simulator with live desktop environment and core rescue applications", () => {
    render(<KasperskySimulator />);

    // Check header branding and OS version
    expect(screen.getByText(/KASPERSKY RESCUE DISK/i)).toBeInTheDocument();

    // Check desktop icons and main rescue tools
    expect(screen.getByText("Kaspersky Rescue Tool")).toBeInTheDocument();
    expect(screen.getByText("محرر الريجستري المستقل")).toBeInTheDocument();
    expect(screen.getByText("مستكشف ملفات الإنقاذ")).toBeInTheDocument();
    expect(screen.getByText("XFCE Terminal")).toBeInTheDocument();
    expect(screen.getAllByText("مهام وتحديات الإنقاذ").length).toBeGreaterThanOrEqual(1);
  });

  it("successfully matches the /kaspersky route in TanStack Router", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/kaspersky");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/kaspersky")).toBe(true);
  });
});
