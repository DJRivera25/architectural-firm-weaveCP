import { Project } from "@/types";

interface ProjectNavProps {
  projects: Array<Project & { taskCount: number }>;
  selectedProjectId: string | null;
  onSelect: (projectId: string | null) => void;
}

export default function ProjectNav({ projects, selectedProjectId, onSelect }: ProjectNavProps) {
  return (
    <nav className="flex flex-col gap-1 w-full bg-white rounded-xl shadow p-2">
      <button
        className={`text-left px-3 py-2 rounded-lg font-semibold transition-colors w-full text-sm flex items-center gap-2 ${
          !selectedProjectId ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
        }`}
        onClick={() => onSelect(null)}
        aria-current={!selectedProjectId ? "page" : undefined}
      >
        <span className="truncate flex-1">All Projects</span>
      </button>
      {projects.map((project) => (
        <button
          key={project._id}
          className={`flex items-center justify-between text-left px-3 py-2 rounded-lg font-semibold transition-colors w-full text-sm gap-2 ${
            selectedProjectId === project._id ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
          }`}
          onClick={() => onSelect(project._id)}
          aria-current={selectedProjectId === project._id ? "page" : undefined}
        >
          <span className="truncate flex-1">{project.name}</span>
          <span
            className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
              selectedProjectId === project._id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {project.taskCount}
          </span>
        </button>
      ))}
    </nav>
  );
}
