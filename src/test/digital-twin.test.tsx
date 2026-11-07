import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { buildDefaultDigitalTwin, syncTwinWithActivities } from "@/lib/digital-twin-store";
import type { CognitiveDimensionKey } from "@/lib/digital-twin.types";

describe("Learner Digital Twin & Intelligent Agent System", () => {
  it("initializes a valid default digital twin with 5 cognitive dimensions", () => {
    const twin = buildDefaultDigitalTwin();

    expect(twin.id).toBeTruthy();
    expect(twin.studentName).toBeTruthy();
    expect(twin.stageTitle).toBeTruthy();
    expect(twin.overallMastery).toBeGreaterThanOrEqual(0);
    expect(twin.overallMastery).toBeLessThanOrEqual(100);
    expect(twin.immunityHealthScore).toBeGreaterThanOrEqual(0);
    expect(twin.immunityHealthScore).toBeLessThanOrEqual(100);

    const requiredDimensions: CognitiveDimensionKey[] = [
      "passwords_accounts",
      "malware_scanning",
      "firewall_network",
      "backup_crypto_hash",
      "edtech_security",
    ];

    requiredDimensions.forEach((dimKey) => {
      const dim = twin.dimensions[dimKey];
      expect(dim).toBeDefined();
      expect(dim.score).toBeGreaterThanOrEqual(0);
      expect(dim.score).toBeLessThanOrEqual(100);
      expect(dim.titleArabic).toBeTruthy();
      expect(dim.recommendedLessonSlug).toBeTruthy();
    });

    expect(twin.behavior.curiosityIndex).toBeGreaterThanOrEqual(0);
    expect(twin.behavior.cognitiveResilience).toBeGreaterThanOrEqual(0);
    expect(twin.behavior.decisionVelocity).toBeTruthy();

    expect(twin.misconceptions.length).toBeGreaterThanOrEqual(5);
    twin.misconceptions.forEach((misc) => {
      expect(misc.id).toBeTruthy();
      expect(misc.title).toBeTruthy();
      expect(misc.scientificCorrection).toBeTruthy();
      expect(misc.relatedLessonSlug).toBeTruthy();
    });
  });

  it("updates twin metrics properly during activity synchronization", () => {
    const baseTwin = buildDefaultDigitalTwin();
    const synced = syncTwinWithActivities(baseTwin);

    expect(synced.dimensions).toBeDefined();
    expect(synced.overallMastery).toBeGreaterThanOrEqual(0);
    expect(synced.immunityHealthScore).toBeGreaterThanOrEqual(0);
  });

  it("successfully matches the /digital-twin route in TanStack Router", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/digital-twin");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/digital-twin")).toBe(true);
  });
});
