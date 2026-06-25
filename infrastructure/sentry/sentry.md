# Sentry Error Tracking Integration

Wingman AI uses Sentry to monitor backend runtime errors and client-side Chrome extension errors.

## Backend Setup

1. Install Sentry SDK:
   ```bash
   pip install sentry-sdk[fastapi]
   ```
2. Configure settings by adding a `SENTRY_DSN` environment variable:
   ```env
   SENTRY_DSN=https://your-public-key@sentry.io/project-id
   ```
3. Initialize Sentry in `app/main.py`:
   ```python
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration

   if settings.SENTRY_DSN:
       sentry_sdk.init(
           dsn=settings.SENTRY_DSN,
           integrations=[FastApiIntegration()],
           traces_sample_rate=1.0,
           environment=settings.ENVIRONMENT,
       )
   ```

## Chrome Extension Setup

1. Install Sentry Browser SDK in the extension:
   ```bash
   npm install @sentry/browser
   ```
2. Initialize inside entry points (popup, sidepanel, and service worker):
   ```typescript
   import * as Sentry from "@sentry/browser";

   Sentry.init({
     dsn: "https://your-public-key@sentry.io/project-id",
     integrations: [],
     tracesSampleRate: 1.0,
     environment: "production",
   });
   ```
