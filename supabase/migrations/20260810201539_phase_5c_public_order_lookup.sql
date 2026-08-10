alter table public.orders
  add column if not exists public_lookup_token uuid not null default gen_random_uuid();

create unique index if not exists orders_public_lookup_token_uidx
  on public.orders(public_lookup_token);

create or replace function public.create_order_transaction_v2(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  lookup_token uuid;
begin
  result := public.create_order_transaction(payload);

  select public_lookup_token
    into lookup_token
  from public.orders
  where id = (result ->> 'orderId')::uuid;

  if lookup_token is null then
    raise exception 'order_lookup_token_missing';
  end if;

  return result || jsonb_build_object('lookupToken', lookup_token);
end;
$$;

create or replace function public.get_public_order(order_number_input text, lookup_token_input uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders%rowtype;
  customer_data jsonb;
  address_data jsonb;
  item_data jsonb;
  event_data jsonb;
begin
  select *
    into order_row
  from public.orders
  where order_number = order_number_input
    and public_lookup_token = lookup_token_input;

  if order_row.id is null then
    return null;
  end if;

  select jsonb_build_object(
      'firstName', c.first_name,
      'lastName', c.last_name,
      'phone', c.phone,
      'email', c.email
    )
    into customer_data
  from public.customers c
  where c.id = order_row.customer_id;

  select jsonb_build_object(
      'street', coalesce(a.street, ''),
      'exteriorNumber', coalesce(a.exterior_number, ''),
      'interiorNumber', nullif(a.interior_number, ''),
      'neighborhood', coalesce(a.neighborhood, ''),
      'postalCode', coalesce(a.postal_code, ''),
      'city', coalesce(a.city, ''),
      'state', coalesce(a.state, ''),
      'references', nullif(a.delivery_references, '')
    )
    into address_data
  from public.order_addresses a
  where a.order_id = order_row.id
    and a.type = 'shipping'
  order by a.created_at desc
  limit 1;

  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'bundleId', oi.bundle_id,
          'sku', oi.sku,
          'name', oi.name,
          'variant', oi.variant_name,
          'image', oi.image_path,
          'quantity', oi.quantity,
          'unitPrice', oi.unit_price,
          'total', oi.total
        )
        order by oi.created_at asc
      ),
      '[]'::jsonb
    )
    into item_data
  from public.order_items oi
  where oi.order_id = order_row.id;

  select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', oe.id,
          'eventType', oe.event_type,
          'fromStatus', oe.from_status,
          'toStatus', oe.to_status,
          'notes', oe.notes,
          'createdAt', oe.created_at,
          'metadata', oe.metadata
        )
        order by oe.created_at asc
      ),
      '[]'::jsonb
    )
    into event_data
  from public.order_events oe
  where oe.order_id = order_row.id;

  return jsonb_build_object(
    'id', order_row.id,
    'orderNumber', order_row.order_number,
    'createdAt', order_row.created_at,
    'updatedAt', order_row.updated_at,
    'status', order_row.status,
    'customer', coalesce(customer_data, '{}'::jsonb),
    'shippingAddress', coalesce(address_data, '{}'::jsonb),
    'items', item_data,
    'subtotal', order_row.subtotal,
    'shipping', order_row.shipping,
    'total', order_row.total,
    'currency', order_row.currency,
    'shippingMethod', coalesce(order_row.shipping_method, 'Envio estandar'),
    'trackingNumber', order_row.tracking_number,
    'carrier', order_row.carrier,
    'trackingUrl', order_row.tracking_url,
    'whatsappOptIn', order_row.whatsapp_opt_in,
    'customerNotes', order_row.customer_notes,
    'internalNotes', order_row.internal_notes,
    'requiresInvoice', order_row.requires_invoice,
    'events', event_data
  );
end;
$$;

revoke all on function public.create_order_transaction_v2(jsonb) from public;
revoke all on function public.get_public_order(text, uuid) from public;

grant execute on function public.create_order_transaction_v2(jsonb) to anon, authenticated;
grant execute on function public.get_public_order(text, uuid) to anon, authenticated;
