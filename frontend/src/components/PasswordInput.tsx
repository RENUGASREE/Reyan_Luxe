import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ containerClassName = '', ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className={`relative ${containerClassName}`}>
        <Input
          ref={ref}
          type={visible ? 'text' : 'password'}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    );
  }
);

export default PasswordInput;