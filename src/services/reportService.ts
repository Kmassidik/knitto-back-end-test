import db from "../config/database";
import { AppError } from "../middlewares/errorHandler";

export class ReportService {
  // Report A: Top customers by purchase
  async getTopCustomers(limit: number = 10) {
    const result = await db.query(
      `SELECT 
        c.id as customer_id,
        c.name as customer_name,
        c.email,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id, c.name, c.email
      ORDER BY total_spent DESC
      LIMIT $1`,
      [limit]
    );

    return result.rows;
  }

  // Report B: Sales by date range
  async getSalesByDateRange(startDate: string, endDate: string) {
    const result = await db.query(
      `SELECT 
        DATE(o.created_at) as date,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as average_order_value
      FROM orders o
      WHERE DATE(o.created_at) BETWEEN $1 AND $2
      GROUP BY DATE(o.created_at)
      ORDER BY date DESC`,
      [startDate, endDate]
    );

    // Calculate summary
    const summary = await db.query(
      `SELECT 
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as average_order_value
      FROM orders o
      WHERE DATE(o.created_at) BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    return {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      summary: summary.rows[0],
      daily: result.rows,
    };
  }

  // Report C: Average products sold per month
  async getAverageProductsPerMonth(year: number) {
    const result = await db.query(
      `SELECT 
        TO_CHAR(o.created_at, 'YYYY-MM') as month,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_sales,
        COALESCE(AVG(o.total_amount), 0) as average_order_value
      FROM orders o
      WHERE EXTRACT(YEAR FROM o.created_at) = $1
      GROUP BY TO_CHAR(o.created_at, 'YYYY-MM')
      ORDER BY month ASC`,
      [year]
    );

    // Fill in missing months with zero values
    const allMonths = this.generateMonthsForYear(year);
    const dataMap = new Map(result.rows.map((row) => [row.month, row]));

    const completeData = allMonths.map((month) => {
      const existing = dataMap.get(month);
      return (
        existing || {
          month,
          total_orders: 0,
          total_sales: 0,
          average_order_value: 0,
        }
      );
    });

    return {
      year,
      months: completeData,
      summary: {
        total_orders: result.rows.reduce(
          (sum, row) => sum + parseInt(row.total_orders),
          0
        ),
        total_sales: result.rows.reduce(
          (sum, row) => sum + parseFloat(row.total_sales),
          0
        ),
      },
    };
  }

  // Report D: Customer growth over time
  async getCustomerGrowth(startDate: string, endDate: string) {
    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM customers
      WHERE DATE(created_at) BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDate, endDate]
    );

    // Calculate cumulative total
    let cumulative = 0;
    const dataWithCumulative = result.rows.map((row) => {
      cumulative += parseInt(row.new_customers);
      return {
        ...row,
        cumulative_customers: cumulative,
      };
    });

    return {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      data: dataWithCumulative,
      summary: {
        new_customers: result.rows.reduce(
          (sum, row) => sum + parseInt(row.new_customers),
          0
        ),
        total_customers: cumulative,
      },
    };
  }

  // Report E: System activity summary
  async getSystemActivitySummary() {
    // Count users
    const usersResult = await db.query("SELECT COUNT(*) as count FROM users");

    // Count invoices
    const invoicesResult = await db.query(
      "SELECT COUNT(*) as count FROM invoices"
    );

    // Count today's invoices
    const todayInvoicesResult = await db.query(
      `SELECT COUNT(*) as count FROM invoices WHERE DATE(created_at) = CURRENT_DATE`
    );

    // Count customers
    const customersResult = await db.query(
      "SELECT COUNT(*) as count FROM customers"
    );

    // Count orders
    const ordersResult = await db.query("SELECT COUNT(*) as count FROM orders");

    // Total sales
    const salesResult = await db.query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders"
    );

    return {
      users: {
        total: parseInt(usersResult.rows[0].count),
      },
      invoices: {
        total: parseInt(invoicesResult.rows[0].count),
        today: parseInt(todayInvoicesResult.rows[0].count),
      },
      customers: {
        total: parseInt(customersResult.rows[0].count),
      },
      orders: {
        total: parseInt(ordersResult.rows[0].count),
      },
      sales: {
        total: parseFloat(salesResult.rows[0].total),
      },
      generated_at: new Date().toISOString(),
    };
  }

  // Helper: Generate all months for a year
  private generateMonthsForYear(year: number): string[] {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const month = i.toString().padStart(2, "0");
      months.push(`${year}-${month}`);
    }
    return months;
  }
}
