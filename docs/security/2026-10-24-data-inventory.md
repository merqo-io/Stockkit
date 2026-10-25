# stockkit personal-data inventory (2026-10-24)

Source: `supabase/migrations/0001` to `0022` on `origin/main`. Nothing is dropped by this PR. "Candidate to drop" rows need owner approval, then a follow-up migration PR.

Stockkit holds almost no personal data: a vendor's own stock records. There are no customer columns.

| Table               | Column                                       | Purpose                                             | Read by              | Retention today | Verdict                                   |
| ------------------- | -------------------------------------------- | --------------------------------------------------- | -------------------- | --------------- | ----------------------------------------- |
| `vendors`           | `id`, stall name                             | The vendor's own row                                | Dashboard, admin     | Life of account | Required                                  |
| `products`          | `name`, `unit`, `unit_cost_cents`, `on_hand` | The vendor's stock list                             | Dashboard            | Life of account | Required (business data, not personal)    |
| `stock_movements`   | `note`, `reason`, `delta`                    | Stock history; `note` is free text the vendor types | Product history page | Kept            | Required; retention period to set in X-26 |
| `feedback`          | `message`                                    | Vendor feedback                                     | Admin                | Kept            | Required; retention period to set in X-26 |
| `legal_check_state` | `email`                                      | Cache of merqo's legal answer                       | Legal gate           | Life of account | Required                                  |
| `admin_audit`       | `admin_id`, `detail`                         | Admin trail                                         | Admin activity       | Kept            | Required                                  |

## Proposed drop list (owner approval needed)

None. `stock_movements.linked_movement_id` and `product_components` are covered by SK-01 (keep or drop), not this inventory.
