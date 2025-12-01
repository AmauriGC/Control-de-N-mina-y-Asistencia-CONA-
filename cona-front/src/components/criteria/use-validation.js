import {useMemo, useState} from "react";
import {passwordValidationRules, rulesLib as sharedRulesLib, sanitize} from "@/components/criteria/criteria";

export function useFieldValidation(initialValue = "", rules = [], sanitizer = null) {
    const [value, setValue] = useState(initialValue);
    const [touched, setTouched] = useState(false);

    const sanitizedValue = useMemo(() => {
        if (sanitizer && typeof sanitizer === 'function') {
            return sanitizer(value);
        }
        return value;
    }, [value, sanitizer]);

    const rawError = useMemo(() => {
        for (const rule of rules) {
            try {
                if (!rule.test(sanitizedValue)) return rule.message;
            } catch (e) {
                return rule.message || "Valor inválido";
            }
        }
        return "";
    }, [sanitizedValue, rules]);

    const onChange = (e) => {
        const v = e?.target ? e.target.value : e;
        if (!touched) setTouched(true);
        setValue(v);
    };
    const onBlur = () => setTouched(true);
    const reset = () => {
        setValue(initialValue);
        setTouched(false);
    };
    const isValid = !rawError;
    const error = touched ? rawError : "";
    const showError = touched && !!rawError;

    return {value: sanitizedValue, setValue, error, isValid, onChange, onBlur, reset, touched, showError, rawValue: value};
}

export function makeRules(...ruleDefs) {
    return ruleDefs;
}

export const rulesLib = sharedRulesLib;

export {passwordValidationRules};

export function useBackendErrors(initial = {}) {
    const [errors, setErrors] = useState(initial);
    const setFromList = (list = []) => {
        // list elementos tipo "field: message" o solo "message"
        const mapped = {};
        list.forEach((e) => {
            if (typeof e === 'string' && e.includes(':')) {
                const [field, msg] = e.split(':');
                mapped[field.trim()] = msg.trim();
            } else if (typeof e === 'string') {
                mapped._general = e;
            }
        });
        setErrors(mapped);
    };
    const getFieldError = (field) => errors[field] || '';
    const getGeneralError = () => errors._general || '';
    const reset = () => setErrors({});
    return {errors, setErrors, setFromList, getFieldError, getGeneralError, reset};
}
