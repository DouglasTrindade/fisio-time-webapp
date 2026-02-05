"use client";

interface DroppableTimeBlockProps {
  date: Date;
  hour: number;
  minute: number;
  children: React.ReactNode;
}

export function DroppableTimeBlock({ children }: DroppableTimeBlockProps) {
  return <div className="h-[24px]">{children}</div>;
}
