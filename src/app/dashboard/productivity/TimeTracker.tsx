import React from "react";

interface TimeTrackerProps {
  projectId: string;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ projectId }) => {
  return (
    <div className="flex-1 bg-white rounded shadow p-4 min-h-[400px]">
      <div className="mb-2 text-xs text-gray-500">Project ID: {projectId}</div>
      Time Tracker (Clockify-like) coming soon...
    </div>
  );
};

export default TimeTracker;
