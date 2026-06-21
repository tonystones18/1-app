import { createAuditEvent, type AuditAction, type AuditEvent } from "@visionesoft/audit";
import type { ActorContext } from "@visionesoft/shared-types";

export interface AuditSink {
  write(event: AuditEvent): Promise<void>;
}

export interface AuditCommand {
  requestId: string;
  actor: ActorContext;
  action: AuditAction;
  entityType: string;
  entityId: string;
  reason?: string;
  diff?: Record<string, unknown>;
}

export async function writeAuditEvent(sink: AuditSink, command: AuditCommand): Promise<AuditEvent> {
  const event = createAuditEvent(command);
  await sink.write(event);
  return event;
}
