import { SHIRT_FIELDS, PANT_FIELDS } from '../constants/fields';

export function validateOrder({ forName, qty, price, deliveryDate, type, shirtM, pantM }) {
  if (!forName.trim())   return 'Please enter who this order is for.';
  if (!qty)              return 'Please enter quantity.';
  if (!(parseFloat(price) > 0)) return 'Please enter a valid price per item.';
  if (!deliveryDate)     return 'Please select a delivery date.';

  const fields = type === 'Shirt' ? SHIRT_FIELDS : PANT_FIELDS;
  const mState = type === 'Shirt' ? shirtM : pantM;
  const missing = fields.filter(f => f.required && !mState[f.key]?.trim()).map(f => f.label);
  if (missing.length)  return `Please fill in: ${missing.join(', ')}`;

  return null;
}
