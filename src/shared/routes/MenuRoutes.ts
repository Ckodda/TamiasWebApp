export interface MenuItem {
  Path: string;
  Label: string;
  Icon: string;
  Module: string; // Debe coincidir con la llave en Permissions del API (ej: "Loan")
  Action: string; // La acción requerida para ver el menú (ej: "Read")
  IsPublic?: boolean; // Si es true, se ignora la verificación de permisos
}

export const MENU_ROUTES: MenuItem[] = [
  {
    Path: '/home',
    Label: 'Inicio',
    Icon: 'home-outline',
    Module: 'Dashboard',
    Action: 'Read',
    IsPublic: true
  },
  {
    Path: '/loans',
    Label: 'Préstamos',
    Icon: 'cash-outline',
    Module: 'Loan',
    Action: 'Read'
  },
  {
    Path: '/currencies',
    Label: 'Monedas',
    Icon: 'calculator-outline',
    Module: 'Currency',
    Action: 'Read'
  },
  {
    Path: '/transactions',
    Label: 'Transacciones',
    Icon: 'swap-horizontal-outline',
    Module: 'Transaction',
    Action: 'Read'
  },
  {
    Path: '/commitments',
    Label: 'Compromisos',
    Icon: 'document-text-outline',
    Module: 'Commitment',
    Action: 'Read'
  },
  {
    Path: '/cost-centers',
    Label: 'Centros de Costo',
    Icon: 'business-outline',
    Module: 'CostCenter',
    Action: 'Read'
  },
  {
    Path: '/events',
    Label: 'Eventos',
    Icon: 'calendar-outline',
    Module: 'Event',
    Action: 'Read'
  },
  {
    Path: '/monthly-balances',
    Label: 'Balances Mensuales',
    Icon: 'stats-chart-outline',
    Module: 'MonthlyBalance',
    Action: 'Read'
  },
  {
    Path: '/payment-methods',
    Label: 'Métodos de Pago',
    Icon: 'card-outline',
    Module: 'PaymentMethod',
    Action: 'Read'
  },
  {
    Path: '/pending-expenses',
    Label: 'Gastos Pendientes',
    Icon: 'receipt-outline',
    Module: 'PendingExpense',
    Action: 'Read'
  },
  {
    Path: '/users',
    Label: 'Usuarios',
    Icon: 'people-outline',
    Module: 'User',
    Action: 'Read'
  }
];
