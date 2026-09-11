"use client";

import React from "react";
import { cn } from "@/presentation/utils/cn";
import { StatusPill, ComplaintStatusType } from "./StatusPill";

export interface TimelineEventItem {
  id: string;
  action: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  actorRole: string;
  actorName?: string | null;
  createdAt: string;
  remarks?: string | null;
}

export interface TimelineFeedProps {
  events: TimelineEventItem[];
  className?: string;
}

export const TimelineFeed: React.FC<TimelineFeedProps> = ({ events, className }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-slate-500 italic">
        No event history recorded yet.
      </div>
    );
  }

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const formatActorRole = (role: string) => {
    return role.replace(/^ROLE_/, "").replace(/_/g, " ");
  };

  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1;

          return (
            <li key={event.id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}

                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center ring-4 ring-white">
                      <span className="h-2 w-2 rounded-full bg-[var(--role-primary,#7FA8D9)]" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
                      <div className="font-medium text-slate-900">
                        <span>{event.action.replace(/_/g, " ")}</span>
                        {event.newStatus && (
                          <span className="ml-2 inline-block">
                            <StatusPill
                              status={event.newStatus as ComplaintStatusType}
                              size="sm"
                            />
                          </span>
                        )}
                      </div>
                      <time
                        dateTime={event.createdAt}
                        className="text-xs text-slate-400"
                      >
                        {formatTimestamp(event.createdAt)}
                      </time>
                    </div>

                    <div className="mt-1 text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-semibold text-slate-600 uppercase tracking-wide">
                        {formatActorRole(event.actorRole)}
                      </span>
                      {event.actorName && (
                        <span>&bull; {event.actorName}</span>
                      )}
                    </div>

                    {event.remarks && (
                      <div className="mt-2 rounded-md bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200">
                        {event.remarks}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
