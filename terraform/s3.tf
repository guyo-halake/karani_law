resource "aws_s3_bucket" "legal_vault_backup" {
  bucket        = "${var.project_name}-legal-vault-${var.environment}"
  force_destroy = false

  tags = {
    Name        = "Encrypted Legal Vault Document Storage"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vault_encryption" {
  bucket = aws_s3_bucket.legal_vault_backup.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "vault_versioning" {
  bucket = aws_s3_bucket.legal_vault_backup.id
  versioning_configuration {
    status = "Enabled"
  }
}
