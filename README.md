# vamsiMart

vamsiMart is a multipage ecommerce website built with HTML, CSS, JavaScript, Node.js, Express, and SQLite.

## Features

- Marketplace-style homepage
- Product catalog with 735+ generated products
- 105+ products in each department
- Electronics, Fashion, Beauty, Home, Grocery, Appliances, and Sports categories
- Product search and category filtering
- Sorting by price
- Load-more pagination
- Product detail pages
- Persistent shopping cart
- Account registration and login
- JWT authentication API
- Account-specific carts
- Checkout flow
- UPI, card, net banking, and cash-on-delivery payment options
- Order creation and order history support
- Responsive layouts
- Custom vamsiMart favicon

## Run locally

Requirements:

- Node.js 18 or newer
- npm

Install dependencies:

```powershell
npm install
```

Create a local environment file from the example:

```powershell
Copy-Item .env.example .env
```

Start the server:

```powershell
node server.js
```

Open the website:

```text
http://localhost:4173
```

Do not open the HTML files directly with `file://`. The account, catalog API, checkout, and order features require the Express server.

## Project demo

Watch the project walkthrough recording:

[Open the vamsiMart project demo video](./media/vamsimart-project-demo.mp4)

## Main pages

- `/index.html` - homepage
- `/products.html` - catalog, search, filters, and sorting
- `/categories.html` - category browsing
- `/product.html?id=1` - product details
- `/cart.html` - shopping cart
- `/checkout.html` - checkout and payment selection
- `/account.html` - registration and login

## API routes

- `GET /api/health`
- `GET /api/products`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/payments/confirm`
- `POST /api/orders`
- `GET /api/orders`

## Project structure

```text
index.html       Homepage
products.html    Product catalog
categories.html  Category browser
product.html     Product details
cart.html        Shopping cart
checkout.html    Checkout
account.html     Customer account
script.js        Frontend behavior and API integration
styles.css       Responsive styling
server.js        Express API and SQLite database
favicon.png      vamsiMart favicon
media/           Project demo video and other media
```

## Notes

The checkout payment flow is a demo integration. It does not process real payments or store real card details. Connect a production payment provider such as Razorpay or Stripe before deploying for real transactions.
