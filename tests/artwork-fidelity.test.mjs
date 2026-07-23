import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const EXPECTED_SHA256 = {
  "atiyoga-dark.jpg":
    "943b7df146af1ec1b7b9abc8f5237f10a4466028bcd5ec1d2565e278f51e57bc",
  "atiyoga-light.jpg":
    "06b2feeedcbcedd46eaea75debd51a5d04c43a38e4f594cccb6bb484d83a52f8",
  "yihua-dark-desktop.jpg":
    "283eb541d7297d34efa6af239476a2e8f442ded3bc1ce9b4c063e3131d91c00e",
  "yihua-dark-mobile.jpg":
    "3673f3685c44d725526c416dbbb2930f0b7172562b1e0b98605a95060556e5f8",
  "yihua-light-desktop.jpg":
    "f5034c1ab5b7b1764a1354bd0155d1fb35b6b8eafc794fc5d6a8e7825a252f9b",
  "yihua-light-mobile.jpg":
    "ec61fff161edf0ad7a0ae33d1d19b311ea68d25cd03a2c5025b6b0276a510388",
  "yixi-original.jpg":
    "5963ea24e158f44ed78242f8ff93460779a0c9d7af45f9a0a0f2717150c6375c",
  "yunmen-dark.jpg":
    "16bd79ee9ae83608fb9821c5f7b6de07c0d93a25f640b72bf2f80dea2158e4f4",
  "yunmen-light.jpg":
    "040cb235866afa33a55cb045f46b711dbf78b2ad22b6d3a5b72447894c1063e8",
};

test("published chart artwork remains byte-for-byte identical to approved outputs", async () => {
  for (const [filename, expectedHash] of Object.entries(EXPECTED_SHA256)) {
    const bytes = await readFile(
      new URL(`../public/charts/${filename}`, import.meta.url),
    );
    const actualHash = createHash("sha256").update(bytes).digest("hex");

    assert.equal(
      actualHash,
      expectedHash,
      `${filename} changed; regenerate and explicitly approve the new artwork before updating this fingerprint`,
    );
  }
});
