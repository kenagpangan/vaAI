#!/bin/bash

echo "Running Prisma migrations..."
npx prisma migrate deploy
echo "Prisma migrations complete."
