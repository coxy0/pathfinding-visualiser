function resizeP5Canvas() {
  var canvas = document.getElementById("defaultCanvas0");
  if (canvas) {
    var minDimension = Math.min(window.innerWidth, window.innerHeight) * 0.85;
    canvas.style.width = minDimension + "px";
    canvas.style.height = minDimension + "px";
  }
}

window.addEventListener("DOMContentLoaded", resizeP5Canvas);
window.addEventListener("resize", resizeP5Canvas);
