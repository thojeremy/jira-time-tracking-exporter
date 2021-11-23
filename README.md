# Jira Time Tracking Exporter

If you can't find a plugin available for your Jira version, you can use this exporter

This exporter will export the time tracking for the current month

## Notes

- Worklog starting on one month and ending on another month is not managed yet
- The only authentication method allowed is the Token authentication

## Token creation

### Cloud
You will have to create a token in Jira following these guidelines : [Create a token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)

### On-Premise
[Create a token](https://www.resolution.de/create-or-generate-api-tokens-in-jira/?utm_campaign=C%3Agoad%7CA%3Atext%7CR%3AreW%3Aapit%7CP%3Ajira-software%7CV%3Agoogle%7CG%3Aall%7CL%3Aen%7CF%3Aaware%7C&utm_term=token%20for%20jira&utm_medium=cpc&utm_source=google&utm_content=token%20for%20jira&gclid=CjwKCAiAv_KMBhAzEiwAs-rX1HQOTg52sMLh8HbaMShZeLiY6FHxu4wXnvy5tf4S0rBkHm4vhNrJoxoC3ecQAvD_BwE)

# Development

## Dependencies

In order to install all dependencies, run :

```sh
npm i
```

To install electron and its packaging util globally, use :

```sh
npm i electron -g
npm i electron-packager -g
```

## Launch unit tests

Tests will have to be done when dev will start.

In order to run unit tests, run :

```sh
npm run test
```

## Launch application

Launch the following command :

```sh
electron .
```

# Package

You can package automatically by using the command :

```sh
npm run package:mac
npm run package:windows
npm run package:linux
```

Or manually with :

```sh
# Mac
electron-packager . --overwrite --platform=darwin --arch=x64  --prune=true --out=release-builds
# Windows
electron-packager . --overwrite --platform=win32 --arch=ia32  --prune=true --out=release-builds
# Linux
electron-packager . --overwrite --platform=linux --arch=x64  --prune=true --out=release-builds
```
