import {useMemo, useState} from "react";
import {passwordValidationRules, rulesLib as sharedRulesLib} from "@/components/criteria/criteria";

export function useFieldValidation(initialValue = "", rules = []) {
    const [value, setValue] = useState(initialValue);
    const [touched, setTouched] = useState(false);
    const rawError = useMemo(() => {
        for (const rule of rules) {
            try {
                if (!rule.test(value)) return rule.message;
            } catch (e) {
                return rule.message || "Valor inválido";
            }
        }
        return "";
    }, [value, rules]);

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

    return {value, setValue, error, isValid, onChange, onBlur, reset, touched, showError};
}

export function makeRules(...ruleDefs) {
    return ruleDefs;
}

export const rulesLib = sharedRulesLib;

export {passwordValidationRules};
