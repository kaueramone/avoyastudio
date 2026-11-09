import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml, validImage } from '../public/content.mjs';
test('stored editorial values cannot inject HTML into templates',()=>{
  assert.equal(escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(escapeHtml("' &"),'&#39; &amp;');
});
test('only project media and bundled images are accepted',()=>{
  const url='https://example.supabase.co';
  assert.equal(validImage('assets/hero.webp',url),true);
  assert.equal(validImage(`${url}/storage/v1/object/public/avoya-media/image.jpg`,url),true);
  for(const value of ['javascript:alert(1)','https://evil.example/image.jpg','assets/../secret.png',`${url}/storage/v1/object/public/other/private.jpg`]) assert.equal(validImage(value,url),false);
});
