"use client";

import React, { useEffect, useState } from "react";
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

interface ComplaintCategory {
  id: string;
  name: string;
  description?: string;
  defaultDepartmentId: string;
}

interface CampusLocation {
  id: string;
  campus: string;
  building: string;
  block?: string;
  floor?: string;
  roomOrArea: string;
}

const PRIORITIES: Array<{ id: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; label: string; desc: string }> = [
  { id: "LOW", label: "Low", desc: "Routine maintenance or minor non-blocking issue" },
  { id: "MEDIUM", label: "Medium", desc: "Noticeable disruption to standard daily study or work" },
  { id: "HIGH", label: "High", desc: "Significant impediment affecting multiple students or facilities" },
  { id: "URGENT", label: "Urgent", desc: "Immediate safety, security, or severe campus-wide outage" },
];

function NewComplaintForm() {
  const router = useRouter();

  // Form State
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [files, setFiles] = useState<UploadedFileItem[]>([]);

  // Workflow & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([apiClient.getReferenceData("categories"), apiClient.getReferenceData("locations")])
      .then(([categoryData, locationData]) => {
        if (cancelled) return;
        const loadedCategories = categoryData as unknown as ComplaintCategory[];
        setCategories(loadedCategories);
        setLocations(locationData as unknown as CampusLocation[]);
        setCategoryId(loadedCategories[0]?.id || "");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load complaint categories.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCategory = categories.find((category) => category.id === categoryId);

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

    if (!selectedCategory) {
      setErrorMessage("Complaint categories are still loading. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedAttachments: Array<{
        storageKey: string;
        originalFilename: string;
        mimeType: "image/jpeg" | "image/png" | "application/pdf";
        fileSizeBytes: number;
      }> = [];

      for (const item of files) {
        const presignRes = await apiClient.presignUpload({
          filename: item.name,
          mimeType: item.file.type as "image/jpeg" | "image/png" | "application/pdf",
          fileSizeBytes: item.sizeBytes,
        });
        const uploadResponse = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": item.file.type },
          body: item.file,
        });
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${item.name}. Please retry before submitting.`);
        }
        uploadedAttachments.push({
          storageKey: presignRes.fileKey,
          originalFilename: item.name,
          mimeType: item.file.type as "image/jpeg" | "image/png" | "application/pdf",
          fileSizeBytes: item.sizeBytes,
        });
      }

      // Submit complaint with UUIDv4 Idempotency-Key
      const idempotencyKey = crypto.randomUUID();
      const result = await apiClient.submitComplaint(
        {
          title: trimmedTitle,
          description: trimmedDesc,
          categoryId: selectedCategory.id,
          departmentId: selectedCategory.defaultDepartmentId,
          locationDetails: locationDetails.trim(),
          suggestedPriority: priority,
          attachments: uploadedAttachments,
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
            {categories.map((cat) => (
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
                <div className="font-semibold text-xs text-slate-900">{cat.name}</div>
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
                list="campus-location-suggestions"
                disabled={isSubmitting}
                helperText="Specify the building, floor, lab, or hostel room where the issue occurred."
              />
              <datalist id="campus-location-suggestions">
                {locations.map((location) => (
                  <option
                    key={location.id}
                    value={[location.building, location.block, location.floor, location.roomOrArea]
                      .filter(Boolean)
                      .join(", ")}
                  >
                    {location.campus}
                  </option>
                ))}
              </datalist>
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

        {/* Step 4: Supporting Attachments */}
        <Card title="4. Evidence &amp; Attachments (Optional)" description="Upload photos or PDF documents supporting your grievance (max 3 files, 5MB each).">
          <div className="pt-2">
            <FileUploader
              files={files}
              onChange={setFiles}
              maxFiles={3}
              maxSizeBytes={5 * 1024 * 1024}
              disabled={isSubmitting}
            />
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Attachment Protocol (GAP-003):</span> Attached files are pre-signed and stored securely in Supabase Storage. Entity relation binding is tracked in the intake audit log.
            </div>
          </div>
        </Card>

        {/* Step 5: Review & Confirm Submission */}
        <Card title="5. Review &amp; Confirm Submission" description="Review all provided details before authoritatively filing this grievance into the Campus Plus ledger.">
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 divide-y divide-slate-200/80 text-xs">
              <div className="pb-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Jurisdiction &amp; Category:</span>
                <span className="font-semibold text-slate-900">{selectedCategory?.name || "Loading categories..."}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Suggested Priority:</span>
                <span className="font-semibold text-slate-900">{priority} Priority</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Subject / Title:</span>
                <span className="font-semibold text-slate-900 truncate max-w-xs">{title.trim() || "(Pending input)"}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Campus Location:</span>
                <span className="font-semibold text-slate-900">{locationDetails.trim() || "(Pending input)"}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Description Length:</span>
                <span className="font-semibold text-slate-900">{description.trim().length} chars (min 30)</span>
              </div>
              <div className="pt-2.5 flex justify-between items-center">
                <span className="text-slate-500 font-medium">Attached Proofs:</span>
                <span className="font-semibold text-slate-900">{files.length} file(s) attached</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              Upon clicking &quot;Submit Grievance&quot;, your complaint will be assigned a unique immutable tracking code (CP-YYYY-XXXXX) and queued for triage by the designated department head.
            </p>
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
