import db from "../config/database";
import { AppError } from "../middlewares/errorHandler";
import { Invoice } from "../types";

export class InvoiceService {
  // Generate invoice with unique code and handle race condition
  async createInvoice(data: any) {
    const client = await db.connect();

    try {
      // Start transaction
      await client.query("BEGIN");

      // Get current date prefix (YYYYMMDD)
      const datePrefix = new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "");

      // Lock and get last sequence number for today
      await client.query("LOCK TABLE invoices IN EXCLUSIVE MODE");

      const result = await client.query(
        `SELECT COALESCE(MAX(sequence_number), 0) as last_sequence
        FROM invoices
        WHERE date_prefix = $1`,
        [datePrefix]
      );
      const lastSequence = result.rows[0].last_sequence;
      const nextSequence = lastSequence + 1;

      // Generate unique code: INV-YYYYMMDD-00001
      const code = `INV-${datePrefix}-${nextSequence
        .toString()
        .padStart(5, "0")}`;

      // Insert invoice
      const insertResult = await client.query(
        `INSERT INTO invoices (code, date_prefix, sequence_number, data)
         VALUES ($1, $2, $3, $4)
         RETURNING id, code, date_prefix, sequence_number, data, created_at`,
        [code, datePrefix, nextSequence, JSON.stringify(data)]
      );

      // Commit transaction
      await client.query("COMMIT");

      return insertResult.rows[0];
    } catch (error) {
      // Rollback on error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      // Release client back to pool
      client.release();
    }
  }

  // Get all invoices
  async getAllInvoices(limit: number = 10, offset: number = 0) {
    const result = await db.query(
      `SELECT id, code, date_prefix, sequence_number, data, created_at
       FROM invoices
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  // Get invoice by code
  async getInvoiceByCode(code: string) {
    const result = await db.query(
      `SELECT id, code, date_prefix, sequence_number, data, created_at
       FROM invoices
       WHERE code = $1`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new AppError("Invoice not found", 404);
    }

    return result.rows[0];
  }

  // Test race condition - create multiple invoices simultaneously
  async testRaceCondition(count: number = 5) {
    const promises = [];

    for (let i = 0; i < count; i++) {
      promises.push(
        this.createInvoice({
          test: true,
          index: i + 1,
          timestamp: new Date().toISOString(),
        })
      );
    }

    // Execute all creates simultaneously
    const results = await Promise.all(promises);

    return {
      message: `Created ${count} invoices simultaneously`,
      invoices: results.map((inv) => ({
        code: inv.code,
        sequence: inv.sequence_number,
      })),
    };
  }
}
