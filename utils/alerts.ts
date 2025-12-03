export function simulateAlerts() {
    return [
        { id: 1, message: 'Alerta: Rebanho abaixo do esperado', type: 'warning' },
        { id: 2, message: 'Pastagem atingiu capacidade máxima', type: 'info' },
        { id: 3, message: 'Saldo financeiro negativo', type: 'danger' }
    ];
}
