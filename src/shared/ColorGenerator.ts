/**
 * Selecciona un color nativo de Ionic basado en una cadena de texto.
 * Utiliza los nombres de colores estándar definidos en variables.scss.
 */
export function GetAvatarColor(seed: string): string {
  const Colors = [
    'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'medium', 'dark'
  ];

  const Text = String(seed || '').trim();
  if (!Text) return Colors[0];

  let hash = 0;
  for (let i = 0; i < Text.length; i++) {
    hash = ((hash << 5) - hash) + Text.charCodeAt(i);
    hash |= 0; // Forzar a entero de 32 bits para mayor aleatoriedad en JS
  }

  const Index = Math.abs(hash % Colors.length);
  return Colors[Index];
}