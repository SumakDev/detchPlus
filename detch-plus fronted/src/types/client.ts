export type Cliente = {
  CED_CLI: string;
  NOM_CLI: string;
  APE_CLI: string;
  DIR_CLI?: string;
  COR_CLI?: string;
  NUM_CLI?: string;
  DIF_CLI: "BAJA" | "MEDIA" | "ALTA";
  ACTIVO: boolean;
  FECHA_REGISTRO: string; // ISO
};

export type ClienteFormData = {
  CED_CLI: string;
  NOM_CLI: string;
  APE_CLI: string;
  DIR_CLI?: string;
  COR_CLI?: string;
  NUM_CLI?: string;
  DIF_CLI: "BAJA" | "MEDIA" | "ALTA";
  ACTIVO?: boolean;
};