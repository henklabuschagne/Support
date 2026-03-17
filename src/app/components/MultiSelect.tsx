import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChevronDown, X, Search } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  color?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  allLabel?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  className = '',
  allLabel = 'All',
  enableSearch = false,
  searchPlaceholder = 'Search...',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = selected
    .map(v => options.find(o => o.value === v))
    .filter(Boolean);

  const filteredOptions = enableSearch && searchQuery.trim()
    ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Auto-enable search when there are many options
  const showSearch = enableSearch || options.length > 8;

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setSearchQuery('');
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`justify-between min-h-[36px] h-auto py-1.5 ${className}`}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selected.length === 0 ? (
              <span className="text-gray-500">{allLabel}</span>
            ) : selected.length <= 2 ? (
              selectedLabels.map(opt => (
                <Badge
                  key={opt!.value}
                  variant="outline"
                  className="text-xs py-0 px-1.5 gap-0.5"
                >
                  {opt!.color && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt!.color }}
                    />
                  )}
                  {opt!.label}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="text-xs py-0 px-1.5">
                {selected.length} selected
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            {selected.length > 0 && (
              <X
                className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600"
                onClick={clearAll}
              />
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {showSearch && (
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
              autoFocus
            />
          </div>
        )}
        <div className="space-y-0.5 max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-2 py-3 text-center text-sm text-gray-500">
              No results found
            </div>
          ) : (
            filteredOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
              >
                <Checkbox
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => toggleOption(option.value)}
                />
                {option.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="text-sm truncate">{option.label}</span>
              </label>
            ))
          )}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-gray-100 mt-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 text-gray-500"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
