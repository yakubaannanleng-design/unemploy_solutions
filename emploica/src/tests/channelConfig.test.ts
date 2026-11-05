import { describe, expect, it } from "vitest";
import { LIEN_CANAL_TELEGRAM } from "@/config/canaux";
import { isValidChannelLink } from "@/features/canaux/utils/channelLink";

describe("Lien du canal Telegram Workca", () => {
  it("ouvre directement le canal et non sa page de boost", () => {
    expect(LIEN_CANAL_TELEGRAM).toBe("https://t.me/workca_cm");
    expect(isValidChannelLink(LIEN_CANAL_TELEGRAM)).toBe(true);
    expect(LIEN_CANAL_TELEGRAM).not.toContain("/boost/");
  });
});
