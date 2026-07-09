#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(new URL("../../..", import.meta.url).pathname);
const releaseRoot = join(repoRoot, "app-store/releases/va-document-finder-ios");
const screenshotRoot = join(releaseRoot, "screenshots/final");
const localizationId = "59a9ca64-a090-42eb-b19c-1be1b109884e";

const screenshotGroups = [
  {
    displayType: "APP_IPHONE_67",
    fallbackDisplayTypes: [],
    label: "iPhone 6.9-inch",
    files: [
      "iphone-69-01-home.png",
      "iphone-69-02-intake.png",
      "iphone-69-03-dossier.png",
      "iphone-69-04-calculator.png",
      "iphone-69-05-tools.png",
    ],
  },
  {
    displayType: "APP_IPAD_PRO_3GEN_129",
    fallbackDisplayTypes: ["APP_IPAD_PRO_129", "APP_IPAD_PRO_2GEN_129"],
    label: "iPad Pro 13-inch",
    files: [
      "ipad-13-01-home.png",
      "ipad-13-02-intake.png",
      "ipad-13-03-dossier.png",
      "ipad-13-04-calculator.png",
      "ipad-13-05-tools.png",
    ],
  },
];

for (const group of screenshotGroups) {
  for (const file of group.files) {
    statSync(join(screenshotRoot, file));
  }
}

