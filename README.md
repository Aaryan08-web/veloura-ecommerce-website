<div align="center">

# 👗 Veloura — Wear Your Aura

### A Modern Full-Stack E-Commerce Platform

<p>
  <strong>React</strong> •
  <strong>TypeScript</strong> •
  <strong>Node.js</strong> •
  <strong>Express.js</strong> •
  <strong>MongoDB</strong> •
  <strong>AWS</strong>
</p>

<br>

<a href="http://13.232.229.25:3000">
  <img src="https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20Veloura-0e75b6?style=for-the-badge" alt="Live Demo"/>
</a>

<a href="https://github.com/Aaryan08-web/veloura-ecommerce-website">
  <img src="https://img.shields.io/badge/GitHub-Source%20Code-181717?style=for-the-badge&logo=github" alt="GitHub"/>
</a>

<br><br>

<img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js&logoColor=white"/>
<img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white"/>
<img src="https://img.shields.io/badge/Cloud-AWS-FF9900?style=flat-square&logo=amazonaws&logoColor=white"/>

</div>

---

## 📖 Overview

**Veloura — Wear Your Aura** is a modern full-stack e-commerce platform designed to provide a complete online shopping experience.

The project combines a responsive React frontend with a Node.js/Express backend and MongoDB database to handle products, users, authentication, carts, wishlists, orders, payments, and administrative operations.

Veloura also integrates AI-powered functionality to enhance the shopping experience and includes a dedicated administration system for managing the platform.

The project is deployed on an **AWS server** and is built with scalability, modularity, security, and user experience in mind.

---

## 🌐 Live Demo

🚀 **Try Veloura:**

**http://13.232.229.25:3000**

> The application is currently hosted on an AWS server.

---

# ✨ Key Features

## 🛍️ Shopping Experience

- Browse products through a modern catalog
- Product categories and filtering
- Product sorting
- Product search
- Product details and galleries
- Product variants
- Related products
- Responsive shopping interface
- Cart management
- Wishlist management
- Order management

---

## 🔐 Authentication & Security

- User registration
- User login
- Authentication system
- JWT-based authentication
- Protected routes
- Admin authentication
- Input validation
- Cloudflare Turnstile integration
- Secure environment variable configuration

---

## 🛒 Cart & Wishlist

- Add products to cart
- Update product quantities
- Remove products from cart
- Persistent cart functionality
- Add/remove wishlist items
- Wishlist management
- Cart summary and order summary

---

## 📦 Orders & Payments

- Checkout workflow
- Order creation
- Order confirmation
- Order tracking
- Order history
- Payment integration
- Razorpay integration
- Payment service architecture

---

## 🤖 AI-Powered Features

Veloura includes AI-powered functionality designed to improve the shopping experience.

### AI Chatbot

- Interactive shopping assistant
- Customer-oriented conversations
- Product-related assistance
- Gemini-powered functionality

The AI functionality is separated into dedicated services and backend routes for easier maintenance and future expansion.

---

## 👨‍💼 Admin Dashboard

Veloura includes a dedicated administration system.

### Admin capabilities include:

- Admin authentication
- Product management
- User management
- Order management
- Product creation and editing
- Bulk product import
- Sales analytics
- Order details
- Administrative overview

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       CLIENT        │
                         │                     │
                         │ React + TypeScript  │
                         │ Tailwind CSS        │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP / REST API
                                    ▼
                         ┌─────────────────────┐
                         │       SERVER        │
                         │                     │
                         │ Node.js + Express   │
                         │ Authentication      │
                         │ Business Logic      │
                         │ API Routes          │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌────────────┐  ┌────────────┐  ┌────────────┐
             │  MongoDB   │  │  Razorpay  │  │   Gemini   │
             │  Database  │  │  Payments  │  │     AI     │
             └────────────┘  └────────────┘  └────────────┘
                                   
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │        AWS          │
                         │      Hosting        │
                         └─────────────────────┘
