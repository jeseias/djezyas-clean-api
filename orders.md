Generate the following use cases for the `Order` domain using DDD principles and the following dependencies:

- `orderRepository: OrderRepository`
- `productRepository: ProductRepository`
- `priceRepository: PriceRepository`
- `isUserValidService: IsUserValidService`
- `isOrganizationValidService: IsOrganizationValidService`
- `isOrganizationMemberService: IsOrganizationMemberService`

Each use case should follow a clean architecture pattern, like the `ClearCartUseCase` example. Input and output types should be nested under a namespace using the use case name. All errors should be handled using `AppError` and `ErrorCode`.

### 📦 Use Cases to Generate

1. **CreateOrdersFromCartUseCase**  
   - Input: userId, list of cart items  
   - Output: list of created orders (one per organization)

2. **MarkOrderAsPaidUseCase**  
   - Input: orderId or list of orderIds  
   - Marks the order as paid

3. **ExpireOrderUseCase**  
   - Input: orderId  
   - Marks a pending order as expired (based on external payment timeout or polling result)

4. **CancelOrderUseCase**  
   - Input: orderId and userId  
   - Validates that the user is the owner, and marks the order as cancelled if pending

5. **GetOrdersByUserUseCase**  
   - Input: userId  
   - Output: list of orders grouped by date or status

6. **GetOrdersByOrganizationUseCase**  
   - Input: organizationId  
   - Validates that the current user is a member of the organization  
   - Output: list of orders for that vendor

7. **GetOrderByIdUseCase**  
   - Input: orderId and userId or organizationId  
   - Output: full order details  
   - Includes permission validation (user or org member)

8. **FilterOrdersByStatusUseCase**  
   - Input: organizationId, status (optional), date range (optional)  
   - For reporting or dashboard filtering

9. **CalculateOrderTotalsUseCase** (Optional Utility)  
   - Input: list of items  
   - Output: subtotal, total, fee breakdown  
   - Used before placing an order to confirm totals

10. **MarkOrdersAsPaidByTransactionIdUseCase**  
   - Input: transactionId  
   - Fetch all orders linked to that transaction and mark as paid

11. **SplitCartIntoOrdersUseCase** (Helper use case)  
   - Input: full cart  
   - Output: map of organizationId -> order items  
   - Useful inside `CreateOrdersFromCartUseCase`

### 💡 Notes
- Orders should be validated for product availability and price consistency during creation.
- Subtotal and total should be calculated from unit prices, not user input.
- All timestamps (createdAt, updatedAt) should be handled consistently.

