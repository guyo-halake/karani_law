resource "aws_instance" "lexflow_app_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS LTS
  instance_type = var.ec2_instance_type

  subnet_id                   = aws_subnet.public_1.id
  vpc_security_group_ids      = [aws_security_group.web_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              apt-get update
              apt-get install -y docker.io docker-compose git
              systemctl enable --now docker
              EOF

  tags = {
    Name = "${var.project_name}-app-server"
  }
}
