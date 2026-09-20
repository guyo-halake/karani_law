FROM nginx:alpine

# Copy Billszip law firm web app into Nginx HTML directory
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
