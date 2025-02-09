import { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  color?: 'primary' | 'secondary' | 'accent' | 'info';
}

export const Card = ({ title, value, icon, trend, onClick, color = 'primary' }: CardProps) => {
  return (
    <div
      className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 ${
        onClick ? 'cursor-pointer transform hover:-translate-y-1' : ''
      }`}
      onClick={onClick}
    >
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-base-content/70 text-sm">{title}</h2>
          {icon && (
            <div className={`text-2xl ${
              color === 'primary' ? 'text-primary' :
              color === 'secondary' ? 'text-secondary' :
              color === 'accent' ? 'text-accent' :
              'text-info'
            }`}>
              {icon}
            </div>
          )}
        </div>
        
        <div className="flex items-end gap-2 mt-2">
          <p className="text-3xl font-bold text-base-content">{value}</p>
          
          {trend && (
            <div
              className={`badge ${
                trend.isPositive ? 'badge-success' : 'badge-error'
              } gap-1 text-xs`}
            >
              {trend.isPositive ? '↑' : '↓'}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 