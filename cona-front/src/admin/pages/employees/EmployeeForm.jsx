import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Field from "@/components/ui/field";
import {makeRules, rulesLib, useFieldValidation} from "@/components/criteria/use-validation";
import {alertConfig} from "@/lib/alert-config";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Calendar} from "@/components/ui/calendar";

function EmployeeForm({onSave, onClose, editingEmployee}) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        position: "",
        rfc: "",
        hourlyRate: "",
        contractType: "",
        contractStartDate: "",
        contractEndDate: "",
        bankAccount: "",
        bankName: "",
        clabe: "",
        workSchedule: "",
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    useEffect(() => {
        if (editingEmployee) {
            setFormData({
                fullName: editingEmployee.fullName || "",
                email: editingEmployee.email || "",
                phone: editingEmployee.phone || "",
                position: editingEmployee.position || "",
                rfc: editingEmployee.rfc || "",
                hourlyRate: editingEmployee.hourlyRate ? editingEmployee.hourlyRate.toString() : "",
                contractType: editingEmployee.contractType || "",
                contractStartDate: editingEmployee.contractStartDate || "",
                contractEndDate: editingEmployee.contractEndDate || "",
                bankAccount: editingEmployee.bankAccount || "",
                bankName: editingEmployee.bankName || "",
                clabe: editingEmployee.clabe || "",
                workSchedule: editingEmployee.workSchedule ? editingEmployee.workSchedule.toString() : "",
            });
            // Update field values
            fullNameField.onChange({target: {value: editingEmployee.fullName || ""}});
            emailField.onChange({target: {value: editingEmployee.email || ""}});
            phoneField.onChange({target: {value: editingEmployee.phone || ""}});
            positionField.onChange({target: {value: editingEmployee.position || ""}});
            rfcField.onChange({target: {value: editingEmployee.rfc || ""}});
            hourlyRateField.onChange({target: {value: editingEmployee.hourlyRate ? editingEmployee.hourlyRate.toString() : ""}});
            bankAccountField.onChange({target: {value: editingEmployee.bankAccount || ""}});
            bankNameField.onChange({target: {value: editingEmployee.bankName || ""}});
            clabeField.onChange({target: {value: editingEmployee.clabe || ""}});
            contractEndDateField.onChange({target: {value: editingEmployee.contractEndDate || ""}});
            setCurrentStep(1);
        } else {
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                position: "",
                rfc: "",
                hourlyRate: "",
                contractType: "",
                contractStartDate: "",
                contractEndDate: "",
                bankAccount: "",
                bankName: "",
                clabe: "",
                workSchedule: "",
            });
            setCurrentStep(1);
        }
    }, [editingEmployee]);

    const fullNameField = useFieldValidation(
        formData.fullName || "",
        makeRules(
            rulesLib.required("El nombre completo es obligatorio"),
            rulesLib.onlyLettersAndSpaces("El nombre debe contener solo letras y espacios"),
            rulesLib.minLength(2, "Mínimo 2 caracteres"),
            rulesLib.maxLength(100, "Máximo 100 caracteres")
        )
    );
    const emailField = useFieldValidation(
        formData.email || "",
        makeRules(
            rulesLib.required("El correo es obligatorio"),
            rulesLib.email()
        )
    );
    const phoneField = useFieldValidation(
        formData.phone || "",
        makeRules(
            rulesLib.required("El teléfono es obligatorio"),
            rulesLib.phoneMX("Formato de teléfono inválido")
        )
    );
    const positionField = useFieldValidation(
        formData.position || "",
        makeRules(
            rulesLib.required("El puesto es obligatorio"),
            rulesLib.minLength(2, "Mínimo 2 caracteres"),
            rulesLib.maxLength(50, "Máximo 50 caracteres")
        )
    );
    const rfcField = useFieldValidation(
        formData.rfc || "",
        makeRules(
            rulesLib.required("El RFC es obligatorio"),
            rulesLib.rfcMX("Formato de RFC inválido")
        )
    );
    const hourlyRateField = useFieldValidation(
        formData.hourlyRate || "",
        makeRules(
            rulesLib.required("El pago por hora es obligatorio"),
            rulesLib.decimal2("Formato inválido, máximo 2 decimales")
        )
    );
    const bankAccountField = useFieldValidation(
        formData.bankAccount || "",
        makeRules(
            rulesLib.maxLength(20, "Máximo 20 caracteres")
        )
    );
    const bankNameField = useFieldValidation(
        formData.bankName || "",
        makeRules(
            rulesLib.maxLength(50, "Máximo 50 caracteres")
        )
    );
    const clabeField = useFieldValidation(
        formData.clabe || "",
        makeRules(
            rulesLib.clabe18("Debe contener exactamente 18 dígitos")
        )
    );

    const contractEndDateField = useFieldValidation(
        formData.contractEndDate || "",
        makeRules(
            rulesLib.required("La fecha de fin del contrato es obligatoria")
        )
    );

    const [submitting, setSubmitting] = useState(false);

    const nextStep = () => {
        if (currentStep === 1) {
            if (!fullNameField.isValid || !emailField.isValid || !phoneField.isValid || !positionField.isValid || !rfcField.isValid || !hourlyRateField.isValid) {
                alertConfig.toastError({title: "Faltan datos en el paso 1", text: "Revisa los campos con error"});
                return;
            }
        } else if (currentStep === 2) {
            if (!formData.contractType || !formData.contractStartDate || !formData.contractEndDate || !formData.workSchedule) {
                alertConfig.toastError({
                    title: "Faltan datos en el paso 2",
                    text: "Selecciona tipo de contrato, fechas y horario"
                });
                return;
            }
        }
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async () => {
        if (
            !fullNameField.isValid ||
            !emailField.isValid ||
            !phoneField.isValid ||
            !positionField.isValid ||
            !rfcField.isValid ||
            !hourlyRateField.isValid ||
            !formData.contractType ||
            !formData.contractStartDate ||
            !formData.contractEndDate ||
            !formData.workSchedule
        ) {
            alertConfig.toastError({title: "Faltan datos", text: "Revisa los campos con error"});
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                fullName: fullNameField.value,
                email: emailField.value,
                phone: phoneField.value,
                position: positionField.value,
                rfc: rfcField.value.toUpperCase(),
                hourlyRate: parseFloat(hourlyRateField.value),
                contractType: formData.contractType,
                contractStartDate: formData.contractStartDate,
                contractEndDate: contractEndDateField.value ? contractEndDateField.value : null,
                bankAccount: bankAccountField.value || null,
                bankName: bankNameField.value || null,
                clabe: clabeField.value || null,
                workSchedule: parseInt(formData.workSchedule),
            };
            await onSave(payload);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nombre Completo *" htmlFor="fullName" error={fullNameField.error}
                                   showError={fullNameField.showError}>
                                <Input
                                    id="fullName"
                                    placeholder="Juan Pérez García"
                                    value={fullNameField.value}
                                    onChange={fullNameField.onChange}
                                    onBlur={fullNameField.onBlur}
                                    aria-invalid={fullNameField.showError && !!fullNameField.error}
                                    disabled={submitting}
                                />
                            </Field>
                            <Field label="Correo Electrónico *" htmlFor="email" error={emailField.error}
                                   showError={emailField.showError}>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="juan@empresa.com"
                                    value={emailField.value}
                                    onChange={emailField.onChange}
                                    onBlur={emailField.onBlur}
                                    aria-invalid={emailField.showError && !!emailField.error}
                                    disabled={submitting}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Teléfono *" htmlFor="phone" error={phoneField.error}
                                   showError={phoneField.showError}>
                                <Input
                                    id="phone"
                                    placeholder="5512345678"
                                    value={phoneField.value}
                                    onChange={(e) => {
                                        phoneField.onChange(e);
                                        setFormData({...formData, phone: e.target.value});
                                    }}
                                    onBlur={phoneField.onBlur}
                                    aria-invalid={phoneField.showError && !!phoneField.error}
                                    disabled={submitting}
                                />
                            </Field>
                            <Field label="Puesto *" htmlFor="position" error={positionField.error}
                                   showError={positionField.showError}>
                                <Input
                                    id="position"
                                    placeholder="Operador"
                                    value={positionField.value}
                                    onChange={(e) => {
                                        positionField.onChange(e);
                                        setFormData({...formData, position: e.target.value});
                                    }}
                                    onBlur={positionField.onBlur}
                                    aria-invalid={positionField.showError && !!positionField.error}
                                    disabled={submitting}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field label="RFC *" htmlFor="rfc" error={rfcField.error} showError={rfcField.showError}>
                                <Input
                                    id="rfc"
                                    placeholder="GODE561231GR8"
                                    value={rfcField.value}
                                    onChange={(e) => {
                                        rfcField.onChange(e);
                                        setFormData({...formData, rfc: e.target.value});
                                    }}
                                    onBlur={rfcField.onBlur}
                                    aria-invalid={rfcField.showError && !!rfcField.error}
                                    disabled={submitting}
                                />
                            </Field>
                            <Field label="Pago por Hora (MXN) *" htmlFor="hourlyRate" error={hourlyRateField.error}
                                   showError={hourlyRateField.showError}>
                                <Input
                                    id="hourlyRate"
                                    inputMode="decimal"
                                    placeholder="100.00"
                                    value={hourlyRateField.value}
                                    onChange={(e) => {
                                        hourlyRateField.onChange(e);
                                        setFormData({...formData, hourlyRate: e.target.value});
                                    }}
                                    onBlur={hourlyRateField.onBlur}
                                    aria-invalid={hourlyRateField.showError && !!hourlyRateField.error}
                                    disabled={submitting}
                                />
                            </Field>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contractType">Tipo de Contrato *</Label>
                                <Select
                                    value={formData.contractType}
                                    onValueChange={(value) => setFormData({...formData, contractType: value})}
                                    disabled={submitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Tiempo Completo</SelectItem>
                                        <SelectItem value="PART_TIME">Medio Tiempo</SelectItem>
                                        <SelectItem value="CONTRACTOR">Contratista</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workSchedule">Horario de Trabajo *</Label>
                                <Select
                                    value={formData.workSchedule}
                                    onValueChange={(value) => setFormData({...formData, workSchedule: value})}
                                    disabled={submitting}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona horario"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Horario 1 (9:00 - 18:00)</SelectItem>
                                        <SelectItem value="2">Horario 2 (8:00 - 17:00)</SelectItem>
                                        {/* Asumir IDs de horarios, ajustar según backend */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="contractStartDate">Fecha Inicio Contrato *</Label>
                                <Calendar
                                    value={formData.contractStartDate ? new Date(formData.contractStartDate) : null}
                                    onChange={(d) => setFormData({
                                        ...formData,
                                        contractStartDate: d.toISOString().slice(0, 10)
                                    })}
                                    disabled={submitting}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contractEndDate">Fecha Fin Contrato *</Label>
                                <Calendar
                                    value={formData.contractEndDate ? new Date(formData.contractEndDate) : null}
                                    onChange={(d) => {
                                        const value = d ? d.toISOString().slice(0, 10) : "";
                                        setFormData({
                                            ...formData,
                                            contractEndDate: value
                                        });
                                        contractEndDateField.onChange({target: {value}});
                                    }}
                                    disabled={submitting}
                                    minDate={formData.contractStartDate ? new Date(formData.contractStartDate) : undefined}
                                />
                                {contractEndDateField.showError &&
                                    <p className="text-sm text-red-500">{contractEndDateField.error}</p>}
                            </div>
                        </div>
                    </>
                );
            case 3:
                return (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Cuenta Bancaria" htmlFor="bankAccount" error={bankAccountField.error}
                                   showError={bankAccountField.showError}>
                                <Input
                                    id="bankAccount"
                                    placeholder="0123456789"
                                    value={bankAccountField.value}
                                    onChange={(e) => {
                                        bankAccountField.onChange(e);
                                        setFormData({...formData, bankAccount: e.target.value});
                                    }}
                                    onBlur={bankAccountField.onBlur}
                                    aria-invalid={bankAccountField.showError && !!bankAccountField.error}
                                    disabled={submitting}
                                />
                            </Field>
                            <Field label="Nombre del Banco" htmlFor="bankName" error={bankNameField.error}
                                   showError={bankNameField.showError}>
                                <Input
                                    id="bankName"
                                    placeholder="BBVA"
                                    value={bankNameField.value}
                                    onChange={(e) => {
                                        bankNameField.onChange(e);
                                        setFormData({...formData, bankName: e.target.value});
                                    }}
                                    onBlur={bankNameField.onBlur}
                                    aria-invalid={bankNameField.showError && !!bankAccountField.error}
                                    disabled={submitting}
                                />
                            </Field>
                        </div>

                        <Field label="CLABE (18 dígitos)" htmlFor="clabe" error={clabeField.error}
                               showError={clabeField.showError}>
                            <Input
                                id="clabe"
                                inputMode="numeric"
                                placeholder="123456789012345678"
                                value={clabeField.value}
                                onChange={(e) => {
                                    clabeField.onChange(e);
                                    setFormData({...formData, clabe: e.target.value});
                                }}
                                onBlur={clabeField.onBlur}
                                aria-invalid={clabeField.showError && !!clabeField.error}
                                disabled={submitting}
                            />
                        </Field>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <form className="space-y-6">
            {/* Step Indicator */}
            <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                }`}
                            >
                                {step}
                            </div>
                            {step < 3 && (
                                <div
                                    className={`w-12 h-1 mx-2 ${
                                        step < currentStep ? "bg-primary" : "bg-muted"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {renderStep()}

            <div className="flex justify-between">
                <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || submitting}
                >
                    Anterior
                </Button>
                {currentStep < totalSteps ? (
                    <Button type="button" onClick={nextStep} disabled={submitting}>
                        Siguiente
                    </Button>
                ) : (
                    <Button type="button" onClick={handleSubmit} loading={submitting}>
                        {editingEmployee ? "Actualizar Empleado" : "Registrar Empleado"}
                    </Button>
                )}
            </div>
        </form>
    );
}

export default EmployeeForm;
