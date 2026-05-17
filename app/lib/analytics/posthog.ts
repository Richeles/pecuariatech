// =========================================================
// PecuariaTech
// PostHog Runtime Analytics
// Equação Y + Runtime Intelligence
// =========================================================

import posthog from "posthog-js";

/* =========================================================
   INIT
========================================================= */

let initialized =
  false;

/* =========================================================
   START
========================================================= */

export function initPostHog() {

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  if (initialized) {
    return;
  }

  const key =
    process.env
      .NEXT_PUBLIC_POSTHOG_KEY;

  const host =
    process.env
      .NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {

    console.warn(
      "[PostHog] env ausente"
    );

    return;
  }

  posthog.init(
    key,
    {
      api_host: host,

      capture_pageview: true,

      persistence:
        "localStorage",

      autocapture: true,

      session_recording: {
        maskAllInputs: false,
      },
    }
  );

  initialized = true;

  console.log(
    "[PostHog] runtime online"
  );
}

/* =========================================================
   TRACK
========================================================= */

export function trackEvent(
  event: string,
  properties?: Record<
    string,
    unknown
  >
) {

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {

    posthog.capture(
      event,
      properties
    );

  } catch (error) {

    console.error(
      "[PostHog] erro track",
      error
    );
  }
}

/* =========================================================
   IDENTIFY
========================================================= */

export function identifyUser(
  userId: string,
  properties?: Record<
    string,
    unknown
  >
) {

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {

    posthog.identify(
      userId,
      properties
    );

  } catch (error) {

    console.error(
      "[PostHog] erro identify",
      error
    );
  }
}

/* =========================================================
   RESET
========================================================= */

export function resetAnalytics() {

  if (
    typeof window === "undefined"
  ) {
    return;
  }

  posthog.reset();
}