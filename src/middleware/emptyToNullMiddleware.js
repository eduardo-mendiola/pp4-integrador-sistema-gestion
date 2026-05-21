// Lista de campos que pueden ser null si están vacíos
const nullableFields = [
  'first_name', 'last_name', 'category',
  'company_type', 'name', 'website',
  'email', 'phone', 'address_street',
  'address_city', 'address_state', 'address_postal_code',
  'address_country', 'address_country_code',
  'billing_payment_terms', 'billing_currency',
  'contact_name'
];

const emptyToNull = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    // Si el campo está en la lista o cualquier campo opcional que quieras
    if (nullableFields.includes(key) && req.body[key] === '') {
      req.body[key] = null;
    }
  });
  next();
};

export default emptyToNull;
