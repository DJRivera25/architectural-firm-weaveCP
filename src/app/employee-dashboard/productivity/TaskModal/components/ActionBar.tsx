import React from "react";
import { UserGroupIcon, CalendarIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import type { Assignee } from "../utils/assigneeUtils";
import type { TaskAttachment, TaskChecklistItem } from "@/types";

interface ActionBarProps {
  assignees: Assignee[];
  dueDate?: string;
  attachments?: TaskAttachment[];
  checklist?: TaskChecklistItem[];
  showDueDateSection: boolean;
  showAttachmentsSection: boolean;
  showChecklistSection: boolean;
  onMembersClick: () => void;
  onShowDueDateSection: () => void;
  onShowAttachmentsSection: () => void;
  onShowChecklistSection: () => void;
  isEmployee?: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  assignees,
  dueDate,
  attachments,
  checklist,
  showDueDateSection,
  showAttachmentsSection,
  showChecklistSection,
  onMembersClick,
  onShowDueDateSection,
  onShowAttachmentsSection,
  onShowChecklistSection,
  isEmployee = false,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center max-w-full relative">
      {/* Members */}
      {assignees && assignees.length > 0 ? (
        <div
          className={`flex items-center gap-2 flex-wrap bg-white border rounded-lg shadow px-4 py-2 relative ${
            isEmployee ? "cursor-not-allowed opacity-75" : "cursor-pointer"
          }`}
          onClick={isEmployee ? undefined : onMembersClick}
        >
          <span className="text-sm font-semibold text-gray-700 mr-2">Members</span>
        </div>
      ) : (
        <div className="relative">
          <button
            className={`border rounded px-4 py-2 text-sm font-medium transition flex items-center gap-1 ${
              isEmployee ? "cursor-not-allowed opacity-75" : "hover:bg-blue-50"
            }`}
            type="button"
            onClick={isEmployee ? undefined : onMembersClick}
            disabled={isEmployee}
          >
            <UserGroupIcon className="w-4 h-4 mr-1" />
            Members
          </button>
        </div>
      )}

      {/* Action buttons for empty sections */}
      {!dueDate && !showDueDateSection && (
        <button
          className={`border rounded px-4 py-2 text-sm font-medium transition flex items-center gap-1 ${
            isEmployee ? "cursor-not-allowed opacity-75" : "hover:bg-blue-50"
          }`}
          type="button"
          onClick={isEmployee ? undefined : onShowDueDateSection}
          disabled={isEmployee}
        >
          <CalendarIcon className="w-4 h-4 mr-1" />
          Due Date
        </button>
      )}
      {(!attachments || attachments.length === 0) && !showAttachmentsSection && (
        <button
          className="border rounded px-4 py-2 text-sm font-medium transition flex items-center gap-1 hover:bg-blue-50"
          type="button"
          onClick={onShowAttachmentsSection}
        >
          <PaperClipIcon className="w-4 h-4 mr-1" />
          Attachments
        </button>
      )}
      {(!checklist || checklist.length === 0) && !showChecklistSection && (
        <button
          className="border rounded px-4 py-2 text-sm font-medium transition flex items-center gap-1 hover:bg-blue-50"
          type="button"
          onClick={onShowChecklistSection}
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Checklist
        </button>
      )}
    </div>
  );
};
