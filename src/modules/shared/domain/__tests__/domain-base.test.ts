import { describe, it, expect } from "vitest";
import z from "zod";
import { Entity } from "../entity/entity.ts";
import { AggregateRoot } from "../aggregate/aggregate-root.ts";
import { ValueObject } from "../value-object/base.vo.ts";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type TestData = z.infer<typeof TestSchema>;

class TestEntity extends Entity<typeof TestSchema> {
  constructor(data: TestData, id?: string) {
    super(data, TestSchema, id);
  }
}

class TestAggregate extends AggregateRoot<typeof TestSchema, TestEntity> {
  constructor(entity: TestEntity) {
    super(entity);
  }
}

const TestVOSchema = z.object({
  value: z.string(),
});

class TestVO extends ValueObject<typeof TestVOSchema> {
  constructor(value: string) {
    super({ value }, TestVOSchema);
  }
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------

describe("Entity", () => {
  describe("constructor", () => {
    it("generates a UUID when no id is provided", () => {
      const entity = new TestEntity({ name: "alice", age: 30 });
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      // UUID v4 format: 8-4-4-4-12 hex digits
      expect(entity.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it("accepts valid data through Zod schema", () => {
      const entity = new TestEntity({ name: "bob", age: 25 });
      expect(entity.data).toEqual({ name: "bob", age: 25 });
    });

    it("throws when data fails Zod validation", () => {
      expect(
        () => new TestEntity({ name: "incomplete" } as unknown as TestData),
      ).toThrow();
    });

    it("accepts a provided valid id override", () => {
      const id = crypto.randomUUID();
      const entity = new TestEntity({ name: "carol", age: 35 }, id);
      expect(entity.id).toBe(id);
    });

    it("throws when the provided id is not a valid UUID v4", () => {
      expect(
        () => new TestEntity({ name: "dave", age: 40 }, "not-a-uuid"),
      ).toThrow();
    });
  });

  describe("data getter / setter", () => {
    it("returns the current data", () => {
      const entity = new TestEntity({ name: "eve", age: 20 });
      expect(entity.data).toEqual({ name: "eve", age: 20 });
    });

    it("updates data when setting valid new data", () => {
      const entity = new TestEntity({ name: "frank", age: 45 });
      entity.data = { name: "frank-updated", age: 46 };
      expect(entity.data).toEqual({ name: "frank-updated", age: 46 });
    });

    it("throws when setting invalid data", () => {
      const entity = new TestEntity({ name: "grace", age: 50 });
      expect(() => {
        entity.data = { name: "grace" } as TestData;
      }).toThrow();
    });
  });

  describe("createdAt / updatedAt", () => {
    it("setter and getter for createdAt", () => {
      const entity = new TestEntity({ name: "hank", age: 28 });
      const date = new Date("2025-01-01T00:00:00Z");
      entity.createdAt = date;
      expect(entity.createdAt).toEqual(date);
    });

    it("setter and getter for updatedAt", () => {
      const entity = new TestEntity({ name: "ivy", age: 32 });
      const date = new Date("2025-06-15T12:00:00Z");
      entity.updatedAt = date;
      expect(entity.updatedAt).toEqual(date);
    });

    it("returns undefined for createdAt / updatedAt when not set", () => {
      const entity = new TestEntity({ name: "jack", age: 22 });
      expect(entity.createdAt).toBeUndefined();
      expect(entity.updatedAt).toBeUndefined();
    });
  });

  describe("toJSON", () => {
    it("returns data alongside id and timestamps", () => {
      const entity = new TestEntity({ name: "kate", age: 27 });
      const createdAt = new Date("2025-03-10T08:00:00Z");
      const updatedAt = new Date("2025-04-20T16:30:00Z");
      entity.createdAt = createdAt;
      entity.updatedAt = updatedAt;

      const json = entity.toJSON();
      expect(json).toEqual({
        name: "kate",
        age: 27,
        id: entity.id,
        createdAt,
        updatedAt,
      });
    });

    it("includes undefined timestamps when not set", () => {
      const entity = new TestEntity({ name: "leo", age: 33 });
      const json = entity.toJSON();
      expect(json).toEqual({
        name: "leo",
        age: 33,
        id: entity.id,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe("equals", () => {
    it("returns true when compared with own id", () => {
      const id = crypto.randomUUID();
      const entity = new TestEntity({ name: "mike", age: 29 }, id);
      expect(entity.equals(id)).toBe(true);
    });

    it("returns true for two entities sharing the same id", () => {
      const id = crypto.randomUUID();
      const a = new TestEntity({ name: "a", age: 1 }, id);
      const b = new TestEntity({ name: "b", age: 2 }, id);
      expect(a.equals(b.id)).toBe(true);
    });

    it("returns false for entities with different ids", () => {
      const a = new TestEntity({ name: "x", age: 10 });
      const b = new TestEntity({ name: "y", age: 20 });
      expect(a.equals(b.id)).toBe(false);
    });
  });
});

// ---------------------------------------------------------------------------
// AggregateRoot
// ---------------------------------------------------------------------------

describe("AggregateRoot", () => {
  it("wraps an entity and exposes it via .entity getter", () => {
    const inner = new TestEntity({ name: "agg-user", age: 99 });
    const agg = new TestAggregate(inner);
    expect(agg.entity).toBe(inner);
  });

  it("delegates .data to the parent Entity", () => {
    const inner = new TestEntity({ name: "data-check", age: 50 });
    const agg = new TestAggregate(inner);
    expect(agg.data).toEqual(inner.data);
  });

  it("delegates .id to the parent Entity", () => {
    const inner = new TestEntity({ name: "id-check", age: 50 });
    const agg = new TestAggregate(inner);
    expect(agg.id).toBe(inner.id);
  });

  it("delegates .schema to the parent Entity", () => {
    const inner = new TestEntity({ name: "schema-check", age: 50 });
    const agg = new TestAggregate(inner);
    expect(agg.schema).toBe(inner.schema);
  });

  it("supports toJSON() via inherited Entity", () => {
    const inner = new TestEntity({ name: "json-check", age: 10 });
    const agg = new TestAggregate(inner);
    expect(agg.toJSON()).toEqual(inner.toJSON());
  });
});

// ---------------------------------------------------------------------------
// ValueObject
// ---------------------------------------------------------------------------

describe("ValueObject", () => {
  it("constructs and returns value via .value getter", () => {
    const vo = new TestVO("hello");
    expect(vo.value).toEqual({ value: "hello" });
  });

  it("throws ZodError when constructed with invalid data", () => {
    // bypass TypeScript to test runtime validation
    class BadVO extends ValueObject<typeof TestVOSchema> {
      constructor() {
        super({ value: 123 } as unknown as z.infer<typeof TestVOSchema>, TestVOSchema);
      }
    }
    expect(() => new BadVO()).toThrow();
  });
});
