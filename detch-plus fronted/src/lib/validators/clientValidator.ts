/**
 * Validador para Clientes según normativas ecuatorianas y estándares de negocio
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Valida Cédula de 10 dígitos o RUC de 13 dígitos de Ecuador
 */
export function validarCedulaRucEcuador(id: string): { isValid: boolean; message?: string } {
  const clean = (id || "").trim();

  // Caso especial estándar para ventas rápidas
  if (clean === "9999999999" || clean === "9999999999999") {
    return { isValid: true };
  }

  if (!clean) {
    return { isValid: false, message: "La cédula o RUC es obligatoria" };
  }

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: "Debe contener únicamente números sin guiones ni espacios" };
  }

  if (clean.length !== 10 && clean.length !== 13) {
    return { isValid: false, message: "Debe tener 10 dígitos (cédula) o 13 dígitos (RUC)" };
  }

  // Provincia válida: 01 a 24, o 30 para residentes en el exterior
  const provincia = parseInt(clean.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return { isValid: false, message: "Los dos primeros dígitos deben corresponder a una provincia válida (01 a 24)" };
  }

  const tercerDigito = parseInt(clean.substring(2, 3), 10);

  // 1. Cédula (10 dígitos) o RUC Persona Natural (13 dígitos)
  if (clean.length === 10 || (clean.length === 13 && tercerDigito < 6)) {
    if (tercerDigito < 0 || tercerDigito > 5) {
      return { isValid: false, message: "El tercer dígito de la cédula o RUC personal debe estar entre 0 y 5" };
    }

    if (clean.length === 13 && !clean.endsWith("001")) {
      return { isValid: false, message: "El RUC de persona natural debe terminar en 001" };
    }

    // Algoritmo Módulo 10
    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(clean.charAt(i), 10) * coeficientes[i];
      if (valor >= 10) valor -= 9;
      suma += valor;
    }

    const digitoVerificador = parseInt(clean.charAt(9), 10);
    const residuo = suma % 10;
    const resultado = residuo === 0 ? 0 : 10 - residuo;

    if (resultado !== digitoVerificador) {
      return { isValid: false, message: "Número de identificación inválido (dígito verificador incorrecto)" };
    }

    return { isValid: true };
  }

  // 2. RUC Sociedad Privada / Extranjera (13 dígitos, tercer dígito = 9, termina en 001+)
  if (clean.length === 13 && tercerDigito === 9) {
    const establecimiento = parseInt(clean.substring(10, 13), 10);
    if (establecimiento < 1) {
      return { isValid: false, message: "El código de establecimiento del RUC debe ser al menos 001" };
    }

    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      suma += parseInt(clean.charAt(i), 10) * coeficientes[i];
    }

    const digitoVerificador = parseInt(clean.charAt(9), 10);
    const residuo = suma % 11;
    const resultado = residuo === 0 ? 0 : 11 - residuo;

    if (resultado !== digitoVerificador) {
      return { isValid: false, message: "RUC de sociedad privada inválido" };
    }

    return { isValid: true };
  }

  // 3. RUC Entidad Pública (13 dígitos, tercer dígito = 6, termina en 0001+)
  if (clean.length === 13 && tercerDigito === 6) {
    const establecimiento = parseInt(clean.substring(9, 13), 10);
    if (establecimiento < 1) {
      return { isValid: false, message: "El código de establecimiento del RUC público debe ser al menos 0001" };
    }

    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) {
      suma += parseInt(clean.charAt(i), 10) * coeficientes[i];
    }

    const digitoVerificador = parseInt(clean.charAt(8), 10);
    const residuo = suma % 11;
    const resultado = residuo === 0 ? 0 : 11 - residuo;

    if (resultado !== digitoVerificador) {
      return { isValid: false, message: "RUC de institución pública inválido" };
    }

    return { isValid: true };
  }

  return { isValid: false, message: "El formato de identificación no es válido para Ecuador" };
}

/**
 * Valida nombres o apellidos (sin números ni símbolos extraños)
 */
export function validarTextoNombre(valor: string, campo: "Nombres" | "Apellidos"): { isValid: boolean; message?: string } {
  const clean = (valor || "").trim();

  if (!clean) {
    return { isValid: false, message: `${campo} es un campo obligatorio` };
  }

  if (clean.length < 2) {
    return { isValid: false, message: `${campo} debe tener al menos 2 caracteres` };
  }

  if (clean.length > 100) {
    return { isValid: false, message: `${campo} no puede exceder 100 caracteres` };
  }

  if (/\d/.test(clean)) {
    return { isValid: false, message: `${campo} no puede contener números` };
  }

  // Permitir letras del alfabeto español con tildes, diéresis, ñ, espacios y apóstrofes
  const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!regexLetras.test(clean)) {
    return { isValid: false, message: `${campo} no puede contener símbolos especiales (@, #, $, %, etc.)` };
  }

  return { isValid: true };
}

/**
 * Valida teléfono celular o convencional de Ecuador
 */
export function validarTelefonoEcuador(tel?: string): { isValid: boolean; message?: string } {
  const clean = (tel || "").trim();
  if (!clean) return { isValid: true }; // Opcional

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: "El teléfono debe contener únicamente números" };
  }

  // Celulares: 10 dígitos (empiezan con 09). Convencionales: 9 dígitos (02, 03, 04, 07, etc.)
  if (clean.length !== 9 && clean.length !== 10) {
    return { isValid: false, message: "El teléfono debe tener 10 dígitos (celular) o 9 dígitos (convencional)" };
  }

  if (!clean.startsWith("0")) {
    return { isValid: false, message: "El teléfono debe comenzar con 0 (ej. 0991234567 o 022123456)" };
  }

  return { isValid: true };
}

/**
 * Valida correo electrónico
 */
export function validarCorreo(email?: string): { isValid: boolean; message?: string } {
  const clean = (email || "").trim();
  if (!clean) return { isValid: true }; // Opcional

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(clean)) {
    return { isValid: false, message: "El correo electrónico no tiene un formato válido (ej. usuario@ejemplo.com)" };
  }

  return { isValid: true };
}

/**
 * Validador integral para formulario de cliente
 */
export function validarFormularioCliente(
  data: {
    CED_CLI: string;
    NOM_CLI: string;
    APE_CLI: string;
    NUM_CLI?: string;
    COR_CLI?: string;
    DIR_CLI?: string;
  },
  isEditing = false
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isEditing) {
    const valCed = validarCedulaRucEcuador(data.CED_CLI);
    if (!valCed.isValid && valCed.message) {
      errors.CED_CLI = valCed.message;
    }
  }

  const valNom = validarTextoNombre(data.NOM_CLI, "Nombres");
  if (!valNom.isValid && valNom.message) {
    errors.NOM_CLI = valNom.message;
  }

  const valApe = validarTextoNombre(data.APE_CLI, "Apellidos");
  if (!valApe.isValid && valApe.message) {
    errors.APE_CLI = valApe.message;
  }

  const valTel = validarTelefonoEcuador(data.NUM_CLI);
  if (!valTel.isValid && valTel.message) {
    errors.NUM_CLI = valTel.message;
  }

  const valCor = validarCorreo(data.COR_CLI);
  if (!valCor.isValid && valCor.message) {
    errors.COR_CLI = valCor.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
