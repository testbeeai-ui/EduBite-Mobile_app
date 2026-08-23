import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { doseResultView } from './dose-result';
import type { DoseDayRecord } from './types';

const webShapedZero: DoseDayRecord = {
  correct: 0,
  total: 5,
  pct: 0,
  completed: true,
  classLevel: '11',
};

describe('doseResultView', () => {
  it('does not treat an in-flight persist as the exam score', () => {
    const view = doseResultView({
      signedIn: true,
      classLevel: '11',
      dayLog: undefined,
      questionCount: 5,
      saving: true,
    });
    assert.equal(view.status, 'pending');
    assert.equal(view.correct, 0);
  });

  it('shows a web-shaped doseDayLog score including a real zero', () => {
    const zero = doseResultView({
      signedIn: true,
      classLevel: '11',
      dayLog: webShapedZero,
      questionCount: 5,
    });
    assert.equal(zero.status, 'graded');
    assert.equal(zero.correct, 0);

    const four = doseResultView({
      signedIn: true,
      classLevel: '11',
      dayLog: {
        correct: 4,
        total: 5,
        pct: 80,
        completed: true,
        classLevel: '11',
      },
      questionCount: 5,
    });
    assert.equal(four.status, 'graded');
    assert.equal(four.correct, 4);
    assert.equal(four.pct, 80);
  });

  it('asks unsigned learners to sign in instead of showing a fake score', () => {
    const view = doseResultView({
      signedIn: false,
      classLevel: '11',
      dayLog: webShapedZero,
      questionCount: 5,
    });
    assert.equal(view.status, 'unsigned');
  });
});
