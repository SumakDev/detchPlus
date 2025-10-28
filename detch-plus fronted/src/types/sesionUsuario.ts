export type SesionUsuario = {
  ID_SES_USU: string;
  ID_USU: number;
  IP_SES_USU?: string | null;
  UA_SES_USU?: string | null;
  FEC_INI_SES: string;
  FEC_ULG_SES: string;
  EXP_SES_USU: string;
  ACT_SES_USU?: boolean
  DAT_SES_USU?: any;
  usuario?: { ID_USU: number; USR_USU: string; NOM_USU?: string; APE_USU?: string; ID_ROL?: number };
};