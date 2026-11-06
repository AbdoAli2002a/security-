import { describe, expect, it } from "vitest";
import { securityProtocolQuestions } from "@/content/security-protocols-data";

describe("Security Protocols Quiz Data", () => {
  it("contains valid protocol questions with 4 options and valid answer indices", () => {
    expect(securityProtocolQuestions.length).toBeGreaterThanOrEqual(10);

    securityProtocolQuestions.forEach((q) => {
      expect(q.protocol).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.options).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
      expect(q.explanation).toBeTruthy();
      expect(q.keyTakeaway).toBeTruthy();
      expect(["transport", "web_encryption", "firewall_rules", "wireless_auth"]).toContain(
        q.category,
      );
    });
  });
});
