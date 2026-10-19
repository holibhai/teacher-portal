import React from 'react';
import { MaterialStatus } from '../types';
import { MATERIAL_STATUS_CONFIG } from '../constants';

interface MaterialStatusBadgeProps {
  status: MaterialStatus;
  size?: 'sm' | 'md';
}

export const MaterialStatusBadge: React.FC<MaterialStatusBadgeProps> = ({
  status,
  size = 'sm',
}) => {
  const config = MATERIAL_STATUS_CONFIG[status] || {
    label: status,
    badgeClasses: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: null,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full border ${
        config.badgeClasses
      } ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
