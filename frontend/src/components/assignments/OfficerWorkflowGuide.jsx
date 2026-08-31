import { MapPin, PenLine, Send, Shapes } from "lucide-react";

const zoneBlockSteps = [
  {
    title: "Open your zone block assignment",
    detail: "From My Assignments, open a Define Zone Blocks task for your zone.",
  },
  {
    title: "Add each zone block",
    detail: 'Click Add, then give every zone block a name and code (e.g. "Block 01" / Z01).',
  },
  {
    title: "Draw boundaries on the map",
    detail:
      "Use the map tools to draw one polygon per zone block. Stay inside the gray zone boundary when it is shown.",
  },
  {
    title: "Save draft as you work",
    detail: "Use Save Draft so your progress is not lost. You can return and continue later.",
  },
  {
    title: "Submit for admin approval",
    detail:
      "When all zone blocks are complete, submit for approval. An admin will review and publish them to the registry.",
  },
];

const addressSteps = [
  {
    title: "Open your address assignment",
    detail: "From My Assignments, open a Register Addresses task for your assigned zone block.",
  },
  {
    title: "Add one entry per building",
    detail:
      "Click Add for each house, compound, shop, or structure you are registering. The system does not auto-count buildings — you register each one manually.",
  },
  {
    title: "Fill in property details",
    detail: "Enter the street name and a short description (e.g. gate color, landmark, compound name).",
  },
  {
    title: "Place the GPS pin on the map",
    detail:
      "Select an address, then click inside the blue zone block boundary to set its location. Drag the marker to adjust.",
  },
  {
    title: "Save draft, then submit",
    detail:
      "Save Draft often. When every property in your assignment is recorded, submit for approval. The admin will issue sequential DAC codes (e.g. HOD-TLX-Z01-0001, 0002, 0003).",
  },
];

function StepList({ steps, icon: Icon }) {
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
            You only work through assignments assigned by an administrator. You cannot create
            addresses or zones directly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-violet-800">
              <Shapes className="h-4 w-4" />
              <p className="text-[13px] font-semibold">Define Zone Blocks</p>
            </div>
            <StepList steps={zoneBlockSteps.slice(0, 3)} />
          </div>

          <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-4">
            <div className="mb-3 flex items-center gap-2 text-cyan-800">
              <MapPin className="h-4 w-4" />
              <p className="text-[13px] font-semibold">Register Addresses</p>
            </div>
            <StepList steps={addressSteps.slice(0, 3)} />
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
          You carry out field data collection for the Somalia Digital Address System. An
          administrator prepares zones and zone blocks, then assigns you tasks. You record
          boundaries and properties on the map, save drafts, and submit for approval. Official
          DAC codes are only issued after admin approval — not when you draw a zone block.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <PenLine className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">You collect data</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Draw zone blocks or place one pin per building you verify in the field.
            </p>
          </div>
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <Shapes className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">System validates</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              Zone blocks must stay inside the zone. Pins must stay inside the zone block.
            </p>
          </div>
          <div className="rounded-lg bg-bg border border-line px-4 py-3">
            <Send className="h-4 w-4 text-blue-deep" />
            <p className="mt-2 text-[12px] font-semibold text-ink">Admin publishes</p>
            <p className="mt-1 text-[11px] text-ink-soft">
              After approval, zone blocks go live and addresses receive sequential DAC codes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shapes className="h-4 w-4 text-violet-700" />
            <h3 className="text-[15px] font-semibold text-ink">Task 1: Define Zone Blocks</h3>
          </div>
          <StepList steps={zoneBlockSteps} />
        </div>

        <div className="rounded-xl border border-line bg-white p-5 shadow-card-sm">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-700" />
            <h3 className="text-[15px] font-semibold text-ink">Task 2: Register Addresses</h3>
          </div>
          <StepList steps={addressSteps} />
          <p className="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-900">
            Important: the system does not know how many buildings are in a zone block. You must add
            each property yourself — one address per building or compound you are registering.
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
          "Click Add for each building you are registering.",
          "Enter street name and description for the selected address.",
          "Click inside the blue zone block on the map to place the GPS pin.",
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
