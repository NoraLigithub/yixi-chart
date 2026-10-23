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
    "43753df08e77863c29b78e42547782fb40c0b4504485ada18ceb0e6b8c503646",
  "dzogchen4-light.jpg":
    "d173e623eb7bc79e89adfe7f55c1b3950437097b4402e3214956b1e03554bcd3",
  "dzogchen3-dark.jpg":
    "bb3e98c0e78c3dd67727522325ab49b61e5de83b65e7dfb73ee3df2ca2ef8bdf",
  "dzogchen3-light.jpg":
    "c498d4b1e62bb0543d87e34fd9dcb4fd46fdd53e4b27b624a0f63ecfffd8afd2",
  "huayan-dark.jpg":
    "45f294a1da7dd6ac16200ccb9436267a1dbcb7472a80648e4298a9a9269c4dfa",
  "huayan-light.jpg":
    "52b5e7bb330e0dbdd31de9f47cd5ad120636384176ec077d72973fc1ff995388",
  "huayan5-dark.jpg":
    "e949e6b259279d6e3e6dde7f579b269a11b32ae616fba87dd9c7fd7ec4481a14",
  "huayan5-light.jpg":
    "9021fde617f2f9685abb77666eb969ac06e18735bd224a4bc3810c76a74c5119",
  "tiantai-dark.jpg":
    "8260ea95de5ca1c6deb36b4bacc0c5ab0893d23c524118703d2f6801658cc7c7",
  "tiantai-light.jpg":
    "e702afcb5f9b5af469859a367735e03b133af01c097137b86740b7f251fc3689",
  "yihua-classic.jpg":
    "60c03906d5653f92c347d5173e0234bfacc1bbbe4a2b3b4c10d057ba3cea43af",
  "yihua-dark-desktop.jpg":
    "c50d592d0731587ea15df88a9e9ba4b8d58c4fc3e59ba76167e73cab9fef5266",
  "yihua-dark-mobile.jpg":
    "bf076453317ab17e184013fa4ead59ad34770b06bcef04aee1d970e123f82548",
  "yihua-light-desktop.jpg":
    "9cbf642f77d62a667420ec3e8604d6fb79d7074b0ed7e27f56164488d678df84",
  "yihua-light-mobile.jpg":
    "df0dffb247b1febb343529bd19e0091c7f66a1cff1b60fa87465b6901e4b64c1",
  "yixi-dark.jpg":
    "e81517cb11dfc1353021e105094760df3c67cb2b383c25f9c984ee7d847a8269",
  "yixi-light.jpg":
    "7d260606d8b3f0706da18508449b60ca9fdad52013c5e6c07963e337035e08d6",
  "yunmen-dark.jpg":
    "7f47b8ab32cd6147751d1e2f247768aac609b95867a5f2af9636f97acadea554",
  "yunmen-light.jpg":
    "4319067439721a9cadd563935675e8291f4158ddbbfde6feb026339b76c171a9",
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
