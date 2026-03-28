'use client';

import { MockDashboardLayer } from './MockDashboardLayer';

interface SpotlightLayerProps {
  targetRect: DOMRect | null;
  stepKey?: string;
}

const SPOTLIGHT_PADDING = 10;

export function SpotlightLayer({ targetRect, stepKey }: SpotlightLayerProps) {
  if (!targetRect) {
    return (
      <div className="pointer-events-auto fixed inset-0 z-[130]">
        <div className="onboarding-overlay-backdrop absolute inset-0" />
      </div>
    );
  }

  const viewportWidth =
    typeof document !== 'undefined'
      ? document.documentElement.clientWidth
      : targetRect.left + targetRect.width + SPOTLIGHT_PADDING;
  const viewportHeight =
    typeof document !== 'undefined'
      ? document.documentElement.clientHeight
      : targetRect.top + targetRect.height + SPOTLIGHT_PADDING;

  const holeLeft = Math.max(targetRect.left - SPOTLIGHT_PADDING, 6);
  const holeTop = Math.max(targetRect.top - SPOTLIGHT_PADDING, 6);
  const holeWidth = Math.max(
    40,
    Math.min(targetRect.width + SPOTLIGHT_PADDING * 2, viewportWidth - holeLeft - 6)
  );
  const holeHeight = Math.max(
    32,
    Math.min(targetRect.height + SPOTLIGHT_PADDING * 2, viewportHeight - holeTop - 6)
  );
  const holeRight = holeLeft + holeWidth;
  const holeBottom = holeTop + holeHeight;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[130]">
      <div className="onboarding-overlay-backdrop absolute left-0 right-0 top-0" style={{ height: holeTop }} />
      <div className="onboarding-overlay-backdrop absolute left-0 top-0" style={{ width: holeLeft, height: holeBottom }} />
      <div className="onboarding-overlay-backdrop absolute right-0 top-0" style={{ left: holeRight, height: holeBottom }} />
      <div className="onboarding-overlay-backdrop absolute bottom-0 left-0 right-0" style={{ top: holeBottom }} />

      <div
        className="onboarding-spotlight-clear absolute"
        style={{
          left: holeLeft,
          top: holeTop,
          width: holeWidth,
          height: holeHeight,
        }}
        aria-hidden
      />
      <div
        className="onboarding-spotlight-ring absolute"
        style={{
          left: holeLeft,
          top: holeTop,
          width: holeWidth,
          height: holeHeight,
        }}
        aria-hidden
      />
      {stepKey ? (
        <MockDashboardLayer
          stepKey={stepKey}
          frame={{
            left: holeLeft,
            top: holeTop,
            width: holeWidth,
            height: holeHeight,
          }}
        />
      ) : null}
    </div>
  );
}
