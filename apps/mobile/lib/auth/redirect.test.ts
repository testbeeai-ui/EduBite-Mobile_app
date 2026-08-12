import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isEdublastWebAuthDeadEnd } from './redirect-guards';

describe('isEdublastWebAuthDeadEnd', () => {
  it('flags edublast auth failure pages without code', () => {
    assert.equal(
      isEdublastWebAuthDeadEnd('https://www.edublast.in/auth/callback'),
      true,
    );
    assert.equal(
      isEdublastWebAuthDeadEnd(
        'https://www.edublast.in/preview?mode=signin&role=student',
      ),
      true,
    );
  });

  it('allows edublast URLs that still carry a PKCE code', () => {
    assert.equal(
      isEdublastWebAuthDeadEnd('https://www.edublast.in/?code=abc123'),
      false,
    );
  });

  it('ignores non-edublast URLs', () => {
    assert.equal(
      isEdublastWebAuthDeadEnd('exp://10.0.0.1:8081/--/auth/callback'),
      false,
    );
  });
});
