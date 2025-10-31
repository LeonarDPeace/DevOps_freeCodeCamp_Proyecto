terraform {
  required_providers {
    render = {
      source  = "renderinc/render"
      version = "0.1.0"
    }
  }
}

provider "render" {
  api_key = var.render_api_key
}
