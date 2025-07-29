import React from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { User } from "@/types";
import type { Assignee } from "../utils/assigneeUtils";

interface AssigneesSectionProps {
  assignedUsers: User[];
  onRemoveAssignee: (userId: string) => void;
  isEmployee?: boolean;
}

export const AssigneesSection: React.FC<AssigneesSectionProps> = ({
  assignedUsers,
  onRemoveAssignee,
  isEmployee = false,
}) => {
  if (assignedUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      <span className="text-sm font-semibold text-gray-700 mr-2">
        {isEmployee ? "Assigned Members (View Only):" : "Assigned Members:"}
      </span>
      {assignedUsers.map((user) => (
        <div key={user._id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
          <Avatar src={user.image} alt={user.name || "?"} size="sm" />
          <span className="text-xs text-gray-800 font-medium">{user.name}</span>
          {!isEmployee && (
            <button
              className="ml-1 text-gray-400 hover:text-red-500 text-xs font-bold"
              onClick={() => onRemoveAssignee(user._id)}
              type="button"
              aria-label="Remove member"
            >
              ×
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
