interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  trend?: string;
  trendPositive?: boolean;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconColor,
  iconBg,
  trend,
  trendPositive = true,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-2 ${iconBg} rounded-lg`}>
          <i className={`${icon} ${iconColor} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <span className={`text-sm ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
            <i className={`fas fa-${trendPositive ? 'arrow-up' : 'exclamation-triangle'} text-xs mr-1`}></i>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
