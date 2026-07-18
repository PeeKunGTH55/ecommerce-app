"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  align?: "start" | "end" | "center";
  offset?: number;
}

export function Dropdown({ trigger, content, align = "end" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const dropdownContent = (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-2 min-w-[200px] origin-top-right rounded-xl bg-white border border-gray-200 shadow-xl py-1",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2"
      )}
      role="menu"
      onKeyDown={handleKeyDown}
    >
      {content}
    </div>
  );

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {isOpen && dropdownContent}
    </div>
  );
}

interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  danger?: boolean;
}

export function DropdownItem({ className, icon, danger, children, onClick, ...props }: DropdownItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    // Close dropdown after click
    const dropdown = document.querySelector('[role="menu"]');
    if (dropdown) {
      const trigger = dropdown.previousElementSibling;
      if (trigger instanceof HTMLElement) {
        trigger.click();
      }
    }
  };

  return (
    <button
      className={cn(
        "w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors",
        "hover:bg-gray-50 focus:outline-none focus:bg-gray-50",
        danger ? "text-red-600 hover:bg-red-50" : "text-gray-700",
        className
      )}
      onClick={handleClick}
      role="menuitem"
      {...props}
    >
      {icon && <span className="shrink-0 h-4 w-4">{icon}</span>}
      <span className="flex-1">{children}</span>
    </button>
  );
}

type DropdownDividerProps = React.HTMLAttributes<HTMLHRElement>;

export function DropdownDivider({ className, ...props }: DropdownDividerProps) {
  return <hr className={cn("my-1 border-gray-100", className)} {...props} role="separator" />;
}