import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const EXPECTED_SHA256 = {
  "atiyoga-dark.jpg":
    "739b848bc17cd447e3703a3407baa358ea27deda737e0f98fa70690b44065d43",
  "atiyoga-light.jpg":
    "e4a4f1483c93b6d225710bec11b412ab7c0416c76f2869f12eae8a5971ce358e",
  "dzogchen4-dark.jpg":
    "3d5a8d97d693ad753af87d0d5910530fca75773b622a4a7dc0f7c93a867e931b",
  "dzogchen4-light.jpg":
    "11e1c7036c0bcc25b54a50b0e174023e9d76e2a0ac28859b4aaf3f73354ca00a",
  "yihua-dark-desktop.jpg":
    "7c4fc4ef9568b67c8b4837bc2abda3b84dc0feee240d505194dce8968cc18434",
  "yihua-dark-mobile.jpg":
    "e153d6712cf83ae23f8becd35a3282cd51081a1ac9ed40b4afb5fcda4e0d84fa",
  "yihua-light-desktop.jpg":
    "774ddf519f589dfbe835226383c0ea77ea763dbd7297117e5c3bc6463aeeebdd",
  "yihua-light-mobile.jpg":
    "fd7f5e7f8c794998fde3ceba4f5f23de573e8dd55b6817650885e7fce64f15b3",
  "yixi-original.jpg":
    "5963ea24e158f44ed78242f8ff93460779a0c9d7af45f9a0a0f2717150c6375c",
  "yunmen-dark.jpg":
    "36f31b91eeb36d601c77f2362cfa2e0db8ef41141856697126198c3d1ae1c60a",
  "yunmen-light.jpg":
    "8e93b6a1b09bc1627704896b7504ee4425da66ad50827daa5695c0902175a5a3",
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
