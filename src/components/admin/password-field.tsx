"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * A password input you can read back while typing it.
 *
 * This is for setting a password, not recovering one. Stored passwords are
 * hashed by Supabase Auth and cannot be shown here or anywhere else — that is
 * the point of hashing them. What the toggle fixes is the narrower problem of
 * an admin typing a password they then have to read out to somebody, and
 * having no way to check they typed what they meant.
 */
export function PasswordField({
  name = "password",
  placeholder,
  minLength = 8,
  required = false,
  className = "",
}: {
  name?: string;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        minLength={minLength}
        required={required}
        placeholder={placeholder}
        className={`${className} pr-8`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
