import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Primitives
import { Button } from "@/presentation/components/primitives/Button";
import { Badge } from "@/presentation/components/primitives/Badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/presentation/components/primitives/Card";
import { Divider } from "@/presentation/components/primitives/Divider";
import { Skeleton } from "@/presentation/components/primitives/Skeleton";

// Form Controls
import { TextInput } from "@/presentation/components/forms/TextInput";
import { TextArea } from "@/presentation/components/forms/TextArea";
import { Select } from "@/presentation/components/forms/Select";
import { RadioGroup } from "@/presentation/components/forms/RadioGroup";
import { SearchInput } from "@/presentation/components/forms/SearchInput";

// Feedback & Overlays
import { AlertBanner } from "@/presentation/components/feedback/AlertBanner";
import { Toast } from "@/presentation/components/feedback/Toast";
import { EmptyState } from "@/presentation/components/feedback/EmptyState";
import { Modal } from "@/presentation/components/overlays/Modal";
import { Drawer } from "@/presentation/components/overlays/Drawer";
import { ConfirmDialog } from "@/presentation/components/overlays/ConfirmDialog";
import { ConflictModal } from "@/presentation/components/overlays/ConflictModal";

// Domain Widgets
import { TrackingCodeBadge } from "@/presentation/components/domain/TrackingCodeBadge";
import { StatusPill, ComplaintStatusType } from "@/presentation/components/domain/StatusPill";
import { PriorityBadge } from "@/presentation/components/domain/PriorityBadge";
import { TimelineFeed } from "@/presentation/components/domain/TimelineFeed";
import { FileUploader } from "@/presentation/components/domain/FileUploader";

