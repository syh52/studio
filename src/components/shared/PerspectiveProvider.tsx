"use client";
import React from 'react';

export default function PerspectiveProvider({ children }: { children: React.ReactNode }) {
  // 移除所有动画效果，避免阻挡按钮点击
  return <>{children}</>;
} 