import * as React from "react";
import Field from "@/components/ui/field";
import { Input } from "@/components/ui/input";
export function TextField({
  id,
  label,
  description,
  field,
  type = "text",
  placeholder,
  disabled,
  className,
  inputProps,
  required = false,
}) {
  const labelText = required ? `${label} *` : label;
  const error = field?.showError ? field.error : "";
  const value = field ? field.value : undefined;
  const onChange = field ? field.onChange : undefined;
  const onBlur = field ? field.onBlur : undefined;
  return (
    <Field label={labelText} htmlFor={id} description={description} error={error} className={className}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        disabled={disabled}
        {...inputProps}
      />
    </Field>
  );
}

export default TextField;
