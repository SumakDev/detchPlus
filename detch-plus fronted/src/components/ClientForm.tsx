"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cliente, ClienteFormData, FormErrors } from "@/types/client";
import { AlertCircle, Check, User, Mail, Phone, MapPin, Activity } from "lucide-react";

interface ClientFormProps {
  cliente?: Cliente;
  onSubmit: (data: ClienteFormData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ClientForm({ cliente, onSubmit, onCancel, isEditing = false }: ClientFormProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    CED_CLI: cliente?.CED_CLI || "",
    NOM_CLI: cliente?.NOM_CLI || "",
    APE_CLI: cliente?.APE_CLI || "",
    DIR_CLI: cliente?.DIR_CLI || "",
    COR_CLI: cliente?.COR_CLI || "",
    NUM_CLI: cliente?.NUM_CLI || "",
    DIF_CLI: cliente?.DIF_CLI || "BAJA",
    ACTIVO: cliente?.ACTIVO ?? true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const firstErrorRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Enfocar primer error en validación
  useEffect(() => {
    if (Object.keys(errors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }
  }, [errors]);

  const validateField = (field: keyof ClienteFormData, value: string | boolean): string => {
    switch (field) {
      case 'CED_CLI':
        if (typeof value === 'string') {
          if (!value.trim()) return "La cédula es obligatoria";
          if (!/^\d{10}$/.test(value.trim())) return "La cédula debe tener 10 dígitos";
        }
        break;
      case 'NOM_CLI':
        if (typeof value === 'string' && !value.trim()) return "El nombre es obligatorio";
        if (typeof value === 'string' && value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres";
        break;
      case 'APE_CLI':
        if (typeof value === 'string' && !value.trim()) return "El apellido es obligatorio";
        if (typeof value === 'string' && value.trim().length < 2) return "El apellido debe tener al menos 2 caracteres";
        break;
      case 'COR_CLI':
        if (typeof value === 'string' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "El correo electrónico no es válido";
        }
        break;
      case 'NUM_CLI':
        if (typeof value === 'string' && value && !/^0\d{9}$/.test(value)) {
          return "El teléfono debe tener 10 dígitos y empezar con 0";
        }
        break;
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    Object.keys(formData).forEach(key => {
      const field = key as keyof ClienteFormData;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Anunciar errores al screen reader
      const errorCount = Object.keys(errors).length;
      const announcement = `Se encontraron ${errorCount} errores en el formulario. Por favor, corrígelos antes de continuar.`;
      
      // Crear elemento para anuncio
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      
      setTimeout(() => document.body.removeChild(announcer), 1000);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit(formData);
      setSubmitStatus('success');
      
      // Anunciar éxito
      const successMessage = isEditing ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente';
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'sr-only';
      announcer.textContent = successMessage;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ClienteFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validación en tiempo real
    if (errors[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error ? error : "" }));
    }
  };

  const getFieldProps = (field: keyof ClienteFormData) => {
    const hasError = !!errors[field];
    return {
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${field}-error` : undefined,
      ref: hasError && !firstErrorRef.current ? firstErrorRef : undefined,
    };
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {isEditing ? "Editar Cliente" : "Agregar Cliente"}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Los campos marcados con asterisco (*) son obligatorios
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          
          {/* Información personal */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-gray-900 mb-4">Información Personal</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cedula" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Cédula/RUC *
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  maxLength={10}
                  value={formData.CED_CLI}
                  onChange={(e) => handleInputChange("CED_CLI", e.target.value)}
                  placeholder="1234567890"
                  disabled={isEditing || isSubmitting}
                  className={errors.CED_CLI ? "border-red-500 focus:ring-red-300" : ""}
                  {...getFieldProps('CED_CLI')}
                />
                {errors.CED_CLI && (
                  <div id="CED_CLI-error" role="alert" className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.CED_CLI}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  type="text"
                  value={formData.NOM_CLI}
                  onChange={(e) => handleInputChange("NOM_CLI", e.target.value)}
                  placeholder="Juan"
                  disabled={isSubmitting}
                  className={errors.NOM_CLI ? "border-red-500 focus:ring-red-300" : ""}
                  {...getFieldProps('NOM_CLI')}
                />
                {errors.NOM_CLI && (
                  <div id="NOM_CLI-error" role="alert" className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.NOM_CLI}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  type="text"
                  value={formData.APE_CLI}
                  onChange={(e) => handleInputChange("APE_CLI", e.target.value)}
                  placeholder="Pérez"
                  disabled={isSubmitting}
                  className={errors.APE_CLI ? "border-red-500 focus:ring-red-300" : ""}
                  {...getFieldProps('APE_CLI')}
                />
                {errors.APE_CLI && (
                  <div id="APE_CLI-error" role="alert" className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.APE_CLI}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="telefono" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  maxLength={10}
                  value={formData.NUM_CLI}
                  onChange={(e) => handleInputChange("NUM_CLI", e.target.value)}
                  placeholder="0999999999"
                  disabled={isSubmitting}
                  className={errors.NUM_CLI ? "border-red-500 focus:ring-red-300" : ""}
                  {...getFieldProps('NUM_CLI')}
                />
                {errors.NUM_CLI && (
                  <div id="NUM_CLI-error" role="alert" className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.NUM_CLI}
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Información de contacto */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</legend>
            
            <div>
              <Label htmlFor="correo" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Correo Electrónico
              </Label>
              <Input
                id="correo"
                type="email"
                value={formData.COR_CLI}
                onChange={(e) => handleInputChange("COR_CLI", e.target.value)}
                placeholder="juan@example.com"
                disabled={isSubmitting}
                className={errors.COR_CLI ? "border-red-500 focus:ring-red-300" : ""}
                {...getFieldProps('COR_CLI')}
              />
              {errors.COR_CLI && (
                <div id="COR_CLI-error" role="alert" className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.COR_CLI}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="direccion" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </Label>
              <Input
                id="direccion"
                type="text"
                value={formData.DIR_CLI}
                onChange={(e) => handleInputChange("DIR_CLI", e.target.value)}
                placeholder="Av. Principal 123"
                disabled={isSubmitting}
              />
            </div>
          </fieldset>

          {/* Configuración del cliente */}
          <fieldset className="space-y-4">
            <legend className="text-lg font-medium text-gray-900 mb-4">Configuración del Cliente</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dificultad" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Nivel de Dificultad
                </Label>
                <Select 
                  value={formData.DIF_CLI} 
                  onValueChange={(value) => handleInputChange("DIF_CLI", value as "BAJA" | "MEDIA" | "ALTA")}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="dificultad" aria-describedby="dificultad-help">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAJA">Baja - Cliente fácil de gestionar</SelectItem>
                    <SelectItem value="MEDIA">Media - Cliente con requerimientos moderados</SelectItem>
                    <SelectItem value="ALTA">Alta - Cliente con requerimientos complejos</SelectItem>
                  </SelectContent>
                </Select>
                <p id="dificultad-help" className="text-xs text-gray-600 mt-1">
                  Indica la complejidad de gestión del cliente
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-6">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.ACTIVO}
                  onChange={(e) => handleInputChange("ACTIVO", e.target.checked)}
                  disabled={isSubmitting}
                  className="rounded focus:ring-2 focus:ring-blue-300"
                  aria-describedby="activo-help"
                />
                <Label htmlFor="activo" className="flex items-center gap-2 cursor-pointer">
                  <Check className="h-4 w-4" />
                  Cliente Activo
                </Label>
              </div>
              <p id="activo-help" className="text-xs text-gray-600 col-span-2">
                Los clientes inactivos no aparecerán en las búsquedas por defecto
              </p>
            </div>
          </fieldset>

          {/* Mensaje de estado */}
          {submitStatus === 'success' && (
            <div role="alert" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
              <Check className="h-5 w-5" />
              Cliente {isEditing ? 'actualizado' : 'creado'} correctamente
            </div>
          )}

          {submitStatus === 'error' && (
            <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-5 w-5" />
              Error al {isEditing ? 'actualizar' : 'crear'} el cliente. Inténtalo de nuevo.
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                `${isEditing ? "Actualizar" : "Crear"} Cliente`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}