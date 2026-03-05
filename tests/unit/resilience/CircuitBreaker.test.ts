/**
 * Unit tests for CircuitBreaker
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CircuitBreaker, CircuitState } from '../../../src/shared/resilience/CircuitBreaker.ts';

describe('CircuitBreaker', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker({
      name: 'test-circuit',
      failureThreshold: 3,
      failureTimeWindow: 10000,
      resetTimeout: 5000,
      successThreshold: 2,
      timeout: 1000,
    });
  });

  describe('CLOSED state', () => {
    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should execute function successfully', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await circuitBreaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should handle failures without opening circuit immediately', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Failure');
      });

      // First failure
      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Failure');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);

      // Second failure
      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Failure');
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should open circuit after threshold failures', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Failure');
      });

      // Trigger 3 failures (threshold)
      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(fn)).rejects.toThrow('Failure');
      }

      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('OPEN state', () => {
    beforeEach(async () => {
      // Force circuit to OPEN state
      const fn = vi.fn(async () => {
        throw new Error('Failure');
      });

      for (let i = 0; i < 3; i++) {
        await expect(circuitBreaker.execute(fn)).rejects.toThrow('Failure');
      }
    });

    it('should reject calls when circuit is open', async () => {
      const fn = vi.fn(async () => 'success');

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Circuit breaker');
      expect(fn).not.toHaveBeenCalled();
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      // Wait for reset timeout
      await new Promise(resolve => setTimeout(resolve, 5100));

      const fn = vi.fn(async () => 'success');
      await circuitBreaker.execute(fn);

      expect(circuitBreaker.getState()).toBe(CircuitState.HALF_OPEN);
    });
  });

  describe('HALF_OPEN state', () => {
    beforeEach(async () => {
      // Force circuit to HALF_OPEN state
      circuitBreaker.open();
      await new Promise(resolve => setTimeout(resolve, 5100));
    });

    it('should allow trial calls', async () => {
      const fn = vi.fn(async () => 'success');
      await circuitBreaker.execute(fn);

      expect(fn).toHaveBeenCalled();
    });

    it('should close circuit after successful calls exceed threshold', async () => {
      const fn = vi.fn(async () => 'success');

      // Execute 2 successful calls (successThreshold = 2)
      await circuitBreaker.execute(fn);
      await circuitBreaker.execute(fn);

      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);
    });

    it('should reopen circuit on failure', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Failure');
      });

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('Failure');
      
      // Should transition back to OPEN
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);
    });
  });

  describe('timeout', () => {
    it('should timeout long-running operations', async () => {
      const fn = vi.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'success';
      });

      await expect(circuitBreaker.execute(fn)).rejects.toThrow('timed out');
    });
  });

  describe('metrics', () => {
    it('should track call metrics', async () => {
      const successFn = vi.fn(async () => 'success');
      const failFn = vi.fn(async () => {
        throw new Error('Failure');
      });

      await circuitBreaker.execute(successFn);
      await circuitBreaker.execute(successFn);
      await expect(circuitBreaker.execute(failFn)).rejects.toThrow();

      const metrics = circuitBreaker.getMetrics();

      expect(metrics.totalCalls).toBe(3);
      expect(metrics.successfulCalls).toBe(2);
      expect(metrics.failedCalls).toBe(1);
      expect(metrics.state).toBe(CircuitState.CLOSED);
    });
  });

  describe('reset', () => {
    it('should manually reset circuit to CLOSED state', async () => {
      circuitBreaker.open();
      expect(circuitBreaker.getState()).toBe(CircuitState.OPEN);

      circuitBreaker.reset();
      expect(circuitBreaker.getState()).toBe(CircuitState.CLOSED);

      const fn = vi.fn(async () => 'success');
      await circuitBreaker.execute(fn);
      expect(fn).toHaveBeenCalled();
    });
  });
});
