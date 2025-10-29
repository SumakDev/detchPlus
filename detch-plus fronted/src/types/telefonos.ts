export type DetTelefono = {
  ID_PRO: number;
  COL_TEL?: string | null;
  ALM_TEL?: string | null;
  EST_BAT_TEL?: number | null;
  EST_PAN_TEL?: number | null;
  EST_CAR_TEL?: number | null;
  EST_CAM_TEL?: number | null;
  EST_SOF_TEL?: number | null;
  ACC_INC_TEL?: string | null;
  producto?: {
    ID_PRO: number;
    ID_MAR?: number;
    ID_MOD?: number;
    DES_PRO?: string | null;
    IMG_URL?: string | null;
    marca?: { NOM_MAR?: string | null };
    modelo?: { NOM_MOD?: string | null };
  };
};