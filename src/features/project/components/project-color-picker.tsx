'use client';

type ProjectColorPickerProps = {
  value: string;
  onChange: (...event: unknown[]) => void;
  onBlur: () => void;
  name: string;
};

export default function ProjectColorPicker({
  value,
  onChange,
  onBlur,
  name,
}: ProjectColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="h-9 w-16 cursor-pointer rounded border-none bg-transparent"
        aria-label="Couleur du projet"
      />
    </div>
  );
}
