resource "render_service" "web_app" {
  name          = "ci-demo-app"
  type          = "web_service"
  repo          = "https://github.com/YOUR-USERNAME/YOUR-REPO"
  env           = "docker"
  plan          = "starter"
  branch        = "main"
  build_command = "docker build -t app ."
  start_command = "docker run -p 3000:3000 app"
  auto_deploy   = true
}
