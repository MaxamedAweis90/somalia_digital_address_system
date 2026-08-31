import { MapPin, PenLine, Send, Shapes } from "lucide-react";

const zoneBlockSteps = [
  {
    title: "Open an assigned zone",
    detail: "From Zones, open a zone assigned to you by an administrator.",
  },
  {
    title: "Review available zone blocks",
    detail: "Check the published blocks inside the zone and choose one that is ready for field work.",
  },
  {
    title: "Assign a block to a collector",
    detail: "Select a supervised data collector and give them one zone block to register.",
  },
  {
    title: "Track block progress",
    detail: "Follow each collector task from assigned, through review, to approved.",
  },
  {
    title: "Merge and submit the zone",
    detail:
      "After all block tasks are approved, merge the work and submit the completed zone to admin.",
  },
];

const addressSteps = [
  {
    title: "Review submitted block work",
    detail: "Open the Review Queue to see address registrations submitted by your collectors.",
  },
  {
    title: "Check each address",
    detail: "Verify the street details and GPS pin are correct and inside the assigned zone block.",
  },
  {
    title: "Approve or return the task",
    detail: "Approve accurate work or reject it with a reason so the collector can correct it.",
  },
  {
    title: "Merge approved work",
    detail: "When the block tasks are approved, merge their address registrations into the zone assignment.",
  },
  {
    title: "Submit the zone to admin",
    detail:
      "Submit the merged zone for final approval. The system issues sequential DAC codes when admin publishes the addresses.",
  },
];

const collectorAddressSteps = [
  {
    title: "Open your assigned zone block",
    detail: "Open the block task assigned to you by your data officer.",
  },
  {
    title: "Add one entry per building",
    detail: "Click Add for each house, compound, shop, or structure you are registering.",
  },
  {
    title: "Fill in property details",
    detail: "Enter the street name and a short description for each property.",
  },
  {
    title: "Place the GPS pin on the map",
    detail: "Select an address, then click inside the blue zone block boundary to set its location.",
  },
  {
    title: "Save and submit your work",
    detail: "Save Draft often. Submit when finished so your data officer can review it.",
  },
];

function StepList({ steps }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step.title} className="flex gap-3 text-[12px]">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue/10 text-[11px] font-semibold text-blue-deep">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold text-ink">{step.title}</p>
            <p className="mt-0.5 text-ink-soft leading-relaxed">{step.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function OfficerWorkflowGuide({ compact = false }) {
  if (compact) {
    return (
      <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm space-y-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">How field work works</h2>
          <p className="mt-1 text-[12px] text-ink-soft">
            Your data officer assigns you a zone block. Register its addresses and submit them for
            review.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-violet-800">
              <Shapes className="h-4 w-4" />
              <p className="text-[13px] font-semibold">Work in Your Zone Block</p>
            </div>
            <StepList steps={collectorAddressSteps.slice(0, 3)} />
          </div>

          <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-800">
              <MapPin className="h-4 w-4" />
              <p className="text-[13px] font-semibold">Register Addresses</p>
            </div>
            <StepList steps={collectorAddressSteps.slice(2, 5)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
        <h2 className="text-[16px] font-semibold text-ink">Your role as a Data Officer</h2>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">
          An administrator assigns you a zone and sets the expected collector team size. You
          allocate its zone blocks to your supervised collectors, review their submissions, merge
          the approved work, and submit it for final approval. Official DAC codes are issued only
          when the administrator publishes the addresses.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <PenLine className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">You coordinate collection</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Assign each zone block to the right data collector and monitor its progress.
            </p>
          </div>
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <Shapes className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">System validates</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Collector GPS pins must stay inside their assigned zone block.
            </p>
          </div>
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <Send className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">Admin publishes</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              After approval, registered addresses receive sequential DAC codes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shapes className="h-4 w-4 text-violet-700" />
            <h3 className="text-[15px] font-semibold text-ink">Task 1: Allocate Zone Blocks</h3>
          </div>
          <StepList steps={zoneBlockSteps} />
        </div>

        <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-700" />
            <h3 className="text-[15px] font-semibold text-ink">Task 2: Review Addresses</h3>
          </div>
          <StepList steps={addressSteps} />
          <p className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900">
            Important: review every address submitted for the block before approving it. DAC codes
            are generated automatically when admin publishes the merged zone.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AssignmentWorkSteps({ type }) {
  const steps =
    type === "REGISTER_ADDRESSES"
      ? [
          "Open the zone block task assigned to you.",
          "Click Add for each building, then enter its details.",
          "Place the GPS pin inside the blue zone block.",
          "Save Draft, then Submit for Approval when finished.",
        ]
      : [
          "Click Add for each zone block you need to define.",
          "Enter zone block name and code, then draw its boundary on the map.",
          "Keep polygons inside the gray zone boundary when shown.",
          "Save Draft, then Submit for Approval when finished.",
        ];

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-deep">
        Your steps
      </p>
      <ol className="mt-2 space-y-1">
        {steps.map((step, index) => (
          <li key={step} className="text-[12px] text-ink-soft">
            <span className="font-semibold text-ink">{index + 1}.</span> {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
