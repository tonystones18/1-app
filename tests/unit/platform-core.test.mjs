import assert from "node:assert/strict";
import test from "node:test";
import { can } from "../../packages/permissions/dist/index.js";
import { createDomainEvent, createTenantScope } from "../../packages/platform-core/dist/index.js";

test("owner admin can view provider resources in platform scope", () => {
  const actor = {
    actorId: "user-owner",
    roleId: "owner_admin",
    scope: createTenantScope({
      tenantId: "platform",
      tenantType: "platform"
    })
  };

  assert.equal(can(actor, "provider", "read"), true);
});

test("aggregator admin cannot access finance permissions by default", () => {
  const actor = {
    actorId: "user-aggregator",
    roleId: "aggregator_admin",
    scope: createTenantScope({
      tenantId: "platform",
      tenantType: "platform"
    })
  };

  assert.equal(can(actor, "finance", "read"), false);
});

test("domain events include immutable event metadata", () => {
  const event = createDomainEvent({
    name: "provider.created",
    aggregateType: "Provider",
    aggregateId: "provider-1",
    tenantId: "tenant-1",
    payload: {
      code: "PRAGMATIC"
    }
  });

  assert.equal(event.name, "provider.created");
  assert.equal(event.schemaVersion, 1);
  assert.equal(event.aggregateId, "provider-1");
  assert.match(event.id, /^[0-9a-f-]{36}$/i);
  assert.ok(Date.parse(event.occurredAt));
});
