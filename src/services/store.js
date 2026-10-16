export function filterCatalog(products, { search = '', available = false, minPrice = '', maxPrice = '', sort = 'default' } = {}) {
  const term = search.trim().toLocaleLowerCase('es');
  const list = products.filter(p => {
    const text = `${p.title} ${p.description || ''} ${p.characteristics || ''}`.toLocaleLowerCase('es');
    return (!term || text.includes(term)) && (!available || Number(p.stock) > 0)
      && (minPrice === '' || Number(p.price) >= Number(minPrice))
      && (maxPrice === '' || Number(p.price) <= Number(maxPrice));
  });
  if (sort === 'price-asc') list.sort((a, b) => Number(a.price) - Number(b.price));
  if (sort === 'price-desc') list.sort((a, b) => Number(b.price) - Number(a.price));
  if (sort === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title, 'es'));
  return list;
}

export function summarizeSales(orders) {
  const paid = orders.filter(o => o.payment_status === 'paid' && o.status !== 'cancelled' && !o.demo);
  const revenue = paid.reduce((sum, o) => sum + Number(o.subtotal || 0) - Number(o.discount_amount || 0), 0);
  let costs = 0;
  let knownCosts = true;
  const sold = new Map();
  for (const order of paid) {
    if (!order.items_data?.length) knownCosts = false;
    for (const item of order.items_data || []) {
      if (item.cost_price == null) knownCosts = false;
      else costs += Number(item.cost_price) * Number(item.quantity);
      const row = sold.get(item.id) || { id: item.id, title: item.title, quantity: 0 };
      row.quantity += Number(item.quantity);
      sold.set(item.id, row);
    }
  }
  return { paid, count: paid.length, revenue, average: paid.length ? Math.round(revenue / paid.length) : 0,
    productMargin: paid.length && knownCosts ? revenue - costs : null,
    bestSellers: [...sold.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5) };
}
