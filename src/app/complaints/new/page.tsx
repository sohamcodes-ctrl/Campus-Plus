"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/presentation/components/auth/ProtectedRoute";
import { UserRole } from "@/domain/complaint";
import { apiClient } from "@/presentation/services/apiClient";
import { Card } from "@/presentation/components/primitives/Card";
import { Button } from "@/presentation/components/primitives/Button";
import { TextInput } from "@/presentation/components/forms/TextInput";
import { TextArea } from "@/presentation/components/forms/TextArea";
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { FileUploader, UploadedFileItem } from "@/presentation/components/domain/FileUploader";

const CATEGORIES = [
  { id: "NETWORK_WIFI", label: "Network & Campus Wi-Fi", defaultDept: "00000000-0000-0000-0000-000000000010" },
  { id: "HOSTEL_MAINTENANCE", label: "Hostel Maintenance & Facilities", defaultDept: "00000000-0000-0000-0000-000000000020" },
  { id: "CLASSROOM_INFRASTRUCTURE", label: "Classroom & Lab Infrastructure", defaultDept: "00000000-0000-0000-0000-000000000010" },
  { id: "ACADEMIC_EVALUATION", label: "Academic & Evaluation Concerns", defaultDept: "00000000-0000-0000-0000-000000000010" },
  { id: "CAMPUS_SANITATION", label: "Campus Sanitation & Grounds", defaultDept: "00000000-0000-0000-0000-000000000020" },
  { id: "OTHER", label: "Other General Inquiries", defaultDept: "00000000-0000-0000-0000-000000000010" },
];

const PRIORITIES: Array<{ id: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; label: string; desc: string }> = [
  { id: "LOW", label: "Low", desc: "Routine maintenance or minor non-blocking issue" },
  { id: "MEDIUM", label: "Medium", desc: "Noticeable disruption to standard daily study or work" },
  { id: "HIGH", label: "High", desc: "Significant impediment affecting multiple students or facilities" },
  { id: "URGENT", label: "Urgent", desc: "Immediate safety, security, or severe campus-wide outage" },
];

function NewComplaintForm() {
  const router = useRouter();

  // Form State
  const [categoryId, setCategoryId] = useState("NETWORK_WIFI");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [files, setFiles] = useState<UploadedFileItem[]>([]);

  // Workflow & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation checks matching domain value objects
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 10 || trimmedTitle.length > 120) {
      setErrorMessage("Title must be between 10 and 120 characters.");
      return;
    }

    const trimmedDesc = description.trim();
    if (trimmedDesc.length < 30) {
      setErrorMessage("Description must contain at least 30 characters detailing the issue.");
      return;
    }

    if (!locationDetails.trim()) {
      setErrorMessage("Please specify the campus location (e.g. Building, Room number, Floor).");
      return;
    }

    setIsSubmitting(true);
    try {
      // Execute upload presigning for any attached files
      for (const item of files) {
        try {
          const presignRes = await apiClient.presignUpload({
            filename: item.name,
            mimeType: item.file.type as "image/jpeg" | "image/png" | "application/pdf",
            fileSizeBytes: item.sizeBytes,
          });
          if (presignRes && presignRes.uploadUrl) {
            await fetch(presignRes.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": item.file.type },
              body: item.file,
            });
          }
        } catch {
          // File upload best-effort; does not block grievance filing
        }
      }

      // Submit complaint with UUIDv4 Idempotency-Key
      const idempotencyKey = crypto.randomUUID();
      const result = await apiClient.submitComplaint(
        {
          title: trimmedTitle,
          description: trimmedDesc,
          categoryId: selectedCategory.id,
          departmentId: selectedCategory.defaultDept,
          locationDetails: locationDetails.trim(),
          suggestedPriority: priority,
        },
        idempotencyKey
      );

      // Redirect to newly created complaint detail view
      router.push(`/complaints/${result.complaintId}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setErrorMessage(err instanceof Error ? err.message : "Failed to register grievance. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Register Formal Grievance
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Submit a campus infrastructure, academic, or facility issue for authoritative triage and resolution.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            &larr; Cancel
          </Button>
        </Link>
      </div>

      {errorMessage && (
        <AlertBanner variant="error" title="Validation &amp; Submission Error">
          {errorMessage}
        </AlertBanner>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Step 1: Category Selection */}
        <Card title="1. Category &amp; Jurisdiction" description="Select the institutional category that best describes your grievance.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  categoryId === cat.id
                    ? "border-[var(--role-primary,#7FA8D9)] bg-[var(--role-accent,#EAF2FB)] ring-1 ring-[var(--role-primary,#7FA8D9)]"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">{cat.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Dispatched to responsible department</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 2 & 3: Subject and Description */}
        <Card title="2. Grievance Details" description="Provide clear, factual information to help handlers triage and investigate.">
          <div className="space-y-4 pt-2">
            <div>
              <TextInput
                id="complaint-title"
                label="Grievance Title / Subject (10–120 characters)"
                required
                placeholder="e.g. Wi-Fi Connectivity Down in Mechanical Lab 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                disabled={isSubmitting}
                helperText={`${title.trim().length} / 120 characters (minimum 10 required)`}
              />
            </div>

            <div>
              <TextArea
                id="complaint-description"
                label="Detailed Description (minimum 30 characters)"
                required
                rows={4}
                placeholder="Describe the problem, when it started, and its impact on campus operations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                helperText={`${description.trim().length} characters (minimum 30 required)`}
              />
            </div>

            <div>
              <TextInput
                id="complaint-location"
                label="Location Details"
                required
                placeholder="e.g. Academic Block B, 2nd Floor, Room 204"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                disabled={isSubmitting}
                helperText="Specify the building, floor, lab, or hostel room where the issue occurred."
              />
            </div>
          </div>
        </Card>

        {/* Step 4: Suggested Priority */}
        <Card title="3. Impact &amp; Suggested Priority" description="Indicate the urgency to assist the department head during triage.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  priority === p.id
                    ? "border-[var(--role-primary,#7FA8D9)] bg-[var(--role-accent,#EAF2FB)] ring-1 ring-[var(--role-primary,#7FA8D9)]"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{p.label} Priority</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Step 5: Supporting Attachments */}
        <Card title="4. Evidence &amp; Attachments (Optional)" description="Upload photos or PDF documents supporting your grievance (max 3 files, 5MB each).">
          <div className="pt-2">
            <FileUploader
              files={files}
              onChange={setFiles}
              maxFiles={3}
              maxSizeBytes={5 * 1024 * 1024}
              disabled={isSubmitting}
            />
          </div>
        </Card>

        {/* Submission Confirmation */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="outline" size="md" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-bold shadow-xs"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Submit Grievance
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewComplaintPage() {
  return (
    <ProtectedRoute allowedRoles={[UserRole.ROLE_STUDENT, UserRole.ROLE_FACULTY]}>
      <NewComplaintForm />
    </ProtectedRoute>
  );
}
