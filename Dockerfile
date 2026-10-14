# Multi-stage Docker build for Karani Law Vite/React Frontend
FROM node:20-alpine AS build

WORKDIR /app

# Build arguments for Supabase client configuration
ARG VITE_SUPABASE_URL=https://hhkbypvdwikxdlwivmrn.supabase.co
ARG VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoa2J5cHZkd2lreGRsd2l2bXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NTg2NTUsImV4cCI6MjEwNTAzNDY1NX0.WBtSdlFX-DFG_Rfaf_19GU7meTBSvDUTzkosft-hjlc

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Install dependencies with caching
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
