import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export function FilterSelect({
  placeholder = "Select...",
  value,
  onChange,
  options,
  className,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
