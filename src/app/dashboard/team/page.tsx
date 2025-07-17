"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getTeams, createTeam, updateTeam, deleteTeam, getUsers } from "@/utils/api";
import { ITeam } from "@/models/Team";
import { IUser } from "@/models/User";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/providers/ToastProvider";
import React from "react";

export default function TeamManager() {
  const [teams, setTeams] = useState<ITeam[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ITeam | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, usersRes] = await Promise.all([getTeams(), getUsers()]);
      setTeams(teamsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      showToast("Failed to load teams or users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; description?: string; members: string[]; manager?: string }) => {
    try {
      await createTeam(data);
      setShowModal(false);
      showToast("Team created successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to create team", "error");
    }
  };

  const handleUpdate = async (
    id: string,
    data: { name?: string; description?: string; members?: string[]; manager?: string }
  ) => {
    try {
      await updateTeam(id, data);
      setEditingTeam(null);
      showToast("Team updated successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to update team", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTeam(id);
      showToast("Team deleted successfully", "success");
      fetchData();
    } catch (err) {
      showToast("Failed to delete team", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const teamId = deleteTarget._id as string;
    try {
      await deleteTeam(teamId);
      showToast("Team deleted successfully", "success");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      showToast("Failed to delete team", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Management</h1>
          <Button onClick={() => setShowModal(true)}>Create Team</Button>
        </div>
        <DataTable<ITeam>
          columns={[
            { Header: "Name", accessor: "name" },
            {
              Header: "Manager",
              accessor: (row) => {
                if (
                  row.manager &&
                  typeof row.manager === "object" &&
                  "name" in row.manager &&
                  typeof row.manager.name === "string"
                ) {
                  const image =
                    "image" in row.manager && typeof row.manager.image === "string" ? row.manager.image : undefined;
                  return (
                    <div className="flex items-center gap-2">
                      <Avatar src={image} alt={row.manager.name} size="sm" />
                      {row.manager.name}
                    </div>
                  );
                }
                const managerId = typeof row.manager === "string" ? row.manager : row.manager?.toString();
                const manager = users.find((u) => u._id === managerId);
                return manager ? (
                  <div className="flex items-center gap-2">
                    <Avatar src={manager.image} alt={manager.name} size="sm" />
                    {manager.name}
                  </div>
                ) : (
                  <Badge>Unassigned</Badge>
                );
              },
            },
            { Header: "Members", accessor: (row) => row.members.length },
            {
              Header: "Actions",
              accessor: (row) => (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingTeam(row)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteTarget(row)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={teams}
          loading={loading}
          skeletonRowCount={4}
        />
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogTitle>Create Team</DialogTitle>
            <TeamForm users={users} onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
          </DialogContent>
        </Dialog>
        <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
          <DialogContent>
            <DialogTitle>Edit Team</DialogTitle>
            {editingTeam && (
              <TeamForm
                users={users}
                team={editingTeam}
                onSubmit={(data) => {
                  if (!editingTeam._id) return;
                  const id = typeof editingTeam._id === "string" ? editingTeam._id : editingTeam._id.toString();
                  handleUpdate(id, data);
                }}
                onCancel={() => setEditingTeam(null)}
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogTitle>Delete Team</DialogTitle>
            <div className="mb-4">
              Are you sure you want to delete the team <span className="font-semibold">{deleteTarget?.name}</span>? This
              action cannot be undone.
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function TeamForm({
  users,
  team,
  onSubmit,
  onCancel,
}: {
  users: IUser[];
  team?: ITeam;
  onSubmit: (data: { name: string; description?: string; members: string[]; manager?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(team?.name || "");
  const [description, setDescription] = useState(team?.description || "");
  const [members, setMembers] = useState<string[]>(team ? team.members.map((m) => m.toString()) : []);
  const [manager, setManager] = useState<string | undefined>(team?.manager?.toString());
  const [touched, setTouched] = useState(false);
  const nameRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nameRef.current) nameRef.current.focus();
  }, []);

  const nameError = touched && !name.trim() ? "Team name is required" : undefined;
  const membersError = touched && members.length === 0 ? "Select at least one member" : undefined;
  const isValid = name.trim() && members.length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (!isValid) return;
        onSubmit({ name, description, members, manager });
      }}
      className="space-y-4"
    >
      <Input
        label="Team Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        ref={nameRef}
        error={nameError}
      />
      <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Select
        label="Members"
        multiple
        value={members}
        onChange={(e) => setMembers(Array.from(e.target.selectedOptions).map((opt) => opt.value))}
        required
      >
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name} ({u.email})
          </option>
        ))}
      </Select>
      {membersError && <div className="text-red-600 text-sm mt-1">{membersError}</div>}
      <Select label="Manager" value={manager} onChange={(e) => setManager(e.target.value)}>
        <option value="">Unassigned</option>
        {users
          .filter((u) => members.includes(u._id))
          .map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
      </Select>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          {team ? "Update" : "Create"} Team
        </Button>
      </div>
    </form>
  );
}