describe("Stage 08-C-C: Enterprise Design System & Reusable Components Suite", () => {
  // ==========================================================================
  // 1. BASE PRIMITIVES
  // ==========================================================================
  describe("1. Base Primitives", () => {
    describe("Button", () => {
      it("renders primary button with token-based role colors and contrast tokens", () => {
        const html = renderToStaticMarkup(
          React.createElement(Button, { variant: "primary" }, "Submit Complaint")
        );
        expect(html).toContain("Submit Complaint");
        expect(html).toContain("bg-[var(--role-primary)]");
        expect(html).toContain("text-[var(--role-btn-text)]");
      });

      it("renders secondary, outline, destructive, and ghost variants", () => {
        const sec = renderToStaticMarkup(React.createElement(Button, { variant: "secondary" }, "Secondary"));
        expect(sec).toContain("bg-slate-100");

        const out = renderToStaticMarkup(React.createElement(Button, { variant: "outline" }, "Outline"));
        expect(out).toContain("border-slate-300");

        const des = renderToStaticMarkup(React.createElement(Button, { variant: "destructive" }, "Delete"));
        expect(des).toContain("bg-red-600");
        expect(des).toContain("text-white");

        const gho = renderToStaticMarkup(React.createElement(Button, { variant: "ghost" }, "Cancel"));
        expect(gho).toContain("hover:bg-slate-100");
      });

      it("renders sizes sm, md, and lg (with lg meeting 44px touch target)", () => {
        const sm = renderToStaticMarkup(React.createElement(Button, { size: "sm" }, "Small"));
        expect(sm).toContain("min-h-[32px]");

        const md = renderToStaticMarkup(React.createElement(Button, { size: "md" }, "Medium"));
        expect(md).toContain("min-h-[40px]");

        const lg = renderToStaticMarkup(React.createElement(Button, { size: "lg" }, "Large"));
        expect(lg).toContain("min-h-[44px]");
      });

      it("handles loading state with spinner and aria-busy", () => {
        const html = renderToStaticMarkup(
          React.createElement(Button, { isLoading: true }, "Processing")
        );
        expect(html).toContain('aria-busy="true"');
        expect(html).toContain("animate-spin");
        expect(html).toContain("disabled");
      });

      it("handles disabled state", () => {
        const html = renderToStaticMarkup(
          React.createElement(Button, { disabled: true }, "Disabled")
        );
        expect(html).toContain("disabled");
        expect(html).toContain("disabled:cursor-not-allowed");
      });
    });

    describe("Badge", () => {
      it("renders neutral, info, success, warning, danger, and role variants", () => {
        const neu = renderToStaticMarkup(React.createElement(Badge, { variant: "neutral" }, "General"));
        expect(neu).toContain("bg-slate-100");

        const inf = renderToStaticMarkup(React.createElement(Badge, { variant: "info" }, "Informational"));
        expect(inf).toContain("bg-blue-50");

        const suc = renderToStaticMarkup(React.createElement(Badge, { variant: "success" }, "Complete"));
        expect(suc).toContain("bg-emerald-50");

        const war = renderToStaticMarkup(React.createElement(Badge, { variant: "warning" }, "Pending"));
        expect(war).toContain("bg-amber-50");

        const dan = renderToStaticMarkup(React.createElement(Badge, { variant: "danger" }, "Critical"));
        expect(dan).toContain("bg-red-50");

        const rol = renderToStaticMarkup(React.createElement(Badge, { variant: "role" }, "Student"));
        expect(rol).toContain("bg-[var(--role-accent)]");
      });

      it("renders optional non-color dot cue", () => {
        const html = renderToStaticMarkup(
          React.createElement(Badge, { variant: "info", dot: true }, "Active")
        );
        expect(html).toContain("h-1.5 w-1.5 rounded-full");
      });
    });

    describe("Card", () => {
      it("renders backwards-compatible title and description props", () => {
        const html = renderToStaticMarkup(
          React.createElement(Card, { title: "System Status", description: "All services operational" }, "Card Body")
        );
        expect(html).toContain("System Status");
        expect(html).toContain("All services operational");
        expect(html).toContain("Card Body");
      });

      it("renders composite subcomponents CardHeader, CardTitle, CardContent, CardFooter", () => {
        const html = renderToStaticMarkup(
          React.createElement(
            Card,
            null,
            React.createElement(
              CardHeader,
              null,
              React.createElement(CardTitle, null, "Custom Header"),
              React.createElement(CardDescription, null, "Custom Subtitle")
            ),
            React.createElement(CardContent, null, React.createElement("p", null, "Inner content")),
            React.createElement(CardFooter, null, React.createElement("span", null, "Footer text"))
          )
        );
        expect(html).toContain("Custom Header");
        expect(html).toContain("Custom Subtitle");
        expect(html).toContain("Inner content");
        expect(html).toContain("Footer text");
      });
    });

    describe("Divider", () => {
      it("renders horizontal separator with role separator", () => {
        const html = renderToStaticMarkup(React.createElement(Divider, null));
        expect(html).toContain('role="separator"');
        expect(html).toContain('aria-orientation="horizontal"');
      });

      it("renders vertical separator", () => {
        const html = renderToStaticMarkup(React.createElement(Divider, { orientation: "vertical" }));
        expect(html).toContain('aria-orientation="vertical"');
        expect(html).toContain("w-px");
      });

      it("renders divider with label", () => {
        const html = renderToStaticMarkup(React.createElement(Divider, { label: "OR CONTINUE WITH" }));
        expect(html).toContain("OR CONTINUE WITH");
      });
    });

    describe("Skeleton", () => {
      it("renders text, circular, and rectangular variants with aria-hidden", () => {
        const text = renderToStaticMarkup(React.createElement(Skeleton, { variant: "text" }));
        expect(text).toContain("animate-pulse");
        expect(text).toContain('aria-hidden="true"');

        const circ = renderToStaticMarkup(React.createElement(Skeleton, { variant: "circular", width: 40, height: 40 }));
        expect(circ).toContain("rounded-full");

        const rect = renderToStaticMarkup(React.createElement(Skeleton, { variant: "rectangular", height: 120 }));
        expect(rect).toContain("rounded-md");
      });
    });
  });

  // ==========================================================================
  // 2. FORM CONTROLS
  // ==========================================================================
  describe("2. Form Controls", () => {
    describe("TextInput", () => {
      it("renders label, required indicator, and helper text", () => {
        const html = renderToStaticMarkup(
          React.createElement(TextInput, {
            id: "complaint-title",
            label: "Complaint Title",
            required: true,
            helperText: "Summarize your issue in 10-120 characters",
          })
        );
        expect(html).toContain("Complaint Title");
        expect(html).toContain("*");
        expect(html).toContain("Summarize your issue in 10-120 characters");
        expect(html).toContain('aria-describedby="complaint-title-helper"');
      });

      it("renders error state with role alert and aria-invalid", () => {
        const html = renderToStaticMarkup(
          React.createElement(TextInput, {
            id: "complaint-title",
            label: "Complaint Title",
            error: "Title must be at least 10 characters",
          })
        );
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain('role="alert"');
        expect(html).toContain("Title must be at least 10 characters");
        expect(html).toContain("complaint-title-error");
      });

      it("renders left icon adornment", () => {
        const icon = React.createElement("span", { id: "test-icon" }, "@");
        const html = renderToStaticMarkup(
          React.createElement(TextInput, { label: "Email", leftIcon: icon })
        );
        expect(html).toContain("test-icon");
        expect(html).toContain("pl-9");
      });
    });

    describe("TextArea", () => {
      it("renders textarea with live character counter formatting", () => {
        const html = renderToStaticMarkup(
          React.createElement(TextArea, {
            id: "complaint-desc",
            label: "Detailed Description",
            value: "Initial text that is relatively short",
            readOnly: true,
            minChars: 30,
            maxChars: 1000,
            showCharCount: true,
          })
        );
        expect(html).toContain("Detailed Description");
        expect(html).toContain('aria-live="polite"');
        expect(html).toContain("/ 1000");
      });

      it("flags validation error when error prop provided", () => {
        const html = renderToStaticMarkup(
          React.createElement(TextArea, {
            id: "complaint-desc",
            error: "Description must be at least 30 characters long",
          })
        );
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain('role="alert"');
        expect(html).toContain("Description must be at least 30 characters long");
      });
    });

    describe("Select", () => {
      it("renders options and placeholder", () => {
        const options = [
          { value: "cat-1", label: "WiFi / Network" },
          { value: "cat-2", label: "Hostel Maintenance" },
        ];
        const html = renderToStaticMarkup(
          React.createElement(Select, {
            id: "cat-select",
            label: "Select Category",
            placeholder: "Choose a category...",
            options,
          })
        );
        expect(html).toContain("Choose a category...");
        expect(html).toContain("WiFi / Network");
        expect(html).toContain("Hostel Maintenance");
      });

      it("links error message via aria-describedby", () => {
        const html = renderToStaticMarkup(
          React.createElement(Select, {
            id: "cat-select",
            error: "Please select a category",
          })
        );
        expect(html).toContain('aria-invalid="true"');
        expect(html).toContain("cat-select-error");
      });
    });

    describe("RadioGroup", () => {
      it("renders options in accessible fieldset with role radiogroup", () => {
        const options = [
          { value: "LOW", label: "Low", description: "Routine request" },
          { value: "HIGH", label: "High", description: "Urgent disruption" },
        ];
        const html = renderToStaticMarkup(
          React.createElement(RadioGroup, {
            name: "priority",
            label: "Priority Level",
            options,
            value: "HIGH",
          })
        );
        expect(html).toContain("Priority Level");
        expect(html).toContain("Routine request");
        expect(html).toContain("Urgent disruption");
        expect(html).toContain("checked");
      });
    });

    describe("SearchInput", () => {
      it("renders search input with shortcut hint and clear button when valued", () => {
        const withVal = renderToStaticMarkup(
          React.createElement(SearchInput, {
            value: "WiFi",
            readOnly: true,
            onClear: () => {},
            shortcutHint: "Ctrl+K",
          })
        );
        expect(withVal).toContain('aria-label="Clear search"');

        const empty = renderToStaticMarkup(
          React.createElement(SearchInput, {
            value: "",
            readOnly: true,
            shortcutHint: "Ctrl+K",
          })
        );
        expect(empty).toContain("Ctrl+K");
      });
    });
  });

  // ==========================================================================
  // 3. FEEDBACK & OVERLAYS
  // ==========================================================================
  describe("3. Feedback & Overlays", () => {
    describe("AlertBanner", () => {
      it("renders info and success alerts with role status", () => {
        const info = renderToStaticMarkup(
          React.createElement(AlertBanner, { variant: "info", title: "Note" }, "Information text")
        );
        expect(info).toContain('role="status"');
        expect(info).toContain("Information text");

        const success = renderToStaticMarkup(
          React.createElement(AlertBanner, { variant: "success" }, "Action succeeded")
        );
        expect(success).toContain('role="status"');
      });

      it("renders warning and error alerts with role alert", () => {
        const warn = renderToStaticMarkup(
          React.createElement(AlertBanner, { variant: "warning" }, "Anti-deadlock warning: 2 transfers")
        );
        expect(warn).toContain('role="alert"');

        const err = renderToStaticMarkup(
          React.createElement(AlertBanner, { variant: "error" }, "State transition rejected")
        );
        expect(err).toContain('role="alert"');
      });

      it("renders dismiss button when isDismissible is true", () => {
        const html = renderToStaticMarkup(
          React.createElement(AlertBanner, { variant: "info", isDismissible: true, onDismiss: () => {} }, "Alert")
        );
        expect(html).toContain('aria-label="Dismiss alert"');
      });
    });

    describe("Toast", () => {
      it("renders toast with role status and dismiss trigger", () => {
        const html = renderToStaticMarkup(
          React.createElement(Toast, {
            id: "t-1",
            title: "Saved",
            message: "Complaint saved as draft",
            onDismiss: () => {},
          })
        );
        expect(html).toContain('role="status"');
        expect(html).toContain("Complaint saved as draft");
        expect(html).toContain('aria-label="Dismiss notification"');
      });
    });

    describe("EmptyState", () => {
      it("renders title, description, and action", () => {
        const action = React.createElement(Button, null, "Submit New Complaint");
        const html = renderToStaticMarkup(
          React.createElement(EmptyState, {
            title: "No Complaints Found",
            description: "You have not submitted any complaints yet.",
            action,
          })
        );
        expect(html).toContain("No Complaints Found");
        expect(html).toContain("You have not submitted any complaints yet.");
        expect(html).toContain("Submit New Complaint");
      });
    });

    describe("Modal & Dialogs", () => {
      it("renders modal with role dialog and aria-modal when isOpen", () => {
        const html = renderToStaticMarkup(
          React.createElement(
            Modal,
            { isOpen: true, onClose: () => {}, title: "Assign Handler" },
            React.createElement("p", null, "Select a handler for this complaint")
          )
        );
        expect(html).toContain('role="dialog"');
        expect(html).toContain('aria-modal="true"');
        expect(html).toContain("Assign Handler");
      });

      it("renders nothing when isOpen is false", () => {
        const html = renderToStaticMarkup(
          React.createElement(Modal, { isOpen: false, onClose: () => {} }, "Hidden")
        );
        expect(html).toBe("");
      });

      it("renders ConfirmDialog with title, description, and action buttons", () => {
        const html = renderToStaticMarkup(
          React.createElement(ConfirmDialog, {
            isOpen: true,
            onClose: () => {},
            onConfirm: () => {},
            title: "Cancel Complaint",
            description: "Are you sure you want to cancel this complaint? This cannot be undone.",
            confirmVariant: "destructive",
            confirmText: "Yes, Cancel Complaint",
          })
        );
        expect(html).toContain("Cancel Complaint");
        expect(html).toContain("Yes, Cancel Complaint");
        expect(html).toContain("bg-red-600");
      });

      it("renders ConflictModal with OCC 409 conflict message and reload action", () => {
        const html = renderToStaticMarkup(
          React.createElement(ConflictModal, {
            isOpen: true,
            expectedVersion: 2,
            currentVersion: 3,
            onClose: () => {},
            onReload: () => {},
          })
        );
        expect(html).toContain("Record Modified by Another User (HTTP 409)");
        expect(html).toContain("Optimistic Concurrency Conflict");
        expect(html).toContain('Your Form Version: <span class="font-semibold text-slate-800">v2</span>');
        expect(html).toContain('Server Version: <span class="font-semibold text-emerald-700">v3</span>');
        expect(html).toContain("Reload Latest Complaint");
      });
    });

    describe("Drawer", () => {
      it("renders slide-over drawer with role dialog and title", () => {
        const html = renderToStaticMarkup(
          React.createElement(
            Drawer,
            { isOpen: true, onClose: () => {}, title: "Notifications" },
            React.createElement("p", null, "Notification feed")
          )
        );
        expect(html).toContain('role="dialog"');
        expect(html).toContain("Notifications");
        expect(html).toContain('aria-label="Close drawer"');
      });
    });
  });

  // ==========================================================================
  // 4. DOMAIN WIDGETS
  // ==========================================================================
  describe("4. Domain Widgets", () => {
    describe("TrackingCodeBadge", () => {
      it("renders tracking code in monospace with copy action", () => {
        const html = renderToStaticMarkup(
          React.createElement(TrackingCodeBadge, { trackingCode: "CP-2026-00042" })
        );
        expect(html).toContain("CP-2026-00042");
        expect(html).toContain("font-mono");
        expect(html).toContain('aria-label="Copy tracking code CP-2026-00042"');
      });
    });

    describe("StatusPill (13 FSM Lifecycle States)", () => {
      const allStates: ComplaintStatusType[] = [
        "DRAFT",
        "SUBMITTED",
        "REVIEWED",
        "ASSIGNED",
        "IN_PROGRESS",
        "FORWARDED",
        "ESCALATED",
        "RESOLVED",
        "CLOSED",
        "REOPENED",
        "REJECTED",
        "DUPLICATE",
        "CANCELLED",
      ];

      it.each(allStates)("renders status pill for %s with non-color cue", (status) => {
        const html = renderToStaticMarkup(React.createElement(StatusPill, { status }));
        expect(html).toContain("inline-flex items-center");
        expect(html).toContain('aria-hidden="true"'); // Dot/icon non-color cue
      });

      it("renders correct labels for statuses", () => {
        const inProgress = renderToStaticMarkup(React.createElement(StatusPill, { status: "IN_PROGRESS" }));
        expect(inProgress).toContain("In Progress");
        expect(inProgress).toContain("animate-ping"); // Pulsing dot indicator

        const resolved = renderToStaticMarkup(React.createElement(StatusPill, { status: "RESOLVED" }));
        expect(resolved).toContain("Resolved");

        const escalated = renderToStaticMarkup(React.createElement(StatusPill, { status: "ESCALATED" }));
        expect(escalated).toContain("Escalated");
      });
    });

    describe("PriorityBadge (4 Priority Levels)", () => {
      it("renders all 4 priority levels with non-color cues", () => {
        const low = renderToStaticMarkup(React.createElement(PriorityBadge, { priority: "LOW" }));
        expect(low).toContain("Low");

        const med = renderToStaticMarkup(React.createElement(PriorityBadge, { priority: "MEDIUM" }));
        expect(med).toContain("Medium");

        const high = renderToStaticMarkup(React.createElement(PriorityBadge, { priority: "HIGH" }));
        expect(high).toContain("High");

        const urgent = renderToStaticMarkup(React.createElement(PriorityBadge, { priority: "URGENT" }));
        expect(urgent).toContain("Urgent");
        expect(urgent).toContain("animate-ping"); // Urgent has pulsing non-color cue
      });
    });

    describe("TimelineFeed", () => {
      it("renders empty timeline message when no events exist", () => {
        const html = renderToStaticMarkup(React.createElement(TimelineFeed, { events: [] }));
        expect(html).toContain("No event history recorded yet");
      });

      it("renders chronological timeline items with actor role and formatted action", () => {
        const events = [
          {
            id: "ev-1",
            action: "COMPLAINT_SUBMITTED",
            newStatus: "SUBMITTED",
            actorRole: "ROLE_STUDENT",
            actorName: "John Doe",
            createdAt: "2026-09-11T10:00:00Z",
            remarks: "WiFi access down across whole wing",
          },
          {
            id: "ev-2",
            action: "ASSIGNED_TO_HANDLER",
            newStatus: "ASSIGNED",
            actorRole: "ROLE_DEPT_HEAD",
            actorName: "Dr. Smith",
            createdAt: "2026-09-11T11:00:00Z",
            remarks: null,
          },
        ];

        const html = renderToStaticMarkup(React.createElement(TimelineFeed, { events }));
        expect(html).toContain("COMPLAINT SUBMITTED");
        expect(html).toContain("STUDENT");
        expect(html).toContain("John Doe");
        expect(html).toContain("WiFi access down across whole wing");
        expect(html).toContain("ASSIGNED TO HANDLER");
        expect(html).toContain("DEPT HEAD");
        expect(html).toContain("Dr. Smith");
      });
    });

    describe("FileUploader", () => {
      it("renders file upload dropzone with MIME and size constraints", () => {
        const html = renderToStaticMarkup(
          React.createElement(FileUploader, {
            files: [],
            onChange: () => {},
          })
        );
        expect(html).toContain("JPEG, PNG, or PDF up to 5MB each (Max 3 files)");
        expect(html).toContain("Click to upload");
      });

      it("renders list of uploaded files with formatted sizes and remove buttons", () => {
        const mockFiles = [
          {
            id: "f-1",
            file: {} as File,
            name: "router_error.png",
            sizeBytes: 1548576, // ~1.5 MB
            mimeType: "image/png",
          },
        ];

        const html = renderToStaticMarkup(
          React.createElement(FileUploader, {
            files: mockFiles,
            onChange: () => {},
          })
        );
        expect(html).toContain("router_error.png");
        expect(html).toContain("1.5 MB");
        expect(html).toContain('aria-label="Remove file router_error.png"');
      });

      it("displays maximum attachments limit message when 3 files uploaded", () => {
        const mockFiles = [
          { id: "f-1", file: {} as File, name: "1.png", sizeBytes: 1000, mimeType: "image/png" },
          { id: "f-2", file: {} as File, name: "2.png", sizeBytes: 1000, mimeType: "image/png" },
          { id: "f-3", file: {} as File, name: "3.png", sizeBytes: 1000, mimeType: "image/png" },
        ];

        const html = renderToStaticMarkup(
          React.createElement(FileUploader, {
            files: mockFiles,
            onChange: () => {},
          })
        );
        expect(html).toContain("Maximum attachments limit reached (3/3)");
      });
    });
  });
});
