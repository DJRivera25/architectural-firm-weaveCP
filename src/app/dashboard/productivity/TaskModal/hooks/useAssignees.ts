import { useState, useCallback, useMemo, useEffect } from "react";
import type { User } from "@/types";
import {
  Assignee,
  isUserAssigned,
  filterUnassignedUsers,
  filterAssignedUsers,
  addAssignee as addAssigneeUtil,
  removeAssignee as removeAssigneeUtil,
} from "../utils/assigneeUtils";

interface UseAssigneesProps {
  users: User[];
  initialAssignees?: Assignee[] | string[];
  onAssigneesChange?: (assignees: Assignee[]) => void;
}

export const useAssignees = ({ users, initialAssignees = [], onAssigneesChange }: UseAssigneesProps) => {
  // Convert string[] to Assignee[] if needed
  const convertedInitialAssignees = useMemo(() => {
    if (!initialAssignees || initialAssignees.length === 0) return [];
    return initialAssignees.map((assignee) => (typeof assignee === "string" ? assignee : assignee)) as Assignee[];
  }, [initialAssignees]);

  const [assignees, setAssignees] = useState<Assignee[]>(convertedInitialAssignees);
  const [memberSearch, setMemberSearch] = useState("");

  // Update assignees when initialAssignees changes
  useEffect(() => {
    setAssignees(convertedInitialAssignees);
  }, [convertedInitialAssignees]);

  // Memoized filtered users
  const assignedUsers = useMemo(() => filterAssignedUsers(users, assignees), [users, assignees]);

  const unassignedUsers = useMemo(() => filterUnassignedUsers(users, assignees), [users, assignees]);

  const filteredUnassignedUsers = useMemo(
    () =>
      unassignedUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
          user.email?.toLowerCase().includes(memberSearch.toLowerCase())
      ),
    [unassignedUsers, memberSearch]
  );

  // Actions
  const addAssignee = useCallback(
    (userId: string) => {
      const newAssignees = addAssigneeUtil(assignees, userId);
      setAssignees(newAssignees);
      onAssigneesChange?.(newAssignees);
    },
    [assignees, onAssigneesChange]
  );

  const removeAssignee = useCallback(
    (userId: string) => {
      const newAssignees = removeAssigneeUtil(assignees, userId);
      setAssignees(newAssignees);
      onAssigneesChange?.(newAssignees);
    },
    [assignees, onAssigneesChange]
  );

  const isAssigned = useCallback((userId: string) => isUserAssigned(userId, assignees), [assignees]);

  const updateAssignees = useCallback(
    (newAssignees: Assignee[]) => {
      setAssignees(newAssignees);
      onAssigneesChange?.(newAssignees);
    },
    [onAssigneesChange]
  );

  return {
    // State
    assignees,
    memberSearch,
    assignedUsers,
    unassignedUsers,
    filteredUnassignedUsers,

    // Actions
    addAssignee,
    removeAssignee,
    isAssigned,
    updateAssignees,
    setMemberSearch,
  };
};
