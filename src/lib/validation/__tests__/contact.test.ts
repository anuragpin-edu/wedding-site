import { test } from "node:test";
import assert from "node:assert";
import { contactNameSchema, contactEmailSchema, contactPhoneSchema } from "../contact";

test("contactEmailSchema: must accept valid emails", () => {
  assert.ok(contactEmailSchema.safeParse("user@example.net").success);
  assert.ok(contactEmailSchema.safeParse("user.name+tag@gmail.com").success);
});

test("contactEmailSchema: must reject placeholders and malformed emails", () => {
  const cases = [
    "email@gmail.com",
    "test@example.com",
    "dummy@gmail.com",
    "none@gmail.com",
    "na@gmail.com",
    "noemail@gmail.com",
    "user@example.com",
    "not-an-email",
    "",
  ];
  for (const c of cases) {
    assert.ok(!contactEmailSchema.safeParse(c).success, `Should reject ${c}`);
  }
});

test("contactPhoneSchema: must accept valid phones and normalize them", () => {
  const result1 = contactPhoneSchema.safeParse("(615) 555-1234");
  assert.ok(result1.success);
  assert.strictEqual(result1.data, "6155551234");

  const result2 = contactPhoneSchema.safeParse("+1 615 555 1234");
  assert.ok(result2.success);
  assert.strictEqual(result2.data, "+16155551234");

  const result3 = contactPhoneSchema.safeParse("+91 98765 43210");
  assert.ok(result3.success);
  assert.strictEqual(result3.data, "+919876543210");
});

test("contactPhoneSchema: must reject placeholders and invalid lengths", () => {
  const cases = [
    "0000000000",
    "1111111111",
    "1234567890",
    "0987654321",
    "123", // too short
    "12345678901234567", // too long
    "", // empty
  ];
  for (const c of cases) {
    assert.ok(!contactPhoneSchema.safeParse(c).success, `Should reject ${c}`);
  }
});

test("contactNameSchema: must accept valid names", () => {
  const cases = [
    "Anurag Pinnadari",
    "O'Connor",
    "Mary-Jane",
    "René",
    "A. P.",
  ];
  for (const c of cases) {
    assert.ok(contactNameSchema.safeParse(c).success, `Should accept ${c}`);
  }
});

test("contactNameSchema: must reject placeholders and invalid names", () => {
  const cases = [
    "test",
    "guest",
    "unknown",
    "asdf",
    "dummy",
    "12345",
    "...",
    "",
    "A", // too short
  ];
  for (const c of cases) {
    assert.ok(!contactNameSchema.safeParse(c).success, `Should reject ${c}`);
  }
});
