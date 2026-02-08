"use client";

import { forwardRef, useMemo } from "react";

import { cn } from "@/lib/utils";

export type TimeValue = {
  hour: number;
  minute: number;
};

interface TimeInputProps {
  value?: TimeValue;
  onChange?: (value: TimeValue) => void;
  disabled?: boolean;
  "data-invalid"?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

const TimeInput = forwardRef<HTMLDivElement, TimeInputProps>(function TimeInput(
  { className, value, onChange, disabled, "data-invalid": dataInvalid, ...props },
  ref,
) {
  const selectedHour = value?.hour ?? 8;
  const selectedMinute = value?.minute ?? 0;

  const minuteOptions = useMemo(() => MINUTES, []);

  const handleHourChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const hour = Number(event.target.value);
    onChange?.({ hour, minute: selectedMinute });
  };

  const handleMinuteChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const minute = Number(event.target.value);
    onChange?.({ hour: selectedHour, minute });
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm",
        "focus-within:ring-1 focus-within:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        dataInvalid && "border-destructive",
        className,
      )}
      data-invalid={dataInvalid}
      {...props}
    >
      <select
        className="bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        value={selectedHour}
        onChange={handleHourChange}
        disabled={disabled}
        aria-label="Hora"
      >
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {hour.toString().padStart(2, "0")}
          </option>
        ))}
      </select>

      <span className="text-muted-foreground">:</span>

      <select
        className="bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        value={selectedMinute}
        onChange={handleMinuteChange}
        disabled={disabled}
        aria-label="Minuto"
      >
        {minuteOptions.map((minute) => (
          <option key={minute} value={minute}>
            {minute.toString().padStart(2, "0")}
          </option>
        ))}
      </select>
    </div>
  );
});

export { TimeInput };
