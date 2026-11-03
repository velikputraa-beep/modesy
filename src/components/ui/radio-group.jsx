import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroupContext = React.createContext({
  value: undefined,
  onChange: () => {},
  name: undefined,
});

function RadioGroup({ className, value, defaultValue, onValueChange, name, children, ...props }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleChange = (val) => {
    if (!isControlled) {
      setInternalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <RadioGroupContext.Provider
      value={{
        value: currentValue,
        onChange: handleChange,
        name,
      }}
    >
      <div
        role="radiogroup"
        data-slot="radio-group"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

function RadioGroupItem({ className, value, id, ...props }) {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      onClick={() => context.onChange(value)}
      id={id}
      className={cn(
        "aspect-square size-4 rounded-full border border-gray-300 text-teal-600 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center transition-all cursor-pointer",
        isChecked ? "border-teal-600 bg-teal-600 text-white" : "bg-white",
        className
      )}
      {...props}
    >
      {isChecked && <span className="size-1.5 rounded-full bg-white" />}
    </button>
  );
}

export { RadioGroup, RadioGroupItem };
