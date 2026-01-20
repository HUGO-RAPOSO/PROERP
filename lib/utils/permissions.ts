export const PERMISSIONS = {
    ACADEMIC_ACCESS: "ACADEMIC_ACCESS",
    FINANCIAL_ACCESS: "FINANCIAL_ACCESS",
    HR_ACCESS: "HR_ACCESS",
    CRM_ACCESS: "CRM_ACCESS",
    LIBRARY_ACCESS: "LIBRARY_ACCESS",
    COMMUNICATION_ACCESS: "COMMUNICATION_ACCESS",
    SETTINGS_ACCESS: "SETTINGS_ACCESS",
};

export const MODULE_PERMISSIONS = [
    { label: "Módulo Acadêmico", value: PERMISSIONS.ACADEMIC_ACCESS },
    { label: "Módulo Financeiro", value: PERMISSIONS.FINANCIAL_ACCESS },
    { label: "Módulo RH", value: PERMISSIONS.HR_ACCESS },
    { label: "Módulo CRM", value: PERMISSIONS.CRM_ACCESS },
    { label: "Módulo Biblioteca", value: PERMISSIONS.LIBRARY_ACCESS },
    { label: "Módulo Comunicação", value: PERMISSIONS.COMMUNICATION_ACCESS },
    { label: "Configurações", value: PERMISSIONS.SETTINGS_ACCESS },
];

export function hasPermission(userPermissions: string[], permission: string): boolean {
    return userPermissions?.includes(permission) || false;
}
