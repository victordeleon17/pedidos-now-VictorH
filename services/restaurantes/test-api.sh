#!/bin/bash
BASE_URL="https://restaurantes.fly.dev"

echo "=== Probando API de Restaurantes en Fly.io ==="
echo ""

echo "1. Health Check:"
curl -s "$BASE_URL/health" | jq . 2>/dev/null || curl -s "$BASE_URL/health"
echo -e "\n"

echo "2. Listar Restaurantes (debería estar vacío):"
curl -s "$BASE_URL/api/restaurantes" | jq . 2>/dev/null || curl -s "$BASE_URL/api/restaurantes"
echo -e "\n"

echo "3. Listar Productos (debería estar vacío):"
curl -s "$BASE_URL/api/productos" | jq . 2>/dev/null || curl -s "$BASE_URL/api/productos"
echo -e "\n"

echo "4. Listar Tipos de Producto (debería estar vacío):"
curl -s "$BASE_URL/api/tipos-producto" | jq . 2>/dev/null || curl -s "$BASE_URL/api/tipos-producto"
echo ""
