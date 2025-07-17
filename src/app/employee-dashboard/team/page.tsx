"use client";

import { useEffect, useState } from "react";
import EmployeeDashboardLayout from "@/components/layout/EmployeeDashboardLayout";
import { getTeams, getUsers } from "@/utils/api";
import { ITeam } from "@/models/Team";
import { IUser } from "@/models/User";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useSession } from "next-auth/react";

function isUser(obj: unknown): obj is IUser {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "_id" in obj &&
    typeof (obj as unknown as { _id?: unknown })._id === "string" &&
    "name" in obj &&
    typeof (obj as unknown as { name?: unknown }).name === "string"
  );
}

export default function EmployeeTeamPage() {
  const { data: session } = useSession();
  const [team, setTeam] = useState<ITeam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        if (!session?.user?.id) return;
        const teamsRes = await getTeams();
        const found = teamsRes.data.find((t) => {
          if (
            t.manager &&
            typeof t.manager === "object" &&
            "_id" in t.manager &&
            String(t.manager._id) === session.user.id
          ) {
            return true;
          }
          // Check members
          if (Array.isArray(t.members)) {
            return t.members.some((m) => typeof m === "object" && "_id" in m && String(m._id) === session.user.id);
          }
          return false;
        });
        setTeam(found || null);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [session]);

  if (loading) {
    return (
      <EmployeeDashboardLayout>
        <div className="p-8">Loading team info...</div>
      </EmployeeDashboardLayout>
    );
  }

  if (!team) {
    return (
      <EmployeeDashboardLayout>
        <div className="p-8">You are not assigned to any team.</div>
      </EmployeeDashboardLayout>
    );
  }

  const manager = isUser(team.manager) ? team.manager : null;
  const members = Array.isArray(team.members) ? team.members.filter(isUser) : [];

  return (
    <EmployeeDashboardLayout>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Team</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="text-lg font-semibold">Team Name:</div>
            <div>{team.name}</div>
          </div>
          <div className="mb-4">
            <div className="text-lg font-semibold">Manager:</div>
            {manager ? (
              <div className="flex items-center gap-2 mt-1">
                {manager.image && <Avatar src={manager.image} alt={manager.name} size="sm" />}
                <span>{manager.name}</span>
                <Badge>{manager.position || manager.role}</Badge>
              </div>
            ) : (
              <Badge>Unassigned</Badge>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold mb-2">Members:</div>
            <div className="flex flex-col gap-2">
              {members.map((member) =>
                isUser(member) ? (
                  <div key={member._id as string} className="flex items-center gap-2">
                    {member.image && <Avatar src={member.image} alt={member.name} size="sm" />}
                    <span>{member.name}</span>
                    <Badge>{member.position || member.role}</Badge>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </EmployeeDashboardLayout>
  );
}
