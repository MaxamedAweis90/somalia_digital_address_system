export const ROLES = {
  SYS_ADMIN: "SYS_ADMIN",
  DATA_OFFICER: "DATA_OFFICER",
  DATA_COLLECTOR: "DATA_COLLECTOR",
};

export const ROLE_HOME = {
  [ROLES.SYS_ADMIN]: "/admin/dashboard",
  [ROLES.DATA_OFFICER]: "/officer/dashboard",
  [ROLES.DATA_COLLECTOR]: "/collector/dashboard",
};
