import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { securityScenarios } from "@/content/scenarios-data";
import { lessons } from "@/content/lessons";

describe("Security Scenarios & Thought Challenges", () => {
  it("contains 30 comprehensive real-world scenarios covering site content and EdTech contexts", () => {
    expect(securityScenarios.length).toBeGreaterThanOrEqual(30);

    const validCategories = [
      "passwords_accounts",
      "malware_scanning",
      "firewall_network",
      "backup_crypto_hash",
      "security_fundamentals",
    ];

    const validDifficulties = ["مبتدئ", "متوسط", "متقدم"];
    const validTracks = ["general", "edtech"];
    const existingLessonSlugs = new Set(lessons.map((l) => l.slug));

    const edtechScenarios = securityScenarios.filter((sc) => sc.track === "edtech");
    const generalScenarios = securityScenarios.filter((sc) => sc.track === "general");

    expect(edtechScenarios.length).toBeGreaterThanOrEqual(14);
    expect(generalScenarios.length).toBeGreaterThanOrEqual(16);

    securityScenarios.forEach((sc) => {
      expect(sc.id).toBeTruthy();
      expect(sc.title).toBeTruthy();
      expect(sc.incidentContext.length).toBeGreaterThan(30);
      expect(sc.question).toBeTruthy();
      expect(sc.options).toHaveLength(4);
      expect(sc.correctIndex).toBeGreaterThanOrEqual(0);
      expect(sc.correctIndex).toBeLessThan(4);
      expect(sc.explanation.length).toBeGreaterThan(20);
      expect(sc.whyOthersFail.length).toBeGreaterThan(15);
      expect(validCategories).toContain(sc.category);
      expect(validDifficulties).toContain(sc.difficulty);
      expect(validTracks).toContain(sc.track);
      if (sc.track === "edtech") {
        expect(sc.edtechDomain).toBeTruthy();
      }
      expect(existingLessonSlugs.has(sc.lessonSlug)).toBe(true);
      expect(sc.curriculumReference).toBeTruthy();
    });
  });

  it("successfully matches the /scenarios route in TanStack Router", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/scenarios");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.some((m) => m.routeId === "/scenarios")).toBe(true);
  });
});
