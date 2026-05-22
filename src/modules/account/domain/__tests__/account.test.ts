import { describe, it, expect } from "vitest";
import { AccountEntity } from "../entity/account.entity.ts";
import { AccountService } from "../service/account.service.ts";
import type { AccountInfo } from "../schema/account.schema.ts";

// ---------------------------------------------------------------------------
// AccountEntity
// ---------------------------------------------------------------------------

describe("AccountEntity", () => {
  it("creates an instance with phoneNumber and password", () => {
    const entity = new AccountEntity({ phoneNumber: "+8613800000000", password: "s3cret" });
    expect(entity.data.phoneNumber).toBe("+8613800000000");
    expect(entity.data.password).toBe("s3cret");
  });

  it("has an auto-generated UUID id", () => {
    const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
    expect(entity.id).toBeDefined();
    expect(entity.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  describe("setAccountInfo", () => {
    it("stores the account info on first call", () => {
      const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
      const info: AccountInfo = {
        accessToken: "tok_abc",
        account: { exId: "ex_1", username: "alice" },
      };
      entity.setAccountInfo(info);
      expect(entity.getAccountInfo()).toEqual(info);
    });

    it("merges into existing account info on subsequent calls", () => {
      const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
      entity.setAccountInfo({
        accessToken: "tok_first",
        account: { exId: "ex_1", username: "bob" },
      });

      // Partial merge: only accessToken changes, account stays
      entity.setAccountInfo({ accessToken: "tok_second" } as AccountInfo);

      const info = entity.getAccountInfo()!;
      expect(info.accessToken).toBe("tok_second");
      expect(info.account).toEqual({ exId: "ex_1", username: "bob" });
    });
  });

  describe("getAccountInfo", () => {
    it("returns undefined when no info has been set", () => {
      const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
      expect(entity.getAccountInfo()).toBeUndefined();
    });
  });

  describe("clearToken", () => {
    it("resets account info to undefined", () => {
      const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
      entity.setAccountInfo({
        accessToken: "tok_clear",
        account: { exId: "ex_1", username: "carol" },
      });
      entity.clearToken();
      expect(entity.getAccountInfo()).toBeUndefined();
    });

    it("is safe to call when account info is already undefined", () => {
      const entity = new AccountEntity({ phoneNumber: "+1", password: "pw" });
      expect(() => entity.clearToken()).not.toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// AccountService
// ---------------------------------------------------------------------------

describe("AccountService", () => {
  it("constructor creates an AccountEntity with the given credentials", () => {
    const service = new AccountService("+86", "mypassword");
    expect(service.account).toBeInstanceOf(AccountEntity);
    expect(service.account.data.phoneNumber).toBe("+86");
    expect(service.account.data.password).toBe("mypassword");
    expect(service.isLoggedIn).toBe(false);
  });

  describe("handleLogin", () => {
    it("sets isLoggedIn to true and stores account info", () => {
      const service = new AccountService("+1", "pw");
      const info: AccountInfo = {
        accessToken: "tok_login",
        account: { exId: "ex_login", username: "dave" },
      };

      service.handleLogin(info);

      expect(service.isLoggedIn).toBe(true);
      expect(service.account.getAccountInfo()).toEqual(info);
    });

    it("is idempotent when already logged in", () => {
      const service = new AccountService("+1", "pw");
      const info1: AccountInfo = {
        accessToken: "tok_first",
        account: { exId: "ex_first", username: "eve" },
      };
      const info2: AccountInfo = {
        accessToken: "tok_second",
        account: { exId: "ex_second", username: "frank" },
      };

      service.handleLogin(info1);
      service.handleLogin(info2);

      // Second call should return early – first info is preserved
      expect(service.isLoggedIn).toBe(true);
      expect(service.account.getAccountInfo()).toEqual(info1);
    });
  });
});
