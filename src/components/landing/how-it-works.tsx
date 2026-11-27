'use client';

import { useRef, useState, type ReactNode, type RefObject } from 'react';

import {
  Journey,
  JourneyStep,
  PhoneFrame,
  PressButton,
  usePrefersReducedMotion,
  useScrollPlay,
} from '@merqo/ui';

import { ADD_PRODUCT_BUTTON, REASON_RESTOCK, SAMPLE, restockButton } from './stock-labels';
import { AddProductScreen, OverviewScreen, RestockScreen } from './stock-screen';

const PHONE = 'h-[250px] w-[190px] max-w-full min-w-0';
const REPLAY =
  'focus-visible:ring-ring focus-visible:ring-offset-background hover:bg-muted active:bg-muted/70 inline-flex min-h-11 items-center justify-center rounded-lg border-[1.5px] px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none';

const FILL_FRAMES = 3;

function Stage({
  stageRef,
  replay,
  children,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  replay?: () => void;
  children: ReactNode;
}) {
  return (
    <div ref={stageRef} className="flex w-full flex-col items-center gap-3">
      {children}
      {replay ? (
        <button type="button" onClick={replay} className={REPLAY}>
          Replay
        </button>
      ) : null}
    </div>
  );
}

/** Step 1 is a watch: the scroll position fills the form in and rewinds on the way up. */
function CountStage() {
  const ref = useRef<HTMLDivElement>(null);
  const filled = useScrollPlay(ref, FILL_FRAMES);
  return (
    <Stage stageRef={ref}>
      <PhoneFrame label="Add product screen" size="small" className={PHONE}>
        <AddProductScreen
          filled={filled}
          action={
            <PressButton aria-hidden tabIndex={-1} className="pointer-events-none h-10 text-sm">
              {ADD_PRODUCT_BUTTON}
            </PressButton>
          }
        />
      </PhoneFrame>
    </Stage>
  );
}

/**
 * Step 2 is the visitor's to press: scrolling never presses it. Reduced motion
 * rests on the finished state and Replay hands the button back.
 */
function RestockStage() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [pressed, setPressed] = useState<boolean | null>(null);
  const done = pressed ?? reduced;
  return (
    <Stage stageRef={ref} replay={done ? () => setPressed(false) : undefined}>
      <PhoneFrame label="Restock screen" size="small" className={PHONE}>
        <RestockScreen
          done={done}
          action={
            done ? undefined : (
              <PressButton onClick={() => setPressed(true)} className="h-10 text-sm">
                {restockButton(SAMPLE.restockQuantity, SAMPLE.unit)}
              </PressButton>
            )
          }
        />
      </PhoneFrame>
    </Stage>
  );
}

function LowStockStage() {
  const ref = useRef<HTMLDivElement>(null);
  const step = useScrollPlay(ref, 1);
  return (
    <Stage stageRef={ref}>
      <PhoneFrame label="Overview screen" size="small" className={PHONE}>
        <OverviewScreen low={step >= 1} />
      </PhoneFrame>
    </Stage>
  );
}

export function HowItWorks() {
  return (
    <Journey id="how" title="From a count to a low-stock list.">
      <JourneyStep
        label="Count"
        heading="Add a product and what you have."
        say="Enter the unit, what one unit costs, how many you hold and where it counts as low."
        stage={<CountStage />}
      />
      <JourneyStep
        label={REASON_RESTOCK}
        heading="Log a restock when stock arrives."
        say="One press adds the quantity to the count. You enter every restock yourself, and each one is kept in the product's history."
        stage={<RestockStage />}
      />
      <JourneyStep
        label="Low stock"
        heading="See what is running low."
        say="The overview adds up your inventory value and lists products at or under their low-stock threshold. It does not send alerts."
        stage={<LowStockStage />}
      />
    </Journey>
  );
}
