"use client";

import {
  UsersIcon,
  ClockIcon,
  CalendarDaysIcon,
  ClipboardIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

import { AnalyticsMetric } from "@/types";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetric[];
  chartData?: ChartData;
  recentActivities?: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status: string;
  }>;
  quickActions?: Array<{
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    color: string;
    bgColor: string;
  }>;
  title?: string;
  subtitle?: string;
  showChart?: boolean;
  showActivities?: boolean;
  showQuickActions?: boolean;
}

export default function AnalyticsDashboard({
  metrics,
  chartData,
  recentActivities = [],
  quickActions = [],
  title = "Analytics Dashboard",
  subtitle = "Overview of key metrics and performance indicators",
  showChart = false,
  showActivities = true,
  showQuickActions = true,
}: AnalyticsDashboardProps) {
  const MetricCard = ({ metric }: { metric: AnalyticsMetric }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow ${metric.bgColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{metric.title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
          {metric.change !== undefined && (
            <div
              className={`flex items-center mt-2 text-sm ${
                metric.changeType === "increase" ? "text-green-600" : "text-red-600"
              }`}
            >
              {metric.changeType === "increase" ? (
                <ArrowUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 mr-1" />
              )}
              {Math.abs(metric.change)}%
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${metric.color}`}>{metric.icon}</div>
      </div>
    </div>
  );

  const ActivityItem = ({
    activity,
  }: {
    activity: {
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      status: string;
    };
  }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "completed":
        case "approved":
          return "text-green-600 bg-green-100";
        case "pending":
          return "text-yellow-600 bg-yellow-100";
        case "rejected":
          return "text-red-600 bg-red-100";
        default:
          return "text-gray-600 bg-gray-100";
      }
    };

    const getTypeIcon = (type: string) => {
      switch (type) {
        case "task":
          return <ClipboardIcon className="w-5 h-5" />;
        case "leave":
          return <CalendarDaysIcon className="w-5 h-5" />;
        case "time":
          return <ClockIcon className="w-5 h-5" />;
        case "user":
          return <UsersIcon className="w-5 h-5" />;
        default:
          return <ClipboardIcon className="w-5 h-5" />;
      }
    };

    return (
      <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
            {getTypeIcon(activity.type)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
          <p className="text-sm text-gray-500">{activity.description}</p>
        </div>
        <div className="flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
              activity.status
            )}`}
          >
            {activity.status}
          </span>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-400">{new Date(activity.timestamp).toLocaleDateString()}</div>
      </div>
    );
  };

  const SimpleChart = ({ data }: { data: ChartData }) => {
    const maxValue = Math.max(...data.datasets[0].data);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
        <div className="flex items-end space-x-2 h-32">
          {data.datasets[0].data.map((value, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-200 rounded-t transition-all duration-300 hover:bg-blue-300"
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  minHeight: "4px",
                }}
              ></div>
              <span className="text-xs text-gray-500 mt-1">{data.labels[index]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric: AnalyticsMetric, index: number) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Chart and Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        {showChart && chartData && (
          <div className="lg:col-span-2">
            <SimpleChart data={chartData} />
          </div>
        )}

        {/* Recent Activities */}
        {showActivities && (
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${showChart ? "" : "lg:col-span-3"}`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map(
                  (
                    activity: {
                      id: string;
                      type: string;
                      title: string;
                      description: string;
                      timestamp: string;
                      status: string;
                    },
                    index: number
                  ) => <ActivityItem key={activity.id} activity={activity} />
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {showQuickActions && quickActions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map(
              (
                action: { onClick: () => void; title: string; bgColor: string; color: string; icon: React.ReactNode },
                index: number
              ) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`flex items-center p-4 ${action.bgColor} hover:opacity-80 rounded-lg transition-all`}
                >
                  <div className={action.color}>{action.icon}</div>
                  <span
                    className={`text-sm font-medium ml-3 ${action.color
                      .replace("text-", "text-")
                      .replace("-600", "-900")}`}
                  >
                    {action.title}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined metric configurations
export const createMetric = (
  title: string,
  value: string | number,
  icon: React.ReactNode,
  change?: number,
  changeType?: "increase" | "decrease"
): AnalyticsMetric => ({
  title,
  value,
  change,
  changeType,
  icon,
  color: "text-blue-600",
  bgColor: "bg-blue-50",
});

export const createTaskMetric = (value: number, change?: number): AnalyticsMetric => ({
  title: "Total Tasks",
  value,
  change,
  changeType: change && change > 0 ? "increase" : "decrease",
  icon: <ClipboardIcon className="w-6 h-6 text-blue-600" />,
  color: "text-blue-600",
  bgColor: "bg-blue-50",
});

export const createCompletionMetric = (value: number, change?: number): AnalyticsMetric => ({
  title: "Completion Rate",
  value: `${value.toFixed(1)}%`,
  change,
  changeType: change && change > 0 ? "increase" : "decrease",
  icon: <CheckCircleIcon className="w-6 h-6 text-green-600" />,
  color: "text-green-600",
  bgColor: "bg-green-50",
});

export const createTimeMetric = (value: number, change?: number): AnalyticsMetric => ({
  title: "Total Hours",
  value: `${value.toFixed(1)}h`,
  change,
  changeType: change && change > 0 ? "increase" : "decrease",
  icon: <ClockIcon className="w-6 h-6 text-purple-600" />,
  color: "text-purple-600",
  bgColor: "bg-purple-50",
});

export const createTeamMetric = (value: number, change?: number): AnalyticsMetric => ({
  title: "Team Members",
  value,
  change,
  changeType: change && change > 0 ? "increase" : "decrease",
  icon: <UsersIcon className="w-6 h-6 text-orange-600" />,
  color: "text-orange-600",
  bgColor: "bg-orange-50",
});
