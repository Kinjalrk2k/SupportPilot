import { useState } from "react";
import {
  AttributeEditor,
  Box,
  Button,
  ColumnLayout,
  Container,
  Form,
  FormField,
  Input,
  Select,
  SpaceBetween,
  Textarea,
} from "@cloudscape-design/components";
import type {
  IOrderCreate,
  OrderStatusType,
  PaymentStatusType,
} from "../app/api/orders";

interface OrderFormProps {
  initialValues?: Partial<IOrderCreate>;
  onSubmit: (values: IOrderCreate) => void;
  onCancel: () => void;
  isLoading: boolean;
  submitText: string;
  headerText: string;
}

const ORDER_STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Preparing", value: "preparing" },
  { label: "Out for Delivery", value: "out_for_delivery" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Refunded", value: "refunded" },
];

export default function OrderForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
  submitText,
  headerText,
}: OrderFormProps) {
  const [values, setValues] = useState<IOrderCreate>({
    customer_name: initialValues?.customer_name || "",
    customer_phone: initialValues?.customer_phone || "",
    delivery_address: initialValues?.delivery_address || "",
    delivery_notes: initialValues?.delivery_notes || "",
    items: initialValues?.items || [],
    total_amount: initialValues?.total_amount || 0,
    order_status: initialValues?.order_status || "pending",
    payment_status: initialValues?.payment_status || "unpaid",
  });

  const handleChange = <K extends keyof IOrderCreate>(
    field: K,
    value: IOrderCreate[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const calculateTotal = (items: IOrderCreate["items"]) => {
    return items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleItemsChange = (items: IOrderCreate["items"]) => {
    const newItems = [...items];
    handleChange("items", newItems);
    handleChange("total_amount", calculateTotal(newItems));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button formAction="none" variant="link" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isLoading}
              disabled={isLoading || values.items.length === 0}
            >
              {submitText}
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <Container header={<h2>{headerText}</h2>}>
            <SpaceBetween size="l">
              <ColumnLayout columns={2}>
                <FormField label="Customer Name">
                  <Input
                    value={values.customer_name}
                    onChange={({ detail }) =>
                      handleChange("customer_name", detail.value)
                    }
                  />
                </FormField>

                <FormField label="Customer Phone">
                  <Input
                    value={values.customer_phone}
                    onChange={({ detail }) =>
                      handleChange("customer_phone", detail.value)
                    }
                  />
                </FormField>
              </ColumnLayout>

              <ColumnLayout columns={2}>
                <FormField label="Delivery Address">
                  <Textarea
                    value={values.delivery_address}
                    onChange={({ detail }) =>
                      handleChange("delivery_address", detail.value)
                    }
                  />
                </FormField>

                <FormField label="Delivery Notes">
                  <Textarea
                    value={values.delivery_notes || ""}
                    onChange={({ detail }) =>
                      handleChange("delivery_notes", detail.value)
                    }
                  />
                </FormField>
              </ColumnLayout>
            </SpaceBetween>
          </Container>

          <Container header={<h2>Order Details</h2>}>
            <SpaceBetween size="l">
              <AttributeEditor
                onAddButtonClick={() =>
                  handleItemsChange([
                    ...values.items,
                    { name: "", qty: 1, amount: 0 },
                  ])
                }
                onRemoveButtonClick={({ detail: { itemIndex } }) => {
                  const items = [...values.items];
                  items.splice(itemIndex, 1);
                  handleItemsChange(items);
                }}
                items={values.items}
                addButtonText="Add item"
                removeButtonText="Remove"
                empty={<Box textAlign="center">No items added.</Box>}
                definition={[
                  {
                    label: "Name",
                    control: (item, itemIndex) => (
                      <Input
                        value={item.name}
                        onChange={({ detail }) => {
                          const newItems = [...values.items];
                          newItems[itemIndex].name = detail.value;
                          handleItemsChange(newItems);
                        }}
                        placeholder="Item name"
                      />
                    ),
                  },
                  {
                    label: "Quantity",
                    control: (item, itemIndex) => (
                      <Input
                        type="number"
                        value={item.qty.toString()}
                        onChange={({ detail }) => {
                          const newItems = [...values.items];
                          newItems[itemIndex].qty = parseInt(detail.value) || 0;
                          handleItemsChange(newItems);
                        }}
                      />
                    ),
                  },
                  {
                    label: "Amount",
                    control: (item, itemIndex) => (
                      <Input
                        type="number"
                        value={item.amount.toString()}
                        onChange={({ detail }) => {
                          const newItems = [...values.items];
                          newItems[itemIndex].amount =
                            parseFloat(detail.value) || 0;
                          handleItemsChange(newItems);
                        }}
                      />
                    ),
                  },
                ]}
              />

              <Box variant="h3" padding={{ top: "m" }}>
                Total Amount: ₹{values.total_amount.toFixed(2)}
              </Box>

              <ColumnLayout columns={2}>
                <FormField label="Order Status">
                  <Select
                    selectedOption={
                      ORDER_STATUS_OPTIONS.find(
                        (opt) => opt.value === values.order_status,
                      ) || null
                    }
                    onChange={({ detail }) =>
                      handleChange(
                        "order_status",
                        detail.selectedOption.value as unknown as OrderStatusType
                      )
                    }
                    options={ORDER_STATUS_OPTIONS}
                  />
                </FormField>

                <FormField label="Payment Status">
                  <Select
                    selectedOption={
                      PAYMENT_STATUS_OPTIONS.find(
                        (opt) => opt.value === values.payment_status,
                      ) || null
                    }
                    onChange={({ detail }) =>
                      handleChange(
                        "payment_status",
                        detail.selectedOption.value as unknown as PaymentStatusType,
                      )
                    }
                    options={PAYMENT_STATUS_OPTIONS}
                  />
                </FormField>
              </ColumnLayout>
            </SpaceBetween>
          </Container>
        </SpaceBetween>
      </Form>
    </form>
  );
}
