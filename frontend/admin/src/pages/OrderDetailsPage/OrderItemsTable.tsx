import { Table, Header, Box } from "@cloudscape-design/components";
import type { IOrderItem } from "../../app/api/orders";

export default function OrderItemsTable({ items }: { items: IOrderItem[] }) {
  return (
    <Table<IOrderItem>
      items={items}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (item) => item.name,
        },
        {
          id: "qty",
          header: "Quantity",
          cell: (item) => item.qty,
        },
        {
          id: "amount",
          header: "Amount",
          cell: (item) => `₹ ${item.amount.toFixed(2)}`,
        },
      ]}
      header={
        <Header variant="h2" counter={`(${items.length})`}>
          Items
        </Header>
      }
      empty={
        <Box textAlign="center" color="inherit">
          No items
        </Box>
      }
    />
  );
}
