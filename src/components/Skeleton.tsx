/**
 * Shared skeleton wrapper for loading states.
 * Wraps react-loading-skeleton with project default styles.
 */
import React from 'react';
import ReactSkeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SkeletonProps {
  count?: number;
  height?: number | string;
  width?: number | string;
  borderRadius?: number | string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ count = 1, height, width, borderRadius = 12, className }) => {
  return (
    <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a4e">
      <ReactSkeleton
        count={count}
        height={height}
        width={width}
        borderRadius={borderRadius}
        className={className}
        inline={false}
      />
    </SkeletonTheme>
  );
}

/** Row skeleton for table-like loading states */
export const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a4e">
      <div className="grid gap-4 px-6 py-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <span key={i}><ReactSkeleton height={16} borderRadius={8} /></span>
        ))}
      </div>
    </SkeletonTheme>
  );
};

/** Card skeleton for dashboard stat cards */
export const SkeletonCard: React.FC = () => {
  return (
    <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a4e">
      <div className="rounded-2xl border border-white/5 p-6 space-y-4 bg-bg-card">
        <div className="flex justify-between items-start">
          <ReactSkeleton width={40} height={40} borderRadius={12} />
          <ReactSkeleton width={50} height={20} borderRadius={8} />
        </div>
        <ReactSkeleton width={80} height={12} borderRadius={6} />
        <ReactSkeleton width={120} height={32} borderRadius={8} />
      </div>
    </SkeletonTheme>
  );
};

/** Base Skeleton with key-safe interface for arrays */
export const SkeletonItem: React.FC<SkeletonProps> = ({ count = 1, height, width, borderRadius = 12, className }) => (
  <SkeletonTheme baseColor="#1a1a2e" highlightColor="#2a2a4e">
    <ReactSkeleton count={count} height={height} width={width} borderRadius={borderRadius} className={className} inline={false} />
  </SkeletonTheme>
);
