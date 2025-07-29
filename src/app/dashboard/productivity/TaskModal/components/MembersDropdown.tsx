import React, { useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { User } from "@/types";
import type { Assignee } from "../utils/assigneeUtils";

interface MembersDropdownProps {
  users: User[];
  assignedUsers: User[];
  filteredUnassignedUsers: User[];
  memberSearch: string;
  onMemberSearchChange: (search: string) => void;
  onAddAssignee: (userId: string) => void;
  onRemoveAssignee: (userId: string) => void;
  onClose: () => void;
}

export const MembersDropdown: React.FC<MembersDropdownProps> = ({
  users,
  assignedUsers,
  filteredUnassignedUsers,
  memberSearch,
  onMemberSearchChange,
  onAddAssignee,
  onRemoveAssignee,
  onClose,
}) => {
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full mt-1 z-[9999] bg-white border rounded-xl shadow-xl w-96 p-4 flex flex-col"
      style={{ minWidth: 320 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">Members</span>
        <button
          className="text-gray-400 hover:text-blue-600 text-xl font-bold px-2"
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <input
        type="text"
        placeholder="Search members"
        value={memberSearch}
        onChange={(e) => onMemberSearchChange(e.target.value)}
        className="border rounded px-3 py-2 w-full mb-3 focus:ring-2 focus:ring-blue-200"
      />
      <div className="text-xs text-gray-500 mb-1">Project members</div>
      <div className="flex flex-col gap-1">
        {assignedUsers.length === 0 && <div className="text-gray-400 text-sm">No members yet.</div>}
        {assignedUsers.map((user) => (
          <div key={user._id} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-blue-50">
            <Avatar src={user.image} alt={user.name || "?"} size="sm" />
            <span className="font-medium text-gray-900">{user.name}</span>
            <button
              className="ml-auto text-gray-400 hover:text-red-500 text-lg"
              type="button"
              onClick={() => onRemoveAssignee(user._id)}
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 text-xs text-gray-500 mb-1">Add project members</div>
      <ul className="space-y-1 max-h-32 overflow-y-auto">
        {filteredUnassignedUsers.map((user) => (
          <li key={user._id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-blue-50">
            <Avatar src={user.image} alt={user.name || "?"} size="sm" />
            <span className="text-gray-900">{user.name}</span>
            <button
              className="ml-auto text-blue-600 hover:text-blue-800 text-sm font-semibold"
              type="button"
              onClick={() => onAddAssignee(user._id)}
            >
              Add
            </button>
          </li>
        ))}
        {filteredUnassignedUsers.length === 0 && <li className="text-gray-400 text-sm px-2">No users found.</li>}
      </ul>
    </div>
  );
};
