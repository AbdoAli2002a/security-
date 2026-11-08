import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { AvastRescueSimulator } from "@/components/avast-rescue-simulator";

describe("Avast Rescue Disk ISO Simulator", () => {
  it("renders the simulator with live WinPE desktop environment and core rescue applications", () => {
    render(<AvastRescueSimulator />);

    // Check header branding and environment indicators
    expect(screen.getByText(/AVAST RESCUE DISK/i)).toBeInTheDocument();
    expect(screen.getByText(/STANDALONE OFFLINE ENGINE/i)).toBeInTheDocument();

    // Check desktop icons and main rescue tools
    expect(screen.getByText("Avast Rescue Scanner")).toBeInTheDocument();
    expect(screen.getByText("منظف قطاعات الإقلاع MBR")).toBeInTheDocument();
    expect(screen.getByText("مستكشف إنقاذ الملفات")).toBeInTheDocument();
    expect(screen.getByText("WinPE Terminal")).toBeInTheDocument();
    expect(screen.getAllByText(/مهام أسطوانة الإنقاذ|مهام الإنقاذ/).length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("successfully matches the /avast-rescue route in TanStack Router", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/avast-rescue");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/avast-rescue")).toBe(true);
  });
});
