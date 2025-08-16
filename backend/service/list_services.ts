import { api } from "encore.dev/api";
import { serviceDB } from "./db";

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

interface ListServicesResponse {
  services: Service[];
}

// Lists all service requests.
export const listServices = api<void, ListServicesResponse>(
  { expose: true, method: "GET", path: "/service/list" },
  async () => {
    const services = await serviceDB.queryAll<{
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
      SELECT * FROM services 
      ORDER BY created_at DESC
    `;

    return {
      services: services.map(service => ({
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
      }))
    };
  }
);
