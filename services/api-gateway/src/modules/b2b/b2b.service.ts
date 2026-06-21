import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class B2bService {
  constructor(private readonly prisma: PrismaService) {}

  listWhiteLabels(tenantId: string) {
    return this.prisma.whiteLabel.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  listCrmAccounts(tenantId: string, status?: string) {
    return this.prisma.crmAccount.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { updatedAt: 'desc' },
      include: { contacts: { take: 1 }, opportunities: { where: { stage: { not: 'won' } }, take: 1 } },
    });
  }

  listInvoices(tenantId: string, status?: string) {
    return this.prisma.invoice.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  listAffiliates(tenantId: string) {
    return this.prisma.affiliate.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  listSettlementCycles(tenantId: string, status?: string) {
    return this.prisma.settlementCycle.findMany({
      where: { tenantId, ...(status ? { status } : {}) },
      orderBy: { periodEnd: 'desc' },
      take: 50,
    });
  }
}
