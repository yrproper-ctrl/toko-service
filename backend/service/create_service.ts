import { api } from "encore.dev/api";
import { serviceDB } from "./db";

interface CreateServiceRequest {
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  itemType: string;
  completeness?: string;
  serialNumber?: string;
  notes?: string;
}

interface Service {
  id: number;
  serviceCode: string;
  customerId: number | null;
  customerName: string;
  customerPhone: string | null;
  customerAddress: string | null;
  technicianId: number | null;
  itemType: string;
  completeness: string | null;
  serialNumber: string | null;
  notes: string | null;
  damageReport: string | null;
  repairCost: number;
  partsCost: number;
  totalCost: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Creates a new service request.
export const createService = api<CreateServiceRequest, Service>(
  { expose: true, method: "POST", path: "/service/create" },
  async (req) => {
    // Generate service code (format: SRV-YYYYMMDD-XXX)
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Get count of services created today
    const count = await serviceDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    
    const serviceCode = `SRV-${dateStr}-${String((count?.count || 0) + 1).padStart(3, '0')}`;

    const service = await serviceDB.queryRow<{
      id: number;
      service_code: string;
      customer_id: number | null;
      customer_name: string;
      customer_phone: string | null;
      customer_address: string | null;
      technician_id: number | null;
      item_type: string;
      completeness: string | null;
      serial_number: string | null;
      notes: string | null;
      damage_report: string | null;
      repair_cost: number;
      parts_cost: number;
      total_cost: number;
      status: string;
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO services (
        service_code, customer_name, customer_phone, customer_address,
        item_type, completeness, serial_number, notes
      )
      VALUES (
        ${serviceCode}, ${req.customerName}, ${req.customerPhone || null}, ${req.customerAddress || null},
        ${req.itemType}, ${req.completeness || null}, ${req.serialNumber || null}, ${req.notes || null}
      )
      RETURNING *
    `;

    if (!service) {
      throw new Error("Failed to create service");
    }

    return {
      id: service.id,
      serviceCode: service.service_code,
      customerId: service.customer_id,
      customerName: service.customer_name,
      customerPhone: service.customer_phone,
      customerAddress: service.customer_address,
      technicianId: service.technician_id,
      itemType: service.item_type,
      completeness: service.completeness,
      serialNumber: service.serial_number,
      notes: service.notes,
      damageReport: service.damage_report,
      repairCost: service.repair_cost,
      partsCost: service.parts_cost,
      totalCost: service.total_cost,
      status: service.status,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
  }
);
