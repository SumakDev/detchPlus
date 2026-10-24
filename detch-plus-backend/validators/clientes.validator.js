/**
 * Validador para Clientes en Backend
 */

export function validarCedulaRucEcuador(id = "") {
  const clean = String(id || "").trim();

  // Consumidor final
  if (clean === "9999999999" || clean === "9999999999999") {
    return { isValid: true };
  }

  if (!clean) {
    return { isValid: false, message: "La cédula o RUC es requerida" };
  }

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: "La identificación debe contener únicamente números" };
  }

  if (clean.length !== 10 && clean.length !== 13) {
    return { isValid: false, message: "La identificación debe tener 10 dígitos (cédula) o 13 dígitos (RUC)" };
  }

  const provincia = parseInt(clean.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return { isValid: false, message: "Código de provincia inválido (primeros 2 dígitos entre 01 y 24)" };
  }

  const tercerDigito = parseInt(clean.substring(2, 3), 10);

  // 1. Cédula (10 dígitos) o RUC Persona Natural (13 dígitos)
  if (clean.length === 10 || (clean.length === 13 && tercerDigito < 6)) {
    if (tercerDigito < 0 || tercerDigito > 5) {
      return { isValid: false, message: "El tercer dígito de la cédula debe estar entre 0 y 5" };
    }

    if (clean.length === 13 && !clean.endsWith("001")) {
      return { isValid: false, message: "El RUC de persona natural debe terminar en 001" };
    }

    // Módulo 10
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
      return { isValid: false, message: "Dígito verificador de cédula incorrecto" };
    }

    return { isValid: true };
  }

  // 2. RUC Sociedad Privada (13 dígitos, tercer dígito = 9, termina en 001+)
  if (clean.length === 13 && tercerDigito === 9) {
    const establecimiento = parseInt(clean.substring(10, 13), 10);
    if (establecimiento < 1) {
      return { isValid: false, message: "Establecimiento de RUC privado debe ser al menos 001" };
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
      return { isValid: false, message: "Establecimiento de RUC público debe ser al menos 0001" };
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

  return { isValid: false, message: "Formato de cédula o RUC no reconocido" };
}

export function validarTextoNombre(valor, campo = "Campo") {
  const clean = String(valor || "").trim();

  if (!clean) {
    return { isValid: false, message: `${campo} es obligatorio` };
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

  const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!regexLetras.test(clean)) {
    return { isValid: false, message: `${campo} solo puede contener letras y espacios` };
  }

  return { isValid: true };
}

export function validarTelefono(tel) {
  const clean = String(tel || "").trim();
  if (!clean) return { isValid: true };

  if (!/^\d+$/.test(clean)) {
    return { isValid: false, message: "El teléfono debe contener únicamente números" };
  }

  if (clean.length !== 9 && clean.length !== 10) {
    return { isValid: false, message: "El teléfono debe tener 9 o 10 dígitos" };
  }

  if (!clean.startsWith("0")) {
    return { isValid: false, message: "El teléfono debe comenzar con 0" };
  }

  return { isValid: true };
}

export function validarCorreo(email) {
  const clean = String(email || "").trim();
  if (!clean) return { isValid: true };

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(clean)) {
    return { isValid: false, message: "El correo electrónico no tiene un formato válido" };
  }

  return { isValid: true };
}

export function validarClientePayload(payload, isUpdate = false) {
  const errors = [];

  if (!isUpdate || payload.CED_CLI) {
    const valCed = validarCedulaRucEcuador(payload.CED_CLI);
    if (!valCed.isValid) errors.push({ field: "CED_CLI", message: valCed.message });
  }

  if (!isUpdate || payload.NOM_CLI !== undefined) {
    const valNom = validarTextoNombre(payload.NOM_CLI, "Nombres");
    if (!valNom.isValid) errors.push({ field: "NOM_CLI", message: valNom.message });
  }

  if (!isUpdate || payload.APE_CLI !== undefined) {
    const valApe = validarTextoNombre(payload.APE_CLI, "Apellidos");
    if (!valApe.isValid) errors.push({ field: "APE_CLI", message: valApe.message });
  }

  if (payload.NUM_CLI) {
    const valTel = validarTelefono(payload.NUM_CLI);
    if (!valTel.isValid) errors.push({ field: "NUM_CLI", message: valTel.message });
  }

  if (payload.COR_CLI) {
    const valCor = validarCorreo(payload.COR_CLI);
    if (!valCor.isValid) errors.push({ field: "COR_CLI", message: valCor.message });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
