import { api, APIError } from "encore.dev/api";
import { serviceDB } from "./db";

interface UpdateServiceRequest {
  id: number;
  technicianId?: number;
  damageReport?: string;
  repairCost?: number;
  partsCost?: number;
  status?: "terima" | "proses" | "selesai" | "batal" | "diambil";
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

// Updates a service request.
export const updateService = api<UpdateServiceRequest, Service>(
  { expose: true, method: "PUT", path: "/service/update" },
  async (req) => {
    const totalCost = (req.repairCost || 0) + (req.partsCost || 0);

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
      UPDATE services 
      SET 
        technician_id = COALESCE(${req.technicianId || null}, technician_id),
        damage_report = COALESCE(${req.damageReport || null}, damage_report),
        repair_cost = COALESCE(${req.repairCost || null}, repair_cost),
        parts_cost = COALESCE(${req.partsCost || null}, parts_cost),
        total_cost = CASE 
          WHEN ${req.repairCost !== undefined || req.partsCost !== undefined} THEN ${totalCost}
          ELSE total_cost 
        END,
        status = COALESCE(${req.status || null}, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${req.id}
      RETURNING *
    `;

    if (!service) {
      throw APIError.notFound("Service not found");
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
