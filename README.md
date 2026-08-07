# Telegram Mini App — Personal Finance Tracker

A modern Telegram Mini App designed for quick and seamless personal expense tracking, income logging, and automatic receipt parsing.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Telegram](https://img.shields.io/badge/Telegram-WebApp-26A5E4?logo=telegram)

---

## 🚀 Key Features

* **Transaction Entry:**
    * Custom numpad for fast and effortless amount input.
    * Separate workflows for Expenses and Income.
    * Category grid with subcategory support and built-in pagination.
    * Multi-currency support and a custom date picker.
* **Receipt Scanning & Import:** (will be done)
    * **Yerevan City:** Receipt import via date and receipt barcode.
    * **FNS (Russia):** Receipt parsing using fiscal requisites, QR code URLs, or raw JSON data.
    * **Manual Entry:** Ability to manually assemble itemized shopping lists.
* **Analytics:** (will be done)
    * Visual expense distribution broken down by days, main categories, and subcategories.
* **Telegram Integration:** (will be done)
    * Full Haptic Feedback support for native tactile response.
    * Adaptive dark theme aligned with the Telegram interface.

---

## 🛠 Tech Stack

* **Frontend:** React 18, TypeScript, Vite
* **UI & Styling:** Lucide React (icons), Custom CSS / CSS Modules
* **DatePicker:** `react-datepicker`
* **SDK:** Telegram WebApp API (`@twa-dev/sdk`)

---

## 📂 Project Structure

```text
src/
├── assets/          # Static assets and icons
├── components/      # React components
│   ├── Analytics/   # Analytics tab and data grids
│   ├── EnterTransfer/# Transaction forms and receipt parsing components
│   ├── CustomDatePicker.tsx
│   ├── NavigationBar.tsx
│   ├── Numpad.tsx
│   └── SubCategoryModal.tsx
├── services/        # API service layer for backend communication
├── types/           # TypeScript type definitions (finance, telegram)
├── utils/           # Utility helpers (date formatting, caching)
├── App.styles.ts    # Global styles and theme tokens
└── App.tsx          # Root application component