function runAppleScript(script) {
  return execFileSync("osascript", ["-e", script], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function safariDoJavaScript(source) {
  return runAppleScript(
    `tell application "Safari" to do JavaScript ${JSON.stringify(source)} in current tab of front window`,
  );
}

async function safariAsync(source, timeoutMs = 90000) {
  const commandId = `codexAsc${Date.now()}${Math.random().toString(16).slice(2)}`;
  const wrapped = `
    window.${commandId} = { status: "running" };
    (async () => {
      try {
        const result = await (async () => {
          ${source}
        })();
        window.${commandId} = { status: "complete", result };
      } catch (error) {
        window.${commandId} = {
          status: "failed",
          error: error && error.stack ? error.stack : String(error)
        };
      }
    })();
    "started";
  `;
  safariDoJavaScript(wrapped);

  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const raw = safariDoJavaScript(`JSON.stringify(window.${commandId} || null)`);
    const state = raw ? JSON.parse(raw) : null;
    if (!state || state.status === "running") {
      continue;
    }
    safariDoJavaScript(`delete window.${commandId}; "deleted";`);
    if (state.status === "failed") {
      throw new Error(state.error || "Safari App Store Connect command failed");
    }
    return state.result;
  }

  safariDoJavaScript(`delete window.${commandId}; "deleted";`);
  throw new Error("Timed out waiting for Safari App Store Connect command.");
}

async function ascRequest(method, path, body = null, timeoutMs = 90000) {
  return safariAsync(
    `
      const response = await fetch(${JSON.stringify(path)}, {
        method: ${JSON.stringify(method)},
        headers: ${body ? `{ "Content-Type": "application/json" }` : "undefined"},
        body: ${body ? JSON.stringify(JSON.stringify(body)) : "undefined"},
      });
      const text = await response.text();
      let json = null;
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text };
        }
      }
      if (!response.ok) {
        const detail = json ? JSON.stringify(json).slice(0, 1800) : text.slice(0, 1800);
        throw new Error(${JSON.stringify(method)} + " " + ${JSON.stringify(path)} + " failed with " + response.status + ": " + detail);
      }
      return { status: response.status, json };
    `,
    timeoutMs,
  );
}

async function deleteExistingSets() {
  const response = await ascRequest(
    "GET",
    `/iris/v1/appStoreVersionLocalizations/${localizationId}/appScreenshotSets?include=appScreenshots&limit=50`,
  );
  const targetTypes = new Set(
    screenshotGroups.flatMap((group) => [group.displayType, ...group.fallbackDisplayTypes]),
  );
  for (const set of response.json.data || []) {
    if (targetTypes.has(set.attributes?.screenshotDisplayType)) {
      console.log(`Deleting existing ${set.attributes.screenshotDisplayType} set ${set.id}`);
      await ascRequest("DELETE", `/iris/v1/appScreenshotSets/${set.id}`);
    }
  }
}

async function createScreenshotSet(group) {
  const candidates = [group.displayType, ...group.fallbackDisplayTypes];
  let lastError = null;
  for (const displayType of candidates) {
    try {
      const response = await ascRequest("POST", "/iris/v1/appScreenshotSets", {
        data: {
          type: "appScreenshotSets",
          attributes: {
            screenshotDisplayType: displayType,
          },
          relationships: {
            appStoreVersionLocalization: {
              data: {
                type: "appStoreVersionLocalizations",
                id: localizationId,
              },
            },
          },
        },
      });
      return {
        id: response.json.data.id,
        displayType,
      };
    } catch (error) {
      lastError = error;
      console.log(`Display type ${displayType} failed for ${group.label}; trying next option.`);
    }
  }
  throw lastError;
}

async function reserveScreenshot(setId, fileName, fileSize) {
  const response = await ascRequest("POST", "/iris/v1/appScreenshots", {
    data: {
      type: "appScreenshots",
      attributes: {
        fileName,
        fileSize,
      },
      relationships: {
        appScreenshotSet: {
          data: {
            type: "appScreenshotSets",
            id: setId,
          },
        },
      },
    },
  });
  const data = response.json.data;
  return {
    id: data.id,
    uploadOperations: data.attributes.uploadOperations || [],
  };
}

async function uploadBytes(uploadOperations, buffer, fileName) {
  if (!uploadOperations.length) {
    throw new Error(`No upload operations returned for ${fileName}`);
  }

  for (const operation of uploadOperations) {
    const headers = {};
    for (const header of operation.requestHeaders || []) {
      headers[header.name] = header.value;
    }
    const start = operation.offset || 0;
    const end = start + operation.length;
    const body = buffer.subarray(start, end);
    const response = await fetch(operation.url, {
      method: operation.method || "PUT",
      headers,
      body,
    });
    if (!response.ok) {
      throw new Error(`Upload operation failed for ${fileName} with ${response.status}: ${await response.text()}`);
    }
  }
}

async function commitScreenshot(screenshotId) {
  await ascRequest("PATCH", `/iris/v1/appScreenshots/${screenshotId}`, {
    data: {
      type: "appScreenshots",
      id: screenshotId,
      attributes: {
        uploaded: true,
      },
    },
  });
}

async function pollProcessed(screenshotId, fileName) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const response = await ascRequest("GET", `/iris/v1/appScreenshots/${screenshotId}`, null, 30000);
    const deliveryState = response.json.data.attributes.assetDeliveryState || {};
    if (deliveryState.state === "COMPLETE") {
      return;
    }
    if (deliveryState.errors && deliveryState.errors.length) {
      throw new Error(`Apple rejected ${fileName}: ${JSON.stringify(deliveryState.errors)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  console.log(`Processing is still pending for ${fileName}; upload was committed.`);
}

async function orderScreenshots(setId, orderedIds) {
  await ascRequest("PATCH", `/iris/v1/appScreenshotSets/${setId}/relationships/appScreenshots`, {
    data: orderedIds.map((id) => ({
      type: "appScreenshots",
      id,
    })),
  });
}

async function uploadGroup(group) {
  console.log(`Creating ${group.label} screenshot set`);
  const set = await createScreenshotSet(group);
  console.log(`Created ${group.label} set ${set.id} (${set.displayType})`);
  const orderedIds = [];

  for (const fileName of group.files) {
    const filePath = join(screenshotRoot, fileName);
    const buffer = readFileSync(filePath);
    console.log(`Uploading ${fileName}`);
    const reservation = await reserveScreenshot(set.id, fileName, buffer.byteLength);
    await uploadBytes(reservation.uploadOperations, buffer, fileName);
    await commitScreenshot(reservation.id);
    await pollProcessed(reservation.id, fileName);
    orderedIds.push(reservation.id);
    console.log(`Uploaded ${fileName}`);
  }

  await orderScreenshots(set.id, orderedIds);
  console.log(`Ordered ${group.label} screenshot set`);
  return {
    id: set.id,
    displayType: set.displayType,
    count: orderedIds.length,
  };
}

async function verifyUpload() {
  const response = await ascRequest(
    "GET",
    `/iris/v1/appStoreVersionLocalizations/${localizationId}/appScreenshotSets?include=appScreenshots&limit=50`,
  );
  const matchingSets = (response.json.data || []).filter((set) => {
    const displayType = set.attributes?.screenshotDisplayType;
    return screenshotGroups.some((group) =>
      [group.displayType, ...group.fallbackDisplayTypes].includes(displayType),
    );
  });
  const verified = [];
  for (const set of matchingSets) {
    const screenshots = await ascRequest(
      "GET",
      `/iris/v1/appScreenshotSets/${set.id}/appScreenshots?limit=20`,
    );
    verified.push({
      id: set.id,
      displayType: set.attributes?.screenshotDisplayType,
      count: screenshots.json.meta?.paging?.total || screenshots.json.data?.length || 0,
    });
  }
  return verified.map((set) => ({
    id: set.id,
    displayType: set.displayType,
    count: set.count,
  }));
}

console.log("Using Safari App Store Connect session for metadata calls.");
await deleteExistingSets();
for (const group of screenshotGroups) {
  await uploadGroup(group);
}
const verifiedSets = await verifyUpload();
console.log("Screenshot sets now attached:");
for (const set of verifiedSets) {
  console.log(`- ${set.displayType}: ${set.count} screenshots`);
}
