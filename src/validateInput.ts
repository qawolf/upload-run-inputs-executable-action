import * as core from "@actions/core";

import { type GenerateSignedUrlConfig } from "@qawolf/ci-sdk";
export function validateInput():
  | {
      apiKey: string;
      generateSignedUrlConfig: GenerateSignedUrlConfig;
      isValid: true;
    }
  | {
      error: string;
      isValid: false;
    } {
  const qawolfApiKey = core.getInput("qawolf-api-key", {
    required: true,
  });

  const destinationFilePath = core.getInput("input-file-path", {
    required: true,
  });

  return {
    apiKey: qawolfApiKey,
    generateSignedUrlConfig: { destinationFilePath },
    isValid: true,
  };
}
