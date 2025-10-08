#!/bin/bash

# Seed test products to the database
API_URL="http://localhost:3002/api"

# Test auth header (using DEBUG_AUTH_SECRET from env)
AUTH_HEADER="x-debug-user-id: 5619341542"

echo "Adding test products..."

# Product 1: Vintage Coach Bag
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Vintage Coach Сумка",
    "brand": "Coach",
    "category": "Аксессуары",
    "size": "One Size",
    "color": "Navy Blue",
    "condition": 9,
    "description": "Классическая винтажная сумка Coach в отличном состоянии. Натуральная кожа, все молнии работают.",
    "price": 8500,
    "images": [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop"
    ]
  }'

echo ""

# Product 2: Uniqlo Cashmere Sweater
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Cashmere Свитер Uniqlo",
    "brand": "Uniqlo",
    "category": "Свитеры",
    "size": "M",
    "color": "White",
    "condition": 8,
    "description": "Кашемировый свитер Uniqlo, мягкий и теплый. Минимальные следы носки.",
    "price": 3500,
    "images": [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop"
    ]
  }'

echo ""

# Product 3: Nike Air Jordan 1
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Nike Air Jordan 1",
    "brand": "Nike",
    "category": "Обувь",
    "size": "42",
    "color": "Red/White",
    "condition": 7,
    "description": "Легендарные кроссовки Nike Air Jordan 1. Винтажная пара с характером.",
    "price": 12000,
    "images": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=1000&fit=crop"
    ]
  }'

echo ""

# Product 4: Supreme Box Logo Hoodie
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Supreme Box Logo Толстовка",
    "brand": "Supreme",
    "category": "Толстовки",
    "size": "L",
    "color": "Grey",
    "condition": 8,
    "description": "Классическая толстовка Supreme Box Logo. Редкая модель в хорошем состоянии.",
    "price": 25000,
    "images": [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop"
    ]
  }'

echo ""

# Product 5: Levi's Vintage Jeans
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Levi'\''s 501 Винтаж",
    "brand": "Levi'\''s",
    "category": "Джинсы",
    "size": "32/34",
    "color": "Blue",
    "condition": 9,
    "description": "Винтажные джинсы Levi'\''s 501 из 90-х. Идеальная посадка и состояние.",
    "price": 6500,
    "images": [
      "https://images.unsplash.com/photo-1542272454315-7f6fabf51f16?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=1000&fit=crop"
    ]
  }'

echo ""

# Product 6: Vintage Leather Jacket
curl -X POST "${API_URL}/products" \
  -H "Content-Type: application/json" \
  -H "${AUTH_HEADER}" \
  -d '{
    "title": "Vintage Кожаная Куртка",
    "brand": "Schott",
    "category": "Куртки",
    "size": "L",
    "color": "Black",
    "condition": 8,
    "description": "Винтажная кожаная куртка Schott Perfecto. Культовая модель, натуральная кожа.",
    "price": 18000,
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&h=1000&fit=crop"
    ]
  }'

echo ""
echo "✅ Test products added!"
