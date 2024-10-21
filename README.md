# Notify QA Wolf on Deploy

## Introduction

This action uploads a executable file to be used in a test workflow. this action uses [the `@qawolf/ci-sdk`
package](https://www.npmjs.com/package/@qawolf/ci-sdk).

### `qawolf-api-key`

**Required**. The QA Wolf API key, which you can find on the application's team settings page.

### `input-file-path`

**Required**. The path to the file to be uploaded. Must exist at this location on the file system.

## Outputs

### `destination-file-path`

The location the file will be available at in the playground's file system.

### Usage Example

```yml
name: Upload Run Input File
on: workflow_dispatch:
jobs:
  upload-input-file:
    runs-on: ubuntu-latest
    steps:
      ....
      - name: Upload Run Input
        uses: qawolf/upload-run-inputs-executable-action@v1
        with:
          qawolf-api-key: "${{ secrets.QAWOLF_API_KEY }}"
          input-file-path: "path/to/file.apk"
      ....
```

### Usage within in a Trigger Workflow

The `qawolf/upload-run-inputs-executable-action` will output `destination-file-path` with the location the file will be available at in the playground's file system. To use this in a test workflow you can add this value as a `RUN_INPUT_PATH` environmental variable in the `qawolf/notify-qawolf-on-deploy-action@v1` action.

For official documentation on Triggering test runs refer to [Trigger test runs on deployment](https://qawolf.notion.site/Triggering-test-runs-on-deployment-0f12fb5260de4362a5ebe33d8a2f9538)

Official documentation for the Notify QA Wolf on Deploy Action is located at [Notify QA Wolf on Deploy Action] (https://github.com/marketplace/actions/notify-qa-wolf-on-deploy)

```yml
name: Deploy and Notify QA Wolf
on: pull_request
jobs:
  ...
  notify:
    needs: deploy-preview-environmnent
    name: Trigger QA Wolf PR testing
    runs-on: ubuntu-latest
    steps:
    ...
      # Upload the run input file
      - name: Upload Run Input
        id: upload-run-inputs-executable
        uses: qawolf/upload-run-inputs-executable-action@v1
        with:
          qawolf-api-key: "${{ secrets.QAWOLF_API_KEY }}"
          input-file-path: "path/to/file.apk"
      - name: Notify QA Wolf of deployment
        uses: qawolf/notify-qawolf-on-deploy-action@v1
        env:
          ...
          # Use the output in the RUN_INPUT_PATH environmental variable
          RUN_INPUT_PATH: "${{ steps.upload-run-inputs-executable.outputs.destination-file-path }}"
          ...
        with: ...
```
