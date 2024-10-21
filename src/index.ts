import * as core from "@actions/core";
import fs from "fs/promises";
import path from "path";

import { makeQaWolfSdk } from "@qawolf/ci-sdk";
import { coreLogDriver, stringifyUnknown } from "@qawolf/ci-utils";

import { validateInput } from "./validateInput";

async function runGitHubAction() {
  core.debug("Validating input.");
  const validationResult = validateInput();
  if (!validationResult.isValid) {
    core.setFailed(`Action input is invalid: ${validationResult.error}`);
    return;
  }
  const { apiKey, generateSignedUrlConfig } = validationResult;
  const { generateSignedUrlForRunInputsExecutablesStorage } = makeQaWolfSdk(
    { apiKey },
    {
      log: coreLogDriver,
    },
  );

  core.info("Beginning signed URL generation for file upload.");

  // Always upload to the root of team's run inputs executables directory.
  const fileName = path.basename(generateSignedUrlConfig.destinationFilePath);

  const generateSignedUrlResult =
    await generateSignedUrlForRunInputsExecutablesStorage({
      destinationFilePath: fileName,
    });
  if (!generateSignedUrlResult.success) {
    core.setFailed(
      `Failed to generate signed URL with reason "${generateSignedUrlResult.abortReason}" ${
        generateSignedUrlResult.httpStatus
          ? `, HTTP status ${generateSignedUrlResult.httpStatus}`
          : ""
      }.`,
    );
    return;
  }

  const fileBuffer = await fs.readFile(
    generateSignedUrlConfig.destinationFilePath,
  );

  const url = generateSignedUrlResult.uploadUrl;

  if (!url) {
    core.setFailed(`Failed to recieve upload URL`);
    return;
  }

  try {
    const response = await fetch(url, {
      body: fileBuffer,
      headers: {
        "Content-Type": "application/octet-stream",
      },
      method: "PUT",
    });

    if (!response.ok)
      throw Error(`Failed to upload file: ${response.statusText}`);
  } catch (error) {
    core.setFailed(`Failed to upload file: ${error}`);
    return;
  }

  core.setOutput(
    "destination-file-path",
    generateSignedUrlResult.playgroundFileLocation,
  );

  core.info(`Successfully uploaded the file ${fileName}.`);
}

runGitHubAction().catch((error) => {
  core.setFailed(
    `Action failed with reason: ${stringifyUnknown(error) ?? "Unknown error"}`,
  );
});
