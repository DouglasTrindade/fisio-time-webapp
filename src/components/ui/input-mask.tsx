import React from 'react';
import { Input } from '@/components/ui/input';

interface InputMaskProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function applyMask(value: string, mask: string): string {
  if (!value) return '';

  const digits = value.replace(/\D/g, '');

  let masked = '';
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === '9') {
      masked += digits[digitIndex];
      digitIndex++;
    } else {
      masked += mask[i];
    }
  }

  return masked;
}

const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ mask, value = '', onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      const rawValue = inputValue.replace(/\D/g, '');
      const maskedValue = applyMask(rawValue, mask);

      const syntheticEvent = {
        ...event,
        target: {
          ...event.target,
          value: maskedValue,
        },
      };

      onChange?.(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    };

    const displayValue = applyMask(value, mask);

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
      />
    );
  }
);

InputMask.displayName = 'MaskedInput';
export { InputMask };