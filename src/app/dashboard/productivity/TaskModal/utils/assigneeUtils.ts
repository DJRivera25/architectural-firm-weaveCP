import type { User } from "@/types";

export type Assignee = string | { _id: string; name: string };

/**
 * Check if a user is assigned to a task
 */
export const isUserAssigned = (userId: string, assignees: Assignee[]): boolean => {
  return assignees.some((assignee) => {
    if (typeof assignee === "string") {
      return assignee === userId;
    } else if (typeof assignee === "object" && assignee !== null && "_id" in assignee) {
      return assignee._id === userId;
    }
    return false;
  });
};

/**
 * Filter users to show only unassigned ones
 */
export const filterUnassignedUsers = (users: User[], assignees: Assignee[]): User[] => {
  return users.filter((user) => !isUserAssigned(user._id, assignees));
};

/**
 * Filter users to show only assigned ones
 */
export const filterAssignedUsers = (users: User[], assignees: Assignee[]): User[] => {
  return users.filter((user) => isUserAssigned(user._id, assignees));
};

/**
 * Remove a user from assignees array
 */
export const removeAssignee = (assignees: Assignee[], userId: string): Assignee[] => {
  return assignees.filter((assignee) => {
    if (typeof assignee === "string") {
      return assignee !== userId;
    } else if (typeof assignee === "object" && assignee !== null && "_id" in assignee) {
      return assignee._id !== userId;
    }
    return true;
  });
};

/**
 * Add a user to assignees array (prevents duplicates)
 */
export const addAssignee = (assignees: Assignee[], userId: string): Assignee[] => {
  if (isUserAssigned(userId, assignees)) {
    return assignees; // Already assigned
  }
  return [...assignees, userId];
};
