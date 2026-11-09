import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanCart, cartTotal } from '../public/cart.mjs';
import { products } from '../public/catalogue.mjs';
test('saved carts cannot introduce unknown products or invalid quantities', () => {
  assert.deepEqual(cleanCart([{id:'fake',quantity:1},{id:'jardim',quantity:-1},{id:'raiz',quantity:1.5},null]), []);
  assert.deepEqual(cleanCart({}), []);
});
test('duplicate saved items merge with a per-product quantity limit', () => {
  assert.deepEqual(cleanCart([{id:'jardim',quantity:14},{id:'jardim',quantity:10}]), [{id:'jardim',quantity:20}]);
});
test('subtotal uses catalogue prices and excludes tampered prices', () => {
  assert.equal(cartTotal([{id:'jardim',quantity:2,price:0},{id:'raiz',quantity:1}]), 80);
  assert.equal(cartTotal([]), 0);
});
test('catalogue identities are unique and all demo items have display data', () => {
  assert.equal(new Set(products.map(p=>p.id)).size,products.length);
  for(const p of products) { assert.ok(p.price>0); assert.ok(p.name && p.notes && p.image && p.description); }
});
