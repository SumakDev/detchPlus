export interface Cliente {
  CED_CLI: string;
  NOM_CLI: string;
  APE_CLI: string;
  DIR_CLI?: string;
  COR_CLI?: string;
  NUM_CLI?: string;
  DIF_CLI: 'BAJA' | 'MEDIA' | 'ALTA';
  ACTIVO: boolean;
  FECHA_REGISTRO: string;
}

export interface ClienteFormData {
  CED_CLI: string;
  NOM_CLI: string;
  APE_CLI: string;
  DIR_CLI: string;
  COR_CLI: string;
  NUM_CLI: string;
  DIF_CLI: 'BAJA' | 'MEDIA' | 'ALTA';
  ACTIVO: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
}

export interface FormErrors {
  [key: string]: string;
}