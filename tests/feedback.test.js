const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');
const assert = require('node:assert/strict');

let modalHtml = '';
let clickHandler = null;
const context = {
  modal(html) { modalHtml = html; },
  $(selector) {
    assert.equal(selector, '#fbSubmit');
    return { addEventListener(type, handler) {
      assert.equal(type, 'click');
      clickHandler = handler;
    } };
  }
};

runInNewContext(readFileSync(join(__dirname, '../js/feedback.js'), 'utf8'), context);
context.feedbackEnvoyer = origin => { context.sentOrigin = origin; };

test('lie le bouton de feedback sans injecter l’origine dans le HTML', () => {
  const origin = `mc');alert('injection`;
  context.feedbackModal(origin);

  assert.ok(!modalHtml.includes(origin));
  assert.equal(typeof clickHandler, 'function');
  clickHandler();
  assert.equal(context.sentOrigin, origin);
});
