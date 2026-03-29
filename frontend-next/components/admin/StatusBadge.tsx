"use client";

const STATUS_STYLES: Record<string, string> = {
  // Profile
  draft:               "bg-gray-100 text-gray-600",
  pending_validation:  "bg-amber-100 text-amber-700",
  validated:           "bg-green-100 text-green-700",
  rejected:            "bg-red-100 text-red-700",
  suspended:           "bg-orange-100 text-orange-700",
  // Job
  open:                "bg-blue-100 text-blue-700",
  in_progress:         "bg-purple-100 text-purple-700",
  filled:              "bg-green-100 text-green-700",
  cancelled:           "bg-gray-100 text-gray-500",
  paused:              "bg-yellow-100 text-yellow-700",
  // Document
  uploaded:            "bg-gray-100 text-gray-600",
  pending:             "bg-amber-100 text-amber-700",
  verified:            "bg-green-100 text-green-700",
  expired:             "bg-red-100 text-red-700",
  renewed:             "bg-teal-100 text-teal-700",
  // Migration
  received:            "bg-blue-100 text-blue-700",
  analyzing:           "bg-amber-100 text-amber-700",
  documents_requested: "bg-orange-100 text-orange-700",
  documents_received:  "bg-purple-100 text-purple-700",
  resolving:           "bg-indigo-100 text-indigo-700",
  answer_received:     "bg-green-100 text-green-700",
  closed:              "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<string, string> = {
  draft:               "Schiță",
  pending_validation:  "În Așteptare",
  validated:           "Validat",
  rejected:            "Respins",
  suspended:           "Suspendat",
  open:                "Deschis",
  in_progress:         "În Lucru",
  filled:              "Ocupat",
  cancelled:           "Anulat",
  paused:              "Pauză",
  uploaded:            "Încărcat",
  pending:             "În Verificare",
  verified:            "Verificat",
  expired:             "Expirat",
  renewed:             "Reînnoit",
  received:            "Primit",
  analyzing:           "În Analiză",
  documents_requested: "Documente Solicitate",
  documents_received:  "Documente Primite",
  resolving:           "În Soluționare",
  answer_received:     "Răspuns Primit",
  closed:              "Închis",
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
