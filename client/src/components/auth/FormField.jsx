export default function FormField({
  label,
  name,
  type = 'text',
  autoComplete,
  placeholder,
  register,
  error,
  readOnly = false,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        readOnly={readOnly}
        {...register(name)}
        className={[
          'min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/60',
          readOnly ? 'cursor-not-allowed bg-surface text-muted' : '',
          error
            ? 'border-[#d1605a] focus:border-[#d1605a] focus:ring-4 focus:ring-[#d1605a]/10'
            : 'border-line focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10',
        ].join(' ')}
      />
      {error && <span className="text-xs font-bold text-[#a83d36]">{error}</span>}
    </label>
  );
}
