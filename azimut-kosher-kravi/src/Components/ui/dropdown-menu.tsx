import React, { useState } from 'react';

interface DropdownMenuProps {
  children: React.ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === DropdownMenuTrigger) {
            return React.cloneElement(child, { onClick: () => setIsOpen(!isOpen) });
          }
          if (child.type === DropdownMenuContent) {
            return isOpen ? React.cloneElement(child, { onClose: () => setIsOpen(false) }) : null;
          }
        }
        return child;
      })}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
  onClick?: () => void;
}

export function DropdownMenuTrigger({ children, onClick }: DropdownMenuTriggerProps) {
  return React.cloneElement(children, { onClick });
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
  onClose?: () => void;
}

export function DropdownMenuContent({ children, align = 'start', className = '', onClose }: DropdownMenuContentProps) {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className={`absolute top-full mt-2 ${alignmentClasses[align]} z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 ${className}`}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child) && child.type === DropdownMenuItem) {
            return React.cloneElement(child, { onMenuClose: onClose });
          }
          return child;
        })}
      </div>
    </>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMenuClose?: () => void;
}

export function DropdownMenuItem({ children, className = '', onClick, onMenuClose }: DropdownMenuItemProps) {
  const handleClick = () => {
    onClick?.();
    onMenuClose?.();
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-right ${className}`}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}