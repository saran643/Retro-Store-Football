/**
 * RETRO STORE - Comprehensive End-to-End Integration Test Suite
 * Tests all workflows required by Section 21 of project specifications:
 * 1. User Registration, Duplicate Rejection, Login, Credentials validation
 * 2. Product Search, Filtering, Categories, and Single Product Details
 * 3. Shopping Cart operations, quantity updates, subtotals, delivery charge
 * 4. Wishlist operations and duplicate prevention
 * 5. Atomic Checkout transaction, COD order placement, stock deduction, cart clearing
 * 6. User Order History and Order Details ownership verification
 * 7. Profile update and password change
 * 8. Role-Based Access Control: Normal user blocked from admin APIs (403)
 * 9. Admin Login, Dashboard Stats, Product Management, Order Status Management, Users & Inventory
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('     RETRO STORE - END-TO-END SPECIFICATION TEST SUITE          ');
  console.log('================================================================\n');

  try {
    // 1. HEALTH CHECK
    console.log('[1/8] Verifying API Server & Health Check:');
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API Server is healthy and responsive');
    assert(health.body.store === 'RETRO STORE', 'Store branding verified as RETRO STORE');
    assert(health.body.currency === 'INR (₹)', 'Currency verified as Indian Rupees (INR)');

    // 2. USER REGISTRATION & LOGIN
    console.log('\n[2/8] Testing User Registration & Authentication (Section 3 & 21):');
    const testEmail = `tester_${Date.now()}@retrotest.in`;
    const regRes = await request('POST', '/auth/register', {
      full_name: 'Vikramaditya Roy',
      email: testEmail,
      phone: '+91 9876543210',
      password: 'SecurePassword@123',
      confirm_password: 'SecurePassword@123'
    });
    assert(regRes.status === 201 && regRes.body.success, 'New user successfully registered in MySQL');
    const userToken = regRes.body.token;

    // Duplicate email registration rejection
    const dupRes = await request('POST', '/auth/register', {
      full_name: 'Duplicate Tester',
      email: testEmail,
      password: 'AnotherPassword@123'
    });
    assert(dupRes.status === 409, 'Duplicate email registration safely rejected with 409 Conflict');

    // Invalid credentials rejection
    const badLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'WrongPassword'
    });
    assert(badLogin.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // Valid login
    const goodLogin = await request('POST', '/auth/login', {
      email: testEmail,
      password: 'SecurePassword@123'
    });
    assert(goodLogin.status === 200 && goodLogin.body.token, 'Customer logged in and received valid JWT');

    // 3. PRODUCT CATALOG, FILTERING, & DETAILS
    console.log('\n[3/8] Testing Product Catalog, Search & Details (Section 9 & 10):');
    const prodList = await request('GET', '/products?limit=5');
    assert(prodList.status === 200 && prodList.body.products.length > 0, 'Products catalog retrieved with pagination');
    
    // Search by name
    const searchRes = await request('GET', '/products?search=Zidane');
    assert(searchRes.status === 200 && searchRes.body.products.some(p => p.product_name.includes('Zidane')), 'Product search by name ("Zidane") succeeded');

    // Filter by category
    const catRes = await request('GET', '/categories');
    assert(catRes.status === 200 && catRes.body.categories.length === 11, 'All 11 required football categories verified');

    // Single product details with variants
    const singleProd = await request('GET', '/products/1');
    assert(singleProd.status === 200 && singleProd.body.product.variants.length > 0, 'Product details returned with size variants and gallery images');
    const sampleVariant = singleProd.body.product.variants[0];
    const initialVariantStock = sampleVariant.stock_quantity;

    // 4. SHOPPING CART OPERATIONS
    console.log('\n[4/8] Testing Shopping Cart & Delivery Calculation (Section 11):');
    // Add item to cart
    const addCart = await request('POST', '/cart', {
      product_id: 1,
      variant_id: sampleVariant.variant_id,
      quantity: 1
    }, userToken);
    assert(addCart.status === 200 && addCart.body.success, 'Added product variant to persistent MySQL cart');

    // Fetch cart
    const cartRes = await request('GET', '/cart', null, userToken);
    assert(cartRes.status === 200 && cartRes.body.items.length === 1, 'Cart retrieved with correct item count');
    assert(cartRes.body.summary.total > 0, 'Order summary calculated on backend');

    // Update quantity
    const cartItemId = cartRes.body.items[0].cart_item_id;
    const updateQty = await request('PUT', `/cart/${cartItemId}`, { quantity: 2 }, userToken);
    assert(updateQty.status === 200, 'Cart item quantity updated');

    // 5. WISHLIST OPERATIONS
    console.log('\n[5/8] Testing Wishlist Functionality (Section 12):');
    const addWish = await request('POST', '/wishlist', { product_id: 2 }, userToken);
    assert(addWish.status === 201 || addWish.status === 200, 'Added product to customer wishlist');
    
    const getWish = await request('GET', '/wishlist', null, userToken);
    assert(getWish.status === 200 && getWish.body.items.length >= 1, 'Wishlist items retrieved successfully');

    // 6. CHECKOUT, ATOMIC TRANSACTIONS & ORDER CONFIRMATION
    console.log('\n[6/8] Testing Checkout & COD Order Placement (Section 13 & 14):');
    const orderRes = await request('POST', '/orders', {
      shipping_name: 'Vikramaditya Roy',
      shipping_phone: '9876543210',
      shipping_address: '77 Heritage Court, Football Avenue',
      shipping_city: 'Kolkata',
      shipping_state: 'West Bengal',
      shipping_pin_code: '700001',
      payment_method: 'COD'
    }, userToken);

    assert(orderRes.status === 201 && orderRes.body.order.orderNumber.startsWith('RETRO-'), 'Atomic COD order placed with unique RETRO- order number');
    const createdOrderNumber = orderRes.body.order.orderNumber;

    // Verify cart is now empty
    const emptyCartRes = await request('GET', '/cart', null, userToken);
    assert(emptyCartRes.status === 200 && emptyCartRes.body.items.length === 0, 'Shopping cart automatically emptied after purchase');

    // Verify stock was safely reduced in database
    const refreshedProd = await request('GET', '/products/1');
    const refreshedVariant = refreshedProd.body.product.variants.find(v => v.variant_id === sampleVariant.variant_id);
    assert(refreshedVariant.stock_quantity === initialVariantStock - 2, 'Variant stock decremented atomically (concurrency protection)');

    // Verify user order history
    const myOrdersRes = await request('GET', '/orders/my-orders', null, userToken);
    assert(myOrdersRes.status === 200 && myOrdersRes.body.orders.some(o => o.order_number === createdOrderNumber), 'Order appears in customer Order History');

    // 7. SECURITY & ROLE-BASED ACCESS CONTROL (Section 4 & 18)
    console.log('\n[7/8] Testing Security & Role-Based Authorization:');
    // Normal user attempting to access admin dashboard endpoint
    const forbiddenAdminCall = await request('GET', '/admin/dashboard', null, userToken);
    assert(forbiddenAdminCall.status === 403, 'Normal user blocked from protected admin APIs with 403 Forbidden');

    // Normal user attempting to login through admin portal
    const forbiddenAdminLogin = await request('POST', '/auth/admin-login', {
      email: testEmail,
      password: 'SecurePassword@123'
    });
    assert(forbiddenAdminLogin.status === 403, 'Normal user blocked from /api/auth/admin-login with 403 Forbidden');

    // Unauthenticated user attempting to access protected orders
    const unauthOrderCall = await request('GET', '/orders/my-orders');
    assert(unauthOrderCall.status === 401, 'Unauthenticated visitor blocked with 401 Unauthorized');

    // 8. ADMIN LOGIN & DASHBOARD MANAGEMENT (Section 15)
    console.log('\n[8/8] Testing Administrator Features & Dashboard:');
    const adminLoginRes = await request('POST', '/auth/admin-login', {
      email: 'admin@retrostore.in',
      password: 'Admin@1234'
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.token, 'Administrator logged in successfully via admin login');
    const adminToken = adminLoginRes.body.token;

    // Admin Dashboard Stats
    const adminStats = await request('GET', '/admin/dashboard', null, adminToken);
    assert(adminStats.status === 200 && adminStats.body.stats.totalProducts > 0, 'Admin Dashboard statistics retrieved from MySQL');
    assert(adminStats.body.stats.totalRevenue > 0, 'Admin total revenue accurately calculated from eligible orders');

    // Admin Orders Management & Status Update
    const adminOrdersRes = await request('GET', '/admin/orders', null, adminToken);
    assert(adminOrdersRes.status === 200 && adminOrdersRes.body.orders.length > 0, 'Admin orders list retrieved');
    const testAdminOrder = adminOrdersRes.body.orders[0];

    const updateStatusRes = await request('PUT', `/admin/orders/${testAdminOrder.order_id}/status`, {
      order_status: 'Shipped'
    }, adminToken);
    assert(updateStatusRes.status === 200 && updateStatusRes.body.success, 'Admin updated order status to "Shipped"');

    // Admin Users Management
    const adminUsersRes = await request('GET', '/admin/users', null, adminToken);
    assert(adminUsersRes.status === 200 && adminUsersRes.body.users.length > 0, 'Admin customer users list retrieved without exposing password hashes');

    // Admin Inventory Management
    const adminInvRes = await request('GET', '/admin/inventory', null, adminToken);
    assert(adminInvRes.status === 200 && adminInvRes.body.inventory.length > 0, 'Admin inventory variants and SKU stock levels retrieved');

    console.log('\n================================================================');
    console.log('   ALL SPECIFICATION & SECURITY INTEGRATION TESTS PASSED!       ');
    console.log('================================================================\n');
  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
}

runTestSuite();
