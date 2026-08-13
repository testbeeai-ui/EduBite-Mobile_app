import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  challengeUnlockProgressPct,
  getEntryState,
  mergeEnrolledMonths,
  withChallengeRemoteSync,
} from './monthly';
import type { GameState } from '../game/types';

function baseState(overrides: Partial<GameState> = {}): GameState {
  return {
    rdm: 6000,
    streak: 0,
    joinedDate: '2026-08-01',
    lastActiveDate: '2026-08-13',
    classLevel: '11',
    dayCriteriaLog: {},
    doseDayLog: {},
    habits: [],
    dose: {} as GameState['dose'],
    funbrain: {} as GameState['funbrain'],
    puzzles: {} as GameState['puzzles'],
    pledges: {} as GameState['pledges'],
    notifications: [],
    challengeEnrolledMonthKey: null,
    challengeEnrolledMonths: [],
    challengePuzzleSubmittedMonthKey: null,
    ...overrides,
  } as GameState;
}

describe('challengeUnlockProgressPct', () => {
  it('returns 0–100 progress toward unlock threshold', () => {
    assert.equal(challengeUnlockProgressPct(0, 5000), 0);
    assert.equal(challengeUnlockProgressPct(2500, 5000), 50);
    assert.equal(challengeUnlockProgressPct(5000, 5000), 100);
    assert.equal(challengeUnlockProgressPct(9000, 5000), 100);
  });
});

describe('mergeEnrolledMonths', () => {
  it('dedupes and sorts month keys', () => {
    assert.deepEqual(
      mergeEnrolledMonths(['2026-07'], '2026-08', ['2026-08', '2026-06']),
      ['2026-06', '2026-07', '2026-08'],
    );
  });
});

describe('withChallengeRemoteSync', () => {
  it('merges roster months so paid enrollment survives missing payload keys', () => {
    const next = withChallengeRemoteSync(baseState(), {
      rosterMonths: ['2026-08'],
    });
    assert.equal(next.challengeEnrolledMonthKey, '2026-08');
    assert.deepEqual(next.challengeEnrolledMonths, ['2026-08']);
  });

  it('keeps a valid local enrolled key when roster adds older months', () => {
    const next = withChallengeRemoteSync(
      baseState({
        challengeEnrolledMonthKey: '2026-08',
        challengeEnrolledMonths: ['2026-08'],
      }),
      { rosterMonths: ['2026-07', '2026-08'] },
    );
    assert.equal(next.challengeEnrolledMonthKey, '2026-08');
    assert.deepEqual(next.challengeEnrolledMonths, ['2026-07', '2026-08']);
  });

  it('adopts remote submission month when local is missing', () => {
    const next = withChallengeRemoteSync(baseState(), {
      rosterMonths: ['2026-08'],
      submittedMonthKey: '2026-08',
    });
    assert.equal(next.challengePuzzleSubmittedMonthKey, '2026-08');
  });

  it('returns same object when nothing changes', () => {
    const state = baseState({
      challengeEnrolledMonthKey: '2026-08',
      challengeEnrolledMonths: ['2026-08'],
      challengePuzzleSubmittedMonthKey: '2026-08',
    });
    const next = withChallengeRemoteSync(state, {
      rosterMonths: ['2026-08'],
      submittedMonthKey: '2026-08',
    });
    assert.equal(next, state);
  });
});

describe('getEntryState with roster-backed enrollment', () => {
  it('stays open after day 5 when enrolled via roster months', () => {
    assert.equal(
      getEntryState({
        rdm: 6000,
        dateKey: '2026-08-13',
        enrolledMonthKey: null,
        enrolledMonths: ['2026-08'],
      }),
      'open',
    );
  });

  it('locks window after day 5 when not enrolled even with low RDM', () => {
    assert.equal(
      getEntryState({
        rdm: 100,
        dateKey: '2026-08-13',
        enrolledMonthKey: null,
        enrolledMonths: [],
      }),
      'locked_window',
    );
  });

  it('locks on RDM during the entry window', () => {
    assert.equal(
      getEntryState({
        rdm: 100,
        dateKey: '2026-08-03',
        enrolledMonthKey: null,
        enrolledMonths: [],
      }),
      'locked_rdm',
    );
  });
});
