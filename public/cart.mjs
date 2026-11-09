import { products } from './catalogue.mjs';
export function cleanCart(input) {
  const ids = new Set(products.map(p => p.id));
  if (!Array.isArray(input)) return [];
  const result = new Map();
  for (const item of input) {
    if (!item || !ids.has(item.id) || !Number.isInteger(item.quantity) || item.quantity < 1) continue;
    result.set(item.id, Math.min(20, (result.get(item.id) || 0) + item.quantity));
  }
  return [...result].map(([id, quantity]) => ({ id, quantity }));
}
export function cartTotal(cart) { return cleanCart(cart).reduce((sum, item) => sum + products.find(p => p.id === item.id).price * item.quantity, 0); }
