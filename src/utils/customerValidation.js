export function validateCustomer({ name, phone, customers = [], editingId = null }) {
  if (!name.trim())  return 'Please enter the customer\'s full name.';
  if (!phone.trim()) return 'Please enter the customer\'s phone number.';
  const duplicate = customers.find(
    c => c.Name.trim().toLowerCase() === name.trim().toLowerCase() && c.id !== editingId
  );
  if (duplicate) return `A customer named "${duplicate.Name}" already exists.`;
  return null;
}
