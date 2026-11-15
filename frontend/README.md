# HostelOLX

HostelOLX is a campus marketplace web app designed for students to buy, sell, exchange, and claim items within their hostel and campus community. It is built as a React + Vite frontend prototype with mock data and a modern student-focused UI.

## Overview

This project simulates a campus commerce platform where students can:

- Browse products listed by other students
- Search and filter items by hostel
- Save items in a wishlist
- Start chats with sellers
- Post new items for sale or giveaway
- Claim lost-found items
- Explore safe handover spots on campus
- Manage their student profile and room details

This app is designed around hostel life, quick transactions, safety, and easy peer-to-peer exchanges.

---

## Tech Stack

- Frontend: React
- Build Tool: Vite
- Language: JavaScript
- Styling: Custom CSS / component-based design
- State: React useState and useMemo
- Data: Mock in-memory data

---

## Project Structure

```bash
hostelOLX/
├── frontend/
│   ├── public/
│   │   └── images/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── CampusFavorites.jsx
│   │   │   ├── CampusPulse.jsx
│   │   │   ├── ChatDrawer.jsx
│   │   │   ├── ClaimModal.jsx
│   │   │   ├── DormEssentials.jsx
│   │   │   ├── EditorialBanner.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HandoverSpotsModal.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── LoginModal.jsx
│   │   │   ├── navbar.jsx
│   │   │   ├── ProductDetailModal.jsx
│   │   │   ├── productcard.jsx
│   │   │   ├── productlist.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   ├── SellItemModal.jsx
│   │   │   ├── SellItemPage.jsx
│   │   │   ├── SpecialSections.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   └── WishlistDrawer.jsx
│   │   ├── data/
│   │   │   └── mockData.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── README.md
├── backend/
├── DBMS-Google-Maps-Navigation/
├── campus_marketplace_home.html
├── moddoa_homepage.html
└── README.md