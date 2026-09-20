output "vpc_id" {
  description = "AWS VPC ID"
  value       = aws_vpc.lexflow_vpc.id
}

output "ec2_public_ip" {
  description = "Public IP address of LexFlow App Server"
  value       = aws_instance.lexflow_app_server.public_ip
}

output "s3_bucket_name" {
  description = "Name of Encrypted Legal S3 Storage Bucket"
  value       = aws_s3_bucket.legal_vault_backup.id
}
