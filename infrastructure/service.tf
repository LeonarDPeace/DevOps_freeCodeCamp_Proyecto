resource "render_service" "backend" {
  name          = "crud-backend"
  type          = "web_service"
  repo          = "https://github.com/LeonarDPeace/DevOps_freeCodeCamp_Proyecto"
  env           = "docker"
  plan          = "starter"
  branch        = "main"
  build_command = "docker build -t app ."
  start_command = "docker run -p 3000:3000 app"
  auto_deploy   = true
}
