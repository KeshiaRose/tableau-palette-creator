function initializeCanvas() {
  let right = document.getElementById("right");
  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");
  c.width = right.offsetWidth;
  c.height = right.offsetHeight;
  c.addEventListener("mousemove", previewColor);
  c.addEventListener("click", addColor);
  c.style.cursor = "crosshair";

  let img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = "/tpc_default.png";
  img.onload = function () {
    ctx.drawImage(img, (c.width - 500) / 2, (c.height - 500) / 2);
  };
  initializeDropZone();
}

function initializeDropZone() {
  let dropArea = document.getElementById("dropZone");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    document.addEventListener(eventName, preventDefaults, false);
  });

  dropArea.addEventListener("dragover", highlightZone, false);
  dropArea.addEventListener("dragleave", unhighlightZone, false);

  document.addEventListener("drop", dropFile, false);
}

function previewColor(e) {
  let x = e.layerX;
  let y = e.layerY;
  let colorPreview = document.getElementById("colorPreview");
  colorPreview.innerHTML = "";
  let ctx = document.getElementById("myCanvas").getContext("2d");
  let pixel = ctx.getImageData(x, y, 1, 1);
  let data = pixel.data;
  colorPreview.style.background = `rgb(${data[0]},${data[1]},${data[2]})`;
}

function addColor(e) {
  console.log(e);
  let x = e.layerX;
  let y = e.layerY;
  let output = document.getElementById("colors");
  let ctx = document.getElementById("myCanvas").getContext("2d");
  let pixel = ctx.getImageData(x, y, 1, 1);
  let data = pixel.data;
  let rgb = `rgb(${data[0]},${data[1]},${data[2]})`;
  $("#colors").append(`
    <div class="color" style="background-color:${rgb}">
  <span class="deleteColor" onclick="deleteColor(this)" style="color:${rgb}">x</span>
</div>
  `);
}

function copyPalette() {
  let paletteName = $("#paletteName").val();
  let paletteType = $("#paletteType").val();
  let output = `<color-palette name="${paletteName}" type="${paletteType}">`;
  $(".color").each(function (index) {
    let color = $(this).css("background-color");
    color = color.replace(/[rgb() ]/g, "").split(",");
    color = rgbToHex(color[0], color[1], color[2]);
    output += `\n\t<color>#${color}</color>`;
  });
  output += `\n</color-palette>`;
  let $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(output).select();
  document.execCommand("copy");
  $temp.remove();
}

function deleteColor(div) {
  $(div).remove();
}

function getFileFromInput(e) {
  const file = e.files[0];

  if (file) {
    const accepted = ["image/gif", "image/jpeg", "image/png"];
    const valid = file && accepted.includes(file.type);
    if (valid) {
      readFile(file);
    } else {
      alert("The selected file is not a .gif, .jpg, .jpeg, or .png");
    }
  }
}

function getImageFromURL() {
  let url = $("#imageFromURL").val();

  fetch(url)
    .then((response) => response.blob())
    .then(readFile);

  $("#imageFromURL").val("");
}

function readFile(blob) {
  let reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = () => {
    drawImage(reader.result);
    closeModal("imageModal");
  };
}

function drawImage(imgFile) {
  let c = document.getElementById("myCanvas");
  let ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);

  let img = new Image();
  img.src = imgFile;
  img.crossOrigin = "Anonymous";
  img.onload = () => {
    let width = img.width < c.width ? img.width : c.width;
    let height = img.height < c.height ? img.height : c.height;
    ctx.drawImage(img, 0, 0, width, height);
  };
}

function closeModal(modalID) {
  $(`#${modalID}`).css("display", "none");
}

function openModal(modalID) {
  $(`#${modalID}`).css("display", "flex");
}

function rgbToHex(R, G, B) {
  console.log(R);
  return toHex(R) + toHex(G) + toHex(B);
}

function toHex(n) {
  n = parseInt(n, 10);
  if (isNaN(n)) return "00";
  n = Math.max(0, Math.min(n, 255));
  return "0123456789ABCDEF".charAt((n - (n % 16)) / 16) + "0123456789ABCDEF".charAt(n % 16);
}

document.onpaste = (e) => {
  let items = (e.clipboardData || e.originalEvent.clipboardData).items;
  for (let index in items) {
    let item = items[index];
    if (item.kind === "file") {
      readFile(item.getAsFile());
    }
  }
};

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlightZone(e) {
  document.getElementById("dropZone").classList.add("highlight");
}

function unhighlightZone(e) {
  document.getElementById("dropZone").classList.remove("highlight");
}

function dropFile(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  readFile(files[0]);
}

$("#colors").sortable();
