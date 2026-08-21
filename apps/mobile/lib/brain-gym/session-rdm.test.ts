import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRAIN_GYM_RDM_DEFAULTS,
  computeBrainGymSessionRdm,
} from './session-rdm';

describe('computeBrainGymSessionRdm', () => {
  it('uses live web/server defaults (divisor 20, win 15, cap 120)', () => {
    assert.equal(BRAIN_GYM_RDM_DEFAULTS['brain_gym.score_divisor'], 20);
    assert.equal(BRAIN_GYM_RDM_DEFAULTS['brain_gym.win_bonus'], 15);
    assert.equal(BRAIN_GYM_RDM_DEFAULTS['brain_gym.session_cap'], 120);
    assert.equal(BRAIN_GYM_RDM_DEFAULTS['brain_gym.min_base'], 5);
  });

  it('awards 0 RDM when score is 0 (no free participation floor)', () => {
    assert.equal(
      computeBrainGymSessionRdm({ score: 0, won: false, isDaily: false }),
      0,
    );
    assert.equal(
      computeBrainGymSessionRdm({ score: 0, won: true, isDaily: false }),
      15,
    );
  });

  it('floors positive scores with min_base then adds win bonuses', () => {
    // floor(350/20)=17, max(5,17)=17, +15 win = 32
    assert.equal(
      computeBrainGymSessionRdm({ score: 350, won: true, isDaily: false }),
      32,
    );
    // floor(10/20)=0 → min_base 5 (score > 0)
    assert.equal(
      computeBrainGymSessionRdm({ score: 10, won: false, isDaily: false }),
      5,
    );
    // win + daily: 17 + 15 + 25 = 57
    assert.equal(
      computeBrainGymSessionRdm({ score: 350, won: true, isDaily: true }),
      57,
    );
  });

  it('caps at session_cap', () => {
    assert.equal(
      computeBrainGymSessionRdm({ score: 100_000, won: true, isDaily: true }),
      120,
    );
  });
});
