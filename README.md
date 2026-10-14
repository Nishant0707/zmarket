# Persoanl Detils 
Nishant Gautam
+91-9990058270
ngautam535@gmnail.com

# Added Few More custom Filters i hope you will like it 

# How to run 
in Folder once open in VS code Kindly Run Command of (" npm i or npm install ")

TO Install package to support Application And then Run 

Then Run  (  npx expo start --clear or npx expo start   )

# Login For App 
Username: emilys
Password: emilyspass

# Dummy Json 
https://dummyjson.com/products

# Z Market

A React Native shopping catalog demo built with Expo and JavaScript.

## Features

- Branded app icon and splash screen
- DummyJSON demo login and logout
- Product list and product detail screens
- Live product-name search with a 300 ms debounce
- Optional "Starts with" search
- Category filters
- Price and rating sorting
- Pagination with 12 products per page
- Pull-to-refresh
- Loading, error, empty, and retry states
- Failed refreshes preserve previously loaded products
- Failed pagination can be retried without removing loaded products
- Saved light/dark preference
- Responsive product grid and safe-area padding
- Glass-style panels, with iOS blur and Android translucent gradients

## Stack

- Expo / React Native
- JavaScript
- React Navigation native stack
- React Context
- AsyncStorage for theme preference
- Expo LinearGradient and BlurView
- Native fetch

## API

This app uses DummyJSON:

- Products documentation: https://dummyjson.com/docs/products
- Authentication documentation: https://dummyjson.com/docs/auth

Endpoints used:

- POST /auth/login
- GET /products?limit=12&skip=0
- GET /products/{id}
- GET /products/category-list
- GET /products/category/{category}
- GET /products/search?q={keyword}&limit=0

The products are fictional sample data.
No developer API key is required.
Prices are displayed in USD.

## Demo login

Username: emilys
Password: emilyspass

These are public DummyJSON sample credentials.

Use the "Fill demo credentials" button on the login screen.

Login is validated by DummyJSON. The app keeps its signed-in state
only in memory and does not persist passwords or tokens.
Restarting the app requires signing in again.

This is a demonstration login flow, not production authentication.
Product endpoints are public and are not protected by this login screen.

## Search and pagination

The regular catalog and category lists use server pagination:
12 products per request, using limit and skip.

Keyword search fetches all API matches for the current query.
Product-title matching, category filtering, and sorting are then
applied before displaying results in pages of 12.

This ensures combined filters include all matching search results.
It is suitable for this small demo dataset. A larger production
catalog should support combined filtering and pagination on its backend.

Default search is case-insensitive and matches text anywhere in
the product name. "Starts with" restricts matching to the beginning.

Refresh reloads the first page using the current filters.

## Run locally

Requirements:

- Node.js LTS
- npm
- Expo Go on a compatible Android or iOS device, or an emulator

Clone the repository and open its folder.

Install:

```bash
npm ci
```

Start:

```bash
npx expo start
```

Scan the QR code with Expo Go on Android or Camera on iOS.
The phone and computer should be on the same Wi-Fi network.

Optional tunnel:

```bash
npx expo start --tunnel
```

## Branding

The app uses assets/Z.png for its branding.

Native app icon and splash configuration are in app.json.
Verify the native splash in a standalone build; Expo Go does not
fully reproduce the native splash configuration.

## Manual checks

- Sign in using the sample account.
- Try an invalid password and confirm the error message.
- Search for "a" and test "Starts with".
- Combine a search with a category filter.
- Change the sorting order.
- Load another page and check for duplicate products.
- Open a product and navigate back.
- Pull down to refresh.
- Disable internet and test refresh and pagination errors.
- Restore internet and retry.
- Toggle the theme and restart to check theme persistence.
- Test narrow screens, tablets, and larger text settings.
- Sign out and confirm the login screen returns.

## Scope

This is an Android/iOS catalog demonstration.
There is no checkout, payment, delivery service, or offline catalog.
Theme preference is persisted; login sessions and products are not.